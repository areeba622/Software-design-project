// src/pages/PaymentPage.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiLoader } from 'react-icons/fi'
import { OrderSuccessCard } from '../components/OrderSuccessCard'
import { ApiError, ordersApi, paymentsApi } from '../api'
import { formatPrice } from '../lib/money'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

// ─── NULL OBJECT PATTERN ──────────────────────────────────────────────────────
// Instead of leaving paymentResult as null on failure (which forces null checks
// everywhere in the UI), we always resolve to either a real result OR this
// NullPaymentResult. The result screen renders identically in both cases —
// it only branches once on result.isNull / result.status for green vs red styling.
const NullPaymentResult = {
  status: "FAILED",
  transactionId: "—",
  gateway: "—",
  amountInPKR: 0,
  amountInUSD: null,
  message: "Payment could not be processed. Please try again.",
  isNull: true,   // ← the single flag the UI checks
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Framer Motion Variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// Payment pages always show PKR: that is the currency actually charged.
function fmtPKR(n) {
  return formatPrice(n, 'PKR')
}

// ─── Gateway Card ─────────────────────────────────────────────────────────────
function GatewayCard({ id, name, desc, icon, badge, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: '20px',
        border: `1.5px solid ${selected ? T.ink : T.warm}`,
        borderRadius: 14,
        background: selected ? '#F7F5F2' : T.white,
        cursor: 'pointer',
        transition: 'border-color 0.18s, background 0.18s',
        width: '100%',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <p style={{
        fontFamily: FONT, fontWeight: 700, fontSize: 15,
        color: T.ink, margin: '0 0 4px',
      }}>{name}</p>
      <p style={{
        fontFamily: FONT, fontSize: 12,
        color: T.stone, margin: '0 0 10px',
      }}>{desc}</p>
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        background: id === 'STRIPE' ? '#EFF6FF' : '#F0FDF4',
        color: id === 'STRIPE' ? '#1D4ED8' : '#15803D',
        fontFamily: FONT, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>{badge}</span>

      {/* Selected checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 22, height: 22,
              background: T.ink, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.white, fontSize: 12, fontWeight: 700,
            }}
          >✓</motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── Result Row (used in success/failure screen) ──────────────────────────────
function ResultRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: `1px solid ${T.warm}`,
      fontFamily: FONT,
    }}>
      <span style={{ fontSize: 13, color: T.stone }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: highlight ? T.clay : T.ink,
        fontFamily: 'monospace',
      }}>{value}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PaymentPage({ onBack }) {
  const navigate = useNavigate()
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
        setScreen('select-gateway')
      } catch (e) {
        // Empty cart usually means the order already exists (e.g. the page was
        // refreshed, or a payment failed). Resume the newest unpaid order instead.
        const pending = e instanceof ApiError && e.status === 400
          ? (await ordersApi.list().catch(() => [])).find(o => o.status === 'PENDING')
          : null
        if (pending) setOrder(pending)
        else setOrderError(e.message)
        setScreen('select-gateway') // show UI with error, not blank screen
      }
    }
    createOrder()
  }, []) // runs once on mount

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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.linen, fontFamily: FONT }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: T.white,
          borderBottom: `1px solid ${T.warm}`,
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        {screen !== 'result' && (
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center',
            }}
          >
            <FiArrowLeft size={20} color={T.ink} />
          </button>
        )}
        <div>
          <h1 style={{
            fontFamily: FONT, fontSize: '1.3rem',
            fontWeight: 800, color: T.ink, margin: 0,
          }}>
            {screen === 'creating-order' && 'Preparing your order…'}
            {screen === 'select-gateway' && 'Choose Payment Method'}
            {screen === 'processing' && 'Processing Payment…'}
            {screen === 'result' && (paymentResult?.status === 'SUCCESS' ? 'Payment Confirmed' : 'Payment Failed')}
          </h1>
          {screen === 'select-gateway' && order && (
            <p style={{ fontFamily: FONT, fontSize: 12, color: T.stone, margin: '4px 0 0' }}>
              Order #{order.orderId} · {fmtPKR(order.grandTotal)}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Progress Bar ── */}
      <div style={{ width: '100%', height: 3, background: T.warm }}>
        <motion.div
          animate={{
            width:
              screen === 'creating-order' ? '25%' :
                screen === 'select-gateway' ? '50%' :
                  screen === 'processing' ? '75%' : '100%',
          }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: T.clay }}
        />
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <AnimatePresence mode="wait">

          {/* ────────────────────────────────────────────────────────────
              SCREEN 1: Creating order (spinner)
          ──────────────────────────────────────────────────────────── */}
          {screen === 'creating-order' && (
            <motion.div
              key="creating"
              variants={fadeUp} initial="hidden" animate="show" exit="exit"
              style={{ textAlign: 'center', paddingTop: 60 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                style={{
                  width: 48, height: 48, margin: '0 auto 20px',
                  border: `3px solid ${T.warm}`,
                  borderTopColor: T.clay,
                  borderRadius: '50%',
                }}
              />
              <p style={{ fontFamily: FONT, fontSize: 15, color: T.stone }}>
                Creating your order…
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────
              SCREEN 2: Select gateway
          ──────────────────────────────────────────────────────────── */}
          {screen === 'select-gateway' && (
            <motion.div
              key="gateway"
              variants={fadeUp} initial="hidden" animate="show" exit="exit"
            >
              {/* Order error banner */}
              {orderError && (
                <div style={{
                  marginBottom: 20, padding: '12px 16px',
                  background: '#FEF2F2', color: '#991B1B',
                  border: '1.5px solid #FCA5A5', borderRadius: 10,
                  fontFamily: FONT, fontSize: 13,
                }}>
                  ⚠️ {orderError}
                </div>
              )}

              {/* Order summary card */}
              {order && (
                <div style={{
                  marginBottom: 28,
                  border: `1.5px solid ${T.warm}`, borderRadius: 14,
                  background: T.white, overflow: 'hidden',
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${T.warm}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <p style={{
                      fontFamily: FONT, fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.12em', color: T.clay,
                      textTransform: 'uppercase', margin: 0,
                    }}>Order Summary</p>
                    <span style={{
                      fontFamily: FONT, fontSize: 11, color: T.stone, fontWeight: 600,
                    }}>
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items list */}
                  <div style={{ padding: '8px 0' }}>
                    {(!order.items || order.items.length === 0) && (
                      <p style={{
                        fontFamily: FONT, fontSize: 13, color: T.stone,
                        textAlign: 'center', padding: '20px 0', margin: 0,
                      }}>No items in this order.</p>
                    )}
                    {order.items?.map((item, i) => {
                      // Colour-coded badge per item type
                      const typeMeta = {
                        PRODUCT:       { bg: '#EFF6FF', color: '#1D4ED8', label: 'Product' },
                        CUSTOM_ROOM:   { bg: '#FFF7ED', color: '#C2410C', label: 'Custom Room' },
                        BUNDLE:        { bg: '#F0FDF4', color: '#15803D', label: 'Bundle' },
                        DESIGNER_HIRE: { bg: '#FDF4FF', color: '#7E22CE', label: 'Designer' },
                      }
                      const meta = typeMeta[item.itemType] || { bg: '#F1F5F9', color: '#475569', label: item.itemType || 'Item' }
                      const isLast = i === order.items.length - 1

                      return (
                        <div key={i} style={{
                          padding: '12px 20px',
                          borderBottom: isLast ? 'none' : `1px solid ${T.warm}`,
                          display: 'flex', flexDirection: 'column', gap: 6,
                        }}>
                          {/* Row 1: badge + name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                              background: meta.bg, color: meta.color,
                              fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                              textTransform: 'uppercase', flexShrink: 0,
                            }}>{meta.label}</span>
                            <span style={{
                              fontFamily: FONT, fontSize: 13, fontWeight: 700, color: T.ink,
                            }}>{item.itemName || '—'}</span>
                          </div>

                          {/* Row 2: qty × unit price = line total */}
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span style={{ fontFamily: FONT, fontSize: 12, color: T.stone }}>
                              {fmtPKR(item.unitPrice)} × {item.quantity ?? 1}
                            </span>
                            <span style={{
                              fontFamily: FONT, fontSize: 13, fontWeight: 700, color: T.ink,
                            }}>
                              {fmtPKR(item.lineTotal)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Grand Total footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px',
                    borderTop: `1.5px solid ${T.warm}`,
                    background: '#FAFAF9',
                    fontFamily: FONT,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.stone, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: T.clay }}>{fmtPKR(order.grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Gateway selection label */}
              <p style={{
                fontFamily: FONT, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em', color: T.stone,
                textTransform: 'uppercase', marginBottom: 12,
              }}>Select Payment Gateway</p>

              {/* ── Gateway Cards (from Adapter pattern: StripeAdapter + JazzCashAdapter) ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                <GatewayCard
                  id="STRIPE"
                  name="Stripe"
                  desc="Visa · Mastercard · Amex"
                  icon="💳"
                  badge="International"
                  selected={selectedGateway === 'STRIPE'}
                  onClick={() => setGateway('STRIPE')}
                />
                <GatewayCard
                  id="JAZZCASH"
                  name="JazzCash"
                  desc="Mobile wallet · Local payments"
                  icon="📱"
                  badge="Local"
                  selected={selectedGateway === 'JAZZCASH'}
                  onClick={() => setGateway('JAZZCASH')}
                />
              </div>

              {/* Pay button */}
              <motion.button
                onClick={handlePay}
                disabled={!selectedGateway || !order}
                whileHover={{ scale: selectedGateway && order ? 1.02 : 1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: selectedGateway && order ? T.ink : T.warm,
                  color: selectedGateway && order ? T.white : T.stone,
                  border: 'none', borderRadius: 10,
                  fontFamily: FONT, fontSize: 14, fontWeight: 700,
                  cursor: selectedGateway && order ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s, color 0.2s',
                  letterSpacing: '-0.01em',
                }}
              >
                {selectedGateway && order
                  ? `Pay ${fmtPKR(order.grandTotal)} via ${selectedGateway}`
                  : 'Select a payment method'}
              </motion.button>

              <p style={{
                textAlign: 'center', marginTop: 12,
                fontFamily: FONT, fontSize: 11, color: T.stone,
              }}>
                🔒 Secured via {selectedGateway === 'STRIPE' ? 'Stripe PCI DSS' : selectedGateway === 'JAZZCASH' ? 'JazzCash encryption' : 'end-to-end encryption'}
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────
              SCREEN 3: Processing (spinner)
          ──────────────────────────────────────────────────────────── */}
          {screen === 'processing' && (
            <motion.div
              key="processing"
              variants={fadeUp} initial="hidden" animate="show" exit="exit"
              style={{ textAlign: 'center', paddingTop: 60 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                style={{
                  width: 48, height: 48, margin: '0 auto 20px',
                  border: `3px solid ${T.warm}`,
                  borderTopColor: T.clay,
                  borderRadius: '50%',
                }}
              />
              <p style={{ fontFamily: FONT, fontSize: 15, color: T.stone }}>
                Processing via {selectedGateway}…
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────
              SCREEN 4: Result (success OR failure — same component,
              branches only on paymentResult.isNull / .status)
              This is the Null Object Pattern in action: paymentResult
              is ALWAYS a valid object here, never null.
          ──────────────────────────────────────────────────────────── */}
          {screen === 'result' && paymentResult && (
            <motion.div
              key="result"
              variants={fadeUp} initial="hidden" animate="show" exit="exit"
            >
              {/* Status icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: paymentResult.status === 'SUCCESS' ? '#DCFCE7' : '#FEF2F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                {paymentResult.status === 'SUCCESS' ? '✓' : '✕'}
              </motion.div>

              {/* Title */}
              <h2 style={{
                fontFamily: FONT, fontSize: '1.5rem', fontWeight: 800,
                color: T.ink, textAlign: 'center', margin: '0 0 6px',
                letterSpacing: '-0.02em',
              }}>
                {paymentResult.status === 'SUCCESS' ? 'Payment Confirmed' : 'Payment Failed'}
              </h2>
              <p style={{
                fontFamily: FONT, fontSize: 13, color: T.stone,
                textAlign: 'center', margin: '0 0 28px',
              }}>
                {paymentResult.status === 'SUCCESS'
                  ? 'Your order is confirmed and being prepared.'
                  : paymentResult.message}
              </p>

              {/* Result lines — render identically for both success and NullPaymentResult */}
              <div style={{
                border: `1.5px solid ${T.warm}`, borderRadius: 14,
                background: T.white, padding: '4px 20px',
                marginBottom: 24,
              }}>
                <ResultRow label="Order ID" value={`#${paymentResult.orderId ?? '—'}`} />
                <ResultRow label="Transaction ID" value={paymentResult.transactionId} />
                <ResultRow label="Gateway" value={paymentResult.gateway} />
                <ResultRow label="Amount (PKR)" value={fmtPKR(paymentResult.amountInPKR)} highlight />
                {paymentResult.amountInUSD != null && (
                  <ResultRow label="Amount (USD)" value={`$${Number(paymentResult.amountInUSD).toFixed(2)}`} />
                )}
                <ResultRow
                  label="Status"
                  value={paymentResult.status}
                  highlight={paymentResult.status !== 'SUCCESS'}
                />
              </div>

              {/* Action buttons */}
              {paymentResult.status === 'SUCCESS' ? (
                <OrderSuccessCard
                  onTrackPackage={onBack}
                  onViewHistory={() => navigate('/orders')}
                />
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    onClick={() => { setScreen('select-gateway'); setPaymentResult(null) }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '13px 0',
                      background: T.clay, color: T.white,
                      border: 'none', borderRadius: 10,
                      fontFamily: FONT, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '13px 0',
                      background: T.white, color: T.ink,
                      border: `1.5px solid ${T.warm}`, borderRadius: 10,
                      fontFamily: FONT, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Back to Shop
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}