import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiPlus } from 'react-icons/fi'
import { designersApi, productsApi } from './api'
import { useCurrency } from './lib/CurrencyContext'
import { floorArea, wallArea, WALL_HEIGHT_FT } from './lib/room'
import { styleLabel } from './lib/labels'
import Button from './components/ui/Button'
import ProductCard, { ProductCardSkeleton } from './components/ProductCard'
import ProductImage from './components/ui/ProductImage'
import BeforeAfter from './components/BeforeAfter'

import heroRoom from './assets/background.webp'
import livingRoomImg from './assets/rooms/LivingRoom.jpg'
import bedroomImg from './assets/rooms/bedRoom.jpg'
import diningRoomImg from './assets/rooms/diningRoom.jpg'
import kitchenImg from './assets/rooms/kitchen.jpg'
import minimalistImg from './assets/styles/minimalist.jpg'
import scandinavianImg from './assets/styles/scandinavian.jpg'
import bohemianImg from './assets/styles/bohemian.jpg'
import hardwoodImg from './assets/floors/WarmHardwood.jpg'
import stoneImg from './assets/floors/NaturalStone.jpg'
import cementImg from './assets/floors/MicroCement.jpg'
import carpetImg from './assets/floors/SoftWoolCarpet.jpg'
import tileImg from './assets/floors/MattePorcelainTile.jpg'
import beforeImg from './assets/beforeAfter/before1.jpg'
import afterImg from './assets/beforeAfter/after1.jpg'

// Points on the hero photo (percent of width/height) and the catalog piece closest to each.
const HOTSPOTS = [
  { productId: 6, x: 60, y: 37, label: 'Wall shelf' },
  { productId: 108, x: 45, y: 66, label: 'Sofa' },
  { productId: 94, x: 57, y: 75, label: 'Coffee table' },
  { productId: 61, x: 36, y: 89, label: 'Rug' },
]

const ROOMS = [
  { id: 'LIVING_ROOM', label: 'Living room', img: livingRoomImg },
  { id: 'BEDROOM', label: 'Bedroom', img: bedroomImg },
  { id: 'DINING_ROOM', label: 'Dining room', img: diningRoomImg },
  { id: 'KITCHEN', label: 'Kitchen', img: kitchenImg },
]

const POPULAR_IDS = [108, 47, 57, 33, 61, 94, 24, 44]

const STYLES = [
  {
    id: "MINIMALIST",
    tint: "bg-surface-2",
    img: minimalistImg,
    text: 'Pared-back forms, a restrained palette, and furniture with nothing to spare.',
  },
  {
    id: "SCANDINAVIAN",
    tint: "bg-sage-soft",
    img: scandinavianImg,
    text: 'Light woods, quiet lines and calm negative space. Furniture that never shouts.',
  },
  {
    id: "BOHEMIAN",
    tint: "bg-accent-soft",
    img: bohemianImg,
    text: 'Layered textiles, terracotta warmth and textures collected over time.',
  },
]

const FLOORS = [
  { name: 'Warm hardwood', img: hardwoodImg },
  { name: 'Natural stone', img: stoneImg },
  { name: 'Micro cement', img: cementImg },
  { name: 'Wool carpet', img: carpetImg },
  { name: 'Porcelain tile', img: tileImg },
]

const PLANNER_STEPS = [
  'Pick the room you are furnishing',
  'Enter its size and choose a floor',
  'Choose a wallpaper for the walls',
  'Add the furniture you want in it',
  'Review the total and add the whole room to your cart',
]

function SectionHeading({ title, text, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="display text-[2rem] sm:text-[2.6rem]">{title}</h2>
        {text && <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{text}</p>}
      </div>
      {action}
    </div>
  )
}

function TextLink({ to, children }) {
  return (
    <Link to={to} className="group inline-flex shrink-0 items-center gap-1 text-[15px] font-semibold text-ink">
      <span className="underline decoration-line-strong underline-offset-[5px] transition-colors group-hover:decoration-ink">{children}</span>
      <FiArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}

function Hotspot({ spot, product, open, onToggle }) {
  const { format } = useCurrency()
  const alignRight = spot.x > 55
  return (
    <div className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${spot.label}: show a similar piece`}
        className="relative -ml-[18px] -mt-[18px] flex h-9 w-9 items-center justify-center rounded-full"
      >
        <span className="absolute inset-0 rounded-full bg-white/35 motion-safe:animate-ping [animation-duration:2.4s]" />
        <span
          className={`relative flex h-7 w-7 items-center justify-center rounded-full shadow-lift transition-colors ${
            open ? 'bg-accent text-white' : 'bg-white text-ink'
          }`}
        >
          <FiPlus size={15} className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
        </span>
      </button>
      <AnimatePresence>
        {open && product && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ transformOrigin: alignRight ? 'bottom right' : 'bottom left' }}
            className={`absolute bottom-[calc(100%+16px)] z-10 w-[15.5rem] ${alignRight ? 'right-[-18px]' : 'left-[-18px]'}`}
          >
            <Link
              to={`/product/${product.id}`}
              className="flex items-center gap-3 rounded-card bg-canvas p-2.5 pr-3.5 shadow-overlay transition-colors hover:bg-surface"
            >
              <ProductImage src={product.imageUrl} alt="" ratio="1/1" className="w-16 shrink-0 rounded-[8px]" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-3">Similar {spot.label.toLowerCase()}</span>
                <span className="mt-0.5 block text-sm font-semibold leading-snug text-ink">{product.name}</span>
                <span className="tabular mt-1 block text-sm text-ink-2">{format(product.priceInPKR)}</span>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Hero({ products, total }) {
  const [openSpot, setOpenSpot] = useState(null)
  const reduce = useReducedMotion()
  const frameRef = useRef(null)

  useEffect(() => {
    if (openSpot === null) return
    const close = (e) => !frameRef.current?.contains(e.target) && setOpenSpot(null)
    const onKey = (e) => e.key === 'Escape' && setOpenSpot(null)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [openSpot])

  const rise = (delay) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } }

  return (
    <div className="bg-sand">
    <section className="page grid items-center gap-10 pb-12 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pb-16 lg:pt-14">
      <div className="max-w-xl">
        <motion.h1 {...rise(0)} className="display text-[2.75rem] sm:text-[3.6rem] xl:text-[4.25rem]">
          Every room, planned and priced.
        </motion.h1>
        <motion.p {...rise(0.08)} className="mt-6 text-lg leading-relaxed text-ink-2">
          Shop {total ? `${total} pieces` : 'furniture'} by room and by style, plan a whole room with the price adding up as you go,
          or book a designer who works the way you like.
        </motion.p>
        <motion.div {...rise(0.16)} className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" to="/catalog">
            Shop the catalog
          </Button>
          <Button size="lg" variant="secondary" to="/room-builder">
            Plan a room
          </Button>
        </motion.div>
      </div>

      <motion.figure
        ref={frameRef}
        initial={reduce ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-panel bg-surface" style={{ aspectRatio: '2400 / 1642' }}>
          <img
            src={heroRoom}
            alt="A terracotta living room with an orange sofa, round wooden coffee table, cream shag rug and a floating wall shelf"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        {HOTSPOTS.map((spot, i) => (
          <Hotspot
            key={spot.productId}
            spot={spot}
            product={products[spot.productId]}
            open={openSpot === i}
            onToggle={() => setOpenSpot(openSpot === i ? null : i)}
          />
        ))}
        <figcaption className="mt-3 text-[13px] text-ink-2">Select a dot to see a similar piece from the catalog.</figcaption>
      </motion.figure>
    </section>
    </div>
  )
}

function RoomsSection({ counts }) {
  return (
    <section className="page py-16 lg:py-24">
      <SectionHeading
        title="Shop by room"
        text="Start with the room you are furnishing. Every piece is tagged by the room it suits best."
        action={<TextLink to="/catalog">Browse everything</TextLink>}
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        {ROOMS.map((room) => (
          <Link key={room.id} to={`/catalog?room=${room.id}`} className="group block">
            <div className="overflow-hidden rounded-card">
              <ProductImage
                src={room.img}
                alt={`${room.label} interior`}
                ratio="3/4"
                fit="cover"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-3.5 text-[17px] font-semibold text-ink">{room.label}</p>
            <p className="tabular mt-0.5 text-sm text-ink-3">{counts[room.id] ? `${counts[room.id]} pieces` : ' '}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PopularSection({ items, loading }) {
  return (
    <section className="bg-sage-soft">
      <div className="page py-16 lg:py-24">
        <SectionHeading
          title="Pieces people start with"
          text="A sofa, a bed or a good lamp usually comes first. The rest of the room follows."
          action={<TextLink to="/catalog">See all products</TextLink>}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function StylesSection({ counts }) {
  return (
    <section className="page py-16 lg:py-24">
      <SectionHeading
        title="Three styles, one catalog"
        text="Every product belongs to one of three looks. Not sure which is yours? Four questions will tell you."
        action={<TextLink to="/quiz">Take the style quiz</TextLink>}
      />
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
        {STYLES.map((s) => (
          <Link key={s.id} to={`/catalog?style=${s.id}`} className="group block">
            <div className={`overflow-hidden rounded-card ${s.tint}`}>
              <ProductImage src={s.img} alt={`${styleLabel(s.id)} mood board`} ratio="1/1" fit="contain" className="!bg-transparent" />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[22px] font-medium tracking-[-0.01em] text-ink">{styleLabel(s.id)}</h3>
              {counts[s.id] > 0 && <span className="tabular text-sm text-ink-3">{counts[s.id]} pieces</span>}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PlannerSection() {
  const [w, l] = [12, 14]
  return (
    <section className="bg-cocoa text-white">
      <div className="page grid gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div>
          <h2 className="font-display text-[2rem] font-medium leading-[1.15] tracking-[-0.01em] sm:text-[2.6rem]">
            Plan a room and see what it costs before you buy.
          </h2>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/70">
            The room planner works out how much floor and wall you need from the size you enter, then prices the whole room as one item.
          </p>
          <ol className="mt-9 space-y-4">
            {PLANNER_STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-4">
                <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold">
                  {i + 1}
                </span>
                <span className="text-[16px] text-white/90">{step}</span>
              </li>
            ))}
          </ol>
          <Button variant="inverse" size="lg" to="/room-builder" className="mt-10">
            Open the room planner
          </Button>
        </div>

        <div className="self-center">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
            {FLOORS.map((f) => (
              <figure key={f.name}>
                <ProductImage src={f.img} alt={f.name} ratio="3/4" fit="cover" className="rounded-[10px] bg-white/10" />
                <figcaption className="mt-2 text-[12px] leading-tight text-white/60 sm:text-[13px]">{f.name}</figcaption>
              </figure>
            ))}
          </div>
          <dl className="tabular mt-8 grid grid-cols-3 divide-x divide-white/15 rounded-panel border border-white/15">
            {[
              ['Room', `${w} × ${l} ft`],
              ['Floor', `${floorArea(w, l)} sq ft`],
              ['Walls', `${wallArea(w, l)} sq ft`],
            ].map(([k, v]) => (
              <div key={k} className="px-3 py-4 sm:px-5">
                <dt className="text-[13px] text-white/55">{k}</dt>
                <dd className="mt-1 whitespace-nowrap text-[15px] font-semibold sm:text-lg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-white/50">Wall area assumes {WALL_HEIGHT_FT} ft ceilings, the same figure the planner uses.</p>
        </div>
      </div>
    </section>
  )
}

function DesignersSection({ designers }) {
  const { format } = useCurrency()
  return (
    <div className="bg-accent-soft/70">
    <section className="page grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-24">
      <BeforeAfter before={beforeImg} after={afterImg} alt="A small bedroom" />
      <div>
        <h2 className="display text-[2rem] sm:text-[2.6rem]">Bring in a designer</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Drag across the photo to see one bedroom before and after a designer reworked it. Our designers each work in one of the three
          styles and charge by the hour.
        </p>
        {designers.length > 0 && (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {designers.slice(0, 3).map((d) => (
              <li key={d.id} className="flex items-center gap-4 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-accent">
                  {d.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">{d.name}</span>
                  <span className="block truncate text-sm text-ink-3">{d.specialty}</span>
                </span>
                <span className="tabular shrink-0 text-right text-sm text-ink-2">
                  {format(d.hourlyRatePKR)}
                  <span className="text-ink-3"> /hr</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8">
          <TextLink to="/designers">Meet all designers</TextLink>
        </div>
      </div>
    </section>
    </div>
  )
}

export default function LandingPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [designers, setDesigners] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    productsApi
      .list({ signal: controller.signal })
      .then((list) => setProducts(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => !controller.signal.aborted && setLoading(false))
    designersApi
      .list({ signal: controller.signal })
      .then((list) => setDesigners(Array.isArray(list) ? list : []))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const { byId, roomCounts, styleCounts, popular } = useMemo(() => {
    const byId = Object.fromEntries(products.map((p) => [p.id, p]))
    const roomCounts = {}
    const styleCounts = {}
    products.forEach((p) => {
      roomCounts[p.roomType] = (roomCounts[p.roomType] || 0) + 1
      styleCounts[p.aestheticStyle] = (styleCounts[p.aestheticStyle] || 0) + 1
    })
    const picked = POPULAR_IDS.map((id) => byId[id]).filter(Boolean)
    const popular = picked.length >= 4 ? picked : products.slice(0, 8)
    return { byId, roomCounts, styleCounts, popular }
  }, [products])

  return (
    <>
      <Hero products={byId} total={products.length} />
      <RoomsSection counts={roomCounts} />
      <PopularSection items={popular} loading={loading} />
      <StylesSection counts={styleCounts} />
      <PlannerSection />
      <DesignersSection designers={designers} />
    </>
  )
}
