import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import PageLoader from './components/PageLoader'
import AppLayout from './components/layout/AppLayout'

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
  const navigate = useNavigate()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Sign in / sign up: full-screen, no site chrome ─────────────── */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route
              path="/flooring-wallpaper"
              element={
                <ProductCatalog
                  defaultCategory="FLOORING"
                  pageTitle="Flooring and wallpaper"
                  pageSubtitle="Floors and walls set the tone before a single piece of furniture goes in."
                />
              }
            />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/quiz" element={<DesignQuiz onBack={() => navigate('/dashboard')} />} />
            <Route path="/designers" element={<DesignersPage />} />
            <Route
              path="/room-builder"
              element={<RoomBuilder onBack={() => navigate('/dashboard')} onProceedToPayment={() => navigate('/payment')} />}
            />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        {/* Checkout keeps the header but drops the footer so the payment stays in focus. */}
        <Route element={<AppLayout footer={false} />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/payment" element={<PaymentPage onBack={() => navigate('/catalog')} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
