import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiGrid, FiCompass, FiUsers, FiBox, FiShoppingBag,
  FiLogOut, FiUser, FiChevronRight, FiShoppingCart
} from 'react-icons/fi'

const T = {
  ink:   "#0F172A",
  clay:  "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm:  "#E7DDD5",
  white: "#FFFFFF",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
const BASE = "http://localhost:8081"

function formatPrice(pkr, currency) {
  if (currency === 'USD') return `$${(pkr / 280).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `PKR ${pkr?.toLocaleString('en-PK')}`
}

// ─── Glassmorphism card ───────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, eyebrow, title, description, cta, onClick, index, accent, soon }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!soon ? onClick : undefined}
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: '2rem',
        cursor: soon ? 'default' : 'pointer',
        overflow: 'hidden',
        border: `1.5px solid ${hovered && !soon ? accent + '55' : 'rgba(231,221,213,0.6)'}`,
        background: hovered && !soon
          ? `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(250,250,249,0.96) 100%)`
          : `linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(250,250,249,0.85) 100%)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: hovered && !soon
          ? `0 20px 48px -12px rgba(15,23,42,0.12), 0 0 0 1px ${accent}22`
          : '0 4px 24px -8px rgba(15,23,42,0.07)',
        transition: 'all 0.28s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity: soon ? 0.55 : 1,
      }}
    >
      {/* Subtle accent blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: accent + '18',
        filter: 'blur(24px)',
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        opacity: hovered ? 1 : 0.5,
      }} />

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: hovered && !soon ? accent + '18' : 'rgba(231,221,213,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.25s',
      }}>
        <Icon size={22} color={hovered && !soon ? accent : T.stone} strokeWidth={1.8} style={{ transition: 'color 0.25s' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: FONT, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.13em', color: T.clay, margin: '0 0 6px',
        }}>
          {eyebrow}
        </p>
        <h3 style={{
          fontFamily: FONT, fontWeight: 800, fontSize: '1.15rem',
          color: T.ink, margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2,
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: FONT, fontSize: 13, color: T.stone,
          margin: 0, lineHeight: 1.6,
        }}>
          {description}
        </p>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 13, fontWeight: 700,
          color: soon ? T.stone : (hovered ? accent : T.ink),
          transition: 'color 0.22s',
        }}>
          {soon ? 'Coming soon' : cta}
        </span>
        {!soon && (
          <motion.div
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronRight size={16} color={hovered ? accent : T.stone} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, loading }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(8px)',
      border: `1px solid rgba(231,221,213,0.7)`,
      borderRadius: 12, padding: '12px 20px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontFamily: FONT, fontSize: 11, color: T.stone, fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: '1.1rem', fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>
        {loading ? '—' : value}
      </span>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ user, onNavigate, onLogout }) {
  const currency = user?.currencyPreference || 'PKR'
  const [cartCount, setCartCount]   = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading]       = useState(true)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(`${BASE}/api/cart?userId=${user.userId}`).then(r => r.json()).catch(() => null),
      fetch(`${BASE}/api/order?userId=${user.userId}`).then(r => r.json()).catch(() => []),
    ]).then(([cart, orders]) => {
      setCartCount(cart?.lines?.length || 0)
      setOrderCount(Array.isArray(orders) ? orders.length : 0)
    }).finally(() => setLoading(false))
  }, [user])

  const cards = [
    {
      icon: FiGrid,
      eyebrow: 'CATALOG',
      title: 'Browse Products',
      description: 'Explore our curated furniture and décor collection. Filter by room, style, and price.',
      cta: 'Explore catalog',
      page: 'catalog',
      accent: '#0F172A',
    },
    {
      icon: FiCompass,
      eyebrow: 'STYLE QUIZ',
      title: 'Find Your Aesthetic',
      description: "Answer 4 questions about your taste and we'll reveal your perfect interior design style.",
      cta: 'Take the quiz',
      page: 'quiz',
      accent: '#C2410C',
    },
    {
      icon: FiUsers,
      eyebrow: 'DESIGNERS',
      title: 'View Designers',
      description: 'Connect with elite interior designers available for hire on your next project.',
      cta: 'View designers',
      page: 'designers',
      accent: '#0891B2',
    },
    {
      icon: FiBox,
      eyebrow: 'CUSTOM BUILD',
      title: 'Build Custom Room',
      description: 'Pick products piece by piece and assemble your own bespoke furniture bundle.',
      cta: 'Start building',
      page: 'customRoom',
      accent: '#059669',
      soon: true,
    },
    {
      icon: FiShoppingBag,
      eyebrow: 'ORDERS',
      title: 'My Orders',
      description: 'Track your order history, view confirmations, and manage past purchases.',
      cta: 'View orders',
      page: 'orders',
      accent: '#7C3AED',
      soon: true,
    },
  ]

  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT,
      background: 'linear-gradient(145deg, #f5ede6 0%, #fafaf9 40%, #ede8e3 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed', top: -200, right: -200, width: 600, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,65,12,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -150, left: -100, width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,23,42,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,249,0.82)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(231,221,213,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill={T.ink} />
            <rect x="16" y="1" width="11" height="11" rx="2" fill={T.clay} opacity="0.85" />
            <rect x="1" y="16" width="11" height="11" rx="2" fill={T.clay} opacity="0.35" />
            <rect x="16" y="16" width="11" height="11" rx="2" fill={T.ink} opacity="0.18" />
          </svg>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: T.ink, letterSpacing: '-0.02em' }}>
            Palette
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart */}
          <button onClick={() => onNavigate('catalog')} style={{
            position: 'relative', background: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(231,221,213,0.8)',
            borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.ink,
            backdropFilter: 'blur(8px)',
          }}>
            <FiShoppingCart size={14} />
            Cart
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: T.clay, color: T.white,
                borderRadius: '50%', width: 17, height: 17,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>

          {/* User pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(231,221,213,0.8)',
            borderRadius: 10, padding: '7px 14px',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: T.clay + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiUser size={13} color={T.clay} />
            </div>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.ink }}>
              {user?.fullName?.split(' ')[0]}
            </span>
          </div>

          {/* Logout */}
          <button onClick={onLogout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: FONT, fontSize: 13, color: T.stone,
            padding: '7px 4px',
          }}>
            <FiLogOut size={14} />
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2rem 5rem', position: 'relative', zIndex: 1 }}>

        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', color: T.clay, margin: '0 0 10px',
          }}>
            YOUR STUDIO
          </p>
          <h1 style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: T.ink, margin: '0 0 12px', letterSpacing: '-0.035em', lineHeight: 1.1,
          }}>
            {greeting}, {user?.fullName?.split(' ')[0]}.
          </h1>
          <p style={{
            fontFamily: FONT, fontSize: 15, color: T.stone,
            margin: '0 0 2rem', lineHeight: 1.6, maxWidth: 480,
          }}>
            Welcome to your Palette studio. What would you like to design today?
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <StatPill label="Items in cart" value={cartCount} loading={loading} />
            <StatPill label="Past orders" value={orderCount} loading={loading} />
            <StatPill label="Currency" value={currency} loading={false} />
          </div>
        </motion.div>

        {/* Feature cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {cards.map((card, i) => (
            <FeatureCard
              key={card.page}
              {...card}
              index={i}
              onClick={() => onNavigate(card.page)}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontFamily: FONT, fontSize: 12, color: T.stone,
            textAlign: 'center', marginTop: '4rem',
          }}
        >
          Palette Studio · Interior Design & Furniture Platform
        </motion.p>
      </div>
    </div>
  )
}