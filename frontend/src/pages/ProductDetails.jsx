import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCheck, FiChevronRight, FiMinus, FiPlus, FiTruck, FiCreditCard } from 'react-icons/fi'
import { productsApi } from '../api'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { categoryLabel, roomLabel, styleLabel } from '../lib/labels'
import Button from '../components/ui/Button'
import ProductImage from '../components/ui/ProductImage'
import ProductCard from '../components/ProductCard'

const MAX_QTY = 10

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-12 items-center rounded-full border border-line-strong" role="group" aria-label="Quantity">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="flex h-full w-11 items-center justify-center rounded-l-full text-ink transition-colors hover:bg-surface disabled:text-ink-3/50"
      >
        <FiMinus size={16} />
      </button>
      <span className="tabular w-8 text-center text-[15px] font-semibold text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
        disabled={value >= MAX_QTY}
        aria-label="Increase quantity"
        className="flex h-full w-11 items-center justify-center rounded-r-full text-ink transition-colors hover:bg-surface disabled:text-ink-3/50"
      >
        <FiPlus size={16} />
      </button>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16" aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse rounded-panel bg-surface" />
      <div className="space-y-4 pt-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
        <div className="h-10 w-4/5 animate-pulse rounded bg-surface" />
        <div className="h-7 w-1/4 animate-pulse rounded bg-surface" />
        <div className="h-24 animate-pulse rounded bg-surface" />
      </div>
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const { add } = useCart()
  const { format } = useCurrency()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState('idle')
  const [addError, setAddError] = useState(null)
  const [showBar, setShowBar] = useState(false)
  const addRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setQty(1)
    setStatus('idle')
    productsApi
      .get(id, { signal: controller.signal })
      .then((p) => {
        setProduct(p)
        return productsApi.list({ signal: controller.signal }).then((list) => {
          const others = (list || []).filter((x) => x.id !== p.id)
          const sameStyle = others.filter((x) => x.aestheticStyle === p.aestheticStyle && x.category !== p.category)
          const sameCategory = others.filter((x) => x.category === p.category)
          setRelated([...sameCategory.slice(0, 2), ...sameStyle.slice(0, 2)])
        })
      })
      .catch((err) => err.name !== 'AbortError' && setError(err.message))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [id])

  // A slim bar with the price and button appears once the main button scrolls away.
  useEffect(() => {
    const el = addRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  const onAdd = async () => {
    setStatus('adding')
    setAddError(null)
    try {
      await add({ itemId: product.id, quantity: qty, name: product.name })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setAddError(err.message)
      setStatus('idle')
    }
  }

  const addLabel = status === 'added' ? 'Added to cart' : status === 'adding' ? 'Adding…' : 'Add to cart'

  return (
    <div className="page pb-24 pt-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-sm text-ink-2">
        <Link to="/catalog" className="hover:text-ink hover:underline">
          Shop
        </Link>
        {product && (
          <>
            <FiChevronRight size={14} className="text-ink-3" aria-hidden="true" />
            <Link to={`/catalog?category=${product.category}`} className="hover:text-ink hover:underline">
              {categoryLabel(product.category)}
            </Link>
            <FiChevronRight size={14} className="text-ink-3" aria-hidden="true" />
            <span className="min-w-0 truncate text-ink-3" aria-current="page">
              {product.name}
            </span>
          </>
        )}
      </nav>

      {loading && !product ? (
        <DetailsSkeleton />
      ) : error ? (
        <div className="rounded-panel bg-surface px-6 py-20 text-center">
          <p className="text-[17px] font-semibold text-ink">This product isn't available</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-ink-2">{error}</p>
          <Button className="mt-6" to="/catalog">
            Back to the shop
          </Button>
        </div>
      ) : (
        product && (
          <>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
              <div className="mx-auto w-full max-w-2xl lg:max-w-none">
                <ProductImage key={product.id} src={product.imageUrl} alt={product.name} ratio="natural" eager className="rounded-panel" label={categoryLabel(product.category)} />
              </div>

              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <p className="text-[15px] text-ink-2">
                  <Link to={`/catalog?style=${product.aestheticStyle}`} className="hover:text-ink hover:underline">
                    {styleLabel(product.aestheticStyle)}
                  </Link>
                  {' collection'}
                </p>
                <h1 className="display mt-2 text-[2rem] leading-[1.1] sm:text-[2.4rem]">{product.name}</h1>
                <p className="tabular mt-5 text-[1.75rem] font-semibold text-ink">{format(product.priceInPKR)}</p>

                {product.description && <p className="mt-5 max-w-prose text-[17px] leading-relaxed text-ink-2">{product.description}</p>}

                <div ref={addRef} className="mt-8 flex gap-3">
                  <QuantityStepper value={qty} onChange={setQty} />
                  <Button
                    size="lg"
                    className={`flex-1 ${status === 'added' ? '!bg-success' : ''}`}
                    onClick={onAdd}
                    disabled={status === 'adding'}
                  >
                    {status === 'added' && <FiCheck size={18} />}
                    {addLabel}
                  </Button>
                </div>
                {qty > 1 && <p className="tabular mt-3 text-sm text-ink-2">{qty} for {format(product.priceInPKR * qty)}</p>}
                {addError && (
                  <p role="alert" className="mt-3 text-sm text-danger">
                    {addError}
                  </p>
                )}

                <dl className="mt-10 divide-y divide-line border-y border-line text-[15px]">
                  {[
                    ['Room', roomLabel(product.roomType), `/catalog?room=${product.roomType}`],
                    ['Category', categoryLabel(product.category), `/catalog?category=${product.category}`],
                    ['Style', styleLabel(product.aestheticStyle), `/catalog?style=${product.aestheticStyle}`],
                    ['Sold by', product.vendorName],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v, to]) => (
                      <div key={k} className="flex justify-between gap-4 py-3.5">
                        <dt className="text-ink-2">{k}</dt>
                        <dd className="text-right font-medium text-ink">
                          {to ? (
                            <Link to={to} className="hover:underline">
                              {v}
                            </Link>
                          ) : (
                            v
                          )}
                        </dd>
                      </div>
                    ))}
                </dl>

                <ul className="mt-6 space-y-3 text-sm text-ink-2">
                  <li className="flex gap-3">
                    <FiTruck size={17} className="mt-0.5 shrink-0 text-ink" />
                    Delivery is arranged once your order is confirmed.
                  </li>
                  <li className="flex gap-3">
                    <FiCreditCard size={17} className="mt-0.5 shrink-0 text-ink" />
                    Pay by card through Stripe or with a JazzCash wallet.
                  </li>
                </ul>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-24 border-t border-line pt-14">
                <h2 className="display mb-8 text-[1.9rem] sm:text-[2.2rem]">You might also like</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            <AnimatePresence>
              {showBar && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
                >
                  <div className="page flex h-[4.5rem] items-center gap-4">
                    <ProductImage src={product.imageUrl} alt="" ratio="1/1" className="hidden w-12 shrink-0 rounded-lg sm:block" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{product.name}</p>
                      <p className="tabular text-sm text-ink-2">{format(product.priceInPKR * qty)}</p>
                    </div>
                    <Button onClick={onAdd} disabled={status === 'adding'} className={status === 'added' ? '!bg-success' : ''}>
                      {status === 'added' && <FiCheck size={16} />}
                      {addLabel}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )
      )}
    </div>
  )
}
