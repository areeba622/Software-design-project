import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiShoppingCart, FiAlertCircle } from "react-icons/fi"
import { API_ENDPOINTS, authFetch, errorMessage } from "../config/api"

const C = {
  ink: "#1E252B",
  mustard: "#EAB308",
  mustardSoft: "#FEF08A",
  pastelMuted: "#8C9296",
  creamBg: "#FAF9F5",
  gridLine: "#EAE8E2",
  accentBg: "#F1ECE3",
  white: "#FFFFFF",
  clay: "#C2410C",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

function formatPrice(pkr, currency) {
  if (currency === "USD") {
    const usd = pkr / 280
    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `PKR ${pkr?.toLocaleString("en-PK")}`
}

function labelFormatter(text) {
  if (!text) return ""
  return text.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export default function ProductDetails({ user, onBack, onCartChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const currency = user?.currencyPreference || "PKR"

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(API_ENDPOINTS.PRODUCT_BY_ID(id))
      .then(async (res) => {
        if (!res.ok) throw new Error("Product not found")
        const data = await res.json()
        setProduct(data)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      setAddError("Please log in to add items to cart.")
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      const res = await authFetch(API_ENDPOINTS.CART_ADD, {
        method: "POST",
        body: JSON.stringify({ itemId: product.id, quantity: 1, itemType: "PRODUCT" }),
      })
      if (!res.ok) throw new Error(await errorMessage(res, "Could not add item to cart"))
      
      setAdded(true)
      onCartChange?.()
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: 'linear-gradient(135deg, #FAF9F5 0%, #F5EFE6 28%, #EDE6F8 58%, #E8F3EF 82%, #FAF9F5 100%)', fontFamily: FONT, position: "relative", overflowX: "hidden" }}>
      {/* Decorative Grid and Orbs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '2%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.32 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2.5rem 5rem", position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: "none", border: "none", cursor: "pointer", color: C.ink,
            display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700,
            padding: 0, marginBottom: "2.5rem", fontFamily: FONT
          }}
        >
          <FiArrowLeft size={16} /> Back to Catalog
        </motion.button>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <p style={{ fontFamily: FONT, color: C.pastelMuted }}>Fetching product specs...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#B91C1C" }}>
            <FiAlertCircle size={40} style={{ marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Failed to load product</h2>
            <p style={{ fontSize: "0.9rem", color: C.pastelMuted, marginBottom: "1.5rem" }}>{error}</p>
            <motion.button
              onClick={onBack}
              style={{ background: C.ink, color: C.white, border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontWeight: 700 }}
            >
              Go Back
            </motion.button>
          </div>
        )}

        {!loading && !error && product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            style={{
              background: C.white,
              border: `1.5px solid ${C.gridLine}`,
              borderRadius: 24,
              boxShadow: '0 20px 50px -12px rgba(30,37,43,0.08)',
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 0,
            }}
          >
            {/* Image Section */}
            <div style={{
              background: `linear-gradient(135deg, ${C.white} 0%, ${C.accentBg} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden", minHeight: 400
            }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl} alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 72, marginBottom: 12 }}>🪑</div>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: C.pastelMuted, fontWeight: 700 }}>
                    {labelFormatter(product.category || "OTHER")}
                  </span>
                </div>
              )}
              {product.aestheticStyle && (
                <span style={{ position: "absolute", top: 24, right: 24, background: "rgba(30,37,43,0.85)", backdropFilter: 'blur(6px)', color: C.white, borderRadius: 8, padding: "6px 14px", fontFamily: FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>
                  {product.aestheticStyle.toUpperCase()}
                </span>
              )}
            </div>

            {/* Info Section */}
            <div style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "1.5rem", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.category && (
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: C.clay, background: "#FEF2EC", padding: "4px 10px", borderRadius: 6 }}>
                    {labelFormatter(product.category).toUpperCase()}
                  </span>
                )}
                {product.roomType && (
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.pastelMuted, background: C.creamBg, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.gridLine}` }}>
                    {labelFormatter(product.roomType)}
                  </span>
                )}
              </div>

              <div>
                <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "2rem", color: C.ink, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                  {product.name}
                </h1>
                {product.vendorName && (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: C.pastelMuted, margin: 0, fontWeight: 600 }}>
                    By <span style={{ color: C.ink }}>{product.vendorName}</span>
                  </p>
                )}
              </div>

              {product.description && (
                <p style={{ fontFamily: FONT, fontSize: 14, color: C.pastelMuted, margin: 0, lineHeight: 1.6 }}>
                  {product.description}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: "1rem", paddingTop: "1.5rem", borderTop: `1px dashed ${C.gridLine}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: C.pastelMuted, fontWeight: 700, letterSpacing: "0.05em", margin: "0 0 4px" }}>PRICE</p>
                    <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>
                      {formatPrice(product.priceInPKR, currency)}
                    </span>
                  </div>

                  <motion.button
                    onClick={handleAddToCart} disabled={adding}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{
                      background: added ? "#059669" : C.ink, color: C.white, border: "none", borderRadius: 12,
                      padding: "12px 24px", cursor: adding ? "wait" : "pointer",
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      transition: "background-color 0.2s ease", display: "flex", alignItems: "center", gap: 8,
                      boxShadow: '0 8px 24px -6px rgba(30,37,43,0.15)'
                    }}
                  >
                    {added ? "✓ Added to Cart" : adding ? "Adding..." : (
                      <><FiShoppingCart size={15} /> Add to Cart</>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {addError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 12, color: "#B91C1C", margin: 0, fontWeight: 600 }}
                    >
                      {addError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
