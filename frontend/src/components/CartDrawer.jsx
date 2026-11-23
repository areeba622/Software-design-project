import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../lib/CartContext'
import { useCurrency } from '../lib/CurrencyContext'
import { ITEM_TYPE_LABELS } from '../lib/labels'
import Sheet from './ui/Sheet'
import Button from './ui/Button'
import ProductImage from './ui/ProductImage'

function LineThumb({ line, product }) {
  if (line.itemType === 'PRODUCT' && product?.imageUrl) {
    return <ProductImage src={product.imageUrl} alt="" ratio="1/1" className="w-20 shrink-0 rounded-[10px]" />
  }
  return (
    <div className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-[10px] bg-surface px-2 text-center text-[11px] font-medium leading-tight text-ink-2">
      {ITEM_TYPE_LABELS[line.itemType] || 'Item'}
    </div>
  )
}

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, remove, productsById } = useCart()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const lines = cart?.lines || []

  const go = (path) => {
    closeDrawer()
    navigate(path)
  }

  return (
    <Sheet
      open={drawerOpen}
      onClose={closeDrawer}
      title={lines.length ? `Your cart (${lines.reduce((s, l) => s + l.quantity, 0)})` : 'Your cart'}
      footer={
        lines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] text-ink-2">Total</span>
              <span className="tabular text-xl font-semibold text-ink">{format(cart.grandTotal)}</span>
            </div>
            <p className="text-[13px] leading-snug text-ink-3">Delivery is arranged after your order is confirmed. You choose Stripe or JazzCash at checkout.</p>
            <Button block size="lg" onClick={() => go('/payment')}>
              Check out
            </Button>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink-2">
            <FiShoppingBag size={22} />
          </span>
          <p className="text-[17px] font-semibold text-ink">Your cart is empty</p>
          <p className="mt-1.5 max-w-[16rem] text-[15px] text-ink-2">Find pieces by room or style, or plan a whole room and add it in one go.</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button onClick={() => go('/catalog')}>Shop products</Button>
            <Button variant="secondary" onClick={() => go('/room-builder')}>
              Plan a room
            </Button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-line px-5 sm:px-6">
          {lines.map((line) => {
            const product = line.itemType === 'PRODUCT' ? productsById[line.itemId] : null
            return (
              <li key={line.cartItemId} className="flex gap-4 py-5">
                <LineThumb line={line} product={product} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {line.itemType !== 'PRODUCT' && (
                        <p className="mb-0.5 text-xs font-medium text-accent">{ITEM_TYPE_LABELS[line.itemType]}</p>
                      )}
                      {product ? (
                        <button
                          type="button"
                          onClick={() => go(`/product/${line.itemId}`)}
                          className="text-left text-[15px] font-medium leading-snug text-ink hover:underline"
                        >
                          {line.itemName}
                        </button>
                      ) : (
                        <p className="text-[15px] font-medium leading-snug text-ink">{line.itemName}</p>
                      )}
                    </div>
                    <span className="tabular shrink-0 text-[15px] font-semibold text-ink">{format(line.lineTotal)}</span>
                  </div>
                  <p className="tabular mt-1 text-[13px] text-ink-2">
                    {line.quantity} × {format(line.unitPrice)}
                  </p>
                  {line.subItems?.length > 0 && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-3">{line.subItems.join(', ')}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(line.cartItemId)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-danger"
                    aria-label={`Remove ${line.itemName}`}
                  >
                    <FiTrash2 size={13} /> Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Sheet>
  )
}
