import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { categoryLabel, styleLabel } from '../lib/labels'
import ProductImage from './ui/ProductImage'

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse rounded-card bg-surface" />
      <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-surface" />
      <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded bg-surface" />
      <div className="mt-3 h-5 w-2/5 animate-pulse rounded bg-surface" />
    </div>
  )
}

/** Product tile: photo, name, style, price, and a quick add-to-cart. */
export default function ProductCard({ product, eager }) {
  const { user } = useAuth()
  const { add } = useCart()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('idle')
  const href = `/product/${product.id}`

  const onAdd = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    setStatus('adding')
    try {
      await add({ itemId: product.id, name: product.name })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 1800)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <article className="group relative flex flex-col">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block overflow-hidden rounded-card">
        <ProductImage
          src={product.imageUrl}
          alt=""
          eager={eager}
          label={categoryLabel(product.category)}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 items-start gap-3 pt-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">
            <Link to={href} className="line-clamp-2 hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-[13px] text-ink-3">
            {[styleLabel(product.aestheticStyle), categoryLabel(product.category)].filter(Boolean).join(', ')}
          </p>
          <p className="tabular mt-2 text-[17px] font-semibold text-ink">{format(product.priceInPKR)}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={status === 'adding'}
          aria-label={status === 'added' ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          title={status === 'error' ? "Couldn't add. Try again." : 'Add to cart'}
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors active:scale-95 ${
            status === 'added'
              ? 'border-success bg-success text-white'
              : status === 'error'
                ? 'border-danger text-danger'
                : 'border-line-strong text-ink hover:border-accent hover:bg-accent hover:text-white'
          }`}
        >
          {status === 'added' ? <FiCheck size={17} /> : <FiPlus size={18} className={status === 'adding' ? 'animate-spin' : ''} />}
        </button>
      </div>
    </article>
  )
}
