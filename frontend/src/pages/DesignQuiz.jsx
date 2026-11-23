import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { FaBed, FaBriefcase, FaCouch, FaUtensils, FaWineGlassAlt } from 'react-icons/fa'
import { quizApi } from '../api'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { roomLabel, styleLabel } from '../lib/labels'
import Button from '../components/ui/Button'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ui/ProductImage'
import minimalistImg from '../assets/styles/minimalist.jpg'
import scandinavianImg from '../assets/styles/scandinavian.jpg'
import bohemianImg from '../assets/styles/bohemian.jpg'

// Each option carries weighted scores for each style.
const QUESTIONS = [
  {
    id: 'color',
    question: 'Which colours feel most like home?',
    options: [
      { id: 'warm', label: 'Warm terracottas and earthy spice', swatches: ['#C4522A', '#D9894F', '#E8C3A0', '#7A3E26'], scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 1 } },
      { id: 'cool', label: 'Crisp whites and soft sky blues', swatches: ['#FFFFFF', '#DCE8F2', '#A9C6DE', '#6F93B5'], scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'neutral', label: 'Cool greys and charcoal slate', swatches: ['#E6E6E4', '#B4B4B1', '#6E6F71', '#2F3133'], scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'jewel', label: 'Deep jewel tones and rich indigo', swatches: ['#1F3B73', '#5B2A86', '#0F5E5A', '#8C1C3A'], scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'texture',
    question: 'Which textures draw you in?',
    options: [
      { id: 'layered', label: 'Layered rugs, woven baskets and macramé', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'wood', label: 'Pale natural wood and linen', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'concrete', label: 'Concrete, glass and polished steel', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'velvet', label: 'Velvet, brass and mixed metals', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'mood',
    question: 'How should a room feel when you walk in?',
    options: [
      { id: 'adventure', label: 'Curious, full of stories to discover', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cosy', label: 'Warm, cosy and deeply comfortable', scores: { BOHEMIAN: 1, SCANDINAVIAN: 3, MINIMALIST: 0 } },
      { id: 'calm', label: 'Calm, focused and distraction-free', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'energy', label: 'Energetic, bold and expressive', scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 1 } },
    ],
  },
  {
    id: 'inspiration',
    question: 'Which place would you pin to your mood board?',
    options: [
      { id: 'market', label: 'A Marrakech souk with lanterns, tapestries and colour', scores: { BOHEMIAN: 3, SCANDINAVIAN: 0, MINIMALIST: 0 } },
      { id: 'cabin', label: 'A Nordic cabin with birch floors and candlelight', scores: { BOHEMIAN: 0, SCANDINAVIAN: 3, MINIMALIST: 1 } },
      { id: 'loft', label: 'A Tokyo micro-loft with one perfect object', scores: { BOHEMIAN: 0, SCANDINAVIAN: 1, MINIMALIST: 3 } },
      { id: 'studio', label: "An artist's studio, colourful and creatively cluttered", scores: { BOHEMIAN: 2, SCANDINAVIAN: 0, MINIMALIST: 0 } },
    ],
  },
]

const STYLE_INFO = {
  MINIMALIST: { img: minimalistImg, text: 'Clean lines, a restrained palette and only what you need. Every piece earns its place.' },
  SCANDINAVIAN: { img: scandinavianImg, text: 'Light woods, soft textiles and calm, practical rooms that feel warm in every season.' },
  BOHEMIAN: { img: bohemianImg, text: 'Layered textiles, warm colour and pieces collected over time. Rooms with a story.' },
}

const ROOM_OPTIONS = [
  { id: 'LIVING_ROOM', icon: FaCouch },
  { id: 'BEDROOM', icon: FaBed },
  { id: 'DINING_ROOM', icon: FaWineGlassAlt },
  { id: 'KITCHEN', icon: FaUtensils },
  { id: 'OFFICE', icon: FaBriefcase },
]

function deriveStyle(answers) {
  const scores = { BOHEMIAN: 0, SCANDINAVIAN: 0, MINIMALIST: 0 }
  QUESTIONS.forEach((q) => {
    const opt = q.options.find((o) => o.id === answers[q.id])
    if (opt) Object.keys(scores).forEach((k) => (scores[k] += opt.scores[k]))
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

// Each question gets its own palette tone; the page eases from one to the next.
const QUESTION_BANDS = ['bg-sand', 'bg-sage-soft', 'bg-accent-soft', 'bg-surface-2']
const STYLE_BANDS = { MINIMALIST: 'bg-surface-2', SCANDINAVIAN: 'bg-sage-soft', BOHEMIAN: 'bg-accent-soft' }
const OPTION_TONES = ['bg-accent text-white', 'bg-sage text-white', 'bg-cocoa text-white', 'bg-sand text-cocoa']
const ROOM_TONES = {
  LIVING_ROOM: 'bg-accent text-white',
  BEDROOM: 'bg-sage text-white',
  DINING_ROOM: 'bg-cocoa text-white',
  KITCHEN: 'bg-accent-soft text-accent',
  OFFICE: 'bg-sage-soft text-sage',
}

function Progress({ step, total }) {
  return (
    <div className="flex items-center gap-4">
      <span className="tabular shrink-0 rounded-full bg-accent px-3 py-1 text-[13px] font-semibold text-white">
        {step + 1} of {total}
      </span>
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-accent' : 'bg-white/80'}`} />
        ))}
      </div>
    </div>
  )
}

export default function DesignQuiz({ onBack }) {
  const reduce = useReducedMotion()
  const { add } = useCart()
  const { format } = useCurrency()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('quiz') // quiz | reveal | recommendation
  const [style, setStyle] = useState(null)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [addAllState, setAddAllState] = useState('idle')

  const q = QUESTIONS[step]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [phase, step])

  const choose = (optionId) => {
    const next = { ...answers, [q.id]: optionId }
    setAnswers(next)
    // A short pause lets the selection register before the next question slides in.
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) setStep(step + 1)
      else {
        setStyle(deriveStyle(next))
        setPhase('reveal')
      }
    }, 220)
  }

  const goBack = () => {
    if (phase === 'recommendation') return setPhase('reveal')
    if (phase === 'reveal') return setPhase('quiz')
    if (step > 0) return setStep(step - 1)
    onBack()
  }

  const submit = async (roomId) => {
    setRoom(roomId)
    setLoading(true)
    setError(null)
    try {
      // Sent with the login token, so the result is saved to the user's profile.
      setRecommendation(await quizApi.submit(style, roomId))
      setAddAllState('idle')
      setPhase('recommendation')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers({})
    setStyle(null)
    setRoom(null)
    setRecommendation(null)
    setPhase('quiz')
  }

  const products = recommendation?.bundleProducts || []
  const total = products.reduce((s, p) => s + (p.priceInPKR || 0), 0)

  const addAll = async () => {
    setAddAllState('adding')
    try {
      for (let i = 0; i < products.length; i++) {
        const last = i === products.length - 1
        await add({ itemId: products[i].id, name: last ? `${products.length} pieces for your ${roomLabel(room).toLowerCase()}` : undefined })
      }
      setAddAllState('added')
    } catch {
      setAddAllState('error')
    }
  }

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } }

  const band = phase === 'quiz' ? QUESTION_BANDS[step % QUESTION_BANDS.length] : phase === 'reveal' && style ? STYLE_BANDS[style] : 'bg-canvas'

  return (
    <div className={`transition-colors duration-500 ease-out ${band}`}>
    <div className="page pb-24 pt-8 sm:pt-12">
      <button type="button" onClick={goBack} className="mb-8 inline-flex items-center gap-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink">
        <FiArrowLeft size={17} />
        {phase === 'quiz' && step === 0 ? 'Back to overview' : 'Back'}
      </button>

      <AnimatePresence mode="wait">
        {phase === 'quiz' && (
          <motion.section key={`q-${step}`} {...slide} transition={{ type: 'spring', bounce: 0, duration: 0.35 }} className="mx-auto max-w-3xl pb-8">
            <Progress step={step} total={QUESTIONS.length} />
            <h1 className="display mt-10 text-[2rem] sm:text-[2.75rem]">{q.question}</h1>
            <p className="mt-3 text-[16px] text-ink-2">Pick the one that feels closest. There are no wrong answers.</p>
            <div role="radiogroup" aria-label={q.question} className="mt-9 grid gap-3 sm:grid-cols-2">
              {q.options.map((o, i) => {
                const selected = answers[q.id] === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(o.id)}
                    className={`group flex min-h-[5.5rem] items-center gap-4 rounded-panel bg-white p-5 text-left shadow-[0_1px_2px_rgb(56_36_28/0.06)] transition-[box-shadow,transform] active:scale-[0.99] ${
                      selected ? 'ring-2 ring-accent' : 'hover:shadow-lift'
                    }`}
                  >
                    {o.swatches ? (
                      <span className="flex shrink-0 overflow-hidden rounded-[10px] ring-1 ring-inset ring-black/5" aria-hidden="true">
                        {o.swatches.map((c) => (
                          <span key={c} className="h-12 w-5" style={{ background: c }} />
                        ))}
                      </span>
                    ) : (
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold ${OPTION_TONES[i % OPTION_TONES.length]}`} aria-hidden="true">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    <span className="flex-1 text-[16px] font-medium leading-snug text-ink">{o.label}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        selected ? 'border-accent bg-accent text-white' : 'border-line-strong text-transparent group-hover:border-ink-3'
                      }`}
                      aria-hidden="true"
                    >
                      <FiCheck size={14} strokeWidth={3} />
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.section>
        )}

        {phase === 'reveal' && style && (
          <motion.section key="reveal" {...slide} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
              <div>
                <p className="text-[17px] font-medium text-accent">Your style is</p>
                <h1 className="display mt-1 text-[3rem] sm:text-[4.25rem]">{styleLabel(style)}</h1>
                <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-2">{STYLE_INFO[style].text}</p>
              </div>
              <ProductImage src={STYLE_INFO[style].img} alt={`${styleLabel(style)} mood board`} ratio="4/3" fit="contain" className="rounded-panel !bg-white shadow-lift" />
            </div>

            <div className="mt-16 border-t border-ink/10 pt-10">
              <h2 className="display text-[1.6rem]">Which room are you furnishing?</h2>
              <p className="mt-1.5 text-[15px] text-ink-2">We'll pick {styleLabel(style).toLowerCase()} pieces that suit it.</p>
              {error && (
                <p role="alert" className="mt-4 rounded-card bg-danger-soft px-4 py-3 text-[15px] text-danger">
                  {error}
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {ROOM_OPTIONS.map(({ id, icon: Icon }) => {
                  const busy = loading && room === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => submit(id)}
                      disabled={loading}
                      className="flex flex-col items-start gap-6 rounded-panel bg-white p-5 text-left shadow-[0_1px_2px_rgb(56_36_28/0.06)] transition-[box-shadow,transform] hover:shadow-lift active:scale-[0.98] disabled:opacity-60"
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${ROOM_TONES[id]}`}>
                        {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-ink" /> : <Icon size={18} />}
                      </span>
                      <span className="text-[15px] font-semibold text-ink">{roomLabel(id)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.section>
        )}

        {phase === 'recommendation' && recommendation && (
          <motion.section key="rec" {...slide} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
            <div className={`flex flex-col gap-6 rounded-panel p-7 sm:p-10 lg:flex-row lg:items-end lg:justify-between ${STYLE_BANDS[style] || 'bg-sand'}`}>
              <div className="max-w-2xl">
                <p className="text-[17px] font-medium text-accent">Picked for you</p>
                <h1 className="display mt-1 text-[2.2rem] sm:text-[3rem]">
                  {styleLabel(style)} {roomLabel(room).toLowerCase()}
                </h1>
                <p className="mt-3 text-[17px] text-ink-2">
                  {products.length} pieces chosen to work together. Add them one at a time, or all at once.
                </p>
              </div>
              {products.length > 0 && (
                <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                  <p className="tabular text-[15px] text-ink-2">
                    Together <span className="font-semibold text-ink">{format(total)}</span>
                  </p>
                  <Button size="lg" onClick={addAll} disabled={addAllState === 'adding' || addAllState === 'added'} className={addAllState === 'added' ? '!bg-success !opacity-100' : ''}>
                    {addAllState === 'added' && <FiCheck size={18} />}
                    {addAllState === 'adding' ? 'Adding…' : addAllState === 'added' ? 'All added to cart' : `Add all ${products.length} to cart`}
                  </Button>
                  {addAllState === 'error' && <p className="text-sm text-danger">Some pieces couldn't be added. Try again.</p>}
                </div>
              )}
            </div>

            {products.length ? (
              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="mt-10 rounded-panel bg-surface px-6 py-12 text-center text-[15px] text-ink-2">
                We don't have {styleLabel(style).toLowerCase()} pieces for this room yet. Try another room.
              </p>
            )}

            <div className="mt-14 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setPhase('reveal')}>
                Choose another room
              </Button>
              <Button variant="ghost" onClick={restart}>
                Retake the quiz
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}
