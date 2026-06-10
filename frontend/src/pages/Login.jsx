import { useState } from "react"
import { motion } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi"

export default function Login({ onSwitch, onBack, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    if (e) e.preventDefault() // Safely intercept any default actions
    setLoading(true)
    setMsg(null)
    
    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || "Login failed")
      
      // Pass user payload directly to handleAuth inside App.jsx
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (err) { 
      setMsg({ ok: false, text: err.message }) 
    } finally { 
      setLoading(false) 
    }
  }

  const font = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: font }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, border: "1.5px solid #E7DDD5", boxShadow: "0 24px 60px -12px rgba(15,23,42,0.1)", padding: 36 }}
      >

        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#78716C", background: "none", border: "none", cursor: "pointer", marginBottom: 24, padding: 0 }}
          >
            <FiArrowLeft size={14} /> Back to home
          </button>
        )}

        {/* Minimal Architectural Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill="#0F172A" />
            <rect x="16" y="1" width="11" height="11" rx="2" fill="#C2410C" opacity="0.85" />
            <rect x="1" y="16" width="11" height="11" rx="2" fill="#C2410C" opacity="0.35" />
            <rect x="16" y="16" width="11" height="11" rx="2" fill="#0F172A" opacity="0.18" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", letterSpacing: "-0.03em" }}>Palette</span>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#C2410C", marginBottom: 8 }}>WELCOME BACK</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.035em", margin: "0 0 6px" }}>Sign in</h1>
        <p style={{ fontSize: 14, color: "#78716C", margin: "0 0 28px" }}>Enter your credentials to access your studio.</p>

        {/* Form Element Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Email address", name: "email", type: "email", placeholder: "you@studio.com", Icon: FiMail, auto: "username" },
            { label: "Password", name: "password", type: "password", placeholder: "Your password", Icon: FiLock, auto: "current-password" },
          ].map(({ label, name, type, placeholder, Icon, auto }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", cursor: "pointer" }}>{label}</label>
              <div style={{ position: "relative" }}>
                <Icon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#A8A29E", zIndex: 2 }} size={14} />
                <input 
                  id={name}
                  type={name === "password" ? (showPass ? "text" : "password") : type}
                  name={name} 
                  value={form[name]} 
                  onChange={handle} 
                  placeholder={placeholder} 
                  autoComplete={auto}
                  style={{ width: "100%", paddingLeft: 38, paddingRight: name === "password" ? 40 : 14, paddingTop: 11, paddingBottom: 11, fontSize: 14, color: "#0F172A", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none", fontFamily: font, boxSizing: "border-box", position: "relative", zIndex: 1 }}
                  onFocus={e => e.target.style.borderColor = "#0F172A"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
                {name === "password" && (
                  <button 
                    type="button" 
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#A8A29E", zIndex: 2 }}
                  >
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {msg && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ fontSize: 13, padding: "10px 14px", borderRadius: 8, background: msg.ok ? "#ecfdf5" : "#fef2f2", color: msg.ok ? "#065f46" : "#991b1b", border: `1px solid ${msg.ok ? "#a7f3d0" : "#fecaca"}` }}
            >
              {msg.text}
            </motion.p>
          )}

          <motion.button 
            type="button" 
            onClick={submit}
            disabled={loading} 
            whileHover={{ scale: 1.01, boxShadow: "0 16px 32px -8px rgba(15,23,42,0.2)" }} 
            whileTap={{ scale: 0.98 }}
            style={{ width: "100%", padding: "13px", background: "#0F172A", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: font, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Signing in…" : "Sign in to Palette"}
          </motion.button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#78716C", marginTop: 24 }}>
          Don't have an account?{" "}
          <button 
            type="button" 
            onClick={onSwitch} 
            style={{ fontWeight: 700, color: "#C2410C", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: font }}
          >
            Register
          </button>
        </p>
      </motion.div>
    </div>
  )
}