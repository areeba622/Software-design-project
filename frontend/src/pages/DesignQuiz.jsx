import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { FiChevronLeft, FiCheck, FiChevronRight, FiChevronDown, FiShoppingCart, FiSquare, FiHome } from 'react-icons/fi'
import {
  FaBed, FaCouch, FaUtensils, FaWineGlassAlt, FaGamepad, FaBriefcase,
  FaFeatherAlt, FaSnowflake, FaChair, FaLightbulb, FaLayerGroup,
  FaDoorClosed, FaImage, FaPalette,
} from 'react-icons/fa'

import { cartApi, quizApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useCurrency } from '../lib/CurrencyContext'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

// ─── Quiz questions ───────────────────────────────────────────────────────────
// Each option carries weighted scores for each style
// BOHEMIAN=B, SCANDINAVIAN=S, MINIMALIST=M
//
// TODO — full-bleed photos:
// Each question has an `image` field. Import a photo at the top of this file
// and set it here (e.g. image: ColorPaletteBg) to replace the striped
// placeholder background with a real full-bleed photo, IKEA-matchmaker style.

const QUESTIONS = [
  {
    id: 'color',
    eyebrow: 'COLOUR PALETTE',
    question: 'Which colour palette feels most like home?',
    image: '', // TODO: image: ColorPaletteBg
    options: [
      { id: 'warm', label: 'Warm terracottas & earthy spice', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 1 } },
      { id: 'cool', label: 'Crisp whites & soft sky blues', scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'neutral', label: 'Cool greys & charcoal slate', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'jewel', label: 'Deep jewel tones & rich indigos', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'texture',
    eyebrow: 'TEXTURES & MATERIALS',
    question: 'What textures draw you in most?',
    image: '', // TODO: image: TextureBg
    options: [
      { id: 'layered', label: 'Layered rugs, woven baskets & macramé', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'wood', label: 'Pale natural wood & linen fabrics', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'concrete', label: 'Concrete, glass & polished steel', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'velvet', label: 'Velvet, brass & eclectic mixed metals', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'mood',
    eyebrow: 'ROOM MOOD',
    question: 'When you walk into a room, what feeling do you want?',
    image: '', // TODO: image: MoodBg
    options: [
      { id: 'adventure', label: 'Curious & full of stories to discover', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cosy', label: 'Warm, cosy & deeply comfortable', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 0 } },
      { id: 'calm', label: 'Calm, focused & distraction-free', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'energy', label: 'Energetic, bold & expressive', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'inspiration',
    eyebrow: 'INSPIRATION',
    question: 'Which image would you save to your mood board?',
    image: '', // TODO: image: InspirationBg
    options: [
      { id: 'market', label: 'A Marrakech souk — lanterns, tapestries, layered colour', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cabin', label: 'A Nordic cabin — birch floors, sheepskin throws, candlelight', scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'loft', label: 'A Tokyo micro-loft — open space, one perfect object', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'studio', label: 'An artist\'s studio — chaos, colour, creative clutter', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 0 } },
    ],
  },
]

// Diagonal-stripe placeholder backgrounds, cycled per question (IKEA matchmaker style).
// Swap a question's `image` field above for a real photo whenever it's ready —
// stripeBackground() below is only used as the fallback.
const STRIPE_PALETTES = [
  { a: '#E2724A', b: '#D8623A' }, // terracotta — colour question
  { a: '#F0A438', b: '#E4922A' }, // amber — texture question
  { a: '#C97B3D', b: '#BD6B2E' }, // rust/clay — mood question
  { a: '#D98A4A', b: '#CC7A3A' }, // ochre — inspiration question
]
function stripeBackground(palette) {
  return `repeating-linear-gradient(135deg, ${palette.a} 0px, ${palette.a} 46px, ${palette.b} 46px, ${palette.b} 92px)`
}

// TODO — room thumbnails:
// Set `image` on any room below (e.g. image: BedroomThumb) to show a real
// photo instead of the icon badge. Suggested shot: a well-lit, styled example
// of that room type, cropped square.
const ROOMS = [
  { id: 'BEDROOM', icon: FaBed, image: '', name: 'Bedroom', label: 'Master bedroom, guest room, or studio' },
  { id: 'LIVING_ROOM', icon: FaCouch, image: '', name: 'Living Room', label: 'Social gathering, relaxation space' },
  { id: 'KITCHEN', icon: FaUtensils, image: '', name: 'Kitchen', label: 'Cooking, dining, family hub' },
  { id: 'DINING_ROOM', icon: FaWineGlassAlt, image: '', name: 'Dining Room', label: 'Formal or casual dining' },
  { id: 'GAME_ROOM', icon: FaGamepad, image: '', name: 'Game Room', label: 'Entertainment, recreation' },
  { id: 'OFFICE', icon: FaBriefcase, image: '', name: 'Office', label: 'Work, study, productivity' },
]

// TODO — style photos:
// Set `image` on a style (e.g. image: BohemianStyleImg — reuse the same photos
// from the landing page style teaser) to show a real photo badge instead of
// the icon fallback below.
const STYLE_META = {
  BOHEMIAN: { icon: FaFeatherAlt, image: '', accent: '#F59E0B', bg: '#FFFBEB', stripeA: '#F0A438', stripeB: '#E4922A', label: 'Bohemian', tagline: 'Eclectic, expressive, free-spirited' },
  SCANDINAVIAN: { icon: FaSnowflake, image: '', accent: '#38BDF8', bg: '#F0F9FF', stripeA: '#7DD3FC', stripeB: '#5EC2EF', label: 'Scandinavian', tagline: 'Light, cosy, beautifully functional' },
  MINIMALIST: { icon: FiSquare, image: '', accent: '#64748B', bg: '#F8FAFC', stripeA: '#94A3B8', stripeB: '#7E8FA3', label: 'Minimalist', tagline: 'Clean, calm, intentionally curated' },
}

// Product category icons — replaces the old emoji map so rendering is
// consistent across every browser/OS instead of relying on emoji fonts.
const CATEGORY_ICONS = {
  BED: FaBed, CHAIR: FaChair, TABLE: FaLayerGroup, LAMP: FaLightbulb,
  RUG: FaLayerGroup, WARDROBE: FaDoorClosed, SOFA: FaCouch,
  FLOORING: FaLayerGroup, WALLPAPER: FaImage, DECOR: FaPalette,
}


function deriveStyle(answers) {
  const scores = { BOHEMIAN: 0, SCANDINAVIAN: 0, MINIMALIST: 0 }
  Object.values(answers).forEach(optionId => {
    QUESTIONS.forEach(q => {
      const opt = q.options.find(o => o.id === optionId)
      if (opt) {
        scores.BOHEMIAN += opt.scores.BOHEMIAN
        scores.SCANDINAVIAN += opt.scores.SCANDINAVIAN
        scores.MINIMALIST += opt.scores.MINIMALIST
      }
    })
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

// Fires a real party-popper burst from roughly where the result card sits.
// Called imperatively (not JSX) since canvas-confetti draws on its own canvas.
function fireConfetti(accent) {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 38,
    gravity: 0.9,
    origin: { y: 0.35 },
    colors: [accent, '#ffffff', T.ink, '#FDBA74'],
    zIndex: 999,
  })
  // A second, gentler burst a beat later reads as more "party popper," less "single pop"
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      startVelocity: 28,
      gravity: 0.8,
      origin: { y: 0.35 },
      colors: [accent, '#ffffff'],
      zIndex: 999,
    })
  }, 200)
}

// ─── Style badge — real photo if provided, otherwise a clean icon (no emoji) ──

function StyleBadge({ meta, size = 64 }) {
  const Icon = meta.icon
  if (meta.image) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
        <img src={meta.image} alt={meta.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', margin: '0 auto',
      background: `${meta.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: meta.accent,
    }}>
      <Icon size={size * 0.42} />
    </div>
  )
}

// ─── Intro hero — big text, fades out as the user scrolls down ────────────────

function IntroHero({ scrollY }) {
  const fade = Math.max(0, 1 - scrollY / 380)
  const lift = Math.min(scrollY * 0.25, 70)

  return (
    <div style={{
      height: '100vh', position: 'relative', overflow: 'hidden',
      // TODO: swap this gradient for a real full-bleed lifestyle photo, e.g.
      //   background: `url(${IntroBg}) center/cover no-repeat`
      background: 'linear-gradient(160deg, #C2410C 0%, #78350F 100%)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.55) 100%)' }} />
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 1.5rem',
        opacity: fade, transform: `translateY(-${lift}px)`,
        pointerEvents: fade < 0.05 ? 'none' : 'auto',
      }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#FDBA74', margin: '0 0 18px' }}>
          STYLE QUIZ
        </p>
        <h1 style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(2.2rem, 7vw, 4.6rem)',
          color: '#fff', margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.05,
        }}>
          Find your <span style={{ fontStyle: 'italic', fontWeight: 500 }}>interior</span> match
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: 'rgba(255,255,255,0.85)', maxWidth: 460, margin: '0 0 44px', lineHeight: 1.6 }}>
          Answer a few playful questions and we'll match you with your ideal Palette style.
        </p>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ color: '#fff' }}>
          <FiChevronDown size={26} />
        </motion.div>
        <p style={{ marginTop: 8, fontFamily: FONT, fontSize: 11, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)' }}>
          SCROLL TO BEGIN
        </p>
      </div>
    </div>
  )
}

// ─── Answer card — plain white card, no emoji, auto-advances on click ─────────

function AnswerCard({ option, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: selected ? 1 : 1.02, y: selected ? 0 : -3 }}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: T.white,
        border: `2px solid ${selected ? T.ink : 'transparent'}`,
        borderRadius: 12, padding: '1.1rem 1.35rem',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        boxShadow: selected ? '0 6px 20px rgba(15,23,42,0.18)' : '0 2px 10px rgba(15,23,42,0.08)',
      }}
    >
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: T.ink, lineHeight: 1.4 }}>
        {option.label}
      </span>
      {selected && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: T.ink, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FiCheck size={12} strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  )
}

// ─── Question screen — question left, answers right, striped colour-shift bg ──

function QuizQuestionScreen({ q, index, total, answers, onAnswer, onNext }) {
  const answered = answers[q.id]
  const palette = STRIPE_PALETTES[index % STRIPE_PALETTES.length]
  const background = q.image ? `url(${q.image}) center/cover no-repeat` : stripeBackground(palette)
  const advanceTimer = useRef(null)

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  const handleSelect = (optionId) => {
    onAnswer(optionId)
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => onNext(), 550)
  }

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ position: 'absolute', inset: 0, background }}
      />
      <div className="dq-grid" style={{
        position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto',
        padding: '4rem 2rem', minHeight: 'calc(100vh - 60px)',
      }}>
        {/* Left: counter, eyebrow, question */}
        <div>
          <motion.p
            key={`counter-${index}`}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'rgba(28,25,23,0.55)', margin: '0 0 14px' }}
          >
            {index + 1}/{total}
          </motion.p>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(28,25,23,0.6)', margin: '0 0 10px' }}>
            {q.eyebrow}
          </p>
          <motion.h2
            key={`q-${index}`}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{
              fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)',
              color: '#1C1917', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15,
            }}
          >
            {q.question}
          </motion.h2>
        </div>

        {/* Right: answer cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          {q.options.map((opt, i) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
            >
              <AnswerCard
                option={opt}
                selected={answered === opt.id}
                onClick={() => handleSelect(opt.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Style reveal screen ──────────────────────────────────────────────────────

function StyleReveal({ style, onContinue }) {
  const meta = STYLE_META[style]
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Real party-popper burst, fired once when the result card appears.
  useEffect(() => {
    fireConfetti(meta.accent)
  }, [meta.accent])

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ position: 'absolute', inset: 0, background: stripeBackground({ a: meta.stripeA, b: meta.stripeB }) }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto', padding: '4rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Result card — pops in with a spring, real confetti fired from useEffect above */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          style={{
            position: 'relative', background: T.white,
            border: `2px solid ${meta.accent}55`,
            borderRadius: 24, padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(15,23,42,0.15)',
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            style={{ marginBottom: 16 }}
          >
            <StyleBadge meta={meta} size={72} />
          </motion.div>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 8px' }}>
            YOUR AESTHETIC
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ fontFamily: FONT, fontWeight: 800, fontSize: '2.2rem', color: T.ink, margin: '0 0 8px', letterSpacing: '-0.035em' }}
          >
            {meta.label}
          </motion.h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: T.stone, margin: '0 0 20px' }}>
            {meta.tagline}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, lineHeight: 1.65, maxWidth: 440, margin: '0 auto' }}>
            Based on your answers — your colour instincts, texture preferences, and mood — your interior style
            is <strong style={{ color: T.ink }}>{meta.label}</strong>. We've curated a product bundle just for you.
          </p>

          {/* Replay the burst on demand — small delightful extra, no logic implications */}
          <motion.button
            onClick={() => fireConfetti(meta.accent)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: `1.5px solid ${meta.accent}55`,
              borderRadius: 999, padding: '6px 16px', cursor: 'pointer',
              fontFamily: FONT, fontSize: 11, fontWeight: 700, color: meta.accent,
              letterSpacing: '0.06em',
            }}
          >
            <FaPalette size={12} /> Celebrate again
          </motion.button>
        </motion.div>

        {/* Room picker */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: T.white, borderRadius: 20, padding: '1.75rem', boxShadow: '0 10px 30px rgba(15,23,42,0.1)' }}
        >
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 16px' }}>
            NOW PICK YOUR ROOM
          </p>
          <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.3rem', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
            Which space are we designing?
          </h3>
          <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: '0 0 20px' }}>
            We'll pick products tailored to your room and aesthetic.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.875rem' }}>
            {ROOMS.map((room, i) => {
              const Icon = room.icon
              const isSelected = selectedRoom === room.id
              return (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRoom(room.id)}
                  style={{
                    background: isSelected ? '#FEF2EC' : T.linen,
                    border: `${isSelected ? '2px' : '1.5px'} solid ${isSelected ? T.clay : T.warm}`,
                    borderRadius: 12, padding: '1rem 1.25rem',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', gap: 12, alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                    background: isSelected ? T.clay : `${T.ink}0d`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#fff' : T.ink,
                  }}>
                    {room.image
                      ? <img src={room.image} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Icon size={18} />
                    }
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: T.ink, margin: '0 0 3px' }}>{room.name}</p>
                      <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>{room.label}</p>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: T.clay, color: T.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FiCheck size={11} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <motion.button
          onClick={() => selectedRoom && onContinue(style, selectedRoom)}
          disabled={!selectedRoom}
          whileHover={{ scale: selectedRoom ? 1.02 : 1 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '13px 32px', borderRadius: 999, border: 'none',
            background: selectedRoom ? T.ink : '#CBD5E1',
            color: T.white, fontFamily: FONT, fontSize: 14, fontWeight: 700,
            cursor: selectedRoom ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            alignSelf: 'flex-end', boxShadow: '0 10px 24px rgba(15,23,42,0.25)',
          }}
        >
          Get my recommendations <FiChevronRight size={15} />
        </motion.button>
      </div>
    </div>
  )
}

// ─── Recommendation view — playful pop-in products ─────────────────────────────

function RecommendationView({ recommendation, style, room, onBack, onGoHome }) {
  const { user } = useAuth()
  const { format: formatMoney } = useCurrency()
  const meta = STYLE_META[style]
  const bundle = recommendation.recommendedBundle || recommendation.styleBundle
  const products = recommendation.bundleProducts || recommendation.recommendedProducts || []
  const total = bundle?.totalPrice ?? recommendation.estimatedBundlePrice
  const discount = bundle?.discountFactor

  const [addedIds, setAddedIds] = useState([])
  const [addingToCart, setAddingToCart] = useState(null)
  const [cartMsg, setCartMsg] = useState(null)

  // A small celebratory burst when the recommendations first appear.
  useEffect(() => {
    fireConfetti(meta.accent)
  }, [meta.accent])

  const showMsg = (text, ok = true) => {
    setCartMsg({ text, ok })
    setTimeout(() => setCartMsg(null), 2500)
  }

  const addOne = async (product) => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart(product.id)
    try {
      await cartApi.add({ itemId: product.id })
      setAddedIds(ids => [...ids, product.id])
      showMsg(`${product.name} added to cart!`)
      // Tiny burst right at the button for extra "yes!" feedback
      confetti({ particleCount: 24, spread: 50, startVelocity: 22, origin: { y: 0.7 }, colors: [meta.accent, '#fff'] })
    } catch { showMsg('Failed to add to cart.', false) }
    finally { setAddingToCart(null) }
  }

  const addAll = async () => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart('all')
    try {
      for (const p of products) {
        await cartApi.add({ itemId: p.id })
      }
      setAddedIds(products.map(p => p.id))
      showMsg(`All ${products.length} products added!`)
      fireConfetti(meta.accent)
    } catch { showMsg('Failed to add some items.', false) }
    finally { setAddingToCart(null) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Banner — pops in with a little bounce, like a "ta-da!" reveal */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        style={{
          background: meta.bg, border: `1.5px solid ${meta.accent}44`,
          borderRadius: 20, padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
        >
          <StyleBadge meta={meta} size={48} />
        </motion.div>
        <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>RECOMMENDED FOR YOU</p>
        <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.6rem', color: T.ink, margin: 0, letterSpacing: '-0.03em' }}>
          {recommendation.recommendationTitle || `${meta.label} · ${room?.replace(/_/g, ' ')}`}
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: 0, lineHeight: 1.65 }}>{recommendation.message}</p>
      </motion.div>

      {/* Bundle */}
      {bundle && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: T.white, border: `1.5px solid ${T.warm}`, borderRadius: 14, padding: '1.5rem' }}
        >
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 8px' }}>CURATED BUNDLE</p>
          <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{bundle.name || bundle.styleName}</h3>
          {bundle.description && <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: '0 0 16px', lineHeight: 1.6 }}>{bundle.description}</p>}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {total != null && (
              <div>
                <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: '0 0 2px' }}>Bundle price</p>
                <p style={{ fontFamily: FONT, fontSize: '1.3rem', fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{formatMoney(total)}</p>
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

      {/* Cart feedback — bouncy toast */}
      <AnimatePresence>
        {cartMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              padding: '10px 14px', borderRadius: 8, fontFamily: FONT, fontSize: 13,
              background: cartMsg.ok ? '#f0fdf4' : '#fef2f2',
              color: cartMsg.ok ? '#15803d' : '#b91c1c',
              border: `1px solid ${cartMsg.ok ? '#bbf7d0' : '#fecaca'}`,
            }}
          >{cartMsg.text}</motion.div>
        )}
      </AnimatePresence>

      {/* Products — staggered spring pop-in */}
      {products.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>
              INCLUDED PRODUCTS ({products.length})
            </p>
            <motion.button
              onClick={addAll} disabled={!!addingToCart}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.ink, color: T.white, border: 'none', borderRadius: 8,
                padding: '8px 18px', cursor: addingToCart ? 'wait' : 'pointer',
                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                opacity: addingToCart ? 0.6 : 1,
              }}
            >
              <FiShoppingCart size={13} />
              {addingToCart === 'all' ? 'Adding…' : `Add all ${products.length} to cart`}
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
            {products.map((p, i) => {
              const isAdded = addedIds.includes(p.id)
              const isAdding = addingToCart === p.id
              const CategoryIcon = CATEGORY_ICONS[p.category] || FaChair
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
                  whileHover={{ y: -5, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
                  style={{
                    background: T.white, border: `1.5px solid ${isAdded ? '#A7F3D0' : T.warm}`,
                    borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transition: 'border-color 0.3s',
                  }}
                >
                  <div style={{ height: 130, background: 'linear-gradient(135deg, #f5ede6, #ede8e3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: T.stone }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                      : <CategoryIcon size={30} />
                    }
                    {isAdded && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: '#059669', color: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheck size={12} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, color: T.ink, margin: 0 }}>{p.name}</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>{p.category}</p>
                    <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: T.ink, margin: 0 }}>{formatMoney(p.priceInPKR)}</p>
                    <motion.button
                      onClick={() => addOne(p)} disabled={!!addingToCart || isAdded}
                      whileHover={{ scale: isAdded ? 1 : 1.03 }} whileTap={{ scale: 0.96 }}
                      style={{
                        marginTop: 4, background: isAdded ? '#059669' : T.clay,
                        color: T.white, border: 'none', borderRadius: 7,
                        padding: '7px 0', cursor: isAdded || addingToCart ? 'default' : 'pointer',
                        fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        opacity: addingToCart && !isAdded ? 0.6 : 1,
                      }}
                    >
                      {isAdded ? '✓ Added' : isAdding ? 'Adding…' : 'Add to cart'}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <button onClick={onBack} style={{
          background: 'none', border: `1.5px solid ${T.warm}`,
          borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
          fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.stone,
        }}>
          Retake quiz
        </button>
        <motion.button
          onClick={onGoHome}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: T.ink, border: 'none',
            borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
            fontFamily: FONT, fontSize: 13, fontWeight: 700, color: T.white,
          }}
        >
          <FiHome size={14} /> Back to Home
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main quiz component ──────────────────────────────────────────────────────

export default function DesignQuiz({ onBack }) {
  const TOTAL = QUESTIONS.length
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('quiz')   // quiz | reveal | recommendation
  const [derivedStyle, setDerivedStyle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const q = QUESTIONS[currentQ]
  const answered = answers[q?.id]
  const progress = ((currentQ) / TOTAL) * 100

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
    if (phase === 'reveal') { setPhase('quiz'); setCurrentQ(TOTAL - 1); return }
    if (phase === 'recommendation') { setPhase('reveal'); return }
    if (currentQ > 0) setCurrentQ(c => c - 1)
    else onBack()
  }

  const submitQuiz = async (style, room) => {
    setLoading(true)
    setError(null)
    setSelectedRoom(room)
    try {
      // Sent with the login token, so the result is saved to the user's profile.
      const data = await quizApi.submit(style, room)
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

      {phase === 'quiz' && <IntroHero scrollY={scrollY} />}

      {/* Header */}
      <div style={{
        background: phase === 'quiz' ? 'rgba(28,25,23,0.15)' : 'rgba(250,250,249,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: phase === 'quiz' ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${T.warm}`,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleBack} style={{
            background: 'none',
            border: `1.5px solid ${phase === 'quiz' ? 'rgba(28,25,23,0.3)' : T.warm}`,
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

        {phase === 'quiz' && (
          <div style={{ width: 140, height: 4, background: 'rgba(28,25,23,0.15)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress + (answered ? 100 / TOTAL : 0)}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: T.ink, borderRadius: 999 }}
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {phase === 'quiz' && (
          <motion.div key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32 }}
          >
            <QuizQuestionScreen
              q={q} index={currentQ} total={TOTAL}
              answers={answers} onAnswer={handleAnswer} onNext={handleNext}
            />
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(194,65,12,0.2)', borderTopColor: T.clay, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: FONT, color: T.stone, fontSize: 14 }}>Curating your recommendations…</p>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ maxWidth: 680, margin: '2rem auto 0', padding: '12px 16px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontFamily: FONT, fontSize: 13 }}>
                    {error}
                  </div>
                )}
                <StyleReveal style={derivedStyle} onContinue={submitQuiz} />
              </>
            )}
          </motion.div>
        )}

        {phase === 'recommendation' && recommendation && (
          <motion.div key="recommendation"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}
          >
            <RecommendationView
              recommendation={recommendation}
              style={derivedStyle}
              room={selectedRoom}
              onBack={resetQuiz}
              onGoHome={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .dq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 780px) {
          .dq-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  )
}