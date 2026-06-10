import { useState, useEffect, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { FiArrowRight, FiArrowUpRight, FiMenu, FiX } from "react-icons/fi"

// ── Palette brand tokens ──────────────────────────────────────────────────────
const C = {
  ink:      "#0F172A",
  clay:     "#C2410C",
  clayMid:  "#EA580C",
  stone:    "#78716C",
  linen:    "#FAFAF9",
  linenMid: "#F5F0EB",
  warm:     "#E7DDD5",
}

const font = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

// ── Reusable fade-up wrapper ──────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(250,250,249,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.warm}` : "none",
        transition: "all 0.3s",
        fontFamily: font,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill={C.ink} />
            <rect x="16" y="1" width="11" height="11" rx="2" fill={C.clay} opacity="0.85" />
            <rect x="1" y="16" width="11" height="11" rx="2" fill={C.clay} opacity="0.35" />
            <rect x="16" y="16" width="11" height="11" rx="2" fill={C.ink} opacity="0.18" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 17, color: C.ink, letterSpacing: "-0.03em" }}>Palette</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
          {["Services", "Process", "Work", "Contact"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 500, color: C.stone, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.ink}
              onMouseLeave={e => e.target.style.color = C.stone}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="hidden-mobile">
          <button onClick={onLogin}
            style={{ fontSize: 13, fontWeight: 600, color: C.ink, background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}>
            Sign in
          </button>
          <motion.button onClick={onRegister} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: C.ink, border: "none", cursor: "pointer", padding: "9px 20px", borderRadius: 8 }}>
            Get started
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }} className="show-mobile">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: C.linen, borderTop: `1px solid ${C.warm}`, padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {["Services", "Process", "Work", "Contact"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                style={{ fontSize: 15, fontWeight: 600, color: C.ink, textDecoration: "none" }}>{l}</a>
            ))}
            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <button onClick={onLogin} style={{ flex: 1, padding: "10px", fontSize: 13, fontWeight: 600, background: "none", border: `1.5px solid ${C.warm}`, borderRadius: 8, cursor: "pointer", color: C.ink }}>Sign in</button>
              <button onClick={onRegister} style={{ flex: 1, padding: "10px", fontSize: 13, fontWeight: 700, background: C.ink, border: "none", borderRadius: 8, cursor: "pointer", color: "#fff" }}>Get started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onRegister }) {
  return (
    <section style={{ minHeight: "100vh", background: C.linen, display: "flex", alignItems: "center", paddingTop: 80, fontFamily: font, position: "relative", overflow: "hidden" }}>
      {/* Background geometric shapes */}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, rgba(194,65,12,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "3%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, rgba(15,23,42,0.05) 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(194,65,12,0.08)", border: "1px solid rgba(194,65,12,0.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.clay }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.clay, letterSpacing: "0.08em" }}>INTERIOR DESIGN STUDIO</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 800, color: C.ink, lineHeight: 1.12, letterSpacing: "-0.04em", margin: "0 0 24px" }}>
              Spaces that tell<br />
              <span style={{ color: C.clay, fontStyle: "italic" }}>your</span> story
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 17, color: C.stone, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 420 }}>
              We transform ordinary rooms into considered, liveable spaces. From mood boards to the final finish — your complete interior design studio.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <motion.button onClick={onRegister} whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -8px rgba(15,23,42,0.22)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", background: C.ink, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Start your project <FiArrowRight size={16} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: "14px 24px", background: "none", color: C.ink, border: `1.5px solid ${C.warm}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                View our work
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              style={{ display: "flex", gap: 40, marginTop: 52, paddingTop: 32, borderTop: `1px solid ${C.warm}` }}>
              {[["240+", "Projects"], ["8 yrs", "Experience"], ["98%", "Client satisfaction"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>{n}</div>
                  <div style={{ fontSize: 12, color: C.stone, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — abstract room grid */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, height: 480 }} className="hero-visual">
            {[
              { bg: C.ink, label: "Living Room", sub: "Modern minimal", flex: "2" },
              { bg: "#D4B8A8", label: "Bedroom", sub: "Soft textures", flex: "1" },
              { bg: "#E8DDD6", label: "Kitchen", sub: "Clean lines", flex: "1" },
              { bg: C.clay, label: "Studio", sub: "Work & create", flex: "2" },
            ].map(({ bg, label, sub }, i) => (
              <motion.div key={label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
                style={{ background: bg, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: bg === C.ink || bg === C.clay ? "#fff" : C.ink, letterSpacing: "-0.01em" }}>{label}</div>
                <div style={{ fontSize: 11, color: bg === C.ink || bg === C.clay ? "rgba(255,255,255,0.6)" : C.stone, marginTop: 2 }}>{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
const services = [
  { icon: "◈", title: "Space Planning", desc: "We analyse your space and lifestyle to create layouts that genuinely work — not just look good on paper." },
  { icon: "◉", title: "Mood Board Curation", desc: "Colour palettes, material samples, furniture selections — all pulled together into a cohesive visual direction." },
  { icon: "◫", title: "Furniture Sourcing", desc: "Access to our curated catalogue of local and international vendors. We find pieces that fit your brief and budget." },
  { icon: "◌", title: "Project Management", desc: "We coordinate contractors, deliveries and installations so your transformation runs on time and on budget." },
  { icon: "◍", title: "3D Visualisation", desc: "See your space before a single item is purchased. Photorealistic renders that let you make confident decisions." },
  { icon: "◎", title: "Styling & Finishing", desc: "The final layer — art, accessories, lighting — that turns a furnished room into a photographable home." },
]

function Services() {
  return (
    <section id="services" style={{ background: "#fff", padding: "100px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.clay, marginBottom: 12 }}>WHAT WE DO</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: C.ink, letterSpacing: "-0.035em", maxWidth: 480, margin: "0 0 60px", lineHeight: 1.2 }}>
            Every service you need, under one roof
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <motion.div whileHover={{ backgroundColor: C.linenMid }} transition={{ duration: 0.2 }}
                style={{ padding: "32px 28px", border: `1px solid ${C.warm}`, cursor: "default", background: "#fff" }}>
                <div style={{ fontSize: 24, marginBottom: 16, color: C.clay }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.stone, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Process ───────────────────────────────────────────────────────────────────
const steps = [
  { n: "01", title: "Discovery call", desc: "30 minutes to understand your space, vision, and budget. No commitment required." },
  { n: "02", title: "Concept proposal", desc: "We deliver a mood board, space plan, and material palette within 5 working days." },
  { n: "03", title: "Design development", desc: "Iterate on the concept until it's exactly right. Usually 2–3 rounds of revisions." },
  { n: "04", title: "Procurement & install", desc: "We handle ordering, delivery scheduling, and the final installation day." },
]

function Process() {
  return (
    <section id="process" style={{ background: C.ink, padding: "100px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.clay, marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.035em", margin: "0 0 60px", lineHeight: 1.2 }}>
            From first call to finished room
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div style={{ padding: "36px 28px", borderLeft: i === 0 ? "none" : `1px solid rgba(255,255,255,0.08)` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.clay, letterSpacing: "0.1em", marginBottom: 20 }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Work / Portfolio ──────────────────────────────────────────────────────────
const projects = [
  { title: "The Ismail Residence", tag: "Bedroom · Lahore", color: "#D4B8A8", accent: C.ink },
  { title: "Studio Meem", tag: "Office · Karachi", color: C.ink, accent: "#fff" },
  { title: "Café Verde", tag: "Commercial · Islamabad", color: "#8B7355", accent: "#fff" },
  { title: "The Sana Apartment", tag: "Living Room · Dubai", color: C.warm, accent: C.ink },
]

function Work() {
  return (
    <section id="work" style={{ background: C.linen, padding: "100px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.clay, marginBottom: 12 }}>SELECTED WORK</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: C.ink, letterSpacing: "-0.035em", margin: 0, lineHeight: 1.2 }}>
              Recent projects
            </h2>
          </div>
          <a href="#" style={{ fontSize: 14, fontWeight: 600, color: C.clay, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            View all <FiArrowUpRight size={15} />
          </a>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <motion.div whileHover={{ y: -4, boxShadow: "0 24px 48px -12px rgba(15,23,42,0.14)" }}
                style={{ background: p.color, borderRadius: 16, padding: "0 0 28px", overflow: "hidden", cursor: "pointer" }}>
                {/* Room visualisation */}
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect x="10" y="30" width="60" height="35" rx="3" fill={p.accent} />
                    <rect x="20" y="20" width="40" height="15" rx="2" fill={p.accent} />
                    <rect x="15" y="55" width="18" height="10" rx="1" fill={p.accent} />
                    <rect x="47" y="55" width="18" height="10" rx="1" fill={p.accent} />
                  </svg>
                </div>
                <div style={{ padding: "0 24px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: p.accent === "#fff" ? "rgba(255,255,255,0.5)" : C.stone, letterSpacing: "0.06em", marginBottom: 6 }}>{p.tag}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: p.accent === "#fff" ? "#fff" : C.ink, letterSpacing: "-0.02em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {p.title}
                    <FiArrowUpRight size={16} />
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonial ───────────────────────────────────────────────────────────────
function Testimonial() {
  return (
    <section style={{ background: C.linenMid, padding: "100px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <div style={{ fontSize: 48, color: C.clay, marginBottom: 24, lineHeight: 1 }}>"</div>
          <blockquote style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 600, color: C.ink, lineHeight: 1.45, letterSpacing: "-0.025em", margin: "0 0 36px", fontStyle: "italic" }}>
            Palette didn't just design our living room — they made us understand how we actually wanted to live in it. The process was thoughtful, the result is exact.
          </blockquote>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.stone }}>Sana Mirza — Karachi</div>
        </Reveal>
      </div>
    </section>
  )
}

// ── CTA (Incorporated requested CTA Split actions) ───────────────────────────
function CTA({ onLogin, onQuiz }) {
  return (
    <section id="contact" style={{ background: C.clay, padding: "100px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 20px", lineHeight: 1.15 }}>
            Ready to transform your space?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", margin: "0 0 40px", lineHeight: 1.65 }}>
            Book a free discovery call. No commitment, just a conversation about your space and what's possible.
          </p>
          
          {/* Integrated layout update container matching system styling parameters */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button 
              onClick={() => onQuiz?.()} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "15px 32px", background: "#fff", color: C.clay, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}
            >
              Discover Your Style <FiArrowRight size={16} />
            </motion.button>
            
            <motion.button 
              onClick={() => onLogin?.()} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.97 }}
              style={{ padding: "15px 32px", background: "none", color: "#fff", border: "2px solid #fff", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              Shop Now
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.ink, padding: "48px 24px", fontFamily: font }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" fill="#fff" />
            <rect x="16" y="1" width="11" height="11" rx="2" fill={C.clay} opacity="0.85" />
            <rect x="1" y="16" width="11" height="11" rx="2" fill={C.clay} opacity="0.35" />
            <rect x="16" y="16" width="11" height="11" rx="2" fill="#fff" opacity="0.18" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.03em" }}>Palette</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>© 2026 Palette Studio. All rights reserved.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function LandingPage({ onLogin, onRegister, onQuiz }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: ${font}; }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
      <Nav onLogin={onLogin} onRegister={onRegister} />
      <Hero onRegister={onRegister} />
      <Services />
      <Process />
      <Work />
      <Testimonial />
      <CTA onLogin={onLogin} onQuiz={onQuiz} />
      <Footer />
    </>
  )
}