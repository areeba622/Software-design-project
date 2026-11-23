import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCheck, FiCreditCard, FiLock, FiSmartphone, FiX } from 'react-icons/fi'
import { ApiError, ordersApi, paymentsApi } from '../api'
import { formatPrice, PKR_PER_USD } from '../lib/money'
import { useCart } from '../lib/CartContext'
import { ITEM_TYPE_LABELS } from '../lib/labels'
import Button from '../components/ui/Button'

// ─── NULL OBJECT PATTERN ──────────────────────────────────────────────────────
// Instead of leaving paymentResult as null on failure (which forces null checks
// everywhere in the UI), we always resolve to either a real result OR this
// NullPaymentResult. The result screen renders identically in both cases —
// it only branches once on result.isNull / result.status for green vs red styling.
const NullPaymentResult = {
  status: 'FAILED',
  transactionId: '—',
  gateway: '—',
  amountInPKR: 0,
  amountInUSD: null,
  message: 'Payment could not be processed. Please try again.',
  isNull: true, // ← the single flag the UI checks
}

// Payment pages always show PKR: that is the currency actually charged.
const fmtPKR = (n) => formatPrice(n, 'PKR')

// The two gateways come from the Adapter pattern on the backend (StripeAdapter, JazzCashAdapter).
const GATEWAYS = [
  {
    id: 'STRIPE',
    name: 'Card',
    detail: 'Visa, Mastercard or Amex through Stripe',
    note: `Charged in USD at PKR ${PKR_PER_USD} to $1`,
    icon: FiCreditCard,
  },
  {
    id: 'JAZZCASH',
    name: 'JazzCash',
    detail: 'Pay from your JazzCash mobile wallet',
    note: 'Charged in PKR',
    icon: FiSmartphone,
  },
]

const STEPS = ['Cart', 'Payment', 'Confirmation']

function Steps({ current }) {
  return (
    <ol className="flex items-center gap-2 text-sm sm:gap-3">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`tabular flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                done ? 'bg-accent text-white' : active ? 'border-2 border-accent text-accent' : 'border border-line-strong text-ink-3'
              }`}
            >
              {done ? <FiCheck size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={active || done ? 'font-medium text-ink' : 'text-ink-3'}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-5 bg-line-strong sm:w-10" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

function OrderSummary({ order }) {
  const items = order?.items || []
  return (
    <section className="rounded-panel bg-sand p-6 sm:p-7">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[17px] font-semibold text-ink">Order summary</h2>
        {order && <span className="tabular text-sm text-ink-2">#{order.orderId}</span>}
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-[15px] text-ink-2">No items in this order.</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-4 py-3.5">
              <div className="min-w-0">
                {item.itemType !== 'PRODUCT' && <p className="text-xs font-medium text-accent">{ITEM_TYPE_LABELS[item.itemType] || item.itemType}</p>}
                <p className="text-[15px] leading-snug text-ink">{item.itemName || '—'}</p>
                <p className="tabular mt-0.5 text-sm text-ink-3">
                  {item.quantity ?? 1} × {fmtPKR(item.unitPrice)}
                </p>
              </div>
              <p className="tabular shrink-0 text-[15px] font-medium text-ink">{fmtPKR(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-baseline justify-between border-t border-line-strong pt-4">
        <span className="text-[15px] font-medium text-ink">Total</span>
        <span className="tabular text-xl font-semibold text-ink">{fmtPKR(order?.grandTotal)}</span>
      </div>
    </section>
  )
}

function Spinner({ label }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-24 text-center">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-ink" aria-hidden="true" />
      <p className="mt-5 text-[15px] text-ink-2">{label}</p>
    </div>
  )
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export default function PaymentPage({ onBack }) {
  const navigate = useNavigate()
  const { refresh } = useCart()
  const orderCreationStarted = useRef(false)

  // ── Screens: 'creating-order' | 'select-gateway' | 'processing' | 'result'
  const [screen, setScreen] = useState('creating-order')
  const [order, setOrder] = useState(null)
  const [selectedGateway, setGateway] = useState(null)
  const [orderError, setOrderError] = useState(null)

  // paymentResult is ALWAYS either a real API response OR NullPaymentResult
  // — it is NEVER null after the payment call resolves (Null Object Pattern)
  const [paymentResult, setPaymentResult] = useState(null)

  // ── Step 1: Create order on mount ────────────────────────────────────────
  useEffect(() => {
    if (orderCreationStarted.current) return
    orderCreationStarted.current = true

    const createOrder = async () => {
      try {
        // The server turns the logged-in user's own cart into an order.
        setOrder(await ordersApi.create())
        refresh() // the cart is now empty
        setScreen('select-gateway')
      } catch (e) {
        // Empty cart usually means the order already exists (e.g. the page was
        // refreshed, or a payment failed). Resume the newest unpaid order instead.
        const pending =
          e instanceof ApiError && e.status === 400 ? (await ordersApi.list().catch(() => [])).find((o) => o.status === 'PENDING') : null
        if (pending) setOrder(pending)
        else setOrderError(e.message)
        setScreen('select-gateway') // show UI with error, not blank screen
      }
    }
    createOrder()
  }, [refresh])

  // ── Step 2: Process payment ───────────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedGateway || !order) return
    setScreen('processing')

    try {
      // No amount is sent: the server always charges the order's own total.
      const data = await paymentsApi.pay(order.orderId, selectedGateway)
      setPaymentResult({ ...data, isNull: false, orderId: order.orderId })
    } catch (e) {
      // Declined (402), already paid (409) or network error → Null Object, never null
      setPaymentResult({
        ...NullPaymentResult,
        message: e.message || NullPaymentResult.message,
        orderId: order?.orderId ?? '—',
      })
    }

    setScreen('result')
  }

  const success = paymentResult?.status === 'SUCCESS'
  const stepIndex = screen === 'result' ? (success ? 3 : 1) : 1
  const gateway = GATEWAYS.find((g) => g.id === selectedGateway)

  return (
    <div className="page max-w-5xl pb-24 pt-8 sm:pt-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="display text-[2.2rem] sm:text-[2.6rem]">{screen === 'result' ? (success ? 'Order confirmed' : 'Payment failed') : 'Checkout'}</h1>
        <Steps current={stepIndex} />
      </div>

      <AnimatePresence mode="wait">
        {screen === 'creating-order' && (
          <motion.div key="creating" {...fade}>
            <Spinner label="Preparing your order…" />
          </motion.div>
        )}

        {screen === 'select-gateway' && (
          <motion.div key="gateway" {...fade} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
            <div className="order-2 lg:order-1">
              {orderError && (
                <div role="alert" className="mb-6 rounded-panel bg-danger-soft p-5">
                  <p className="text-[15px] font-medium text-danger">{orderError}</p>
                  <p className="mt-1 text-sm text-ink-2">Add something to your cart, then come back to check out.</p>
                  <Button size="sm" className="mt-4" onClick={onBack}>
                    Back to the shop
                  </Button>
                </div>
              )}

              <h2 className="mb-4 text-[17px] font-semibold text-ink">How would you like to pay?</h2>
              <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                {GATEWAYS.map((g) => {
                  const selected = selectedGateway === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!order}
                      onClick={() => setGateway(g.id)}
                      className={`flex w-full items-center gap-4 rounded-panel border p-5 text-left transition-colors disabled:opacity-50 ${
                        selected ? 'border-accent bg-accent-soft/50 ring-1 ring-accent' : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink">
                        <g.icon size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold text-ink">{g.name}</span>
                        <span className="block text-sm text-ink-2">{g.detail}</span>
                        <span className="mt-1 block text-[13px] text-ink-3">{g.note}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-accent" : "border-line-strong"}`}
                        aria-hidden="true"
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                      </span>
                    </button>
                  )
                })}
              </div>

              <Button size="lg" block className="mt-8" onClick={handlePay} disabled={!selectedGateway || !order}>
                {selectedGateway && order ? `Pay ${fmtPKR(order.grandTotal)}` : 'Choose a payment method'}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-2 text-[13px] text-ink-3">
                <FiLock size={13} /> {gateway ? `Processed securely by ${gateway.id === 'STRIPE' ? 'Stripe' : 'JazzCash'}` : 'Your payment is processed securely'}
              </p>
            </div>

            <div className="order-1 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:order-2">
              <OrderSummary order={order} />
            </div>
          </motion.div>
        )}

        {screen === 'processing' && (
          <motion.div key="processing" {...fade}>
            <Spinner label={`Processing your payment with ${gateway?.name || selectedGateway}…`} />
          </motion.div>
        )}

        {screen === 'result' && paymentResult && (
          <motion.div key="result" {...fade} className="mx-auto max-w-xl">
            <div className="flex items-start gap-4">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5, delay: 0.1 }}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${success ? 'bg-success text-white' : 'bg-danger-soft text-danger'}`}
              >
                {success ? <FiCheck size={24} strokeWidth={2.5} /> : <FiX size={24} strokeWidth={2.5} />}
              </motion.span>
              <div>
                <p className="text-[19px] font-semibold text-ink">
                  {success ? 'Thank you. Your payment went through.' : "Your payment didn't go through."}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-2">
                  {success ? "We've started preparing your order. You can follow it from your orders page." : paymentResult.message}
                </p>
              </div>
            </div>

            {/* Rendered identically for a real result and for NullPaymentResult. */}
            <dl className="tabular mt-8 divide-y divide-line rounded-panel border border-line px-5 text-[15px]">
              {[
                ['Order', `#${paymentResult.orderId ?? '—'}`],
                ['Transaction', paymentResult.transactionId],
                ['Paid with', { STRIPE: 'Card (Stripe)', JAZZCASH: 'JazzCash' }[paymentResult.gateway] || paymentResult.gateway],
                ['Amount', fmtPKR(paymentResult.amountInPKR)],
                paymentResult.amountInUSD != null && ['Amount in USD', `$${Number(paymentResult.amountInUSD).toFixed(2)}`],
                ['Status', success ? 'Paid' : 'Not paid'],
              ]
                .filter(Boolean)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3.5">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="truncate text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {success ? (
                <>
                  <Button size="lg" className="flex-1" onClick={() => navigate('/orders')}>
                    View my orders
                  </Button>
                  <Button size="lg" variant="secondary" className="flex-1" onClick={onBack}>
                    Continue shopping
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setScreen('select-gateway')
                      setPaymentResult(null)
                    }}
                  >
                    Try again
                  </Button>
                  <Button size="lg" variant="secondary" className="flex-1" onClick={onBack}>
                    Back to the shop
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
