import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiPackage } from 'react-icons/fi'
import { ordersApi } from '../api'
import { useCurrency } from '../lib/CurrencyContext'
import { ITEM_TYPE_LABELS } from '../lib/labels'
import Button from '../components/ui/Button'
import StatusBadge from '../components/StatusBadge'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function OrderRow({ order, defaultOpen }) {
  const { format } = useCurrency()
  const [open, setOpen] = useState(defaultOpen)
  const items = order.items || []
  const count = items.reduce((s, i) => s + (i.quantity || 0), 0)
  const summary = items.length ? `${items[0].itemName}${items.length > 1 ? ` and ${items.length - 1} more` : ''}` : 'No items'

  return (
    <li className="rounded-panel border border-line transition-colors hover:border-line-strong">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink-2 sm:flex">
          <FiPackage size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[16px] font-semibold text-ink">Order #{order.orderId}</span>
            <StatusBadge status={order.status} />
          </span>
          <span className="mt-1 block truncate text-sm text-ink-2">
            {fmtDate(order.createdAt)}. {summary}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="tabular block text-[16px] font-semibold text-ink">{format(order.grandTotal)}</span>
          <span className="tabular block text-sm text-ink-3">
            {count} item{count === 1 ? '' : 's'}
          </span>
        </span>
        <FiChevronDown size={18} className={`shrink-0 text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="mx-5 divide-y divide-line border-t border-line sm:mx-6">
              {items.map((item, i) => (
                <li key={`${item.itemType}-${item.itemId ?? i}`} className="flex items-start justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    {item.itemType !== 'PRODUCT' && <p className="text-xs font-medium text-accent">{ITEM_TYPE_LABELS[item.itemType] || item.itemType}</p>}
                    <p className="text-[15px] text-ink">{item.itemName}</p>
                    <p className="tabular mt-0.5 text-sm text-ink-3">
                      {item.quantity} × {format(item.unitPrice)}
                    </p>
                  </div>
                  <p className="tabular shrink-0 text-[15px] font-medium text-ink">{format(item.lineTotal)}</p>
                </li>
              ))}
              <li className="flex justify-between py-4 text-[15px]">
                <span className="text-ink-2">Total charged</span>
                <span className="tabular font-semibold text-ink">{format(order.grandTotal)}</span>
              </li>
            </ul>
            {order.status === 'PENDING' && (
              <div className="mx-5 mb-5 flex flex-col gap-3 rounded-card bg-warning-soft p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink">This order hasn't been paid yet.</p>
                <Button size="sm" to="/payment">
                  Pay now
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    ordersApi
      .list({ signal: controller.signal })
      .then((data) => setOrders(data || [])) // the server already sends newest first
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <div className="pb-24">
      <div className="bg-sand">
      <header className="page max-w-4xl pb-10 pt-10 sm:pt-14">
        <h1 className="display text-[2.4rem] sm:text-[3rem]">Orders</h1>
        <p className="mt-2 text-[17px] text-ink-2">
          {loading ? 'Loading your orders…' : orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'}, newest first.` : 'Everything you buy will be listed here.'}
        </p>
      </header>
      </div>
      <div className="page max-w-4xl pt-10">

      {error ? (
        <div role="alert" className="rounded-panel bg-danger-soft px-6 py-5 text-[15px] text-danger">
          {error}
        </div>
      ) : loading ? (
        <ul className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="h-[5.5rem] animate-pulse rounded-panel bg-surface" />
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="rounded-panel bg-surface px-6 py-20 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-ink-2">
            <FiPackage size={22} />
          </span>
          <p className="text-[17px] font-semibold text-ink">No orders yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-ink-2">Once you check out, your order and its status will show up here.</p>
          <Button className="mt-6" to="/catalog">
            Start shopping
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order, i) => (
            <OrderRow key={order.orderId} order={order} defaultOpen={i === 0} />
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}
