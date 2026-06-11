import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { FiSearch, FiShoppingCart, FiX, FiChevronDown, FiLogOut, FiGrid, FiList } from "react-icons/fi"
// ─── Tokens ───────────────────────────────────────────────────────────────────



const T = {

  ink:   "#0F172A",

  clay:  "#C2410C",

  stone: "#78716C",

  linen: "#FAFAF9",

  warm:  "#E7DDD5",

  white: "#FFFFFF",

}



const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"



// ─── Constants ────────────────────────────────────────────────────────────────



const CATEGORIES = ["ALL", "BED", "CHAIR", "TABLE", "LAMP", "RUG", "WARDROBE", "SOFA", "FLOORING", "WALLPAPER", "DECOR", "OTHER"]

const ROOM_TYPES  = ["ALL", "BEDROOM", "LIVING_ROOM", "KITCHEN", "DINING_ROOM", "GAME_ROOM", "OFFICE"]

const STYLES      = ["ALL", "BOHEMIAN", "SCANDINAVIAN", "MINIMALIST"]

const PRICE_CAPS  = [

  { label: "Any price", value: null },

  { label: "Under PKR 10,000", value: 10000 },

  { label: "Under PKR 25,000", value: 25000 },

  { label: "Under PKR 50,000", value: 50000 },

  { label: "Under PKR 100,000", value: 100000 },

]



const BASE = "http://localhost:8081"



// ─── Helpers ──────────────────────────────────────────────────────────────────



function formatPrice(pkr, currency) {

  if (currency === "USD") {

    const usd = pkr / 280

    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  }

  return `PKR ${pkr.toLocaleString("en-PK")}`

}



function categoryLabel(cat) {

  return cat.charAt(0) + cat.slice(1).toLowerCase()

}



function roomLabel(room) {

  return room.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

}



// ─── Navbar ───────────────────────────────────────────────────────────────────



function Navbar({ user, cartCount, onCartOpen, onLogout, onBack, onRoomBuilder }) {

  return (

    <nav style={{

      position: "sticky", top: 0, zIndex: 100,

      background: "rgba(250,250,249,0.92)", backdropFilter: "blur(12px)",

      borderBottom: `1px solid ${T.warm}`,

      display: "flex", alignItems: "center", justifyContent: "space-between",

      padding: "0 2rem", height: 60,

    }}>

      {/* Logo */}

      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>

        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">

          <rect x="1" y="1" width="11" height="11" rx="2" fill={T.ink} />

          <rect x="16" y="1" width="11" height="11" rx="2" fill={T.clay} opacity="0.85" />

          <rect x="1" y="16" width="11" height="11" rx="2" fill={T.clay} opacity="0.35" />

          <rect x="16" y="16" width="11" height="11" rx="2" fill={T.ink} opacity="0.18" />

        </svg>

        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: T.ink, letterSpacing: "-0.02em" }}>Palette</span>

      </button>



      {/* Center / Navigation items */}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        <button

          onClick={() => onRoomBuilder?.()}

          style={{

            background: 'none',

            border: 'none',

            cursor: 'pointer',

            fontFamily: FONT,

            fontSize: '13px',

            fontWeight: 700,

            color: T.clay,

            padding: '8px 12px',

          }}

        >

          Build Custom Room

        </button>

      </div>



      {/* Right side */}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

        {user && (

          <span style={{ fontFamily: FONT, fontSize: 13, color: T.stone }}>

            {user.fullName}

          </span>

        )}



        {/* Cart */}

        <button onClick={onCartOpen} style={{

          position: "relative", background: "none", border: `1.5px solid ${T.warm}`,

          borderRadius: 8, padding: "6px 12px", cursor: "pointer",

          display: "flex", alignItems: "center", gap: 6,

          fontFamily: FONT, fontSize: 13, fontWeight: 600, color: T.ink,

        }}>

          <FiShoppingCart size={15} />

          Cart

          {cartCount > 0 && (

            <span style={{

              position: "absolute", top: -6, right: -6,

              background: T.clay, color: T.white, borderRadius: "50%",

              width: 18, height: 18, fontSize: 10, fontWeight: 700,

              display: "flex", alignItems: "center", justifyContent: "center",

              fontFamily: FONT,

            }}>{cartCount}</span>

          )}

        </button>



        {/* Logout */}

        <button onClick={onLogout} style={{

          background: "none", border: "none", cursor: "pointer",

          color: T.stone, display: "flex", alignItems: "center", gap: 4,

          fontFamily: FONT, fontSize: 13,

        }}>

          <FiLogOut size={14} /> Logout

        </button>

      </div>

    </nav>

  )

}



// ─── Filter Pill ──────────────────────────────────────────────────────────────



function Pill({ label, active, onClick }) {

  return (

    <button

      onClick={onClick}

      style={{

        padding: "6px 14px", borderRadius: 999, cursor: "pointer",

        fontFamily: FONT, fontSize: 12, fontWeight: 600,

        border: `1.5px solid ${active ? T.ink : T.warm}`,

        background: active ? T.ink : T.white,

        color: active ? T.white : T.stone,

        whiteSpace: "nowrap",

        transition: "all 0.18s",

      }}

    >

      {label === "ALL" ? "All" : categoryLabel(label)}

    </button>

  )

}



// ─── Dropdown Filter ──────────────────────────────────────────────────────────



function Dropdown({ label, value, options, onChange }) {

  const [open, setOpen] = useState(false)

  const ref = useRef(null)



  useEffect(() => {

    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }

    document.addEventListener("mousedown", handler)

    return () => document.removeEventListener("mousedown", handler)

  }, [])



  return (

    <div ref={ref} style={{ position: "relative" }}>

      <button

        onClick={() => setOpen(o => !o)}

        style={{

          display: "flex", alignItems: "center", gap: 6,

          padding: "8px 14px", borderRadius: 8, cursor: "pointer",

          background: value !== "ALL" && value !== null ? T.ink : T.white,

          color: value !== "ALL" && value !== null ? T.white : T.ink,

          border: `1.5px solid ${T.warm}`,

          fontFamily: FONT, fontSize: 13, fontWeight: 600,

          whiteSpace: "nowrap",

        }}

      >

        {label}

        <FiChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />

      </button>

      <AnimatePresence>

        {open && (

          <motion.div

            initial={{ opacity: 0, y: -8 }}

            animate={{ opacity: 1, y: 0 }}

            exit={{ opacity: 0, y: -8 }}

            transition={{ duration: 0.16 }}

            style={{

              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,

              background: T.white, border: `1.5px solid ${T.warm}`,

              borderRadius: 10, padding: "6px 0", minWidth: 180,

              boxShadow: "0 8px 24px -6px rgba(15,23,42,0.12)",

            }}

          >

            {options.map(opt => (

              <button

                key={opt.value ?? opt}

                onClick={() => { onChange(opt.value ?? opt); setOpen(false) }}

                style={{

                  width: "100%", textAlign: "left", padding: "8px 16px",

                  background: "none", border: "none", cursor: "pointer",

                  fontFamily: FONT, fontSize: 13, fontWeight: 500,

                  color: (opt.value ?? opt) === value ? T.clay : T.ink,

                  transition: "background 0.12s",

                }}

                onMouseEnter={e => e.target.style.background = T.linen}

                onMouseLeave={e => e.target.style.background = "none"}

              >

                {opt.label ?? roomLabel(opt)}

              </button>

            ))}

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  )

}



// ─── Product Card ─────────────────────────────────────────────────────────────



function ProductCard({ product, currency, onAddToCart, index }) {

  const ref = useRef(null)

  const inView = useInView(ref, { once: true, margin: "-60px" })

  const [adding, setAdding] = useState(false)

  const [added, setAdded] = useState(false)



  const handleAdd = async () => {

    setAdding(true)

    await onAddToCart(product)

    setAdding(false)

    setAdded(true)

    setTimeout(() => setAdded(false), 2000)

  }



  return (

    <motion.div

      ref={ref}

      initial={{ opacity: 0, y: 24 }}

      animate={inView ? { opacity: 1, y: 0 } : {}}

      transition={{ duration: 0.45, delay: (index % 6) * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}

      style={{

        background: T.white,

        border: `1.5px solid ${T.warm}`,

        borderRadius: 14,

        overflow: "hidden",

        display: "flex",

        flexDirection: "column",

      }}

    >
      {/* Image Container with Safe Fallback Handling */}
      <div style={{
        height: 200, background: `linear-gradient(135deg, #f5ede6 0%, #ede8e3 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { 
              // Fallback: Agar broken link ho ya lowercase/uppercase issue ho
              e.target.src = "/products/minimalist/Bed1.jpeg" 
            }}
          />
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🪑</div>
            <span style={{ fontFamily: FONT, fontSize: 11, color: T.stone }}>{categoryLabel(product.category || "OTHER")}</span>
          </div>
        )}

        {/* Style badge */}

        {product.aestheticStyle && (

          <span style={{

            position: "absolute", top: 10, right: 10,

            background: "rgba(15,23,42,0.75)", color: T.white,

            borderRadius: 6, padding: "3px 8px",

            fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",

          }}>

            {product.aestheticStyle}

          </span>

        )}

      </div>



      {/* Content */}

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>

        {/* Category + Room */}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>

          {product.category && (

            <span style={{

              fontFamily: FONT, fontSize: 10, fontWeight: 700,

              letterSpacing: "0.1em", color: T.clay,

              background: "#FEF2EC", padding: "2px 8px", borderRadius: 4,

            }}>

              {categoryLabel(product.category)}

            </span>

          )}

          {product.roomType && (

            <span style={{

              fontFamily: FONT, fontSize: 10, fontWeight: 600,

              color: T.stone, background: T.linen,

              padding: "2px 8px", borderRadius: 4, border: `1px solid ${T.warm}`,

            }}>

              {roomLabel(product.roomType)}

            </span>

          )}

        </div>



        {/* Name */}

        <p style={{

          fontFamily: FONT, fontSize: 14, fontWeight: 700,

          color: T.ink, margin: 0, lineHeight: 1.3,

          letterSpacing: "-0.01em",

        }}>

          {product.name}

        </p>



        {/* Description */}

        {product.description && (

          <p style={{

            fontFamily: FONT, fontSize: 12, color: T.stone,

            margin: 0, lineHeight: 1.55,

            display: "-webkit-box", WebkitLineClamp: 2,

            WebkitBoxOrient: "vertical", overflow: "hidden",

          }}>

            {product.description}

          </p>

        )}



        {/* Price + CTA */}

        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <span style={{

            fontFamily: FONT, fontSize: 15, fontWeight: 800,

            color: T.ink, letterSpacing: "-0.02em",

          }}>

            {formatPrice(product.priceInPKR, currency)}

          </span>



          <motion.button

            onClick={handleAdd}

            disabled={adding}

            whileHover={{ scale: 1.04 }}

            whileTap={{ scale: 0.96 }}

            style={{

              background: added ? "#059669" : T.ink,

              color: T.white, border: "none", borderRadius: 8,

              padding: "7px 14px", cursor: adding ? "wait" : "pointer",

              fontFamily: FONT, fontSize: 12, fontWeight: 700,

              transition: "background 0.2s",

              display: "flex", alignItems: "center", gap: 5,

            }}

          >

            {added ? "✓ Added" : adding ? "Adding…" : (

              <><FiShoppingCart size={12} /> Add</>

            )}

          </motion.button>

        </div>

      </div>

    </motion.div>

  )

}



// ─── Empty State ──────────────────────────────────────────────────────────────



function EmptyState({ hasFilters, onClear }) {

  return (

    <div style={{

      gridColumn: "1 / -1", textAlign: "center",

      padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,

    }}>

      <div style={{ fontSize: 48 }}>🔍</div>

      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: T.ink, margin: 0 }}>

        No products found

      </p>

      <p style={{ fontFamily: FONT, fontSize: 14, color: T.stone, margin: 0 }}>

        {hasFilters ? "Try adjusting your filters or search term." : "No products available yet."}

      </p>

      {hasFilters && (

        <button onClick={onClear} style={{

          background: T.ink, color: T.white, border: "none",

          borderRadius: 8, padding: "9px 20px", cursor: "pointer",

          fontFamily: FONT, fontSize: 13, fontWeight: 700,

        }}>

          Clear all filters

        </button>

      )}

    </div>

  )

}



// ─── Cart Drawer ──────────────────────────────────────────────────────────────



function CartDrawer({ open, user, currency, onClose, onCheckout }) {

  const [cart, setCart] = useState(null)

  const [loading, setLoading] = useState(false)



  useEffect(() => {

    if (!open || !user) return

    setLoading(true)

    fetch(`${BASE}/api/cart?userId=${user.userId}`)

      .then(r => r.json())

      .then(d => setCart(d))

      .catch(() => setCart(null))

      .finally(() => setLoading(false))

  }, [open, user])



  const removeItem = async (cartItemId) => {

    await fetch(`${BASE}/api/cart/remove/${cartItemId}?userId=${user.userId}`, { method: "DELETE" })

    const res = await fetch(`${BASE}/api/cart?userId=${user.userId}`)

    const d = await res.json()

    setCart(d)

  }



  return (

    <AnimatePresence>

      {open && (

        <>

          {/* Backdrop */}

          <motion.div

            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}

            onClick={onClose}

            style={{

              position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)",

              zIndex: 300, backdropFilter: "blur(2px)",

            }}

          />



          {/* Drawer */}

          <motion.div

            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}

            transition={{ type: "spring", stiffness: 320, damping: 34 }}

            style={{

              position: "fixed", top: 0, right: 0, bottom: 0,

              width: "min(420px, 100vw)", background: T.white,

              zIndex: 400, display: "flex", flexDirection: "column",

              boxShadow: "-8px 0 40px rgba(15,23,42,0.12)",

            }}

          >

            {/* Header */}

            <div style={{

              padding: "20px 24px", borderBottom: `1px solid ${T.warm}`,

              display: "flex", alignItems: "center", justifyContent: "space-between",

            }}>

              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: "1.1rem", color: T.ink }}>Your Cart</span>

              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.stone }}>

                <FiX size={20} />

              </button>

            </div>



            {/* Body */}

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>

              {loading && (

                <p style={{ fontFamily: FONT, color: T.stone, textAlign: "center", marginTop: 40 }}>Loading cart…</p>

              )}

              {!loading && (!cart || !cart.lines || cart.lines.length === 0) && (

                <div style={{ textAlign: "center", marginTop: 60 }}>

                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>

                  <p style={{ fontFamily: FONT, color: T.stone, fontSize: 14 }}>Your cart is empty.</p>

                </div>

              )}

              {!loading && cart?.lines?.map(line => (

                <div key={line.cartItemId} style={{

                  display: "flex", gap: 12, alignItems: "flex-start",

                  padding: "12px 0", borderBottom: `1px solid ${T.warm}`,

                }}>

                  <div style={{

                    width: 52, height: 52, borderRadius: 8, flexShrink: 0,

                    background: `linear-gradient(135deg, #f5ede6, #ede8e3)`,

                    display: "flex", alignItems: "center", justifyContent: "center",

                    fontSize: 20,

                  }}>🪑</div>

                  <div style={{ flex: 1, minWidth: 0 }}>

                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: T.ink, margin: "0 0 2px" }}>{line.itemName}</p>

                    <p style={{ fontFamily: FONT, fontSize: 12, color: T.stone, margin: 0 }}>

                      Qty: {line.quantity} · {formatPrice(line.unitPrice, currency)}

                    </p>

                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>

                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: T.ink }}>

                      {formatPrice(line.lineTotal, currency)}

                    </span>

                    <button onClick={() => removeItem(line.cartItemId)} style={{

                      background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0,

                    }}>

                      <FiX size={14} />

                    </button>

                  </div>

                </div>

              ))}

            </div>



            {/* Footer */}

            {cart?.lines?.length > 0 && (

              <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.warm}` }}>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>

                  <span style={{ fontFamily: FONT, fontSize: 14, color: T.stone }}>Grand total</span>

                  <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: T.ink }}>

                    {formatPrice(cart.grandTotal, currency)}

                  </span>

                </div>

                <motion.button

                  onClick={() => onCheckout(cart)}

                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}

                  style={{

                    width: "100%", background: T.ink, color: T.white,

                    border: "none", borderRadius: 10, padding: "13px 0",

                    fontFamily: FONT, fontSize: 14, fontWeight: 700,

                    cursor: "pointer", letterSpacing: "-0.01em",

                  }}

                >

                  Proceed to checkout →

                </motion.button>

              </div>

            )}

          </motion.div>

        </>

      )}

    </AnimatePresence>

  )

}



// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductCatalog({ user, onBack, onLogout, onRoomBuilder }) {
  const currency = user?.currencyPreference || "PKR"

  // Data State
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // Filter States
  const [search, setSearch]         = useState("")
  const [category, setCategory]     = useState("ALL")
  const [roomType, setRoomType]     = useState("ALL")
  const [style, setStyle]           = useState("ALL")
  const [maxPrice, setMaxPrice]     = useState(null)

  // UI States
  const [cartOpen, setCartOpen]     = useState(false)
  const [cartCount, setCartCount]   = useState(0)
  const [addError, setAddError]     = useState(null)

  const searchTimeout = useRef(null)

  // ── Fetch products ──
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `${BASE}/api/products`

      if (search.trim())           url = `${BASE}/api/products/search?keyword=${encodeURIComponent(search.trim())}`
      else if (maxPrice)           url = `${BASE}/api/products/filter?maxPrice=${maxPrice}`
      else if (category !== "ALL") url = `${BASE}/api/products/category/${category}`

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to load products")
      let data = await res.json()

      // Robust client-side comparison handling strings safely
      if (roomType !== "ALL") {
        data = data.filter(p => p.roomType?.toUpperCase() === roomType.toUpperCase())
      }
      if (style !== "ALL") {
        data = data.filter(p => p.aestheticStyle?.toUpperCase() === style.toUpperCase())
      }
      if (maxPrice && search.trim()) {
        data = data.filter(p => p.priceInPKR <= maxPrice)
      }

      setProducts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(fetchProducts, search ? 400 : 0)
    return () => clearTimeout(searchTimeout.current)
  }, [search, category, roomType, style, maxPrice])

  // ── Fetch cart count ──
  const refreshCartCount = async () => {
    if (!user) return
    try {
      const res = await fetch(`${BASE}/api/cart?userId=${user.userId}`)
      const d = await res.json()
      setCartCount(d?.lines?.length || 0)
    } catch (_) {}
  }

  useEffect(() => { refreshCartCount() }, [])

  // ── Add to cart ──

  const addToCart = async (product) => {

    if (!user) { setAddError("Please log in to add items to cart."); return }

    setAddError(null)

    try {

      const res = await fetch(`${BASE}/api/cart/add?userId=${user.userId}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ itemId: product.id, quantity: 1, itemType: "PRODUCT" }),

      })

      if (!res.ok) throw new Error("Could not add item")

      refreshCartCount()

    } catch (e) {

      setAddError(e.message)

    }

  }



  // ── Clear filters ──

  const clearFilters = () => {

    setSearch(""); setCategory("ALL"); setRoomType("ALL"); setStyle("ALL"); setMaxPrice(null)

  }



  const hasFilters = search || category !== "ALL" || roomType !== "ALL" || style !== "ALL" || maxPrice



  const roomDropdownOptions = ROOM_TYPES.map(r => ({ label: r === "ALL" ? "All rooms" : roomLabel(r), value: r }))

  const styleDropdownOptions = STYLES.map(s => ({ label: s === "ALL" ? "All styles" : s.charAt(0) + s.slice(1).toLowerCase(), value: s }))

  const priceDropdownLabel = PRICE_CAPS.find(p => p.value === maxPrice)?.label || "Any price"



  return (

    <div style={{ minHeight: "100vh", background: T.linen, fontFamily: FONT }}>

      <Navbar

        user={user}

        cartCount={cartCount}

        onCartOpen={() => setCartOpen(true)}

        onLogout={onLogout}

        onBack={onBack}

        onRoomBuilder={onRoomBuilder}

      />



      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 4rem" }}>



        {/* Page header */}

        <motion.div

          initial={{ opacity: 0, y: 24 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}

          style={{ padding: "2.5rem 0 2rem" }}

        >

          <p style={{

            fontFamily: FONT, fontSize: 10, fontWeight: 700,

            letterSpacing: "0.14em", color: T.clay, marginBottom: 8, marginTop: 0,

          }}>CATALOG</p>

          <h1 style={{

            fontFamily: FONT, fontWeight: 800, fontSize: "2rem",

            color: T.ink, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.15,

          }}>Furniture & Décor</h1>

          <p style={{ fontFamily: FONT, fontSize: 14, color: T.stone, marginTop: 8, marginBottom: 0 }}>

            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""} found`}

          </p>

        </motion.div>

{/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          style={{ position: "relative", marginBottom: "1.25rem" }}
        >
          <FiSearch style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: T.stone, pointerEvents: "none",
          }} size={16} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "11px 40px 11px 42px",
              borderRadius: 10, border: `1.5px solid ${T.warm}`,
              background: T.white, fontFamily: FONT, fontSize: 14, color: T.ink,
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = T.ink}
            onBlur={e => e.target.style.borderColor = T.warm}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: T.stone,
              display: "flex", alignItems: "center",
            }}>
              <FiX size={15} />
            </button>
          )}
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}
        >
          {CATEGORIES.map(cat => (
            <Pill key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
          ))}
        </motion.div>

        {/* Dropdowns row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2rem", alignItems: "center" }}
        >
          <Dropdown
            label={roomType === "ALL" ? "Room type" : roomLabel(roomType)}
            value={roomType}
            options={roomDropdownOptions}
            onChange={setRoomType}
          />
          <Dropdown
            label={style === "ALL" ? "Style" : style.charAt(0) + style.slice(1).toLowerCase()}
            value={style}
            options={styleDropdownOptions}
            onChange={setStyle}
          />
          <Dropdown
            label={priceDropdownLabel}
            value={maxPrice}
            options={PRICE_CAPS}
            onChange={setMaxPrice}
          />

          {hasFilters && (

            <button onClick={clearFilters} style={{

              background: "none", border: "none", cursor: "pointer",

              fontFamily: FONT, fontSize: 13, color: T.clay, fontWeight: 600,

              display: "flex", alignItems: "center", gap: 4,

            }}>

              <FiX size={13} /> Clear filters

            </button>

          )}

        </motion.div>


        {/* Add to cart error drawer */}
        <AnimatePresence>
          {addError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                marginBottom: "1rem", padding: "10px 14px", borderRadius: 8,
                background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca",
                fontFamily: FONT, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              {addError}
              <button onClick={() => setAddError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}>
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: T.white, border: `1.5px solid ${T.warm}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 200, background: `linear-gradient(90deg, #f0e9e4 25%, #fafaf9 50%, #f0e9e4 75%)` }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 12, background: T.linen, borderRadius: 4, marginBottom: 8, width: "60%" }} />
                  <div style={{ height: 16, background: T.linen, borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 12, background: T.linen, borderRadius: 4, width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", fontFamily: FONT, color: "#b91c1c", fontSize: 14 }}>
            {error} — <button onClick={fetchProducts} style={{ background: "none", border: "none", color: T.clay, cursor: "pointer", fontWeight: 600, fontFamily: FONT }}>retry</button>
          </div>
        )}

        {/* Product Grid Layout */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {products.length === 0
              ? <EmptyState hasFilters={!!hasFilters} onClear={clearFilters} />
              : products.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    currency={currency}
                    onAddToCart={addToCart}
                    index={i}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* Cart side drawer overlay */}
      <CartDrawer
        open={cartOpen}
        user={user}
        currency={currency}
        onClose={() => setCartOpen(false)}
        onCheckout={(cart) => {
          setCartOpen(false)
          console.log("Checkout triggered with cart:", cart)
        }}
      />
    </div>
  )
}