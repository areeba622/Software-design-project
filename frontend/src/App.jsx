// src/App.jsx
import { useState } from "react"
import LandingPage from "./LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProductCatalog from "./pages/ProductCatalog"
import DesignQuiz from "./pages/DesignQuiz"
import RoomBuilder from "./pages/RoomBuilder"
import CartCheckoutFlow from "./CartCheckoutFlow"
import DesignersPage from "./pages/Designers"
// ── NEW: import PaymentPage ──
import PaymentPage from "./pages/PaymentPage"

export default function App() {
  const [page, setPage] = useState("landing")
  const [user, setUser] = useState(null)

  // ── NEW: cart state passed into PaymentPage ──
  // Holds the cart object received from either CartDrawer (ProductCatalog)
  // or the RoomBuilder "Build Room" flow, before navigating to payment.
  const [pendingCart, setPendingCart] = useState(null)

  const handleAuth = (userData) => {
    setUser(userData)
    setPage("dashboard")
  }

  const handleLogout = () => {
    setUser(null)
    setPage("landing")
  }

  // ── NEW: shared handler — called by both ProductCatalog and RoomBuilder ──
  // Receives the cart object, stores it, then navigates to the payment page.
  const handleGoToPayment = (cart) => {
    setPendingCart(cart)
    setPage("payment")
  }

  // ─── AUTH PAGES ───────────────────────────────────────────────────────────

  if (page === "login")
    return (
      <Login
        onSwitch={() => setPage("register")}
        onBack={() => setPage("landing")}
        onSuccess={handleAuth}
      />
    )

  if (page === "register")
    return (
      <Register
        onSwitch={() => setPage("login")}
        onBack={() => setPage("landing")}
        onSuccess={handleAuth}
      />
    )

  // ─── MAIN APP PAGES ───────────────────────────────────────────────────────

  if (page === "dashboard")
    return (
      <Dashboard
        user={user}
        onNavigate={(targetPage) => setPage(targetPage)}
        onLogout={handleLogout}
      />
    )

  if (page === "catalog")
    return (
      <ProductCatalog
        user={user}
        onQuiz={() => setPage("quiz")}
        onRoomBuilder={() => setPage("room-builder")}
        onLogout={handleLogout}
        onBack={() => setPage("dashboard")}
        // ── NEW: wire checkout → payment ──
        // ProductCatalog already calls onCheckout?.(cart) from CartDrawer.
        // We pass handleGoToPayment so clicking "Proceed to checkout" navigates here.
        onCheckout={handleGoToPayment}
      />
    )

  if (page === "quiz")
    return (
      <DesignQuiz
        user={user}
        onBack={() => setPage("dashboard")}
      />
    )

  if (page === "designers")
    return (
      <DesignersPage
        user={user}
        onBack={() => setPage("dashboard")}
      />
    )

  if (page === "room-builder")
    return (
      <RoomBuilder
        user={user}
        onBack={() => setPage("dashboard")}
        // ── NEW: wire RoomBuilder "Proceed to payment" → payment page ──
        // RoomBuilder will call this after the room is added to cart.
        // See RoomBuilder.jsx for how onProceedToPayment is called.
        onProceedToPayment={handleGoToPayment}
      />
    )

  // ── NEW: Payment page ──
  // Receives user + pendingCart. onBack clears the cart and goes to dashboard.
  if (page === "payment")
    return (
      <PaymentPage
        user={user}
        cart={pendingCart}
        onBack={() => {
          setPendingCart(null)
          setPage("dashboard")
        }}
      />
    )

  // ─── CART CHECKOUT FLOW (existing, unchanged) ─────────────────────────────
  if (page === "cart-checkout")
    return (
      <CartCheckoutFlow
        onBack={() => setPage("dashboard")}
      />
    )

  // ─── LANDING PAGE ─────────────────────────────────────────────────────────
  return (
    <LandingPage
      onLogin={() => setPage("login")}
      onRegister={() => setPage("register")}
      onQuiz={() => {
        if (user) setPage("quiz")
        else setPage("login")
      }}
      onRoomBuilder={() => {
        if (user) setPage("room-builder")
        else setPage("login")
      }}
    />
  )
}