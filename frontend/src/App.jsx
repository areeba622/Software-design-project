import { useState, useEffect, useCallback } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import LandingPage from "./LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard.jsx"
import ProductCatalog from "./pages/ProductCatalog"
import DesignQuiz from "./pages/DesignQuiz"
import RoomBuilder from "./pages/RoomBuilder"
import DesignersPage from "./pages/Designers"
import PaymentPage from "./pages/PaymentPage"
import ProductDetails from "./pages/ProductDetails"
import Orders from "./pages/Orders"
import { loadSession, saveSession, clearSession, UNAUTHORIZED_EVENT } from "./config/api"

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(loadSession)
  const [pendingCart, setPendingCart] = useState(null)

  // ── Global currency — set on Dashboard, persists across all pages ──────────
  const [currency, setCurrency] = useState(() => loadSession()?.currencyPreference || 'PKR')

  // ── Room filter — set when user clicks a Room Bundle card on Dashboard ─────
  const [catalogRoomFilter, setCatalogRoomFilter] = useState(null)

  // ── Style filter — set when user clicks "View Recommendations" / "View All"
  // on Dashboard, based on their latest quiz result. Same pattern as
  // catalogRoomFilter: ProductCatalog reads this once as initialStyleFilter,
  // then owns its own filter state from there.
  const [catalogStyleFilter, setCatalogStyleFilter] = useState(null)

  const navigate = useNavigate()

  const handleAuth = (userData) => {
    setUser(userData)
    saveSession(userData)
    if (userData?.currencyPreference) setCurrency(userData.currencyPreference)
    navigate("/dashboard")
  }

  const handleLogout = useCallback((redirectTo = "/") => {
    setUser(null)
    clearSession()
    setCatalogRoomFilter(null)
    setCatalogStyleFilter(null)
    navigate(redirectTo)
  }, [navigate])

  // The API answered 401 (token expired or invalid): sign out and go to login.
  useEffect(() => {
    const onUnauthorized = () => handleLogout("/login")
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [handleLogout])

  const handleGoToPayment = (cart) => {
    setPendingCart(cart)
    navigate("/payment")
  }

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <LandingPage
            onLogin={() => navigate("/login")}
            onRegister={() => navigate("/register")}
            onQuiz={() => { if (user) navigate("/quiz"); else navigate("/login") }}
            onRoomBuilder={() => { if (user) navigate("/room-builder"); else navigate("/login") }}
          />
        }
      />
      <Route
        path="/login"
        element={<Login onSwitch={() => navigate("/register")} onBack={() => navigate("/")} onSuccess={handleAuth} />}
      />
      <Route
        path="/register"
        element={<Register onSwitch={() => navigate("/login")} onBack={() => navigate("/")} onSuccess={handleAuth} />}
      />

      {/* ── Protected ──────────────────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard
              user={user}
              currency={currency}
              setCurrency={setCurrency}
              setCatalogRoomFilter={setCatalogRoomFilter}
              setCatalogStyleFilter={setCatalogStyleFilter}
              onNavigate={(targetPage) => {
                if (targetPage === "landing") navigate("/")
                else navigate(`/${targetPage}`)
              }}
              onLogout={() => handleLogout()}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalog"
        element={
          <ProtectedRoute user={user}>
            <ProductCatalog
              user={user}
              currency={currency}
              initialRoomFilter={catalogRoomFilter}
              initialStyleFilter={catalogStyleFilter}
              onQuiz={() => navigate("/quiz")}
              onRoomBuilder={() => navigate("/room-builder")}
              onLogout={() => handleLogout()}
              onBack={() => navigate("/dashboard")}
              onCheckout={handleGoToPayment}
              onNavigate={(page) => navigate(`/${page}`)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz"
        element={
          <ProtectedRoute user={user}>
            <DesignQuiz
              user={user}
              currency={currency}
              onBack={() => navigate("/dashboard")}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/designers"
        element={
          <ProtectedRoute user={user}>
            <DesignersPage
              user={user}
              currency={currency}
              onBack={() => navigate("/dashboard")}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/room-builder"
        element={
          <ProtectedRoute user={user}>
            <RoomBuilder
              user={user}
              currency={currency}
              onBack={() => navigate("/dashboard")}
              onProceedToPayment={handleGoToPayment}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute user={user}>
            <PaymentPage
              user={user}
              cart={pendingCart}
              currency={currency}
              onBack={() => { setPendingCart(null); navigate("/dashboard") }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute user={user}>
            <Orders
              user={user}
              currency={currency}
              onBack={() => navigate("/dashboard")}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/product/:id"
        element={
          <ProtectedRoute user={user}>
            <ProductDetails
              user={user}
              currency={currency}
              onBack={() => navigate("/catalog")}
            />
          </ProtectedRoute>
        }
      />

      {/* Flooring & Wallpaper — filtered catalog view */}
      <Route
        path="/flooring-wallpaper"
        element={
          <ProtectedRoute user={user}>
            <ProductCatalog
              user={user}
              currency={currency}
              initialCategoryFilter="FLOORING"
              onQuiz={() => navigate("/quiz")}
              onRoomBuilder={() => navigate("/room-builder")}
              onLogout={() => handleLogout()}
              onBack={() => navigate("/dashboard")}
              onCheckout={handleGoToPayment}
              onNavigate={(page) => navigate(`/${page}`)}
              pageTitle="Flooring & Wallpaper"
              pageSubtitle="Transform your floors and walls with our curated collection."
            />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}