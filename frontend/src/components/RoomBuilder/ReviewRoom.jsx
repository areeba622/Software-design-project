// src/components/RoomBuilder/ReviewRoom.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

export default function ReviewRoom({
  roomType,
  width,
  length,
  flooring,
  selectedProducts,
  products,
  loading,
  error,
  onBuild,
  onBack,
  user,
}) {
  const calculatePrice = () => {
    const w = parseInt(width) || 0
    const l = parseInt(length) || 0
    const baseCost = w * l * 500
    const floorCost = flooring ? 15000 : 0
    const furnCost = selectedProducts.filter(Boolean).length * 8000
    return baseCost + floorCost + furnCost
  }

  const estimatedPrice = calculatePrice()

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
        Review your room
      </h2>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* Dimensions */}
        <div style={{
          padding: '20px',
          border: `1.5px solid ${T.warm}`,
          borderRadius: '10px',
          background: T.white,
        }}>
          <p style={{
            fontFamily: FONT,
            fontSize: '11px',
            fontWeight: 700,
            color: T.clay,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            Room Dimensions
          </p>
          <p style={{
            fontFamily: FONT,
            fontSize: '20px',
            fontWeight: 800,
            color: T.ink,
            margin: 0,
          }}>
            {width}ft × {length}ft
          </p>
          <p style={{
            fontFamily: FONT,
            fontSize: '12px',
            color: T.stone,
            margin: '4px 0 0',
          }}>
            {(parseInt(width) * parseInt(length)).toLocaleString()} sq ft
          </p>
        </div>

        {/* Flooring */}
        <div style={{
          padding: '20px',
          border: `1.5px solid ${T.warm}`,
          borderRadius: '10px',
          background: T.white,
        }}>
          <p style={{
            fontFamily: FONT,
            fontSize: '11px',
            fontWeight: 700,
            color: T.clay,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            Flooring
          </p>
          <p style={{
            fontFamily: FONT,
            fontSize: '18px',
            fontWeight: 700,
            color: T.ink,
            margin: 0,
          }}>
            {flooring || 'Standard'}
          </p>
        </div>

        {/* Items */}
        <div style={{
          padding: '20px',
          border: `1.5px solid ${T.warm}`,
          borderRadius: '10px',
          background: T.white,
        }}>
          <p style={{
            fontFamily: FONT,
            fontSize: '11px',
            fontWeight: 700,
            color: T.clay,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            Items Selected
          </p>
          <p style={{
            fontFamily: FONT,
            fontSize: '20px',
            fontWeight: 800,
            color: T.ink,
            margin: 0,
          }}>
            {selectedProducts.filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div style={{
        padding: '20px',
        border: `1.5px solid ${T.warm}`,
        borderRadius: '10px',
        background: T.linen,
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontFamily: FONT,
          fontSize: '14px',
          fontWeight: 700,
          color: T.ink,
          margin: '0 0 16px',
        }}>
          Price Breakdown
        </h3>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontFamily: FONT,
          fontSize: '13px',
        }}>
          <span>Base cost ({width}×{length}×500 PKR/sqft)</span>
          <span>PKR {(parseInt(width) * parseInt(length) * 500).toLocaleString()}</span>
        </div>

        {flooring && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontFamily: FONT,
            fontSize: '13px',
          }}>
            <span>Flooring upgrade</span>
            <span>PKR 15,000</span>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontFamily: FONT,
          fontSize: '13px',
        }}>
          <span>Furniture ({selectedProducts.filter(Boolean).length} × 8,000)</span>
          <span>PKR {(selectedProducts.filter(Boolean).length * 8000).toLocaleString()}</span>
        </div>

        <div style={{
          borderTop: `1px solid ${T.warm}`,
          paddingTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT,
          fontSize: '16px',
          fontWeight: 700,
          color: T.clay,
        }}>
          <span>Estimated Total</span>
          <span>PKR {estimatedPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Selected Products */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: FONT,
          fontSize: '14px',
          fontWeight: 700,
          color: T.ink,
          margin: '0 0 12px',
        }}>
          Selected Items
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          {selectedProducts.filter(Boolean).map(id => {
            const p = products.find(prod => prod.id === id)
            return p ? (
              <div
                key={id}
                style={{
                  padding: '8px 12px',
                  background: T.white,
                  border: `1px solid ${T.warm}`,
                  borderRadius: '6px',
                  fontFamily: FONT,
                  fontSize: '12px',
                  color: T.ink,
                }}
              >
                ✓ {p.name}
              </div>
            ) : null
          })}
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
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 28px',
            border: `1.5px solid ${T.warm}`,
            borderRadius: '8px',
            background: T.white,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: FONT,
            fontSize: '14px',
            fontWeight: 700,
            color: T.ink,
            opacity: loading ? 0.5 : 1,
          }}
        >
          ← Back
        </motion.button>

        <motion.button
          onClick={onBuild}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 28px',
            border: 'none',
            borderRadius: '8px',
            background: T.clay,
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: FONT,
            fontSize: '14px',
            fontWeight: 700,
            color: T.white,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <>
              <FiLoader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Building...
            </>
          ) : (
            '✓ Build Room'
          )}
        </motion.button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}