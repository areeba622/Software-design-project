import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiPackage, FiChevronDown } from 'react-icons/fi'
import { API_ENDPOINTS, authFetch, errorMessage } from '../config/api'

// ─── Design Tokens (matching PaymentPage.jsx) ─────────────────────────────────
const T = {
    ink: "#0F172A",
    clay: "#C2410C",
    stone: "#78716C",
    linen: "#FAFAF9",
    warm: "#E7DDD5",
    white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

// Status → badge color mapping
const STATUS_STYLES = {
    PENDING: { bg: '#FEF9C3', fg: '#854D0E' },
    CONFIRMED: { bg: '#DBEAFE', fg: '#1D4ED8' },
    SHIPPED: { bg: '#E0E7FF', fg: '#4338CA' },
    DELIVERED: { bg: '#DCFCE7', fg: '#15803D' },
    CANCELLED: { bg: '#FEE2E2', fg: '#B91C1C' },
}

function fmtPKR(n) {
    return `PKR ${Number(n ?? 0).toLocaleString("en-PK")}`
}

function fmtDate(iso) {
    if (!iso) return '—'
    try {
        return new Date(iso).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric',
        })
    } catch {
        return iso
    }
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || { bg: T.warm, fg: T.stone }
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 11px',
            borderRadius: 999,
            background: style.bg,
            color: style.fg,
            fontFamily: FONT, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
            {status}
        </span>
    )
}

// ─── Order Card (collapsible) ──────────────────────────────────────────────────
function OrderCard({ order, index }) {
    const [open, setOpen] = useState(false)
    const itemCount = order.items?.length || 0
    const summary = order.items?.length
        ? `${order.items[0].itemName}${itemCount > 1 ? ` + ${itemCount - 1} more` : ''}`
        : 'No items'

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
            style={{
                border: `1.5px solid ${T.warm}`,
                borderRadius: 14,
                background: T.white,
                overflow: 'hidden',
                marginBottom: 14,
            }}
        >
            {/* Header row — always visible, toggles items */}
            <button
                onClick={() => setOpen(p => !p)}
                style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: '#F7F5F2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <FiPackage size={17} color={T.clay} />
                    </div>
                    <div>
                        <p style={{
                            fontFamily: FONT, fontSize: 14, fontWeight: 700,
                            color: T.ink, margin: '0 0 3px',
                        }}>
                            Order #{order.orderId}
                        </p>
                        <p style={{
                            fontFamily: FONT, fontSize: 12, color: T.stone, margin: 0,
                        }}>
                            {fmtDate(order.createdAt)} · {summary}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontFamily: FONT, fontSize: 14, fontWeight: 800,
                            color: T.clay, margin: '0 0 4px',
                        }}>
                            {fmtPKR(order.grandTotal)}
                        </p>
                        <StatusBadge status={order.status} />
                    </div>
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FiChevronDown size={16} color={T.stone} />
                    </motion.div>
                </div>
            </button>

            {/* Expandable item list */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '0 20px 18px',
                            borderTop: `1px solid ${T.warm}`,
                            marginTop: 0,
                        }}>
                            {order.items?.map((item, i) => (
                                <div key={item.itemId ?? i} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '10px 0',
                                    borderBottom: i < order.items.length - 1 ? `1px solid ${T.warm}` : 'none',
                                    fontFamily: FONT,
                                }}>
                                    <span style={{ fontSize: 13, color: T.stone }}>
                                        {item.itemName} × {item.quantity}
                                    </span>
                                    <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>
                                        {fmtPKR(item.lineTotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Orders({ user, onBack }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return
        let cancelled = false

        const fetchOrders = async () => {
            try {
                const res = await authFetch(API_ENDPOINTS.ORDERS)
                if (!res.ok) throw new Error(await errorMessage(res, 'Could not load your orders.'))
                const data = await res.json()
                if (!cancelled) {
                    // Most recent first
                    const sorted = [...data].sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    setOrders(sorted)
                }
            } catch (e) {
                if (!cancelled) setError(e.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchOrders()
        return () => { cancelled = true }
    }, [user])

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
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 6, display: 'flex', alignItems: 'center',
                    }}
                >
                    <FiArrowLeft size={20} color={T.ink} />
                </button>
                <div>
                    <h1 style={{
                        fontFamily: FONT, fontSize: '1.3rem',
                        fontWeight: 800, color: T.ink, margin: 0,
                    }}>
                        My Orders
                    </h1>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: T.stone, margin: '4px 0 0' }}>
                        {loading ? 'Loading…' : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
                    </p>
                </div>
            </motion.div>

            {/* ── Body ── */}
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>

                {/* Error banner */}
                {error && (
                    <div style={{
                        marginBottom: 20, padding: '12px 16px',
                        background: '#FEF2F2', color: '#991B1B',
                        border: '1.5px solid #FCA5A5', borderRadius: 10,
                        fontFamily: FONT, fontSize: 13,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading state */}
                {loading && !error && (
                    <div style={{ textAlign: 'center', paddingTop: 60 }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                            style={{
                                width: 40, height: 40, margin: '0 auto 18px',
                                border: `3px solid ${T.warm}`,
                                borderTopColor: T.clay,
                                borderRadius: '50%',
                            }}
                        />
                        <p style={{ fontFamily: FONT, fontSize: 14, color: T.stone }}>
                            Loading your orders…
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && orders.length === 0 && (
                    <div style={{ textAlign: 'center', paddingTop: 60 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px',
                            background: '#F7F5F2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FiPackage size={24} color={T.stone} />
                        </div>
                        <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: T.ink, margin: '0 0 6px' }}>
                            No orders yet
                        </p>
                        <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: 0 }}>
                            Your past purchases will show up here once you place an order.
                        </p>
                    </div>
                )}

                {/* Order list */}
                {!loading && !error && orders.map((order, i) => (
                    <OrderCard key={order.orderId} order={order} index={i} />
                ))}
            </div>
        </div>
    )
}