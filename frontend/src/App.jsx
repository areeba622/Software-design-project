import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import PageLoader from './components/PageLoader'

// Each page is its own chunk, downloaded the first time it is opened.
const LandingPage = lazy(() => import('./LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const DesignQuiz = lazy(() => import('./pages/DesignQuiz'))
const RoomBuilder = lazy(() => import('./pages/RoomBuilder'))
const DesignersPage = lazy(() => import('./pages/Designers'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const Orders = lazy(() => import('./pages/Orders'))

/** Sends logged-out visitors to /login and brings them back here afterwards. */
function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

/**
 * Logged-in users don't need the login/register pages. This is also what moves
 * the user on after a successful login: back to the page they were sent away
 * from (ProtectedRoute stores it in location.state.from), or the dashboard.
 */
function GuestOnlyRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Outlet />
  const from = location.state?.from
  return <Navigate to={from ? `${from.pathname}${from.search || ''}` : '/dashboard'} replace />
}

export default function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const goIfLoggedIn = (path) => () =>
    user ? navigate(path) : navigate('/login', { state: { from: { pathname: path } } })

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <LandingPage
              onLogin={() => navigate('/login')}
              onRegister={() => navigate('/register')}
              onQuiz={goIfLoggedIn('/quiz')}
              onRoomBuilder={goIfLoggedIn('/room-builder')}
            />
          }
        />
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ── Logged in ──────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard onNavigate={(page) => navigate(page === 'landing' ? '/' : `/${page}`)} onLogout={() => logout()} />}
          />
          <Route
            path="/catalog"
            element={
              <ProductCatalog
                onRoomBuilder={() => navigate('/room-builder')}
                onLogout={() => logout()}
                onBack={() => navigate('/dashboard')}
                onCheckout={() => navigate('/payment')}
              />
            }
          />
          <Route
            path="/flooring-wallpaper"
            element={
              <ProductCatalog
                defaultCategory="FLOORING"
                pageTitle="Flooring & Wallpaper"
                pageSubtitle="Transform your floors and walls with our curated collection."
                onRoomBuilder={() => navigate('/room-builder')}
                onLogout={() => logout()}
                onBack={() => navigate('/dashboard')}
                onCheckout={() => navigate('/payment')}
              />
            }
          />
          <Route path="/product/:id" element={<ProductDetails onBack={() => navigate('/catalog')} />} />
          <Route path="/quiz" element={<DesignQuiz onBack={() => navigate('/dashboard')} />} />
          <Route path="/designers" element={<DesignersPage onBack={() => navigate('/dashboard')} />} />
          <Route
            path="/room-builder"
            element={<RoomBuilder onBack={() => navigate('/dashboard')} onProceedToPayment={() => navigate('/payment')} />}
          />
          <Route path="/payment" element={<PaymentPage onBack={() => navigate('/dashboard')} />} />
          <Route path="/orders" element={<Orders onBack={() => navigate('/dashboard')} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
