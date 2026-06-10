import { useState } from "react"
import { motion } from "framer-motion"
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi"

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", currencyPreference: "PKR" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")
      setMsg({ ok: true, text: `Account created! Welcome, ${data.fullName}.` })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: "Full name", name: "fullName", type: "text", placeholder: "Sara Khalid", icon: FiUser },
    { label: "Email address", name: "email", type: "email", placeholder: "you@studio.com", icon: FiMail },
    { label: "Password", name: "password", type: "password", placeholder: "Min. 6 characters", icon: FiLock },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill="#0F172A" />
            <rect x="16" y="1" width="11" height="11" rx="2" fill="#C2410C" opacity="0.85" />
            <rect x="1" y="16" width="11" height="11" rx="2" fill="#C2410C" opacity="0.35" />
            <rect x="16" y="16" width="11" height="11" rx="2" fill="#0F172A" opacity="0.18" />
          </svg>
          <span className="font-bold text-[#0F172A] text-lg tracking-tight">Palette</span>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          <p className="text-[#C2410C] text-xs font-semibold tracking-[0.14em] mb-2">GET STARTED</p>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1">Create an account</h1>
          <p className="text-slate-400 text-sm mb-7">Join Palette and start curating your design studio.</p>
        </motion.div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {fields.map(({ label, name, type, placeholder, icon: Icon }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
              className="flex flex-col gap-1.5"
            >
              <label className="text-[13px] font-semibold text-[#0F172A]">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type={name === "password" ? (showPass ? "text" : "password") : type}
                  name={name} value={form[name]} onChange={handle}
                  placeholder={placeholder} required
                  className="w-full pl-10 pr-4 py-2.5 text-[14px] text-[#0F172A] bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0F172A] transition-colors placeholder:text-slate-300"
                />
                {name === "password" && (
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Currency */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.4 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-[13px] font-semibold text-[#0F172A]">Currency</label>
            <select
              name="currencyPreference" value={form.currencyPreference} onChange={handle}
              className="w-full px-3.5 py-2.5 text-[14px] text-[#0F172A] bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0F172A] transition-colors cursor-pointer"
            >
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </motion.div>

          {/* Feedback */}
          {msg && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`text-[13px] px-3.5 py-2.5 rounded-lg border ${msg.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"}`}>
              {msg.text}
            </motion.p>
          )}

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.4 }}
          >
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: "0 16px 32px -8px rgba(15,23,42,0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#0F172A] text-white text-[14px] font-bold rounded-lg disabled:opacity-60 transition-opacity"
            >
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </motion.div>
        </form>

        {/* Footer */}
        <p className="text-center text-[13px] text-slate-400 mt-6">
          Already have an account?{" "}
          <button onClick={onSwitch} className="font-semibold text-[#C2410C] hover:underline">
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  )
}