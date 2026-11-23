import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiLogOut, FiMenu, FiPackage, FiShoppingBag, FiGrid } from 'react-icons/fi'
import { useAuth } from '../../auth/AuthContext'
import { useCart } from '../../lib/CartContext'
import { useCurrency } from '../../lib/CurrencyContext'
import Logo from './Logo'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'

const NAV_LINKS = [
  { to: '/catalog', label: 'Shop' },
  { to: '/room-builder', label: 'Room planner' },
  { to: '/quiz', label: 'Style quiz' },
  { to: '/designers', label: 'Designers' },
]

function CurrencySwitch({ className = '' }) {
  const { currency, setCurrency } = useCurrency()
  return (
    <div role="group" aria-label="Show prices in" className={`inline-flex rounded-full bg-surface p-0.5 ${className}`}>
      {['PKR', 'USD'].map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className={`h-8 rounded-full px-3 text-xs font-semibold transition-colors ${
            currency === c ? 'bg-canvas text-ink shadow-[0_1px_2px_rgb(27_23_20/0.12)]' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const first = user.fullName?.split(' ')[0] || 'Account'

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-full pl-1 pr-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
          {first.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[7rem] truncate">{first}</span>
        <FiChevronDown size={14} className={`text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-panel border border-line bg-canvas p-1.5 shadow-overlay"
          >
            <div className="px-3 pb-2.5 pt-2">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-[13px] text-ink-3">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {[
              { to: '/dashboard', label: 'Overview', icon: FiGrid },
              { to: '/orders', label: 'Orders', icon: FiPackage },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Icon size={15} className="text-ink-2" /> {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
            >
              <FiLogOut size={15} className="text-ink-2" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SiteHeader() {
  const { user, logout } = useAuth()
  const { count, openDrawer } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const onCart = () => (user ? openDrawer() : navigate('/login', { state: { from: location } }))

  return (
    <>
      <header
        className={`sticky top-0 z-[100] h-[var(--header-h)] border-b bg-canvas/85 backdrop-blur-xl backdrop-saturate-150 transition-colors ${
          scrolled ? 'border-line' : 'border-transparent'
        }`}
      >
        <div className="page flex h-full items-center gap-6">
          <Link to={user ? '/dashboard' : '/'} aria-label="Palette home" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${
                    isActive ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <CurrencySwitch className="hidden md:inline-flex" />
            {user ? (
              <div className="hidden lg:block">
                <AccountMenu user={user} onLogout={() => logout()} />
              </div>
            ) : (
              <div className="hidden items-center gap-1 lg:flex">
                <Button variant="ghost" size="sm" to="/login">
                  Sign in
                </Button>
                <Button size="sm" to="/register">
                  Create account
                </Button>
              </div>
            )}
            <button
              type="button"
              onClick={onCart}
              aria-label={count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface"
            >
              <FiShoppingBag size={20} />
              {count > 0 && (
                <span className="tabular absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface lg:hidden"
            >
              <FiMenu size={21} />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" width={380}>
        <nav aria-label="Mobile" className="flex flex-col px-3 py-3">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-3.5 text-[17px] font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-ink'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mx-6 h-px bg-line" />
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-ink-2">Show prices in</span>
            <CurrencySwitch />
          </div>
          {user ? (
            <div className="space-y-1">
              <p className="pb-2 text-sm text-ink-3">Signed in as {user.fullName}</p>
              <Link to="/dashboard" className="flex items-center gap-3 py-2.5 text-[15px] text-ink">
                <FiGrid size={16} className="text-ink-2" /> Overview
              </Link>
              <Link to="/orders" className="flex items-center gap-3 py-2.5 text-[15px] text-ink">
                <FiPackage size={16} className="text-ink-2" /> Orders
              </Link>
              <button type="button" onClick={() => logout()} className="flex items-center gap-3 py-2.5 text-[15px] text-ink">
                <FiLogOut size={16} className="text-ink-2" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Button block to="/register">
                Create account
              </Button>
              <Button block variant="secondary" to="/login">
                Sign in
              </Button>
            </div>
          )}
        </div>
      </Sheet>
    </>
  )
}
