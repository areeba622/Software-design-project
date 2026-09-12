// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiLogOut,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiArrowRight,
  FiPackage,
} from 'react-icons/fi'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'
import PaletteLogoFan from '../components/PaletteLogoFan'


// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TIPS
// ─────────────────────────────────────────────────────────────────────────────

const DESIGN_TIPS = [
  {
    tip: 'Use the 60-30-10 rule',
    detail:
      '60% dominant colour, 30% secondary, 10% accent. This creates visual harmony without making a room feel chaotic.',
  },
  {
    tip: 'Let natural light lead',
    detail:
      'Before choosing paint or furniture, notice how natural light moves through the room. It can completely change how colours and materials appear.',
  },
  {
    tip: 'Layer your lighting',
    detail:
      'Every room benefits from three layers: ambient, task, and accent lighting. Combining them creates depth and warmth.',
  },
  {
    tip: 'Rugs anchor the room',
    detail:
      'A rug that is too small can make furniture feel disconnected. Let the rug help visually unite your seating area.',
  },
  {
    tip: 'Odd numbers feel alive',
    detail:
      'Try grouping decorative objects in threes or fives. Odd-numbered arrangements often create a more natural visual rhythm.',
  },
  {
    tip: 'Vary your heights',
    detail:
      'Mix tall plants, medium-height shelves and low furniture to give the room more visual depth.',
  },
  {
    tip: 'Negative space is furniture',
    detail:
      'You do not need to fill every corner. Empty space gives your eyes somewhere to rest and makes important pieces stand out.',
  },
  {
    tip: 'Texture beats colour',
    detail:
      'A monochromatic room can still feel rich when you combine textures such as linen, wood, stone, metal and glass.',
  },
  {
    tip: 'Mirrors multiply light',
    detail:
      'A mirror placed opposite a window can help distribute natural light throughout the room.',
  },
  {
    tip: 'Start with art',
    detail:
      'Choose a piece of artwork you love and build your room palette around it. It can become the visual starting point for the entire space.',
  },
]


// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────

function Nav({ user, cartCount, onNavigate, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const NAV_LINKS = [
    { page: 'catalog', label: 'Catalog' },
    { page: 'designers', label: 'Designers' },
    { page: 'quiz', label: 'DesignQuiz' },
    { page: 'room-builder', label: 'Custom Room' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center border-b transition-all duration-300 ${
        scrolled
          ? 'bg-paper/92 backdrop-blur-2xl border-hairline shadow-[0_8px_32px_rgba(43,36,32,0.08)]'
          : 'bg-paper/60 backdrop-blur-md border-transparent'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="shrink-0"
        >
          <PaletteLogoFan dark size="sm" />
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ page, label }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="text-[12px] font-semibold uppercase tracking-widest text-ink-soft hover:text-rust transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('catalog')}
            className="relative bg-white border border-hairline rounded-lg px-3.5 py-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:border-rust transition-colors"
          >
            <FiShoppingCart size={14} />
            Cart

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rust text-white rounded-full w-[17px] h-[17px] text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-hairline rounded-lg px-3.5 py-2">
            <div className="w-6 h-6 rounded-full bg-rust/15 flex items-center justify-center">
              <FiUser size={12} className="text-rust" />
            </div>

            <span className="text-[13px] font-semibold text-ink">
              {user?.fullName?.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="text-ink-soft hover:text-rust transition-colors p-1.5"
            aria-label="Sign out"
          >
            <FiLogOut size={16} />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden text-ink"
          aria-label="Menu"
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <FiX size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <FiMenu size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.92 }}
            style={{ transformOrigin: 'top' }}
            className="absolute top-[72px] left-0 right-0 bg-paper/97 backdrop-blur-xl border-b border-hairline px-6 py-5 flex flex-col gap-4"
          >
            {NAV_LINKS.map(({ page, label }) => (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page)
                  setMenuOpen(false)
                }}
                className="text-[15px] font-semibold text-ink text-left"
              >
                {label}
              </button>
            ))}

            <button
              onClick={onLogout}
              className="text-sm text-ink-soft flex items-center gap-2 text-left"
            >
              <FiLogOut size={14} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// WELCOME HEADER — greeting + inline order/cart counts, one card
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeHeader({ user, greeting, greetingEmoji, cartCount, orderCount, loading, onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="rounded-[26px] bg-[#E8E0D5] border border-white/55 shadow-[10px_10px_24px_rgba(169,153,132,0.25),-8px_-8px_20px_rgba(255,253,248,0.86)] px-6 py-6 sm:px-8 sm:py-7 mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
    >
      <div>
        <h1 className="font-display text-[clamp(1.6rem,3.4vw,2.2rem)] text-[#2B2420] mb-1.5">
          Welcome back, {user?.fullName?.split(' ')[0]} {greetingEmoji}
        </h1>
        <p className="text-[13px] text-[#6D6259]">
          Ready to design your perfect space?
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="text-left px-4 py-2.5 rounded-2xl bg-white/60 border border-white/70 hover:border-rust/40 transition-colors"
        >
          <span className="block text-[9px] font-bold tracking-[0.14em] text-[#746A61]">ORDERS</span>
          <span className="block text-lg font-extrabold text-[#2B2420]">{loading ? '—' : orderCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="text-left px-4 py-2.5 rounded-2xl bg-white/60 border border-white/70 hover:border-rust/40 transition-colors"
        >
          <span className="block text-[9px] font-bold tracking-[0.14em] text-[#746A61]">CART</span>
          <span className="block text-lg font-extrabold text-[#2B2420]">{loading ? '—' : cartCount}</span>
        </button>
      </div>
    </motion.div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD (kept — not used in the header anymore, but left available)
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, onClick, loading }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="w-full bg-[#E8E0D5] rounded-[20px] px-5 py-4 text-left border border-white/55 shadow-[6px_6px_15px_rgba(169,153,132,0.22),-5px_-5px_13px_rgba(255,253,248,0.82)] hover:shadow-[8px_8px_18px_rgba(169,153,132,0.25),-6px_-6px_15px_rgba(255,253,248,0.88)] transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold tracking-[0.15em] text-[#746A61]">
          {label}
        </span>

        <span className="text-rust">
          {icon}
        </span>
      </div>

      <span className="text-2xl font-extrabold text-[#2B2420]">
        {loading ? '—' : value}
      </span>
    </motion.button>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// YOUR INTERIOR STYLE
// ─────────────────────────────────────────────────────────────────────────────

function InteriorStyleCard({
  latestQuiz,
  quizLoading,
  onNavigate,
  onViewRecommendations,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55 }}
      className="mb-7"
    >
      <div className="rounded-[26px] bg-[#E8E0D5] border border-white/55 shadow-[10px_10px_24px_rgba(169,153,132,0.25),-8px_-8px_20px_rgba(255,253,248,0.86)] px-6 py-8 sm:px-8 md:px-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-lg">✨</span>

          <span className="text-[10px] font-bold text-rust tracking-[0.16em]">
            YOUR INTERIOR STYLE
          </span>
        </div>

        {quizLoading ? (
          <div className="py-3">
            <div className="mx-auto w-28 h-7 rounded-full bg-[#D8CCBD] animate-pulse" />
          </div>
        ) : latestQuiz ? (
          <>
            <h2 className="font-display text-[clamp(2rem,5vw,3rem)] text-[#2B2420] uppercase tracking-wide">
              {latestQuiz.aestheticStyle}
            </h2>

            {latestQuiz.roomType && (
              <p className="mt-2 text-[11px] text-[#756A61] uppercase tracking-[0.14em]">
                {latestQuiz.roomType.replaceAll('_', ' ')}
              </p>
            )}

            <motion.button
              type="button"
              onClick={onViewRecommendations}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[#2B2420] text-white px-5 py-3 text-[12px] font-bold shadow-[5px_5px_12px_rgba(80,55,40,0.18)]"
            >
              View Recommendations
              <FiArrowRight size={14} />
            </motion.button>
          </>
        ) : (
          <>
            <h2 className="font-display text-[clamp(1.6rem,3.6vw,2.2rem)] text-[#2B2420]">
              You haven't discovered your style yet.
            </h2>

            <motion.button
              type="button"
              onClick={() => onNavigate('quiz')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[#2B2420] text-white px-5 py-3 text-[12px] font-bold"
            >
              Take the Design Quiz
              <FiArrowRight size={14} />
            </motion.button>
          </>
        )}
      </div>
    </motion.section>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDED FOR YOU
// ─────────────────────────────────────────────────────────────────────────────

function RecommendedProducts({ products, loading, onNavigate, onViewAll }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55 }}
      className="mb-7"
    >
      <div className="rounded-[26px] bg-[#E8E0D5] border border-white/55 shadow-[10px_10px_24px_rgba(169,153,132,0.25),-8px_-8px_20px_rgba(255,253,248,0.86)] px-6 py-7 sm:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛋</span>
            <span className="text-[10px] font-bold text-rust tracking-[0.16em]">RECOMMENDED FOR YOU</span>
          </div>
          <button
            onClick={onViewAll}
            className="text-[11px] font-bold text-ink-soft hover:text-rust transition-colors flex items-center gap-1"
          >
            View All <FiArrowRight size={11} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-[#D8CCBD] animate-pulse" />
            ))
          ) : products.length === 0 ? (
            <p className="col-span-full text-[13px] text-[#6D6259] text-center py-6">
              No recommendations yet — browse the catalogue to get started.
            </p>
          ) : (
            products.map(p => (
              <button
                key={p.id}
                onClick={() => onNavigate(`product/${p.id}`)}
                className="text-left group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/60 border border-white/55 mb-2 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl">🪑</span>
                  )}
                </div>
                <p className="text-[12px] font-bold text-[#2B2420] truncate">{p.name}</p>
                <p className="text-[11px] text-[#756A61]">
                  {p.priceInPKR != null ? `PKR ${Number(p.priceInPKR).toLocaleString('en-PK')}` : ''}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </motion.section>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// CREATE YOUR ROOM BUNDLE
// ─────────────────────────────────────────────────────────────────────────────

function RoomBundleCTA({ onNavigate }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55 }}
      className="mb-7"
    >
      <div className="rounded-[26px] bg-[#E8E0D5] border border-white/55 shadow-[10px_10px_24px_rgba(169,153,132,0.25),-8px_-8px_20px_rgba(255,253,248,0.86)] px-6 py-8 sm:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold text-rust tracking-[0.16em]">CREATE YOUR ROOM BUNDLE</span>
        </div>
        <p className="text-[13px] text-[#6D6259] max-w-sm mx-auto mb-6">
          Build a furniture collection for your room.
        </p>
        <motion.button
          type="button"
          onClick={() => onNavigate('room-builder')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-[14px] bg-[#2B2420] text-white px-5 py-3 text-[12px] font-bold shadow-[5px_5px_12px_rgba(80,55,40,0.18)]"
        >
          Build Bundle
          <FiArrowRight size={14} />
        </motion.button>
      </div>
    </motion.section>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TIP OF THE DAY
// ─────────────────────────────────────────────────────────────────────────────

function DesignTipBanner() {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * DESIGN_TIPS.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setTipIndex(i => (i + 1) % DESIGN_TIPS.length)
        setVisible(true)
      }, 380)
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  const tip = DESIGN_TIPS[tipIndex]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55 }}
      className="mb-7"
    >
      <div className="rounded-[26px] bg-[#E8E0D5] border border-white/55 shadow-[10px_10px_24px_rgba(169,153,132,0.25),-8px_-8px_20px_rgba(255,253,248,0.86)] px-6 py-7 sm:px-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-lg">💡</span>
          <span className="text-[10px] font-bold text-rust tracking-[0.16em]">DESIGN TIP OF THE DAY</span>
          <div className="flex gap-1 ml-auto">
            {DESIGN_TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setTipIndex(i); setVisible(true) }, 200) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === tipIndex ? 'bg-rust w-5' : 'bg-rust/25 w-1.5'}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-display text-lg text-[#2B2420] mb-1.5">{tip.tip}</p>
              <p className="text-[13px] text-[#6D6259] leading-relaxed">{tip.detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// WORK WITH A DESIGNER
// ─────────────────────────────────────────────────────────────────────────────

function DesignerCTA({ onNavigate }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55 }}
      className="mb-9 flex justify-center"
    >
      <div className="rounded-[26px] bg-[#2B2420] text-white px-8 py-9 max-w-md w-full text-center shadow-[10px_10px_24px_rgba(43,36,32,0.22),-6px_-6px_16px_rgba(255,253,248,0.5)]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg text-ochre">✦</span>
          <span className="text-[10px] font-bold text-ochre tracking-[0.16em]">WORK WITH A DESIGNER</span>
        </div>
        <p className="text-[13px] text-white/70 mb-6">
          Find an interior designer for your space.
        </p>
        <motion.button
          type="button"
          onClick={() => onNavigate('designers')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-[14px] bg-white text-[#2B2420] px-5 py-3 text-[12px] font-bold"
        >
          View Designers
          <FiArrowRight size={14} />
        </motion.button>
      </div>
    </motion.section>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// QUICK ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

function QuickActions({ onNavigate }) {
  const actions = [
    { label: 'Catalogue', page: 'catalog' },
    { label: 'Design Quiz', page: 'quiz' },
    { label: 'Orders', page: 'orders' },
  ]

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap pb-4">
      {actions.map(a => (
        <button
          key={a.page}
          onClick={() => onNavigate(a.page)}
          className="px-5 py-2.5 rounded-full bg-white border border-hairline text-[12px] font-bold text-ink hover:border-rust hover:text-rust transition-colors"
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onNavigate, onLogout, setCatalogStyleFilter }) {
  const [cartCount, setCartCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [latestQuiz, setLatestQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(true)

  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤' : '👋'

  // Cart + orders
  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(API_ENDPOINTS.CART(user.userId)).then(r => r.json()).catch(() => null),
      fetch(API_ENDPOINTS.ORDERS_BY_USER(user.userId)).then(r => r.json()).catch(() => []),
    ]).then(([cart, orders]) => {
      setCartCount(cart?.lines?.length || 0)
      setOrderCount(Array.isArray(orders) ? orders.length : 0)
    }).finally(() => setLoading(false))
  }, [user])

  // Latest quiz result
  useEffect(() => {
    if (!user) return
    fetch(API_ENDPOINTS.QUIZ_LATEST(user.userId))
      .then(r => (r.ok ? r.json() : null))
      .then(setLatestQuiz)
      .catch(() => setLatestQuiz(null))
      .finally(() => setQuizLoading(false))
  }, [user])

  // Recommended products — waits for the quiz result so it can filter by
  // aestheticStyle when one exists; api.js has no dedicated recommendations
  // endpoint yet, so this pulls the general product list and filters
  // client-side, same approach ProductCatalog.jsx already uses.
  useEffect(() => {
    if (quizLoading) return
    fetch(API_ENDPOINTS.PRODUCTS)
      .then(r => r.json())
      .then(data => {
        let list = Array.isArray(data) ? data : []
        if (latestQuiz?.aestheticStyle) {
          const matched = list.filter(
            p => p.aestheticStyle && p.aestheticStyle.toUpperCase() === latestQuiz.aestheticStyle.toUpperCase()
          )
          if (matched.length > 0) list = matched
        }
        setRecommended(list.slice(0, 4))
      })
      .catch(() => setRecommended([]))
      .finally(() => setRecLoading(false))
  }, [quizLoading, latestQuiz])

  // Both "View Recommendations" (on the style card) and "View All" (on the
  // recommended-products list) mean the same thing: take the user to the
  // catalogue pre-filtered to their quiz style. If they haven't taken the
  // quiz yet, latestQuiz is null and this just behaves like a plain link to
  // the unfiltered catalogue.
  const handleViewStyleInCatalog = () => {
    if (latestQuiz?.aestheticStyle) {
      setCatalogStyleFilter?.(latestQuiz.aestheticStyle)
    }
    onNavigate('catalog')
  }

  return (
    <div className="min-h-screen font-sans bg-plaster relative overflow-x-hidden">
      <Nav user={user} cartCount={cartCount} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-28 pb-16 relative z-10">

        <WelcomeHeader
          user={user}
          greeting={greeting}
          greetingEmoji={greetingEmoji}
          cartCount={cartCount}
          orderCount={orderCount}
          loading={loading}
          onNavigate={onNavigate}
        />

        <InteriorStyleCard
          latestQuiz={latestQuiz}
          quizLoading={quizLoading}
          onNavigate={onNavigate}
          onViewRecommendations={handleViewStyleInCatalog}
        />

        <RecommendedProducts
          products={recommended}
          loading={recLoading}
          onNavigate={onNavigate}
          onViewAll={handleViewStyleInCatalog}
        />

        <RoomBundleCTA onNavigate={onNavigate} />

        <DesignTipBanner />

        <DesignerCTA onNavigate={onNavigate} />

        <QuickActions onNavigate={onNavigate} />

      </div>
    </div>
  )
}