import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiCheck, FiChevronRight } from 'react-icons/fi'

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

// ─── Quiz questions ───────────────────────────────────────────────────────────
// Each option carries weighted scores for each style
// BOHEMIAN=B, SCANDINAVIAN=S, MINIMALIST=M

const QUESTIONS = [
  {
    id: 'color',
    eyebrow: 'COLOUR PALETTE',
    question: 'Which colour palette feels most like home?',
    options: [
      { id: 'warm',    label: 'Warm terracottas & earthy spice',  emoji: '🍂', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 1 } },
      { id: 'cool',    label: 'Crisp whites & soft sky blues',    emoji: '🌨️', scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'neutral', label: 'Cool greys & charcoal slate',      emoji: '🩶', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'jewel',   label: 'Deep jewel tones & rich indigos',  emoji: '💜', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'texture',
    eyebrow: 'TEXTURES & MATERIALS',
    question: 'What textures draw you in most?',
    options: [
      { id: 'layered',  label: 'Layered rugs, woven baskets & macramé', emoji: '🧺', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'wood',     label: 'Pale natural wood & linen fabrics',      emoji: '🪵', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'concrete', label: 'Concrete, glass & polished steel',       emoji: '🏗️', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'velvet',   label: 'Velvet, brass & eclectic mixed metals',  emoji: '✨', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'mood',
    eyebrow: 'ROOM MOOD',
    question: 'When you walk into a room, what feeling do you want?',
    options: [
      { id: 'adventure', label: 'Curious & full of stories to discover', emoji: '🗺️', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cosy',      label: 'Warm, cosy & deeply comfortable',       emoji: '🕯️', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 0 } },
      { id: 'calm',      label: 'Calm, focused & distraction-free',      emoji: '🧘', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'energy',    label: 'Energetic, bold & expressive',          emoji: '⚡', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'inspiration',
    eyebrow: 'INSPIRATION',
    question: 'Which image would you save to your mood board?',
    options: [
      { id: 'market',   label: 'A Marrakech souk — lanterns, tapestries, layered colour',  emoji: '🏮', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cabin',    label: 'A Nordic cabin — birch floors, sheepskin throws, candlelight', emoji: '🏔️', scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'loft',     label: 'A Tokyo micro-loft — open space, one perfect object',        emoji: '🏙️', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'studio',   label: 'An artist\'s studio — chaos, colour, creative clutter',      emoji: '🎨', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 0 } },
    ],
  },
]

const ROOMS = [
  { id: 'BEDROOM',     name: '🛏️ Bedroom',     label: 'Master bedroom, guest room, or studio' },
  { id: 'LIVING_ROOM', name: '🛋️ Living Room',  label: 'Social gathering, relaxation space' },
  { id: 'KITCHEN',     name: '🍳 Kitchen',      label: 'Cooking, dining, family hub' },
  { id: 'DINING_ROOM', name: '🍽️ Dining Room',  label: 'Formal or casual dining' },
  { id: 'GAME_ROOM',   name: '🎮 Game Room',    label: 'Entertainment, recreation' },
  { id: 'OFFICE',      name: '💼 Office',       label: 'Work, study, productivity' },
]

const STYLE_META = {
  BOHEMIAN:     { emoji: '🎭', accent: '#F59E0B', bg: '#FFFBEB', label: 'Bohemian', tagline: 'Eclectic, expressive, free-spirited' },
  SCANDINAVIAN: { emoji: '❄️', accent: '#38BDF8', bg: '#F0F9FF', label: 'Scandinavian', tagline: 'Light, cosy, beautifully functional' },
  MINIMALIST:   { emoji: '🔲', accent: '#64748B', bg: '#F8FAFC', label: 'Minimalist', tagline: 'Clean, calm, intentionally curated' },
}

function formatPrice(pkr, currency) {
  if (currency === 'USD') return `$${(pkr / 280).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `PKR ${pkr?.toLocaleString('en-PK')}`
}

function deriveStyle(answers) {
  const scores = { BOHEMIAN: 0, SCANDINAVIAN: 0, MINIMALIST: 0 }
  Object.values(answers).forEach(optionId => {
    QUESTIONS.forEach(q => {
      const opt = q.options.find(o => o.id === optionId)
      if (opt) {
        scores.BOHEMIAN     += opt.scores.BOHEMIAN
        scores.SCANDINAVIAN += opt.scores.SCANDINAVIAN
        scores.MINIMALIST   += opt.scores.MINIMALIST
      }
    })
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

// ─── Style reveal screen ──────────────────────────────────────────────────────

function StyleReveal({ style, answers, onContinue }) {
  const meta = STYLE_META[style]
  const [selectedRoom, setSelectedRoom] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
    >
      {/* Result card */}
      <div style={{
        background: meta.bg,
        border: `2px solid ${meta.accent}44`,
        borderRadius: 24, padding: '2.5rem',
        textAlign: 'center',
        boxShadow: `0 0 0 6px ${meta.accent}11`,
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          style={{ fontSize: 64, marginBottom: 16 }}
        >
          {meta.emoji}
        </motion.div>
        <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 8px' }}>
          YOUR AESTHETIC
        </p>
        <h2 style={{
          fontFamily: FONT, fontWeight: 800, fontSize: '2.2rem',
          color: T.ink, margin: '0 0 8px', letterSpacing: '-0.035em',
        }}>
          {meta.label}
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 15, color: T.stone, margin: '0 0 20px' }}>
          {meta.tagline}
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 13, color: T.stone, lineHeight: 1.65,
          maxWidth: 440, margin: '0 auto',
        }}>
          Based on your answers — your colour instincts, texture preferences, and mood — your interior style
          is <strong style={{ color: T.ink }}>{meta.label}</strong>. We've curated a product bundle just for you.
        </p>
      </div>

      {/* Room picker */}
      <div>
        <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 16px' }}>
          NOW PICK YOUR ROOM
        </p>
        <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.3rem', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
          Which space are we designing?
        </h3>
        <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: '0 0 20px' }}>
          We'll pick products tailored to your room and aesthetic.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.875rem' }}>
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              style={{
                background: selectedRoom === room.id ? '#FEF2EC' : T.white,
                border: `${selectedRoom === room.id ? '2px' : '1.5px'} solid ${selectedRoom === room.id ? T.clay : T.warm}`,
                borderRadius: 12, padding: '1rem 1.25rem',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                transition: 'all 0.18s',
                boxShadow: selectedRoom === room.id ? `0 0 0 3px ${T.clay}15` : 'none',
              }}
            >
              <div>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: T.ink, margin: '0 0 3px' }}>{room.name}</p>
                <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>{room.label}</p>
              </div>
              {selectedRoom === room.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: T.clay, color: T.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiCheck size={11} strokeWidth={3} />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => selectedRoom && onContinue(style, selectedRoom)}
        disabled={!selectedRoom}
        whileHover={{ scale: selectedRoom ? 1.02 : 1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: '13px 32px', borderRadius: 10, border: 'none',
          background: selectedRoom ? T.clay : '#CBD5E1',
          color: T.white, fontFamily: FONT, fontSize: 14, fontWeight: 700,
          cursor: selectedRoom ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          alignSelf: 'flex-end',
          transition: 'background 0.2s',
        }}
      >
        Get my recommendations <FiChevronRight size={15} />
      </motion.button>
    </motion.div>
  )
}

// ─── Recommendation view ──────────────────────────────────────────────────────

function RecommendationView({ recommendation, style, room, user, onBack }) {
  const currency = user?.currencyPreference || 'PKR'
  const meta     = STYLE_META[style]
  const bundle   = recommendation.recommendedBundle || recommendation.styleBundle
  const products = recommendation.bundleProducts    || recommendation.recommendedProducts || []
  const total    = bundle?.totalPrice ?? recommendation.estimatedBundlePrice
  const discount = bundle?.discountFactor

  const [addedIds,      setAddedIds]      = useState([])
  const [addingToCart,  setAddingToCart]  = useState(null)
  const [cartMsg,       setCartMsg]       = useState(null)

  const showMsg = (text, ok = true) => {
    setCartMsg({ text, ok })
    setTimeout(() => setCartMsg(null), 2500)
  }

  const addOne = async (product) => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart(product.id)
    try {
      const res = await fetch(`${BASE}/api/cart/add?userId=${user.userId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: product.id, quantity: 1, itemType: 'PRODUCT' }),
      })
      if (!res.ok) throw new Error()
      setAddedIds(ids => [...ids, product.id])
      showMsg(`${product.name} added to cart!`)
    } catch { showMsg('Failed to add to cart.', false) }
    finally { setAddingToCart(null) }
  }

  const addAll = async () => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart('all')
    try {
      for (const p of products) {
        await fetch(`${BASE}/api/cart/add?userId=${user.userId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: p.id, quantity: 1, itemType: 'PRODUCT' }),
        })
      }
      setAddedIds(products.map(p => p.id))
      showMsg(`All ${products.length} products added!`)
    } catch { showMsg('Failed to add some items.', false) }
    finally { setAddingToCart(null) }
  }

  const catEmoji = { BED:'🛏️', CHAIR:'🪑', TABLE:'🪵', LAMP:'💡', RUG:'🟫', WARDROBE:'🚪', SOFA:'🛋️', FLOORING:'🏠', WALLPAPER:'🖼️', DECOR:'🎨' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: meta.bg, border: `1.5px solid ${meta.accent}44`,
          borderRadius: 20, padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{ fontSize: 40 }}>{meta.emoji}</div>
        <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>RECOMMENDED FOR YOU</p>
        <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.6rem', color: T.ink, margin: 0, letterSpacing: '-0.03em' }}>
          {recommendation.recommendationTitle || `${meta.label} · ${room?.replace(/_/g, ' ')}`}
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: 0, lineHeight: 1.65 }}>{recommendation.message}</p>
      </motion.div>

      {/* Bundle */}
      {bundle && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: T.white, border: `1.5px solid ${T.warm}`, borderRadius: 14, padding: '1.5rem' }}
        >
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 8px' }}>CURATED BUNDLE</p>
          <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{bundle.name || bundle.styleName}</h3>
          {bundle.description && <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: '0 0 16px', lineHeight: 1.6 }}>{bundle.description}</p>}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {total != null && (
              <div>
                <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: '0 0 2px' }}>Bundle price</p>
                <p style={{ fontFamily: FONT, fontSize: '1.3rem', fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{formatPrice(total, currency)}</p>
              </div>
            )}
            {discount != null && discount < 1 && (
              <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 6, padding: '4px 10px', fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>
                {Math.round((1 - discount) * 100)}% off
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Cart feedback */}
      <AnimatePresence>
        {cartMsg && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '10px 14px', borderRadius: 8, fontFamily: FONT, fontSize: 13,
              background: cartMsg.ok ? '#f0fdf4' : '#fef2f2',
              color: cartMsg.ok ? '#15803d' : '#b91c1c',
              border: `1px solid ${cartMsg.ok ? '#bbf7d0' : '#fecaca'}`,
            }}
          >{cartMsg.text}</motion.div>
        )}
      </AnimatePresence>

      {/* Products */}
      {products.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>
              INCLUDED PRODUCTS ({products.length})
            </p>
            <button onClick={addAll} disabled={!!addingToCart} style={{
              background: T.ink, color: T.white, border: 'none', borderRadius: 8,
              padding: '8px 18px', cursor: addingToCart ? 'wait' : 'pointer',
              fontFamily: FONT, fontSize: 12, fontWeight: 700,
              opacity: addingToCart ? 0.6 : 1,
            }}>
              {addingToCart === 'all' ? 'Adding…' : `Add all ${products.length} to cart`}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
            {products.map((p, i) => {
              const isAdded  = addedIds.includes(p.id)
              const isAdding = addingToCart === p.id
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.04 }}
                  style={{
                    background: T.white, border: `1.5px solid ${isAdded ? '#A7F3D0' : T.warm}`,
                    borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transition: 'border-color 0.3s',
                  }}
                >
                  <div style={{ height: 130, background: 'linear-gradient(135deg, #f5ede6, #ede8e3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} /> : (catEmoji[p.category] || '🪑')}
                    {isAdded && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: '#059669', color: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheck size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, color: T.ink, margin: 0 }}>{p.name}</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>{p.category}</p>
                    <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: T.ink, margin: 0 }}>{formatPrice(p.priceInPKR, currency)}</p>
                    <button onClick={() => addOne(p)} disabled={!!addingToCart || isAdded}
                      style={{
                        marginTop: 4, background: isAdded ? '#059669' : T.clay,
                        color: T.white, border: 'none', borderRadius: 7,
                        padding: '7px 0', cursor: isAdded || addingToCart ? 'default' : 'pointer',
                        fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        transition: 'background 0.2s', opacity: addingToCart && !isAdded ? 0.6 : 1,
                      }}
                    >
                      {isAdded ? '✓ Added' : isAdding ? 'Adding…' : 'Add to cart'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      <button onClick={onBack} style={{
        alignSelf: 'center', background: 'none', border: `1.5px solid ${T.warm}`,
        borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
        fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.stone, marginTop: 8,
      }}>
        Retake quiz
      </button>
    </div>
  )
}

// ─── Option button ────────────────────────────────────────────────────────────

function OptionButton({ option, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: selected ? '#FEF2EC' : T.white,
        border: `${selected ? '2px' : '1.5px'} solid ${selected ? T.clay : T.warm}`,
        borderRadius: 12, padding: '1rem 1.25rem',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'all 0.18s',
        boxShadow: selected ? `0 0 0 3px ${T.clay}12` : 'none',
      }}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }}>{option.emoji}</span>
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>
        {option.label}
      </span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
          marginLeft: 'auto', flexShrink: 0,
          width: 22, height: 22, borderRadius: '50%',
          background: T.clay, color: T.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiCheck size={12} strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  )
}

// ─── Main quiz component ──────────────────────────────────────────────────────

export default function DesignQuiz({ user, onBack }) {
  const TOTAL = QUESTIONS.length
  const [currentQ,      setCurrentQ]      = useState(0)
  const [answers,       setAnswers]        = useState({})
  const [phase,         setPhase]          = useState('quiz')   // quiz | reveal | recommendation
  const [derivedStyle,  setDerivedStyle]   = useState(null)
  const [loading,       setLoading]        = useState(false)
  const [error,         setError]          = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [selectedRoom,  setSelectedRoom]   = useState(null)

  const q          = QUESTIONS[currentQ]
  const answered   = answers[q?.id]
  const progress   = ((currentQ) / TOTAL) * 100

  const handleAnswer = (optionId) => {
    setAnswers(prev => ({ ...prev, [q.id]: optionId }))
  }

  const handleNext = () => {
    if (currentQ < TOTAL - 1) {
      setCurrentQ(c => c + 1)
    } else {
      // All questions answered — derive style
      const style = deriveStyle(answers)
      setDerivedStyle(style)
      setPhase('reveal')
    }
  }

  const handleBack = () => {
    if (phase === 'reveal')          { setPhase('quiz'); setCurrentQ(TOTAL - 1); return }
    if (phase === 'recommendation')  { setPhase('reveal'); return }
    if (currentQ > 0)                setCurrentQ(c => c - 1)
    else                             onBack()
  }

  const submitQuiz = async (style, room) => {
    setLoading(true)
    setError(null)
    setSelectedRoom(room)
    try {
      const url = user
        ? `${BASE}/api/design-quiz/submit?userId=${user.userId}`
        : `${BASE}/api/design-quiz/submit`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, roomType: room }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`)
      const data = await res.json()
      setRecommendation(data)
      setPhase('recommendation')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQ(0); setAnswers({}); setPhase('quiz')
    setDerivedStyle(null); setRecommendation(null)
    setError(null); setSelectedRoom(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.linen, fontFamily: FONT }}>

      {/* Header */}
      <div style={{
        background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.warm}`,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleBack} style={{
            background: 'none', border: `1.5px solid ${T.warm}`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', color: T.ink,
          }}>
            <FiChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.95rem', color: T.ink, margin: 0 }}>
              Design Style Quiz
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>
              {phase === 'quiz' ? `Question ${currentQ + 1} of ${TOTAL}` : phase === 'reveal' ? 'Your result' : 'Recommendations'}
            </p>
          </div>
        </div>

        {/* Progress bar (quiz phase only) */}
        {phase === 'quiz' && (
          <div style={{ width: 140, height: 4, background: T.warm, borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress + (answered ? 100 / TOTAL : 0)}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: T.clay, borderRadius: 999 }}
            />
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <AnimatePresence mode="wait">

          {/* Quiz phase */}
          {phase === 'quiz' && (
            <motion.div key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div>
                <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 10px' }}>
                  {q.eyebrow}
                </p>
                <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.6rem', color: T.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {q.question}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map(opt => (
                  <OptionButton
                    key={opt.id}
                    option={opt}
                    selected={answers[q.id] === opt.id}
                    onClick={() => handleAnswer(opt.id)}
                  />
                ))}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontFamily: FONT, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={handleNext}
                  disabled={!answered}
                  whileHover={{ scale: answered ? 1.02 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '11px 32px', borderRadius: 10, border: 'none',
                    background: answered ? T.clay : '#CBD5E1',
                    color: T.white, fontFamily: FONT, fontSize: 14, fontWeight: 700,
                    cursor: answered ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {currentQ < TOTAL - 1 ? 'Next' : 'See my style'}
                  <FiChevronRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Reveal phase */}
          {phase === 'reveal' && (
            <motion.div key="reveal"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid rgba(194,65,12,0.2)', borderTopColor: T.clay, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ fontFamily: FONT, color: T.stone, fontSize: 14 }}>Curating your recommendations…</p>
                </div>
              ) : (
                <StyleReveal style={derivedStyle} answers={answers} onContinue={submitQuiz} />
              )}
            </motion.div>
          )}

          {/* Recommendation phase */}
          {phase === 'recommendation' && recommendation && (
            <motion.div key="recommendation"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <RecommendationView
                recommendation={recommendation}
                style={derivedStyle}
                room={selectedRoom}
                user={user}
                onBack={resetQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}