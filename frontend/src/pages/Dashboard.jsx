import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { ordersApi, productsApi, quizApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { roomLabel, styleLabel } from '../lib/labels'
import Button from '../components/ui/Button'
import ProductImage from '../components/ui/ProductImage'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import StatusBadge from '../components/StatusBadge'
import minimalistImg from '../assets/styles/minimalist.jpg'
import scandinavianImg from '../assets/styles/scandinavian.jpg'
import bohemianImg from '../assets/styles/bohemian.jpg'
import plannerImg from '../assets/floors/WarmHardwood.jpg'
import designerImg from '../assets/designers/ayesha.jpg'

const STYLE_TINT = { MINIMALIST: "bg-surface-2", SCANDINAVIAN: "bg-sage-soft", BOHEMIAN: "bg-accent-soft" }
const STYLE_BOARDS = { MINIMALIST: minimalistImg, SCANDINAVIAN: scandinavianImg, BOHEMIAN: bohemianImg }

const DESIGN_TIPS = [
  ['Use the 60-30-10 rule', '60% dominant colour, 30% secondary, 10% accent. It keeps a room calm without feeling flat.'],
  ['Let natural light lead', 'Watch how daylight moves through the room before choosing paint. It changes how every colour reads.'],
  ['Layer your lighting', 'Combine ambient, task and accent light. Three layers give a room depth in the evening.'],
  ['Rugs anchor the room', 'Choose a rug large enough for the front legs of every seat to rest on it.'],
  ['Group in odd numbers', 'Objects arranged in threes or fives look collected rather than placed.'],
  ['Vary your heights', 'Mix tall plants, mid-height shelves and low furniture so the eye keeps moving.'],
  ['Leave some space empty', 'Empty floor and wall give your best pieces room to stand out.'],
  ['Texture beats colour', 'Linen, wood, stone and metal make a single-colour room feel rich.'],
]

const TIP_INTERVAL_MS = 3000

/** A new tip every three seconds; hovering or focusing it holds the current one. */
function DesignTips() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(() => Math.floor(Math.random() * DESIGN_TIPS.length))
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % DESIGN_TIPS.length), TIP_INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused])

  const [title, text] = DESIGN_TIPS[index]
  return (
    <aside
      aria-label="Design tips"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="mt-16 overflow-hidden rounded-panel bg-sage text-white"
    >
      <div className="grid gap-6 p-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-9">
        <div className="min-h-[7.5rem] sm:min-h-[6rem]" aria-live="polite">
          <p className="text-sm font-medium text-white/85">Design tip</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <p className="mt-2 font-display text-[1.6rem] font-medium tracking-[-0.01em] leading-tight sm:text-[1.9rem]">{title}</p>
              <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-white/80">{text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Choose a tip">
          {DESIGN_TIPS.map(([t], i) => (
            <button
              key={t}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Tip ${i + 1}: ${t}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-panel bg-white p-6 shadow-[0_1px_2px_rgb(56_36_28/0.05)] sm:p-7 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function StyleCard({ quiz, loading }) {
  if (loading) return <div className="h-full min-h-[18rem] animate-pulse rounded-panel bg-surface" />
  const style = quiz?.aestheticStyle && quiz.aestheticStyle !== 'NONE' ? quiz.aestheticStyle : null

  if (!style) {
    return (
      <section className="flex h-full flex-col justify-between gap-8 rounded-panel bg-cocoa p-7 text-white sm:p-9">
        <div>
          <h2 className="display text-[1.9rem] !text-white sm:text-[2.2rem]">Find your style</h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
            Four quick questions match you to Minimalist, Scandinavian or Bohemian, then suggest a bundle for the room you choose.
          </p>
          <Button to="/quiz" className="mt-6">
            Take the style quiz
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {Object.entries(STYLE_BOARDS).map(([id, img]) => (
            <figure key={id}>
              <ProductImage src={img} alt={`${styleLabel(id)} mood board`} ratio="4/3" fit="cover" className="rounded-[10px]" />
              <figcaption className="mt-2 text-[13px] text-white/75">{styleLabel(id)}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={`grid h-full overflow-hidden rounded-panel ${STYLE_TINT[style]} sm:grid-cols-[1fr_minmax(0,0.85fr)]`}>
      <div className="flex flex-col justify-center p-7 sm:p-9">
        <p className="text-[15px] text-ink-2">Your style</p>
        <h2 className="display mt-1 text-[2.4rem] sm:text-[2.8rem]">{styleLabel(style)}</h2>
        {quiz.roomType && <p className="mt-2 text-[15px] text-ink-2">Matched for your {roomLabel(quiz.roomType).toLowerCase()}</p>}
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button to={`/catalog?style=${style}`}>Shop {styleLabel(style)}</Button>
          <Button to="/quiz" variant="secondary">
            Retake quiz
          </Button>
        </div>
      </div>
      <div className="p-4 sm:py-5 sm:pl-0 sm:pr-5">
        <ProductImage src={STYLE_BOARDS[style]} alt={`${styleLabel(style)} mood board`} ratio="1/1" fit="contain" className="rounded-[10px] bg-white" />
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { cart, count, openDrawer } = useCart()
  const { format } = useCurrency()
  const [orders, setOrders] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(true)
  const [products, setProducts] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    ordersApi.list({ signal }).then(setOrders).catch(() => !signal.aborted && setOrders([]))
    quizApi
      .latest({ signal })
      .then(setQuiz)
      .catch(() => {})
      .finally(() => !signal.aborted && setQuizLoading(false))
    productsApi.list({ signal }).then(setProducts).catch(() => !signal.aborted && setProducts([]))
    return () => controller.abort()
  }, [])

  // Recommendations follow the quiz style when there is one.
  const picks = useMemo(() => {
    if (!products || quizLoading) return null
    const style = quiz?.aestheticStyle
    const matched = style ? products.filter((p) => p.aestheticStyle === style) : []
    const pool = matched.length ? matched : products
    // One piece per category so the row shows a room, not four beds.
    return ['SOFA', 'BED', 'CHAIR', 'LAMP', 'RUG', 'TABLE']
      .map((c) => pool.find((p) => p.category === c))
      .filter(Boolean)
      .slice(0, 4)
  }, [products, quiz, quizLoading])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = user?.fullName?.split(' ')[0]
  const latest = orders?.[0]
  const style = quiz?.aestheticStyle && quiz.aestheticStyle !== 'NONE' ? quiz.aestheticStyle : null

  return (
    <div className="pb-20">
      <div className="bg-sand">
      <div className="page pb-12 pt-10 sm:pb-14 sm:pt-14">
      <header className="mb-10">
        <h1 className="display text-[2.4rem] sm:text-[3rem]">
          {greeting}, {first}
        </h1>
        <p className="mt-2 text-[17px] text-ink-2">Here is where your rooms stand.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <StyleCard quiz={quiz} loading={quizLoading} />

        <div className="grid gap-5">
          <Panel
            title="Cart"
            action={
              count > 0 && (
                <button type="button" onClick={openDrawer} className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  View cart
                </button>
              )
            }
          >
            {count > 0 ? (
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="tabular text-2xl font-semibold text-ink">{format(cart.grandTotal)}</p>
                  <p className="mt-0.5 text-sm text-ink-2">
                    {count} item{count === 1 ? '' : 's'}
                  </p>
                </div>
                <Button size="sm" to="/payment">
                  Check out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FiShoppingBag size={18} />
                </span>
                <p className="text-[15px] text-ink-2">
                  Nothing here yet.{' '}
                  <Link to="/catalog" className="font-semibold text-ink underline decoration-line-strong underline-offset-4">
                    Start shopping
                  </Link>
                </p>
              </div>
            )}
          </Panel>

          <Panel
            title="Latest order"
            action={
              orders?.length > 0 && (
                <Link to="/orders" className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  All orders ({orders.length})
                </Link>
              )
            }
          >
            {orders === null ? (
              <div className="h-12 animate-pulse rounded-lg bg-surface" />
            ) : latest ? (
              <Link to="/orders" className="-m-2 flex items-center justify-between gap-4 rounded-xl p-2 transition-colors hover:bg-surface">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink">Order #{latest.orderId}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-2">
                    {fmtDate(latest.createdAt)}, {latest.items?.length || 0} item{latest.items?.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular text-[15px] font-semibold text-ink">{format(latest.grandTotal)}</p>
                  <StatusBadge status={latest.status} className="mt-1" />
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
                  <FiPackage size={18} />
                </span>
                <p className="text-[15px] text-ink-2">Orders you place will show up here.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
      </div>
      </div>

      <div className="page">
      <section className="mt-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-[1.9rem] sm:text-[2.2rem]">{style ? `Picked for ${styleLabel(style).toLowerCase()} rooms` : 'Pieces to start with'}</h2>
            <p className="mt-2 text-[15px] text-ink-2">
              {style ? 'Large pieces from your style. The small things can follow.' : 'Take the style quiz and these suggestions will follow your taste.'}
            </p>
          </div>
          <Link
            to={style ? `/catalog?style=${style}` : '/catalog'}
            className="group hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ink sm:inline-flex"
          >
            <span className="underline decoration-line-strong underline-offset-[5px] group-hover:decoration-ink">See more</span>
            <FiArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
          {picks ? picks.map((p) => <ProductCard key={p.id} product={p} />) : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-2">
        {[
          { to: '/room-builder', img: plannerImg, title: 'Plan a whole room', text: 'Enter the size, choose floors and walls, add furniture, and see the total as you go.', position: 'center 60%' },
          { to: '/designers', img: designerImg, title: 'Work with a designer', text: 'Six designers, each working in one style, booked by the hour.', position: 'center' },
        ].map((t) => (
          <Link key={t.to} to={t.to} className="group grid grid-cols-[7.5rem_1fr] overflow-hidden rounded-panel border border-line transition-colors hover:border-line-strong sm:grid-cols-[10rem_1fr]">
            <ProductImage src={t.img} alt="" ratio="auto" fit="cover" position={t.position} className="h-full min-h-[9rem]" />
            <div className="flex flex-col justify-center p-5 sm:p-6">
              <h3 className="flex items-center gap-1.5 text-[17px] font-semibold text-ink">
                {t.title}
                <FiArrowUpRight size={16} className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{t.text}</p>
            </div>
          </Link>
        ))}
      </section>

      <DesignTips />
      </div>
    </div>
  )
}
