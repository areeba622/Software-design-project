// src/components/RoomBuilder/RoomBuilderSuccess.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { FiShoppingCart } from 'react-icons/fi'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

export default function RoomBuilderSuccess({
  room,
  loading,
  onAddToCart,
  onContinueShopping,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      style={{
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        style={{
          fontSize: '80px',
          marginBottom: '20px',
        }}
      >
        ✨
      </motion.div>

      <h2 style={{
        fontFamily: FONT,
        fontSize: '32px',
        fontWeight: 800,
        color: T.ink,
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        Room Built Successfully!
      </h2>

      <p style={{
        fontFamily: FONT,
        fontSize: '16px',
        color: T.stone,
        marginBottom: '32px',
      }}>
        Your custom {room.roomType?.toLowerCase()} is ready
      </p>

      {/* Summary */}
      <div style={{
        padding: '20px',
        border: `1.5px solid ${T.warm}`,
        borderRadius: '10px',
        background: T.white,
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: FONT,
          fontSize: '12px',
          fontWeight: 700,
          color: T.clay,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          Total Price
        </p>
        <p style={{
          fontFamily: FONT,
          fontSize: '32px',
          fontWeight: 800,
          color: T.ink,
          margin: 0,
        }}>
          PKR {room.totalPrice?.toLocaleString()}
        </p>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column',
      }}>
        <motion.button
          onClick={onAddToCart}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '14px 28px',
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
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <FiShoppingCart size={16} />
          {loading ? 'Adding to cart...' : 'Add to Cart'}
        </motion.button>

        <motion.button
          onClick={onContinueShopping}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '14px 28px',
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
          Continue Shopping
        </motion.button>
      </div>
    </motion.div>
  )
}