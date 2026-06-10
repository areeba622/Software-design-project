import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiShoppingCart, FiCheck } from 'react-icons/fi'

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

const STYLE_META = {
  BOHEMIAN:      { emoji: '🎭', accent: '#F59E0B', bg: '#FFFBEB' },
  SCANDINAVIAN:  { emoji: '❄️', accent: '#38BDF8', bg: '#F0F9FF' },
  MINIMALIST:    { emoji: '🔲', accent: '#94A3B8', bg: '#F8FAFC' },
}

function formatPrice(pkr, currency) {
  if (currency === 'USD') {
    return `$${(pkr / 280).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `PKR ${pkr?.toLocaleString('en-PK')}`
}

function formatRoom(room) {
  return room?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function QuizRecommendation({ user, recommendation, selectedStyle, selectedRoom, onBack }) {
  const [addingToCart, setAddingToCart] = useState(null)
  const [addedIds, setAddedIds]         = useState([])
  const [cartMsg, setCartMsg]           = useState(null)

  const currency  = user?.currencyPreference || 'PKR'
  const styleMeta = STYLE_META[selectedStyle] || { emoji: '✨', accent: T.clay, bg: T.linen }

  // Support both old shape (styleBundle/recommendedProducts) and new shape (recommendedBundle/bundleProducts)
  const bundle   = recommendation.recommendedBundle   || recommendation.styleBundle
  const products = recommendation.bundleProducts      || recommendation.recommendedProducts || []
  const message  = recommendation.message
  const title    = recommendation.recommendationTitle || `${selectedStyle} · ${formatRoom(selectedRoom)}`
  const discount = bundle?.discountFactor
  const total    = bundle?.totalPrice ?? recommendation.estimatedBundlePrice

  const showMsg = (text, ok = true) => {
    setCartMsg({ text, ok })
    setTimeout(() => setCartMsg(null), 2500)
  }

  const addOne = async (product) => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart(product.id)
    try {
      const res = await fetch(`${BASE}/api/cart/add?userId=${user.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: product.id, quantity: 1, itemType: 'PRODUCT' }),
      })
      if (!res.ok) throw new Error()
      setAddedIds(ids => [...ids, product.id])
      showMsg(`${product.name} added to cart!`)
    } catch {
      showMsg('Failed to add to cart.', false)
    } finally {
      setAddingToCart(null)
    }
  }

  const addAll = async () => {
    if (!user) { showMsg('Please log in to add items to cart.', false); return }
    setAddingToCart('all')
    try {
      for (const p of products) {
        await fetch(`${BASE}/api/cart/add?userId=${user.userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: p.id, quantity: 1, itemType: 'PRODUCT' }),
        })
      }
      setAddedIds(products.map(p => p.id))
      showMsg(`All ${products.length} products added to cart!`)
    } catch {
      showMsg('Failed to add some items.', false)
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.linen, fontFamily: FONT }}>

      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: T.white, borderBottom: `1px solid ${T.warm}`,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: `1.5px solid ${T.warm}`,
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', color: T.ink,
        }}>
          <FiChevronLeft size={18} />
        </button>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1rem', color: T.ink }}>
          Your Recommendation
        </span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Style banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: styleMeta.bg,
            border: `1.5px solid ${styleMeta.accent}44`,
            borderRadius: 20, padding: '2.5rem',
            marginBottom: '2rem',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          <div style={{ fontSize: 48, lineHeight: 1 }}>{styleMeta.emoji}</div>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>
            RECOMMENDED FOR YOU
          </p>
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.9rem', color: T.ink, margin: 0, letterSpacing: '-0.035em', lineHeight: 1.15 }}>
            {title}
          </h1>
          {message && (
            <p style={{ fontFamily: FONT, fontSize: 14, color: T.stone, margin: 0, lineHeight: 1.65, maxWidth: 600 }}>
              {message}
            </p>
          )}
        </motion.div>

        {/* Bundle summary card */}
        {bundle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              background: T.white, border: `1.5px solid ${T.warm}`,
              borderRadius: 14, padding: '1.75rem', marginBottom: '2rem',
            }}
          >
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 10px' }}>
              CURATED BUNDLE
            </p>
            <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.2rem', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {bundle.name || bundle.styleName}
            </h2>
            {bundle.description && (
              <p style={{ fontFamily: FONT, fontSize: 13, color: T.stone, margin: '0 0 20px', lineHeight: 1.6 }}>
                {bundle.description || bundle.styleDescription}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {total != null && (
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: '0 0 2px' }}>Bundle price</p>
                  <p style={{ fontFamily: FONT, fontSize: '1.4rem', fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>
                    {formatPrice(total, currency)}
                  </p>
                </div>
              )}
              {discount != null && discount < 1 && (
                <span style={{
                  background: '#ECFDF5', color: '#065F46',
                  border: '1px solid #A7F3D0', borderRadius: 6,
                  padding: '5px 12px', fontFamily: FONT, fontSize: 12, fontWeight: 700,
                }}>
                  {Math.round((1 - discount) * 100)}% off
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Cart feedback */}
        {cartMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginBottom: '1rem', padding: '10px 14px', borderRadius: 8,
              background: cartMsg.ok ? '#f0fdf4' : '#fef2f2',
              color: cartMsg.ok ? '#15803d' : '#b91c1c',
              border: `1px solid ${cartMsg.ok ? '#bbf7d0' : '#fecaca'}`,
              fontFamily: FONT, fontSize: 13,
            }}
          >
            {cartMsg.text}
          </motion.div>
        )}

        {/* Products grid */}
        {products.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: 0 }}>
                INCLUDED PRODUCTS ({products.length})
              </p>
              <motion.button
                onClick={addAll}
                disabled={!!addingToCart}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: T.ink, color: T.white, border: 'none',
                  borderRadius: 8, padding: '9px 20px', cursor: addingToCart ? 'wait' : 'pointer',
                  fontFamily: FONT, fontSize: 13, fontWeight: 700,
                  opacity: addingToCart ? 0.6 : 1,
                }}
              >
                <FiShoppingCart size={14} />
                {addingToCart === 'all' ? 'Adding all…' : `Add all ${products.length} to cart`}
              </motion.button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '1rem',
            }}>
              {products.map((product, i) => {
                const isAdded   = addedIds.includes(product.id)
                const isAdding  = addingToCart === product.id

                const catEmoji = {
                  BED: '🛏️', CHAIR: '🪑', TABLE: '🪵', LAMP: '💡',
                  RUG: '🟫', WARDROBE: '🚪', SOFA: '🛋️',
                  FLOORING: '🏠', WALLPAPER: '🖼️', DECOR: '🎨',
                }[product.category] || '🪑'

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 + i * 0.05 }}
                    style={{
                      background: T.white,
                      border: `1.5px solid ${isAdded ? '#A7F3D0' : T.warm}`,
                      borderRadius: 12, overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      transition: 'border-color 0.3s',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      height: 150,
                      background: 'linear-gradient(135deg, #f5ede6, #ede8e3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, position: 'relative',
                    }}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                        : catEmoji
                      }
                      {isAdded && (
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          background: '#059669', color: T.white,
                          borderRadius: '50%', width: 24, height: 24,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FiCheck size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: T.ink, margin: 0 }}>
                        {product.name}
                      </p>
                      <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>
                        {product.category}
                      </p>
                      <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: T.ink, margin: 0 }}>
                        {formatPrice(product.priceInPKR, currency)}
                      </p>

                      <motion.button
                        onClick={() => addOne(product)}
                        disabled={!!addingToCart || isAdded}
                        whileHover={{ scale: isAdded ? 1 : 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          marginTop: 'auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: isAdded ? '#059669' : T.clay,
                          color: T.white, border: 'none', borderRadius: 7,
                          padding: '8px 0', cursor: isAdded || addingToCart ? 'default' : 'pointer',
                          fontFamily: FONT, fontSize: 12, fontWeight: 700,
                          opacity: addingToCart && !isAdded ? 0.6 : 1,
                          transition: 'background 0.2s',
                        }}
                      >
                        {isAdded
                          ? <><FiCheck size={12} /> Added</>
                          : isAdding
                            ? 'Adding…'
                            : <><FiShoppingCart size={12} /> Add to cart</>
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Bottom actions */}
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{
            background: T.white, border: `1.5px solid ${T.warm}`,
            borderRadius: 8, padding: '11px 28px', cursor: 'pointer',
            fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.stone,
          }}>
            Retake quiz
          </button>
        </div>
      </div>
    </div>
  )
}