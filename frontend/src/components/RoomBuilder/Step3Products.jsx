// src/components/RoomBuilder/Step3Products.jsx

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

export default function Step3Products({
  roomType,
  products,
  selectedProducts,
  loading,
  error,
  onToggle,
  onSubmit,
  onBack,
}) {
  const [filterStyle, setFilterStyle] = useState('ALL')

  const filtered = filterStyle === 'ALL'
    ? products
    : products.filter(p => p.aestheticStyle === filterStyle)

  const styles = ['ALL', 'BOHEMIAN', 'SCANDINAVIAN', 'MINIMALIST']

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
        Select your furniture
      </h2>
      <p style={{
        fontFamily: FONT,
        fontSize: '16px',
        color: T.stone,
        marginBottom: '24px',
      }}>
        Choose items to complete your {roomType ? roomType.toLowerCase().replace('_', ' ') : 'room'} (at least 1 required)
      </p>

      {/* Style Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {styles.map(style => (
          <motion.button
            key={style}
            onClick={() => setFilterStyle(style)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '6px 14px',
              border: `1.5px solid ${filterStyle === style ? T.ink : T.warm}`,
              borderRadius: 999,
              background: filterStyle === style ? T.ink : T.white,
              cursor: 'pointer',
              fontFamily: FONT,
              fontSize: '12px',
              fontWeight: 600,
              color: filterStyle === style ? T.white : T.stone,
              transition: 'all 0.2s',
            }}
          >
            {style === 'ALL' ? 'All Styles' : style.charAt(0) + style.slice(1).toLowerCase()}
          </motion.button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px',
          background: '#fef2f2',
          color: '#991b1b',
          border: `1px solid #fca5a5`,
          borderRadius: 6,
          fontFamily: FONT,
          fontSize: 13,
          marginBottom: '16px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          fontFamily: FONT,
          color: T.stone,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: `3px solid ${T.warm}`,
            borderTop: `3px solid ${T.clay}`,
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          fontFamily: FONT,
          color: T.stone,
        }}>
          No products found for this style
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {filtered.map(product => {
            const isSelected = selectedProducts.includes(product.id)
            return (
              <motion.button
                key={product.id}
                onClick={() => onToggle(product.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '16px',
                  border: `2px solid ${isSelected ? T.clay : T.warm}`,
                  borderRadius: '10px',
                  background: isSelected ? '#FEF2EC' : T.white,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: T.clay,
                      color: T.white,
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    <FiCheck size={14} />
                  </motion.div>
                )}

                <div style={{
                  width: '100%',
                  height: '120px',
                  background: `linear-gradient(135deg, #f5ede6, #ede8e3)`,
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}>
                  🪑
                </div>

                <h4 style={{
                  fontFamily: FONT,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: T.ink,
                  margin: '0 0 4px',
                  lineHeight: 1.3,
                }}>
                  {product.name}
                </h4>

                <p style={{
                  fontFamily: FONT,
                  fontSize: '11px',
                  color: T.stone,
                  margin: '0 0 8px',
                }}>
                  {product.aestheticStyle}
                </p>

                <p style={{
                  fontFamily: FONT,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: T.clay,
                  margin: 0,
                }}>
                  PKR {product.priceInPKR?.toLocaleString()}
                </p>
              </motion.button>
            )
          })}
        </div>
      )}

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
          onClick={onSubmit}
          disabled={selectedProducts.length === 0 || loading}
          whileHover={{ scale: selectedProducts.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 28px',
            border: 'none',
            borderRadius: '8px',
            background: selectedProducts.length > 0 && !loading ? T.clay : '#9ca3af',
            cursor: selectedProducts.length > 0 && !loading ? 'pointer' : 'not-allowed',
            fontFamily: FONT,
            fontSize: '14px',
            fontWeight: 700,
            color: T.white,
          }}
        >
          Review ({selectedProducts.length}) →
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