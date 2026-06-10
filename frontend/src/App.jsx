// src/App.jsx
import { useState } from "react"
import LandingPage from "./LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard";         
import ProductCatalog from "./pages/ProductCatalog"
import DesignQuiz from "./pages/DesignQuiz"
import RoomBuilder from "./pages/RoomBuilder" 
import CartCheckoutFlow from "./CartCheckoutFlow" // ← IMPORT NEW FLOW FROM YOUR FILE

export default function App() {
  const [page, setPage] = useState("landing")
  const [user, setUser] = useState(null)

  const handleAuth = (userData) => {
    setUser(userData)
    setPage("dashboard") // ← Direct users to Dashboard upon logging in / registering
  }

  const handleLogout = () => {
    setUser(null)
    setPage("landing")
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

  // ─── MAIN APP PAGES (AUTHENTICATED) ───────────────────────────────────────

  // This handles the Dashboard views and hooks up your onNavigate setup
  if (page === "dashboard")
    return (
      <Dashboard
        user={user}
        onNavigate={(targetPage) => setPage(targetPage)} // Handles 'room-builder', 'catalog', 'quiz', 'cart-checkout', etc.
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
        onBack={() => setPage("dashboard")} // Allows navigating back to studio dashboard
      />
    )

  if (page === "quiz")
    return (
      <DesignQuiz
        user={user}
        onBack={() => setPage("dashboard")} // Takes them back to dashboard
      />
    )

  if (page === "room-builder")
    return (
      <RoomBuilder
        user={user}
        onBack={() => setPage("dashboard")} // Takes them back to dashboard
      />
    )

  // ─── PALETTE CHECKOUT & CART FLOW ─────────────────────────────────────────

  if (page === "cart-checkout")
    return (
      <CartCheckoutFlow 
        // Passes back to the main dashboard when user exits or completes payment
        onBack={() => setPage("dashboard")} 
      />
    )

  // ─── LANDING PAGE ─────────────────────────────────────────────────────────

  return (
    <LandingPage
      onLogin={() => setPage("login")}
      onRegister={() => setPage("register")}
      onQuiz={() => {
        if (user) {
          setPage("quiz")
        } else {
          setPage("login")
        }
      }}
      onRoomBuilder={() => {
        if (user) {
          setPage("room-builder")
        } else {
          setPage("login")
        }
      }}
    />
  )
}