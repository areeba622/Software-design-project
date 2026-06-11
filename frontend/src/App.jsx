import { useState } from "react"
import LandingPage from "./LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProductCatalog from "./pages/ProductCatalog"
import DesignQuiz from "./pages/DesignQuiz"

// 1. CHNAGE: Sahi path ke sath Designers import kiya (Kyunki file 'pages' folder ke andar hai)
import DesignersPage from "./pages/Designers" 

export default function App() {
  const [page, setPage]               = useState("landing")
  const [user, setUser]               = useState(null)
  const [intendedPage, setIntendedPage] = useState(null)

  const handleAuth = (userData) => {
    setUser(userData)
    if (intendedPage) {
      setPage(intendedPage)
      setIntendedPage(null)
    } else {
      setPage("dashboard")
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIntendedPage(null)
    setPage("landing")
  }

  const goTo = (destination) => {
    if (!user && destination !== "landing") {
      setIntendedPage(destination)
      setPage("login")
      return
    }
    setPage(destination)
  }

  // ─── Landing ──────────────────────────────────────────────────────────────
  if (page === "landing")
    return (
      <LandingPage
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
        onQuiz={() => goTo("quiz")}
      />
    )

  // ─── Auth ─────────────────────────────────────────────────────────────────
  if (page === "login")
    return (
      <Login
        onSwitch={() => setPage("register")}
        onBack={() => { setIntendedPage(null); setPage("landing") }}
        onSuccess={handleAuth}
      />
    )

  if (page === "register")
    return (
      <Register
        onSwitch={() => setPage("login")}
        onBack={() => { setIntendedPage(null); setPage("landing") }}
        onSuccess={handleAuth}
      />
    )

  // ─── App ──────────────────────────────────────────────────────────────────
  if (page === "dashboard")
    return (
      <Dashboard
        user={user}
        onNavigate={goTo}
        onLogout={handleLogout}
      />
    )

  if (page === "catalog")
    return (
      <ProductCatalog
        user={user}
        onBack={() => setPage("dashboard")}
        onLogout={handleLogout}
      />
    )

  if (page === "quiz")
    return (
      <DesignQuiz
        user={user}
        onBack={() => setPage("dashboard")}
      />
    )

  // 2. CHANGE: Bina kuch purana delete kiye, naya page yahan add kar diya
  if (page === "designers")
    return (
      <DesignersPage
        user={user}
        onBack={() => setPage("dashboard")}
      />
    )

  // Fallback
  return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />
}