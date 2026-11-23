import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiDollarSign, FiAward, FiClock } from 'react-icons/fi'
import { designersApi } from '../api'
import { useCurrency } from '../lib/CurrencyContext'

// Premium Theme Constants matching Quiz exactly
const T = {
  ink:   "#0F172A",
  clay:  "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm:  "#E7DDD5",
  white: "#FFFFFF",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

export default function DesignersPage({ onBack }) {
  const { format } = useCurrency()
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [styleFilter, setStyleFilter] = useState('ALL')
  const [budgetFilter, setBudgetFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    designersApi.list({ signal: controller.signal })
      .then(data => { setDesigners(data); setLoading(false) })
      .catch(e => {
        if (e.name === 'AbortError') return
        setError(e.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const styleOptions = ['ALL', 'MINIMALIST', 'BOHEMIAN', 'SCANDINAVIAN']
  const budgetOptions = [
    { label: 'All Budgets', value: 'ALL' },
    { label: 'Under PKR 40k', value: 'LOW' },
    { label: 'PKR 40k – 70k', value: 'MID' },
    { label: 'Over PKR 70k', value: 'HIGH' },
  ]

  // ⚡ Super Flexible & Fixed Filter Logic
  const filtered = designers.filter(d => {
    const dbStyle = (d.preferredStyleName || '').trim().toUpperCase();
    const currentFilter = (styleFilter || 'ALL').trim().toUpperCase();
    
    // 1. Flexible Style Match
    let styleMatch = false;
    if (currentFilter === 'ALL') {
      styleMatch = true;
    } else if (currentFilter === 'MINIMALIST') {
      styleMatch = dbStyle.includes('MINI');
    } else if (currentFilter === 'BOHEMIAN') {
      styleMatch = dbStyle.includes('BOH') || dbStyle.includes('BOHEMIAN');
    } else if (currentFilter === 'SCANDINAVIAN') {
      styleMatch = dbStyle.includes('SCAN') || dbStyle.includes('SCANDINAVIAN');
    } else {
      styleMatch = dbStyle === currentFilter;
    }

    // 2. Budget Match
    const rate = d.hourlyRatePKR || 0;
    const budgetMatch =
      budgetFilter === 'ALL' ||
      (budgetFilter === 'LOW' && rate < 40000) ||
      (budgetFilter === 'MID' && rate >= 40000 && rate <= 70000) ||
      (budgetFilter === 'HIGH' && rate > 70000);

    // Dono conditions sach honi chahiye
    return styleMatch && budgetMatch;
  })

  return (
    <div style={{ minHeight: '100vh', background: T.linen, fontFamily: FONT }}>

      {/* Sticky Premium Mini-Header */}
      <div style={{
        background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.warm}`,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'none', border: `1.5px solid ${T.warm}`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', color: T.ink,
          }}>
            <FiChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.95rem', color: T.ink, margin: 0 }}>
              Hire a Designer
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 11, color: T.stone, margin: 0 }}>
              Expert curation
            </p>
          </div>
        </div>
      </div>

      {/* Main Beautiful Light Header */}
      <div style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: T.clay, margin: '0 0 10px' }}>
            AVAILABLE PROFESSIONALS
          </p>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '2.2rem', color: T.ink, margin: '0 0 12px', letterSpacing: '-0.035em' }}>
            Expert Designers
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: T.stone, margin: 0, lineHeight: 1.6 }}>
            Pakistan's finest interior design professionals — filtered perfectly by your personal budget and home aesthetic.
          </p>
        </motion.div>
      </div>

      {/* Filter Toolbar Area */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ 
          background: T.white, 
          border: `1.5px solid ${T.warm}`, 
          borderRadius: 16, 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
          boxShadow: '0 4px 12px rgba(15,23,42,0.02)',
          marginBottom: '2.5rem'
        }}>
          {/* Style Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: T.stone, minWidth: 70 }}>STYLE</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {styleOptions.map(st => (
                <button
                  key={st}
                  onClick={() => setStyleFilter(st)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT,
                    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: styleFilter === st ? T.clay : '#F1F5F9',
                    color: styleFilter === st ? T.white : T.ink,
                  }}
                >
                  {st === 'ALL' ? 'All Styles' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: T.stone, minWidth: 70 }}>BUDGET</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {budgetOptions.map(b => (
                <button
                  key={b.value}
                  onClick={() => setBudgetFilter(b.value)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT,
                    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: budgetFilter === b.value ? T.clay : '#F1F5F9',
                    color: budgetFilter === b.value ? T.white : T.ink,
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Designers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(194,65,12,0.1)', borderTopColor: T.clay, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: T.stone, fontSize: 14 }}>Loading expert designers...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '16px', borderRadius: 12, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', textAlign: 'center' }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: T.white, borderRadius: 16, border: `1.5px solid ${T.warm}` }}>
            <p style={{ color: T.stone, fontSize: 15 }}>No designers matched your exact filter combination.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(d => (
              <motion.div
                key={d.id}
                layoutId={`designer-${d.id}`}
                onClick={() => setSelected(d)}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(15,23,42,0.04)' }}
                style={{
                  background: T.white, border: `1.5px solid ${T.warm}`,
                  borderRadius: 16, padding: '1.5rem', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 16, transition: 'box-shadow 0.2s, y 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: T.stone }}>
                    {d.name ? d.name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: T.ink, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{d.name}</h4>
                    <span style={{ 
                      display: 'inline-block', marginTop: 4, background: '#F1F5F9', color: T.ink, 
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 
                    }}>
                      {d.preferredStyleName || 'Generalist'}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, color: T.stone, fontSize: 13, lineHeight: 1.5, flex: 1 }}>
                  {d.bio || 'Professional interior architect specializing in bespoke interior layout creations.'}
                </p>

                <div style={{ borderTop: `1px solid ${T.warm}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: T.stone, fontWeight: 600 }}>HOURLY RATE</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.ink }}>{format(d.hourlyRatePKR)}</p>
                  </div>
                  <button style={{ background: T.ink, color: T.white, border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Styled Modal for Detailed Profile View */}
      <AnimatePresence>
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{ background: T.white, border: `1.5px solid ${T.warm}`, borderRadius: 24, width: '100%', maxWidth: 540, padding: '2rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: T.stone }}>
                    {selected.name ? selected.name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: FONT, fontWeight: 800, fontSize: '1.4rem', color: T.ink }}>{selected.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: T.clay, fontWeight: 600 }}>{selected.preferredStyleName} Specialist</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: '#F1F5F9', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: T.ink }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <h5 style={{ margin: '0 0 6px', fontSize: 11, color: T.stone, letterSpacing: '0.05em' }}>ABOUT DESIGNER</h5>
                  <p style={{ margin: 0, fontSize: 14, color: T.ink, lineHeight: 1.6 }}>{selected.bio || 'Brings spaces to life through calculated aesthetics, intelligent lighting systems, and custom furniture curation.'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: T.linen, padding: 14, borderRadius: 12, border: `1px solid ${T.warm}` }}>
                  <div>
                    <span style={{ fontSize: 10, color: T.stone, display: 'block', fontWeight: 600 }}>CONSULTATION</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{format(selected.hourlyRatePKR)}/hr</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: T.stone, display: 'block', fontWeight: 600 }}>EXPERIENCE</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>5+ Years Pro</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, background: 'none', border: `1.5px solid ${T.warm}`, borderRadius: 10, padding: '12px 0', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: T.stone, cursor: 'pointer' }}>
                  Close
                </button>
                <a href={`mailto:designer@example.com?subject=Inquiry from Design Studio`} style={{ flex: 2, background: T.clay, color: T.white, textDecoration: 'none', textAlign: 'center', borderRadius: 10, padding: '12px 0', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Book Consultation
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}