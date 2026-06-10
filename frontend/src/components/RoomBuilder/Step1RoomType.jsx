// src/components/RoomBuilder/Step1RoomType.jsx

import React from 'react'
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

const ROOM_TYPES = [
  { id: 'BEDROOM', name: 'Bedroom', emoji: '🛏️', description: 'Master or guest bedroom' },
  { id: 'LIVING_ROOM', name: 'Living Room', emoji: '🛋️', description: 'Lounge and relaxation space' },
  { id: 'KITCHEN', name: 'Kitchen', emoji: '🍳', description: 'Cooking and dining hub' },
  { id: 'DINING_ROOM', name: 'Dining Room', emoji: '🍽️', description: 'Formal dining area' },
  { id: 'GAME_ROOM', name: 'Game Room', emoji: '🎮', description: 'Entertainment space' },
  { id: 'OFFICE', name: 'Office', emoji: '💼', description: 'Work and study area' },
]

export default function Step1RoomType({ onSelect }) {
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
        What room are we designing?
      </h2>
      <p style={{
        fontFamily: FONT,
        fontSize: '16px',
        color: T.stone,
        marginBottom: '32px',
      }}>
        Select the type of room you'd like to furnish
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {ROOM_TYPES.map((room) => (
          <motion.button
            key={room.id}
            onClick={() => onSelect(room.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '28px 20px',
              border: `2px solid ${T.warm}`,
              borderRadius: '14px',
              background: T.white,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = T.clay
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(194, 65, 12, 0.15)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.warm
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '40px' }}>{room.emoji}</div>
            <h3 style={{
              fontFamily: FONT,
              fontSize: '16px',
              fontWeight: 700,
              color: T.ink,
              margin: 0,
            }}>
              {room.name}
            </h3>
            <p style={{
              fontFamily: FONT,
              fontSize: '12px',
              color: T.stone,
              margin: 0,
            }}>
              {room.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}