// src/pages/RoomBuilder.jsx

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import RoomBuilderStep1 from '../components/RoomBuilder/Step1RoomType'
import RoomBuilderStep2 from '../components/RoomBuilder/Step2Dimensions'
import RoomBuilderStep3 from '../components/RoomBuilder/Step3Products'
import RoomBuilderReview from '../components/RoomBuilder/ReviewRoom'

const T = {
  ink: "#0F172A",
  clay: "#C2410C",
  stone: "#78716C",
  linen: "#FAFAF9",
  warm: "#E7DDD5",
  white: "#FFFFFF",
}

const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

export default function RoomBuilder({ user, onBack }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Room data
  const [roomType, setRoomType] = useState(null)
  const [width, setWidth] = useState(null)
  const [length, setLength] = useState(null)
  const [flooring, setFlooring] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [products, setProducts] = useState([])
  const [builtRoom, setBuiltRoom] = useState(null)

  // ─── STEP 1: Select Room Type ─────────────────────────────────────────────

  const handleRoomTypeSelect = (type) => {
    setRoomType(type)
    setStep(2)
  }

  // ─── STEP 2: Enter Dimensions ────────────────────────────────────────────

  const handleDimensionsSubmit = (w, l, f) => {
    setWidth(w)
    setLength(l)
    setFlooring(f)
    fetchProductsForRoom(roomType)
    setStep(3)
  }

  // ─── FETCH PRODUCTS FOR ROOM TYPE ────────────────────────────────────────

  const fetchProductsForRoom = async (type) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://localhost:8081/api/room-builder/products/${type}`,
        { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (e) {
      console.error('Fetch error:', e)
      setError(`Unable to load products. Make sure backend is running on port 8081. Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 3: Select Products ─────────────────────────────────────────────

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleProductsSubmit = () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product')
      return
    }
    setError(null)
    setStep(4)
  }

  // ─── STEP 4: Review & Build Room ────────────────────────────────────────

  const handleBuildRoom = async () => {
    if (!user) {
      setError('Please login to build a room')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get selected product names
      const furnitureNames = selectedProducts
        .map(id => products.find(p => p.id === id)?.name)
        .filter(Boolean)

      const requestBody = {
        roomType,
        width: parseInt(width),
        length: parseInt(length),
        flooring: flooring && flooring.length > 0 ? flooring : null,
        furnitureItems: furnitureNames
      }

      console.log('Building room with:', requestBody)

      const response = await fetch(
        `http://localhost:8081/api/room-builder/build?userId=${user.userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Build failed: ${response.status} - ${errText}`)
      }

      const room = await response.json()
      console.log('Room built successfully:', room)
      setBuiltRoom(room)
      setStep(5)
    } catch (e) {
      console.error('Build error:', e)
      setError(`Failed to build room: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ─── ADD ROOM TO CART ─────────────────────────────────────────────────────

  const handleAddToCart = async (roomId) => {
    if (!user) {
      setError('Please login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8081/api/room-builder/${roomId}/add-to-cart?userId=${user.userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: 1 })
        }
      )

      if (!response.ok) {
        throw new Error(`Add to cart failed: ${response.status}`)
      }

      alert('Room added to cart! 🎉')
      onBack()
    } catch (e) {
      console.error('Add to cart error:', e)
      setError(`Failed to add to cart: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ─── RENDER STEPS ────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: T.linen }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: T.white,
          borderBottom: `1px solid ${T.warm}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FiArrowLeft size={20} color={T.ink} />
        </button>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: '1.3rem', fontWeight: 800, color: T.ink, margin: 0 }}>
            Build Your Room
          </h1>
          <p style={{ fontFamily: FONT, fontSize: '12px', color: T.stone, margin: '4px 0 0' }}>
            Step {step} of {builtRoom ? 5 : 4}
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '3px',
        background: T.warm,
        display: 'flex',
      }}>
        <motion.div
          animate={{ width: `${(step / (builtRoom ? 5 : 4)) * 100}%` }}
          style={{ background: T.clay, transition: 'width 0.3s ease' }}
        />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#fef2f2',
                color: '#991b1b',
                border: `1.5px solid #fca5a5`,
                borderRadius: 8,
                fontFamily: FONT,
                fontSize: 13,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Step 1: Room Type */}
          {step === 1 && (
            <RoomBuilderStep1
              onSelect={handleRoomTypeSelect}
            />
          )}

          {/* Step 2: Dimensions */}
          {step === 2 && (
            <RoomBuilderStep2
              roomType={roomType}
              onSubmit={handleDimensionsSubmit}
              onBack={() => setStep(1)}
            />
          )}

          {/* Step 3: Products */}
          {step === 3 && (
            <RoomBuilderStep3
              roomType={roomType}
              products={products}
              selectedProducts={selectedProducts}
              loading={loading}
              error={error}
              onToggle={handleProductToggle}
              onSubmit={handleProductsSubmit}
              onBack={() => setStep(2)}
            />
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <RoomBuilderReview
              roomType={roomType}
              width={width}
              length={length}
              flooring={flooring}
              selectedProducts={selectedProducts.map(id => 
                products.find(p => p.id === id)
              )}
              products={products}
              loading={loading}
              error={error}
              onBuild={handleBuildRoom}
              onAddToCart={handleAddToCart}
              onBack={() => setStep(3)}
              user={user}
            />
          )}

          {/* Step 5: Success */}
          {step === 5 && builtRoom && (
            <RoomBuilderSuccess
              room={builtRoom}
              loading={loading}
              onAddToCart={() => handleAddToCart(builtRoom.roomId)}
              onContinueShopping={onBack}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}