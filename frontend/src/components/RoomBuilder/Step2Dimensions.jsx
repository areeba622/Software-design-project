// src/components/RoomBuilder/Step2Dimensions.jsx

import React, { useState } from 'react'
import { motion } from 'framer-motion'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

const FLOORING_OPTIONS = [
  { value: 'Hardwood', label: '🪵 Hardwood' },
  { value: 'Tile', label: '🔲 Tile' },
  { value: 'Carpet', label: '🧵 Carpet' },
  { value: 'Laminate', label: '⬜ Laminate' },
  { value: 'Stone', label: '🪨 Stone' },
]

export default function Step2Dimensions({ roomType, onSubmit, onBack }) {
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [flooring, setFlooring] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!width || !length) {
      setError('Please enter both width and length')
      return
    }
    if (parseInt(width) <= 0 || parseInt(length) <= 0) {
      setError('Width and length must be greater than 0')
      return
    }
    setError('')
    onSubmit(width, length, flooring)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{
        fontFamily: FONT,
        fontSize: '32px',
        fontWeight: 800,
        color: T.ink,
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        Enter your room dimensions
      </h2>
      <p style={{
        fontFamily: FONT,
        fontSize: '16px',
        color: T.stone,
        marginBottom: '32px',
      }}>
        Help us calculate the perfect layout and pricing
      </p>

      {error && (
        <div style={{
          padding: '12px',
          background: '#fef2f2',
          color: '#991b1b',
          border: `1px solid #fca5a5`,
          borderRadius: 6,
          fontFamily: FONT,
          fontSize: 13,
          marginBottom: '20px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Dimensions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div>
          <label style={{
            fontFamily: FONT,
            fontSize: '12px',
            fontWeight: 700,
            color: T.clay,
            letterSpacing: '0.08em',
            display: 'block',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Width (feet)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder="e.g., 12"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              border: `1.5px solid ${T.warm}`,
              borderRadius: '8px',
              fontFamily: FONT,
              fontSize: '14px',
              color: T.ink,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = T.ink}
            onBlur={e => e.target.style.borderColor = T.warm}
          />
        </div>

        <div>
          <label style={{
            fontFamily: FONT,
            fontSize: '12px',
            fontWeight: 700,
            color: T.clay,
            letterSpacing: '0.08em',
            display: 'block',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Length (feet)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder="e.g., 14"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              border: `1.5px solid ${T.warm}`,
              borderRadius: '8px',
              fontFamily: FONT,
              fontSize: '14px',
              color: T.ink,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = T.ink}
            onBlur={e => e.target.style.borderColor = T.warm}
          />
        </div>
      </div>

      {/* Flooring */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          fontFamily: FONT,
          fontSize: '12px',
          fontWeight: 700,
          color: T.clay,
          letterSpacing: '0.08em',
          display: 'block',
          marginBottom: '12px',
          textTransform: 'uppercase',
        }}>
          Flooring (optional - adds PKR 15,000)
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px',
        }}>
          {FLOORING_OPTIONS.map(opt => (
            <motion.button
              key={opt.value}
              onClick={() => setFlooring(flooring === opt.value ? '' : opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '10px 14px',
                border: `1.5px solid ${flooring === opt.value ? T.clay : T.warm}`,
                borderRadius: '8px',
                background: flooring === opt.value ? T.linen : T.white,
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: '13px',
                fontWeight: 600,
                color: flooring === opt.value ? T.clay : T.stone,
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between',
      }}>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 28px',
            border: `1.5px solid ${T.warm}`,
            borderRadius: '8px',
            background: T.white,
            cursor: 'pointer',
            fontFamily: FONT,
            fontSize: '14px',
            fontWeight: 700,
            color: T.ink,
          }}
        >
          ← Back
        </motion.button>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '12px 28px',
            border: 'none',
            borderRadius: '8px',
            background: T.clay,
            cursor: 'pointer',
            fontFamily: FONT,
            fontSize: '14px',
            fontWeight: 700,
            color: T.white,
          }}
        >
          Continue to Products →
        </motion.button>
      </div>
    </motion.div>
  )
}