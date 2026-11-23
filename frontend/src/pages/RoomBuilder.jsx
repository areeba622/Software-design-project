// Room planner: room → size and floor → walls → furniture → review → done.
// The server builds and prices the room (Builder + Strategy patterns); the
// summary beside each step shows the same estimate using the same formulas.

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { FaBriefcase } from 'react-icons/fa'
import { productsApi, roomsApi } from '../api'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { floorArea, wallArea, WALL_HEIGHT_FT } from '../lib/room'
import { categoryLabel, roomLabel, STYLES, styleLabel } from '../lib/labels'
import Button from '../components/ui/Button'
import ProductImage from '../components/ui/ProductImage'
import livingRoomImg from '../assets/rooms/LivingRoom.jpg'
import bedroomImg from '../assets/rooms/bedRoom.jpg'
import kitchenImg from '../assets/rooms/kitchen.jpg'
import diningRoomImg from '../assets/rooms/diningRoom.jpg'

// Must match Product.java's RoomType values; the products endpoint needs one of these.
const ROOM_TYPES = [
  { id: 'LIVING_ROOM', img: livingRoomImg },
  { id: 'BEDROOM', img: bedroomImg },
  { id: 'DINING_ROOM', img: diningRoomImg },
  { id: 'KITCHEN', img: kitchenImg },
  { id: 'OFFICE', icon: FaBriefcase },
]

const STEPS = ['Room', 'Size and floor', 'Walls', 'Furniture', 'Review']
const SIZE_PRESETS = [
  [10, 12],
  [12, 14],
  [14, 16],
  [16, 20],
]

function StepHeader({ index, title, text }) {
  return (
    <div className="mb-8">
      <p className="tabular text-sm font-medium text-ink-2">
        Step {index + 1} of {STEPS.length}
      </p>
      <h1 className="display mt-2 text-[2rem] sm:text-[2.5rem]">{title}</h1>
      {text && <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-ink-2">{text}</p>}
    </div>
  )
}

function FinishOption({ product, selected, onSelect, priceNote }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-card text-left ring-offset-2 transition-shadow ${selected ? 'ring-2 ring-accent' : 'hover:ring-1 hover:ring-line-strong'}`}
    >
      {product ? (
        <ProductImage src={product.imageUrl} alt="" ratio="1/1" fit="cover" className="rounded-card" />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-card border border-dashed border-line-strong bg-canvas text-sm font-medium text-ink-2">None</div>
      )}
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
          <FiCheck size={13} strokeWidth={3} />
        </span>
      )}
      <span className="mt-2 block text-[14px] font-medium leading-snug text-ink">{product ? product.name : 'Keep as is'}</span>
      {priceNote && <span className="tabular block text-[13px] text-ink-3">{priceNote}</span>}
    </button>
  )
}

function Summary({ room, width, length, floor, wall, furniture, estimate, format }) {
  const fa = floorArea(width, length)
  const wa = wallArea(width, length)
  const rows = [
    ['Room', room ? roomLabel(room) : '—'],
    ['Size', width && length ? `${width} × ${length} ft` : '—'],
    ['Floor', floor ? `${floor.name}` : 'Not chosen', floor && fa ? format(floor.priceInPKR * fa) : null],
    ['Walls', wall ? `${wall.name}` : 'Not chosen', wall && wa ? format(wall.priceInPKR * wa) : null],
    ['Furniture', furniture.length ? `${furniture.length} piece${furniture.length === 1 ? '' : 's'}` : 'None yet', furniture.length ? format(furniture.reduce((s, p) => s + p.priceInPKR, 0)) : null],
  ]
  return (
    <section className="rounded-panel bg-sand p-6">
      <h2 className="text-[17px] font-semibold text-ink">Your room</h2>
      {width > 0 && length > 0 && (
        <p className="tabular mt-1 text-sm text-ink-2">
          {fa} sq ft of floor, {wa} sq ft of wall
        </p>
      )}
      <dl className="mt-4 divide-y divide-line text-[14px]">
        {rows.map(([k, v, price]) => (
          <div key={k} className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 py-2.5">
            <dt className="text-ink-2">{k}</dt>
            <dd className="min-w-0 truncate text-ink">{v}</dd>
            <dd className="tabular text-right text-ink-2">{price}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-baseline justify-between border-t border-line-strong pt-4">
        <span className="text-[15px] font-medium text-ink">Estimate</span>
        <span className="tabular text-xl font-semibold text-ink">{format(estimate)}</span>
      </div>
      <p className="mt-2 text-[13px] text-ink-3">Final price is confirmed when the room is built.</p>
    </section>
  )
}

export default function RoomBuilder({ onBack, onProceedToPayment }) {
  const reduce = useReducedMotion()
  const { format } = useCurrency()
  const { refresh, openDrawer } = useCart()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [roomType, setRoomType] = useState(null)
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [floorId, setFloorId] = useState(null)
  const [wallId, setWallId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [styleFilter, setStyleFilter] = useState(null)

  const [roomProducts, setRoomProducts] = useState([])
  const [floors, setFloors] = useState([])
  const [walls, setWalls] = useState([])
  const [builtRoom, setBuiltRoom] = useState(null)
  const [roomInCart, setRoomInCart] = useState(false) // the built room is already in the cart

  useEffect(() => {
    const controller = new AbortController()
    const opts = { signal: controller.signal }
    Promise.all([productsApi.byCategory('FLOORING', opts), productsApi.byCategory('WALLPAPER', opts)])
      .then(([f, w]) => {
        setFloors(f || [])
        setWalls(w || [])
      })
      .catch((e) => e.name !== 'AbortError' && setError(`Couldn't load flooring and wallpaper: ${e.message}`))
    return () => controller.abort()
  }, [])

  const w = parseInt(width, 10) || 0
  const l = parseInt(length, 10) || 0
  const floor = floors.find((f) => f.id === floorId) || null
  const wall = walls.find((x) => x.id === wallId) || null
  const furniture = selectedIds.map((id) => roomProducts.find((p) => p.id === id)).filter(Boolean)
  // Flooring is priced per sq ft of floor, wallpaper per sq ft of wall.
  const estimate = (floor ? floor.priceInPKR * floorArea(w, l) : 0) + (wall ? wall.priceInPKR * wallArea(w, l) : 0) + furniture.reduce((s, p) => s + p.priceInPKR, 0)

  const visibleProducts = useMemo(
    () => (styleFilter ? roomProducts.filter((p) => p.aestheticStyle === styleFilter) : roomProducts),
    [roomProducts, styleFilter],
  )

  const go = (next) => {
    setError(null)
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  const chooseRoom = async (type) => {
    if (type !== roomType) {
      setSelectedIds([])
      setStyleFilter(null)
      setRoomProducts([])
    }
    setRoomType(type)
    go(1)
    setLoading(true)
    try {
      // Floors and wallpaper are chosen in their own steps and priced per sq ft, so they aren't furniture.
      const list = (await productsApi.forRoom(type)) || []
      setRoomProducts(list.filter((p) => p.category !== 'FLOORING' && p.category !== 'WALLPAPER'))
    } catch (e) {
      setError(`Unable to load products: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const build = async () => {
    if (w <= 0 || l <= 0) return setError('Enter a width and length greater than 0.')
    if (selectedIds.length === 0) return setError('Choose at least one piece of furniture.')
    setLoading(true)
    setError(null)
    try {
      // Send product ids so the server prices everything from the catalogue.
      const room = await roomsApi.build({
        roomType,
        width: w,
        length: l,
        flooringProductId: floorId,
        wallpaperProductId: wallId,
        furnitureProductIds: selectedIds,
      })
      setBuiltRoom(room)
      setRoomInCart(false)
      go(5)
    } catch (e) {
      setError(`The room couldn't be built: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addRoomToCart = async () => {
    if (roomInCart) return true // already there: don't add a second one
    setLoading(true)
    setError(null)
    try {
      await roomsApi.addToCart(builtRoom.roomId)
      await refresh()
      setRoomInCart(true)
      return true
    } catch (e) {
      setError(`Couldn't add the room to your cart: ${e.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkout = async () => {
    // Put the room in the cart (once), then PaymentPage turns the cart into an order.
    if (await addRoomToCart()) onProceedToPayment?.()
  }

  const startOver = () => {
    setRoomType(null)
    setWidth('')
    setLength('')
    setFloorId(null)
    setWallId(null)
    setSelectedIds([])
    setBuiltRoom(null)
    setRoomInCart(false)
    go(0)
  }

  const canContinue = [true, w > 0 && l > 0, true, selectedIds.length > 0, true][step]
  const transition = reduce ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.35 }
  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } }

  if (step === 5 && builtRoom) {
    return (
      <div className="page max-w-3xl pb-24 pt-12 sm:pt-16">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-white"
        >
          <FiCheck size={24} strokeWidth={2.5} />
        </motion.span>
        <h1 className="display mt-6 text-[2.4rem] sm:text-[3rem]">Your {roomLabel(builtRoom.roomType).toLowerCase()} is ready</h1>
        <p className="mt-3 text-[17px] text-ink-2">Everything below is priced together and goes into your cart as one item.</p>

        <dl className="tabular mt-10 divide-y divide-line rounded-panel border border-line px-5 text-[15px]">
          {[
            ['Size', `${builtRoom.width} × ${builtRoom.length} ft`],
            ['Floor', builtRoom.flooring || 'Not included'],
            ['Walls', builtRoom.wallpaper || 'Not included'],
            ['Furniture', (builtRoom.furnitureItems || []).join(', ') || '—'],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 py-3.5">
              <dt className="text-ink-2">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between py-4">
            <dt className="font-medium text-ink">Total</dt>
            <dd className="text-xl font-semibold text-ink">{format(builtRoom.totalPrice)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-5 rounded-card bg-danger-soft px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={checkout} disabled={loading}>
            {loading ? 'One moment…' : 'Check out now'}
          </Button>
          {roomInCart ? (
            <Button size="lg" variant="secondary" className="flex-1" onClick={openDrawer}>
              <FiCheck size={17} /> In your cart
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="flex-1" onClick={addRoomToCart} disabled={loading}>
              Add to cart
            </Button>
          )}
        </div>
        <div className="mt-6 flex gap-6 text-[15px]">
          <button type="button" onClick={startOver} className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Plan another room
          </button>
          <button type="button" onClick={onBack} className="font-medium text-ink-2 hover:text-ink">
            Back to overview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page pb-32 pt-8 sm:pt-10 lg:pb-24">
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => (step === 0 ? onBack?.() : go(step - 1))}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <FiArrowLeft size={17} /> {step === 0 ? 'Back to overview' : 'Back'}
        </button>
        <ol className="hidden items-center gap-1 md:flex" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <button
                type="button"
                disabled={i > step || (i > 0 && !roomType)}
                onClick={() => go(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  i === step ? 'bg-accent font-medium text-white' : i < step ? 'text-ink hover:bg-surface' : 'text-ink-3'
                }`}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-3 bg-line-strong" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14">
        <div className="min-w-0">
          {error && (
            <p role="alert" className="mb-6 rounded-card bg-danger-soft px-4 py-3 text-[15px] text-danger">
              {error}
            </p>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={step} {...motionProps} transition={transition}>
              {step === 0 && (
                <>
                  <StepHeader index={0} title="Which room are you planning?" text="We'll show furniture that suits it, and work out floor and wall areas from its size." />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                    {ROOM_TYPES.map(({ id, img, icon: Icon }) => (
                      <button key={id} type="button" onClick={() => chooseRoom(id)} className="group text-left">
                        <div className={`overflow-hidden rounded-card ${roomType === id ? 'ring-2 ring-accent ring-offset-2' : ''}`}>
                          {img ? (
                            <ProductImage src={img} alt="" ratio="4/5" fit="cover" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                          ) : (
                            <div className="flex aspect-[4/5] items-center justify-center bg-surface text-ink-2 transition-colors group-hover:bg-surface-2">
                              <Icon size={34} />
                            </div>
                          )}
                        </div>
                        <span className="mt-3 block text-[16px] font-semibold text-ink">{roomLabel(id)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <StepHeader index={1} title="How big is the room?" text="Measure wall to wall in feet. A floor finish is optional." />
                  <div className="grid max-w-md grid-cols-2 gap-4">
                    {[
                      ['width', 'Width', width, setWidth],
                      ['length', 'Length', length, setLength],
                    ].map(([id, label, value, set]) => (
                      <label key={id} htmlFor={`room-${id}`} className="block">
                        <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
                        <span className="relative block">
                          <input
                            id={`room-${id}`}
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="100"
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            placeholder="0"
                            className="field tabular pr-10 text-lg font-medium"
                          />
                          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-3">ft</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SIZE_PRESETS.map(([pw, pl]) => (
                      <button
                        key={`${pw}x${pl}`}
                        type="button"
                        onClick={() => {
                          setWidth(String(pw))
                          setLength(String(pl))
                        }}
                        className={`tabular h-8 rounded-full px-3 text-[13px] font-medium transition-colors ${
                          w === pw && l === pl ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-surface-2'
                        }`}
                      >
                        {pw} × {pl} ft
                      </button>
                    ))}
                  </div>

                  <h2 className="mt-12 text-[19px] font-semibold text-ink">Floor</h2>
                  <p className="mt-1 text-[15px] text-ink-2">
                    {w && l ? `Priced for ${floorArea(w, l)} sq ft of floor.` : 'Enter the size to see what each floor would cost.'}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <FinishOption selected={floorId === null} onSelect={() => setFloorId(null)} />
                    {floors.map((f) => (
                      <FinishOption
                        key={f.id}
                        product={f}
                        selected={floorId === f.id}
                        onSelect={() => setFloorId(f.id)}
                        priceNote={w && l ? format(f.priceInPKR * floorArea(w, l)) : `${format(f.priceInPKR)} / sq ft`}
                      />
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <StepHeader
                    index={2}
                    title="Choose a wallpaper"
                    text={`All four walls, ${wallArea(w, l)} sq ft at ${WALL_HEIGHT_FT} ft high. Skip it to keep your walls as they are.`}
                  />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <FinishOption selected={wallId === null} onSelect={() => setWallId(null)} />
                    {walls.map((x) => (
                      <FinishOption key={x.id} product={x} selected={wallId === x.id} onSelect={() => setWallId(x.id)} priceNote={format(x.priceInPKR * wallArea(w, l))} />
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader index={3} title="Add furniture" text={`Pieces that suit a ${roomLabel(roomType).toLowerCase()}. Select as many as you like.`} />
                  <div className="mb-6 flex flex-wrap gap-2">
                    {[null, ...STYLES].map((s) => (
                      <button
                        key={String(s)}
                        type="button"
                        aria-pressed={styleFilter === s}
                        onClick={() => setStyleFilter(s)}
                        className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${styleFilter === s ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-surface-2'}`}
                      >
                        {s ? styleLabel(s) : 'All styles'}
                      </button>
                    ))}
                  </div>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-surface" />
                      ))}
                    </div>
                  ) : visibleProducts.length === 0 ? (
                    <p className="rounded-panel bg-surface px-6 py-12 text-center text-[15px] text-ink-2">No pieces in this style for this room. Try another style.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                      {visibleProducts.map((p) => {
                        const selected = selectedIds.includes(p.id)
                        return (
                          <button key={p.id} type="button" aria-pressed={selected} onClick={() => toggleProduct(p.id)} className="group text-left">
                            <div className={`relative overflow-hidden rounded-card transition-shadow ${selected ? 'ring-2 ring-accent ring-offset-2' : ''}`}>
                              <ProductImage src={p.imageUrl} alt="" label={categoryLabel(p.category)} />
                              <span
                                className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                                  selected ? 'border-accent bg-accent text-white' : 'border-white/80 bg-white/80 text-transparent backdrop-blur group-hover:text-ink-3'
                                }`}
                              >
                                <FiCheck size={14} strokeWidth={3} />
                              </span>
                            </div>
                            <span className="mt-2.5 block text-[14px] font-medium leading-snug text-ink">{p.name}</span>
                            <span className="tabular block text-[13px] text-ink-2">{format(p.priceInPKR)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  <StepHeader index={4} title="Review your room" text="Check the details, then build the room. We'll price it on the server and hold it ready for your cart." />
                  <ul className="divide-y divide-line border-y border-line">
                    {furniture.map((p) => (
                      <li key={p.id} className="flex items-center gap-4 py-3.5">
                        <ProductImage src={p.imageUrl} alt="" ratio="1/1" className="w-14 shrink-0 rounded-lg" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium text-ink">{p.name}</span>
                          <span className="block text-[13px] text-ink-3">{categoryLabel(p.category)}</span>
                        </span>
                        <span className="tabular shrink-0 text-[15px] text-ink">{format(p.priceInPKR)}</span>
                        <button type="button" onClick={() => toggleProduct(p.id)} className="shrink-0 text-sm text-ink-2 hover:text-danger" aria-label={`Remove ${p.name}`}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 lg:hidden">
                    <Summary room={roomType} width={w} length={l} floor={floor} wall={wall} furniture={furniture} estimate={estimate} format={format} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="hidden lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:block">
          <Summary room={roomType} width={w} length={l} floor={floor} wall={wall} furniture={furniture} estimate={estimate} format={format} />
          {step > 0 && (
            <Button size="lg" block className="mt-4" disabled={!canContinue || loading} onClick={() => (step === 4 ? build() : go(step + 1))}>
              {step === 4 ? (loading ? 'Building…' : 'Build my room') : step === 3 && selectedIds.length ? `Continue with ${selectedIds.length}` : 'Continue'}
            </Button>
          )}
        </aside>
      </div>

      {/* Phones: the running total and the next step stay within thumb reach. */}
      {step > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <div className="page flex h-[4.5rem] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] text-ink-2">Estimate</p>
              <p className="tabular truncate text-[17px] font-semibold text-ink">{format(estimate)}</p>
            </div>
            <Button disabled={!canContinue || loading} onClick={() => (step === 4 ? build() : go(step + 1))}>
              {step === 4 ? (loading ? 'Building…' : 'Build my room') : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
