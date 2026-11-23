import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cartApi, productsApi } from '../api'
import { useAuth } from '../auth/AuthContext'

const CartContext = createContext(null)

/**
 * The signed-in user's cart, shared by the header badge, the cart drawer and
 * every "Add to cart" button. The server stays the source of truth: every
 * change returns the updated cart and we store that.
 */
export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [productsById, setProductsById] = useState({})
  const noticeTimer = useRef(null)
  const productsRequested = useRef(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null)
      return null
    }
    try {
      const next = await cartApi.get()
      setCart(next)
      return next
    } catch {
      return null
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Cart lines carry no photo, so the drawer looks products up once.
  const loadProductImages = useCallback(() => {
    if (productsRequested.current) return
    productsRequested.current = true
    productsApi
      .list()
      .then((list) => setProductsById(Object.fromEntries((list || []).map((p) => [p.id, p]))))
      .catch(() => {
        productsRequested.current = false
      })
  }, [])

  const showNotice = useCallback((name) => {
    clearTimeout(noticeTimer.current)
    setNotice({ name, id: Date.now() })
    noticeTimer.current = setTimeout(() => setNotice(null), 4000)
  }, [])

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const add = useCallback(
    async ({ itemId, itemType = 'PRODUCT', quantity = 1, name }) => {
      const next = await cartApi.add({ itemId, itemType, quantity })
      setCart(next)
      showNotice(name)
      return next
    },
    [showNotice],
  )

  const remove = useCallback(
    async (cartItemId) => {
      setCart((prev) => {
        if (!prev) return prev
        const lines = prev.lines.filter((l) => l.cartItemId !== cartItemId)
        return { ...prev, lines, grandTotal: lines.reduce((sum, l) => sum + l.lineTotal, 0) }
      })
      try {
        setCart(await cartApi.remove(cartItemId))
      } catch {
        refresh()
      }
    },
    [refresh],
  )

  const openDrawer = useCallback(() => {
    loadProductImages()
    setDrawerOpen(true)
    setNotice(null)
  }, [loadProductImages])

  const count = cart?.lines?.reduce((sum, l) => sum + (l.quantity || 0), 0) || 0

  const value = useMemo(
    () => ({
      cart,
      count,
      refresh,
      add,
      remove,
      drawerOpen,
      openDrawer,
      closeDrawer: () => setDrawerOpen(false),
      notice,
      dismissNotice: () => setNotice(null),
      productsById,
    }),
    [cart, count, refresh, add, remove, drawerOpen, openDrawer, notice, productsById],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
