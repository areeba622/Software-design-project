import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'
import AuthLayout, { AuthField, authInputClass } from '../components/AuthLayout'
import Button from '../components/ui/Button'
import BedsideDetail from '../assets/BedsideDetail.jpg'
import FabricTextures from '../assets/FabricTextures.jpg'
import ChandelierAccent from '../assets/ChandelierAccent.jpg'

const SLIDES = [
  { img: BedsideDetail, tagline: 'Start with one room.', sub: 'Plan it, price it, and add it to your cart in one go.' },
  { img: FabricTextures, tagline: 'Texture, colour and character.', sub: 'Find out which of our three styles is yours.' },
  { img: ChandelierAccent, tagline: 'Bring in a designer when you want one.', sub: 'Booked by the hour, in the style you like.' },
]

export default function Register() {
  const { register } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', currencyPreference: 'PKR' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form) // GuestOnlyRoute then sends the user on
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      slides={SLIDES}
      title="Create your account"
      subtitle="Save your style, plan rooms and check out in a few steps."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        <AuthField id="fullName" label="Full name">
          <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={handle} placeholder="Sara Khalid" autoComplete="name" required className={authInputClass} />
        </AuthField>
        <AuthField id="email" label="Email">
          <input id="email" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" autoComplete="email" required className={authInputClass} />
        </AuthField>
        <AuthField id="password" label="Password">
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
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
        <div role="radiogroup" aria-labelledby="currency-label">
          <p id="currency-label" className="mb-2 text-sm font-medium text-ink">
            Show prices in
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['PKR', 'Pakistani rupees'],
              ['USD', 'US dollars'],
            ].map(([code, name]) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={form.currencyPreference === code}
                onClick={() => setForm((f) => ({ ...f, currencyPreference: code }))}
                className={`rounded-card border bg-white px-3.5 py-2.5 text-left transition-colors ${
                  form.currencyPreference === code ? 'border-accent bg-accent-soft/50 ring-1 ring-accent' : 'border-line hover:border-line-strong'
                }`}
              >
                <span className="block text-[15px] font-semibold text-ink">{code}</span>
                <span className="block text-[13px] text-ink-2">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-card bg-danger-soft px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" block disabled={loading}>
          {loading ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
