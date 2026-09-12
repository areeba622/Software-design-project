import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  FiSearch, FiShoppingCart, FiX, FiChevronDown, FiLogOut, FiGrid, FiMenu
} from "react-icons/fi"

// ─── Unified Brand Tokens (Synced with Dashboard & Landing) ──────────────────
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
const BASE = "http://localhost:8081"

const CATEGORIES = ["ALL", "BED", "CHAIR", "TABLE", "LAMP", "RUG", "WARDROBE", "SOFA", "FLOORING", "WALLPAPER", "DECOR", "OTHER"]
const ROOM_TYPES = ["ALL", "BEDROOM", "LIVING_ROOM", "KITCHEN", "DINING ROOM", "GAME ROOM", "OFFICE"]
const STYLES = ["ALL", "BOHEMIAN", "SCANDINAVIAN", "MINIMALIST"]
const PRICE_CAPS = [
  { label: "Any price", value: null },
  { label: "Under PKR 10,000", value: 10000 },
  { label: "Under PKR 25,000", value: 25000 },
  { label: "Under PKR 50,000", value: 50000 },
  { label: "Under PKR 100,000", value: 100000 }
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(pkr, currency) {
  if (currency === "USD") {
    const usd = pkr / 280
    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `PKR ${pkr?.toLocaleString("en-PK")}`
}

function categoryLabel(cat) {
  if (!cat) return ""
  return cat.charAt(0) + cat.slice(1).toLowerCase()
}

function roomLabel(room) {
  if (!room) return ""
  return room.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Scroll-Aware Mobile-Responsive Navbar ───────────────────────────────────
function Navbar({ user, cartCount, onCartOpen, onLogout, onBack, onRoomBuilder }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(250,249,245,0.78)' : 'rgba(250,249,245,0.55)',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.7)' : 'blur(8px) saturate(1.2)',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.7)' : 'blur(8px) saturate(1.2)',
          boxShadow: scrolled
            ? '0 1px 0 rgba(30,37,43,0.08), 0 4px 24px rgba(30,37,43,0.05)'
            : '0 1px 0 rgba(234,226,218,0.5)',
        }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        style={{
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2.5rem", height: 72, fontFamily: FONT,
        }}
      >
        {/* Logo */}
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill={C.ink} />
            <rect x="16" y="1" width="11" height="11" rx="2" fill={C.mustard} />
            <rect x="1" y="16" width="11" height="11" rx="2" fill={C.accentBg} />
            <rect x="16" y="16" width="11" height="11" rx="2" fill={C.ink} opacity="0.1" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.ink, letterSpacing: "-0.03em" }}>Palette</span>
        </button>

        {/* Desktop Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="dash-hidden-mobile">
          {user && (
            <span style={{ fontFamily: FONT, fontSize: 13, color: C.pastelMuted, fontWeight: 600 }}>
              {user.fullName?.split(' ')[0]}
            </span>
          )}

          <motion.button
            whileHover={{ scale: 1.03, borderColor: C.mustard }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRoomBuilder?.()}
            style={{
              background: C.white, border: `1.5px solid ${C.gridLine}`, borderRadius: 10,
              cursor: 'pointer', fontFamily: FONT, fontSize: '13px', fontWeight: 600,
              color: C.ink, padding: '7px 14px', transition: 'border-color 0.2s ease',
            }}
          >
            Build Custom Room
          </motion.button>

          <motion.button
            onClick={onCartOpen}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              position: "relative", background: C.white, border: `1.5px solid ${C.gridLine}`,
              borderRadius: 10, padding: "7px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink,
            }}
          >
            <FiShoppingCart size={14} />
            <span>Cart</span>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: "absolute", top: -5, right: -5,
                  background: C.mustard, color: C.ink, borderRadius: "50%",
                  width: 17, height: 17, fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            onClick={onLogout}
            whileHover={{ color: C.mustard }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.pastelMuted, display: "flex", alignItems: "center",
              padding: '7px 4px', transition: 'color 0.2s'
            }}
          >
            <FiLogOut size={16} />
          </motion.button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink }}
          className="dash-show-mobile"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute', top: 72, left: 0, right: 0, zIndex: 99,
              background: 'rgba(250,249,245,0.96)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.gridLine}`,
              padding: '20px 2.5rem', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <button
              onClick={() => { onRoomBuilder?.(); setMenuOpen(false); }}
              style={{
                fontSize: 15, fontWeight: 600, color: C.ink, background: 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              Build Custom Room
            </button>
            <button
              onClick={() => { onCartOpen(); setMenuOpen(false); }}
              style={{
                fontSize: 15, fontWeight: 600, color: C.ink, background: 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              Cart ({cartCount})
            </button>
            <button
              onClick={onLogout}
              style={{
                fontSize: 14, color: C.pastelMuted, background: 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 6, alignItems: 'center',
              }}
            >
              <FiLogOut size={14} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Filter Pills ────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, borderColor: active ? C.ink : C.pastelMuted }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: "6px 14px", borderRadius: 999, cursor: "pointer",
        fontFamily: FONT, fontSize: 12, fontWeight: 600,
        border: `1.5px solid ${active ? C.ink : C.gridLine}`,
        background: active ? C.ink : C.white,
        color: active ? C.white : C.pastelMuted,
        whiteSpace: "nowrap",
        transition: "color 0.18s, background-color 0.18s",
      }}
    >
      {label === "ALL" ? "All" : categoryLabel(label)}
    </motion.button>
  )
}

// ─── Sophisticated Dropdown Filter ───────────────────────────────────────────
function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isActive = value !== "ALL" && value !== null

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 10, cursor: "pointer",
          background: isActive ? C.ink : C.white,
          color: isActive ? C.white : C.ink,
          border: `1.5px solid ${isActive ? C.ink : C.gridLine}`,
          fontFamily: FONT, fontSize: 13, fontWeight: 600,
          whiteSpace: "nowrap", boxShadow: '0 2px 8px -2px rgba(30,37,43,0.04)'
        }}
      >
        <span>{label}</span>
        <FiChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
              background: C.white, border: `1px solid ${C.gridLine}`,
              borderRadius: 12, padding: "6px 0", minWidth: 190,
              boxShadow: "0 12px 32px -8px rgba(30,37,43,0.12)", overflow: 'hidden'
            }}
          >
            {options.map(opt => {
              // 'value' in opt (not opt.value ?? opt) — some options legitimately
              // have a null value (e.g. PRICE_CAPS' "Any price": { value: null }).
              // ?? treats null the same as undefined and would fall back to the
              // whole option object instead of null, breaking that filter.
              const currentVal = (opt && typeof opt === 'object' && 'value' in opt) ? opt.value : opt
              const isSelected = currentVal === value
              return (
                <button
                  key={currentVal}
                  onClick={() => { onChange(currentVal); setOpen(false) }}
                  style={{
                    width: "100%", textAlign: "left", padding: "9px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: FONT, fontSize: 13, fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? C.mustard : C.ink, transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = C.accentBg
                    if (!isSelected) e.currentTarget.style.color = C.ink
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "none"
                    if (!isSelected) e.currentTarget.style.color = C.ink
                  }}
                >
                  {opt.label ?? roomLabel(opt)}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Micro-Interacted Product Card ───────────────────────────────────────────
function ProductCard({ product, currency, onAddToCart, index }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAdd = async (e) => {
    e.stopPropagation()
    setAdding(true)
    await onAddToCart(product)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: C.white,
        border: `1.5px solid ${hovered ? C.mustard + '55' : C.gridLine}`,
        borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: hovered ? '0 16px 36px -8px rgba(30,37,43,0.08)' : '0 4px 16px -6px rgba(30,37,43,0.04)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer'
      }}
    >
      <div style={{ height: 210, background: `linear-gradient(135deg, ${C.white} 0%, ${C.accentBg} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {product.imageUrl ? (
          <motion.img
            animate={{ scale: hovered ? 1.04 : 1 }} transition={{ duration: 0.4 }}
            src={product.imageUrl} alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none" }}
          />
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🪑</div>
            <span style={{ fontFamily: FONT, fontSize: 11, color: C.pastelMuted, fontWeight: 600 }}>{categoryLabel(product.category || "OTHER")}</span>
          </div>
        )}

        {product.aestheticStyle && (
          <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(30,37,43,0.8)", backdropFilter: 'blur(4px)', color: C.white, borderRadius: 6, padding: "4px 9px", fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>
            {product.aestheticStyle.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {product.category && (
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.clay, background: "#FEF2EC", padding: "2px 8px", borderRadius: 4 }}>
              {categoryLabel(product.category).toUpperCase()}
            </span>
          )}
          {product.roomType && (
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.pastelMuted, background: C.creamBg, padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.gridLine}` }}>
              {roomLabel(product.roomType)}
            </span>
          )}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.ink, margin: 0, lineHeight: 1.35, letterSpacing: "-0.01em" }}>
          {product.name}
        </p>

        {product.description && (
          <p style={{ fontFamily: FONT, fontSize: 12, color: C.pastelMuted, margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>
        )}

        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px dashed ${C.gridLine}` }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>
            {formatPrice(product.priceInPKR, currency)}
          </span>

          <motion.button
            onClick={handleAdd} disabled={adding}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              background: added ? "#059669" : C.ink, color: C.white, border: "none", borderRadius: 8,
              padding: "8px 14px", cursor: adding ? "wait" : "pointer",
              fontFamily: FONT, fontSize: 12, fontWeight: 700,
              transition: "background-color 0.2s ease", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {added ? "✓ Added" : adding ? "Adding…" : (
              <><FiShoppingCart size={13} /> Add</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty State Frame ───────────────────────────────────────────────────────
function EmptyState({ hasFilters, onClear }) {
  return (
    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "6rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 52 }}>🔍</div>
      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.ink, margin: 0 }}>No products matched your layout</p>
      <p style={{ fontFamily: FONT, fontSize: 14, color: C.pastelMuted, margin: 0, maxWidth: 300, lineHeight: 1.5 }}>
        {hasFilters ? "Try adjusting your aesthetic filters, custom room filters or search scope." : "No products available in workspace yet."}
      </p>
      {hasFilters && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClear} style={{ background: C.ink, color: C.white, border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 700 }}>
          Clear all filters
        </motion.button>
      )}
    </div>
  )
}

// ─── Cart Drawer Component ───────────────────────────────────────────────────
function CartDrawer({ open, user, currency, onClose, onCheckout }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  // ✅ FIX 1: Reset cart state when drawer closes so next open always fetches fresh
  useEffect(() => {
    if (!open) {
      setCart(null)
      return
    }
    // ✅ FIX 2: Only fetch from DB when drawer opens (cart is null after reset)
    if (!user) return
    setLoading(true)
    fetch(`${BASE}/api/cart?userId=${user.userId}`)
      .then(r => r.json())
      .then(d => setCart(d))
      .catch(() => setCart(null))
      .finally(() => setLoading(false))
  }, [open, user])

  // ✅ FIX 3: removeItem only updates local state — no re-fetch after delete
  const removeItem = async (cartItemId) => {
    setCart(prev => ({
      ...prev,
      lines: prev.lines.filter(l => l.cartItemId !== cartItemId),
      grandTotal: prev.lines
        .filter(l => l.cartItemId !== cartItemId)
        .reduce((sum, l) => sum + l.lineTotal, 0)
    }))
    await fetch(`${BASE}/api/cart/remove/${cartItemId}?userId=${user.userId}`, { method: "DELETE" })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(30,37,43,0.4)", zIndex: 300, backdropFilter: "blur(4px)" }}
          />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 100vw)", background: C.white, zIndex: 400, display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(30,37,43,0.15)" }}
          >
            <div style={{ padding: "22px 24px", borderBottom: `1px solid ${C.gridLine}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: "1.15rem", color: C.ink, letterSpacing: '-0.02em' }}>Your Cart</span>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.pastelMuted, display: 'flex', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px" }}>
              {loading && <p style={{ fontFamily: FONT, color: C.pastelMuted, textAlign: "center", marginTop: 40, fontSize: 14 }}>Loading cart matrix…</p>}
              {!loading && (!cart || !cart.lines || cart.lines.length === 0) && (
                <div style={{ textAlign: "center", marginTop: 80 }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontFamily: FONT, color: C.pastelMuted, fontSize: 14, fontWeight: 500 }}>Your cart studio workspace is empty.</p>
                </div>
              )}
              {!loading && cart?.lines?.map(line => (
                <div key={line.cartItemId} style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${C.gridLine}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${C.white} 0%, ${C.accentBg} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${C.gridLine}` }}>🪑</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: C.ink, margin: "0 0 3px", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.itemName}</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: C.pastelMuted, margin: 0, fontWeight: 500 }}>
                      Qty: {line.quantity} · {formatPrice(line.unitPrice, currency)}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: C.ink }}>{formatPrice(line.lineTotal, currency)}</span>
                    <button onClick={() => removeItem(line.cartItemId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 2, display: 'flex' }}>
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart?.lines?.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.gridLine}`, background: C.creamBg }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: 'center' }}>
                  <span style={{ fontFamily: FONT, fontSize: 14, color: C.pastelMuted, fontWeight: 600 }}>Grand total</span>
                  <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{formatPrice(cart.grandTotal, currency)}</span>
                </div>
                <motion.button
                  onClick={() => onCheckout(cart)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ width: "100%", background: C.ink, color: C.white, border: "none", borderRadius: 12, padding: "14px 0", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: '0 4px 12px rgba(30,37,43,0.15)' }}
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

// ─── Main Catalog Page Export ────────────────────────────────────────────────
export default function ProductCatalog({
  user, onBack, onLogout, onRoomBuilder, onCheckout, onQuiz, onNavigate,
  currency: currencyProp, initialRoomFilter, initialCategoryFilter, initialStyleFilter,
  pageTitle, pageSubtitle,
}) {
  const currency = currencyProp || user?.currencyPreference || "PKR"

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(initialCategoryFilter || "ALL")
  const [roomType, setRoomType] = useState(initialRoomFilter || "ALL")
  const [style, setStyle] = useState(initialStyleFilter || "ALL")
  const [maxPrice, setMaxPrice] = useState(null)

  // initialRoomFilter / initialCategoryFilter / initialStyleFilter only seed
  // state on first render (useState's initializer runs once). If the parent
  // route stays mounted and just updates these props — e.g. clicking
  // "View Recommendations" from the Dashboard without a full navigation
  // remount — this syncs the filters instead of silently ignoring the new
  // value.
  useEffect(() => {
    if (initialRoomFilter) setRoomType(initialRoomFilter)
  }, [initialRoomFilter])
  useEffect(() => {
    if (initialCategoryFilter) setCategory(initialCategoryFilter)
  }, [initialCategoryFilter])
  useEffect(() => {
    if (initialStyleFilter) setStyle(initialStyleFilter)
  }, [initialStyleFilter])

  const [cartOpen, setCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [addError, setAddError] = useState(null)

  const searchTimeout = useRef(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `${BASE}/api/products`
      if (search.trim()) url = `${BASE}/api/products/search?keyword=${encodeURIComponent(search.trim())}`
      else if (maxPrice) url = `${BASE}/api/products/filter?maxPrice=${maxPrice}`
      else if (category !== "ALL") url = `${BASE}/api/products/category/${category}`

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to load products")
      let data = await res.json()

      if (roomType !== "ALL") data = data.filter(p => p.roomType === roomType)
      if (style !== "ALL") data = data.filter(p => p.aestheticStyle === style)
      if (maxPrice && search.trim()) data = data.filter(p => p.priceInPKR <= maxPrice)

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

  const refreshCartCount = async () => {
    if (!user) return
    try {
      const res = await fetch(`${BASE}/api/cart?userId=${user.userId}`)
      const d = await res.json()
      setCartCount(d?.lines?.length || 0)
    } catch (_) { }
  }

  useEffect(() => { refreshCartCount() }, [])

  const addToCart = async (product) => {
    if (!user) {
      setAddError("Please log in to add items to cart.")
      return
    }
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

  const clearFilters = () => {
    setSearch("")
    setCategory("ALL")
    setRoomType("ALL")
    setStyle("ALL")
    setMaxPrice(null)
  }

  const hasFilters = search || category !== "ALL" || roomType !== "ALL" || style !== "ALL" || maxPrice

  const roomDropdownOptions = ROOM_TYPES.map(r => ({ label: r === "ALL" ? "All rooms" : roomLabel(r), value: r }))
  const styleDropdownOptions = STYLES.map(s => ({ label: s === "ALL" ? "All styles" : s.charAt(0) + s.slice(1).toLowerCase(), value: s }))
  const priceDropdownLabel = PRICE_CAPS.find(p => p.value === maxPrice)?.label || "Any price"

  return (
    <div style={{ minHeight: "100vh", background: 'linear-gradient(135deg, #FAF9F5 0%, #F5EFE6 28%, #EDE6F8 58%, #E8F3EF 82%, #FAF9F5 100%)', fontFamily: FONT, position: "relative", overflowX: "hidden" }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 768px) {
          .dash-hidden-mobile { display: none !important; }
          .dash-show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .dash-show-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '2%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.32 }} />

      <Navbar
        user={user}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onLogout={onLogout}
        onBack={onBack}
        onRoomBuilder={onRoomBuilder}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem 5rem", position: 'relative', zIndex: 1 }}>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
          style={{ padding: "3rem 0 2rem" }}
        >
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.mustard, marginBottom: 10 }}>STUDIO COLLECTION</p>
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(2rem, 4vw, 2.8rem)", color: C.ink, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.1 }}>{pageTitle || "Furniture & Décor"}</h1>
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.pastelMuted, marginTop: 10, marginBottom: 0, fontWeight: 500 }}>
            {pageSubtitle || (loading ? "Cataloging inventory matrix…" : `${products.length} elegant workspace product${products.length !== 1 ? "s" : ""} active`)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{ position: "relative", marginBottom: "1.5rem" }}
        >
          <FiSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.pastelMuted, pointerEvents: "none" }} size={16} />
          <input
            type="text"
            placeholder="Search our curated collections room by room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "14px 44px 14px 46px", borderRadius: 12, border: `1.5px solid ${C.gridLine}`, background: C.white, fontFamily: FONT, fontSize: 14, color: C.ink, outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxShadow: '0 4px 12px -2px rgba(30,37,43,0.03)' }}
            onFocus={e => {
              e.target.style.borderColor = C.mustard
              e.target.style.boxShadow = `0 0 0 4px ${C.mustard}1A`
            }}
            onBlur={e => {
              e.target.style.borderColor = C.gridLine
              e.target.style.boxShadow = '0 4px 12px -2px rgba(30,37,43,0.03)'
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.pastelMuted, display: "flex", alignItems: "center", padding: 4 }}>
              <FiX size={15} />
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}
        >
          {CATEGORIES.map(cat => (
            <Pill key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2.5rem", alignItems: "center" }}
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
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearFilters} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13, color: C.clay, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: '6px 10px' }}>
              <FiX size={14} /> Reset parameters
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {addError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: "1.5rem", padding: "12px 16px", borderRadius: 10, background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", fontFamily: FONT, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontWeight: 500 }}>{addError}</span>
              <button onClick={() => setAddError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B91C1C", display: 'flex' }}>
                <FiX size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: C.white, border: `1.5px solid ${C.gridLine}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ height: 210, background: `linear-gradient(90deg, #FAF9F5 25%, ${C.accentBg} 50%, #FAF9F5 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 12, background: C.creamBg, borderRadius: 4, marginBottom: 10, width: "40%" }} />
                  <div style={{ height: 16, background: C.creamBg, borderRadius: 4, marginBottom: 10, width: "85%" }} />
                  <div style={{ height: 12, background: C.creamBg, borderRadius: 4, width: "65%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", fontFamily: FONT, color: "#B91C1C", fontSize: 14, fontWeight: 500 }}>
            {error} — <button onClick={fetchProducts} style={{ background: "none", border: "none", color: C.clay, cursor: "pointer", fontWeight: 700, fontFamily: FONT, textDecoration: 'underline' }}>Retry handshake</button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {products.length === 0 ? (
              <EmptyState hasFilters={!!hasFilters} onClear={clearFilters} />
            ) : (
              products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  onAddToCart={addToCart}
                  index={i}
                />
              ))
            )}
          </div>
        )}

      </div>

      <CartDrawer
        open={cartOpen}
        user={user}
        currency={currency}
        onClose={() => setCartOpen(false)}
        onCheckout={(cart) => {
          setCartOpen(false)
          onCheckout?.(cart)
        }}
      />
    </div>
  )
}