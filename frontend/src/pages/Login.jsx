import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'
import AuthLayout, { AuthField, authInputClass } from '../components/AuthLayout'
import Button from '../components/ui/Button'
import CozyLiving from '../assets/CozyLiving.jpg'
import AmbientCorner from '../assets/AmbientCorner.jpg'
import DiningVignette from '../assets/DiningVignette.jpg'

const SLIDES = [
  { img: CozyLiving, tagline: 'Design the room you keep coming back to.', sub: 'Furniture picked by room and by style.' },
  { img: AmbientCorner, tagline: 'Light that changes how a room feels.', sub: 'Lamps, pendants and lanterns for every corner.' },
  { img: DiningVignette, tagline: 'Every detail, priced before you buy.', sub: 'Plan a whole room and see the total as you go.' },
]

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(form.email, form.password) // GuestOnlyRoute then sends the user on
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      slides={SLIDES}
      title="Welcome back"
      subtitle="Sign in to see your cart, orders and saved style."
      footer={
        <>
          New to Palette?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-7" noValidate={false}>
        <AuthField id="email" label="Email">
          <input id="email" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" autoComplete="username" required className={authInputClass} />
        </AuthField>
        <AuthField id="password" label="Password">
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 hover:text-ink"
            >
              {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
            </button>
          </div>
        </AuthField>

        {error && (
          <p role="alert" className="rounded-card bg-danger-soft px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" block disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
