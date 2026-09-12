import React, { useState, useRef } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { FiStar } from 'react-icons/fi'

// Soft pastel accent per review
const reviewsData = [
  {
    id: 1,
    author: 'Amina Al-Mansoor',
    location: 'Lahore',
    text: 'The architectural clarity Palette brought to our open-plan lounge layout was exceptional. Elegant pastel harmony achieved flawlessly.',
    rating: 5,
    accent: '#C8865A',  // soft terracotta
  },
  {
    id: 2,
    author: 'Zayn Malik',
    location: 'Karachi',
    text: 'Minimalism is tough to deliver cleanly, but their execution mirrored premium Scandinavian precision. Exceptional attention to material textures.',
    rating: 5,
    accent: '#A894CC',  // dusty lavender
  },
  {
    id: 3,
    author: 'Sara Lin',
    location: 'Islamabad',
    text: 'Flawless transitions and spatial geometry. The interactive catalog layout accurately matched the physical setup installed.',
    rating: 5,
    accent: '#7EA88A',  // muted sage
  },
  {
    id: 4,
    author: 'Hassan Khan',
    location: 'Multan',
    text: 'Absolutely transformed my living space. The colour palette suggestions were spot-on and everything arrived perfectly packaged.',
    rating: 5,
    accent: '#B8895A',  // hazel
  },
  {
    id: 5,
    author: 'Fatima Ahmed',
    location: 'Hyderabad',
    text: 'Best interior design experience ever. The team understood my vision completely and executed it beautifully within budget.',
    rating: 5,
    accent: '#D98878',  // pastel coral
  },
]

function ReviewCard({ review }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        flexShrink: 0,
        width: 340,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderRadius: 18,
        padding: '26px 26px 22px',
        border: `1px solid ${review.accent}30`,
        boxShadow: `0 6px 28px ${review.accent}14`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent top edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${review.accent}CC, transparent)`,
        borderRadius: '18px 18px 0 0',
      }} />

      {/* Stars */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
        {[...Array(review.rating)].map((_, i) => (
          <FiStar key={i} size={13} style={{ color: review.accent, fill: review.accent }} />
        ))}
      </div>

      {/* Review text */}
      <p style={{ color: '#5A3E28', fontSize: '0.875rem', lineHeight: 1.76, marginBottom: 18 }}>
        "{review.text}"
      </p>

      {/* Author */}
      <div style={{ borderTop: `1px solid ${review.accent}22`, paddingTop: 13, display: 'flex', alignItems: 'center', gap: 11 }}>
        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `linear-gradient(135deg, ${review.accent}BB, ${review.accent}55)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.82rem', fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {review.author.charAt(0)}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#3A2518', fontSize: '0.84rem' }}>{review.author}</p>
          <p style={{ fontSize: '0.73rem', color: '#9B7456' }}>{review.location}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewsCarousel() {
  const [isPaused, setIsPaused] = useState(false)
  const xRef           = useRef(0)
  const containerRef   = useRef(null)

  const CARD_W    = 340 + 18   // card width + gap
  const TOTAL_W   = reviewsData.length * CARD_W
  const tripled   = [...reviewsData, ...reviewsData, ...reviewsData]

  useAnimationFrame((_, delta) => {
    if (isPaused || !containerRef.current) return
    xRef.current -= delta * 0.038
    if (Math.abs(xRef.current) >= TOTAL_W) xRef.current = 0
    containerRef.current.style.transform = `translateX(${xRef.current}px)`
  })

  return (
    <div style={{ width: '100%', padding: '76px 0', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 44 }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ display: 'inline-block', width: 28, height: 2.5, borderRadius: 99, background: '#D4A96A' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4A96A' }}>
              Client Testimonials
            </span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 'clamp(1.75rem,3.4vw,2.65rem)', color: '#3A2518', marginBottom: 10 }}>
            Loved by Designers &amp;{' '}
            <span style={{ background: 'linear-gradient(135deg, #C8865A, #D4A96A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Homeowners
            </span>
          </h2>
          <p style={{ color: '#7A5540', maxWidth: 460, lineHeight: 1.72, fontSize: '0.97rem' }}>
            Real experiences from real people who transformed their spaces with Palette.
          </p>
        </motion.div>
      </div>

          {/* Marquee */}
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left fade */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 90,
            background: 'linear-gradient(to right, #FFF8F2, transparent)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />

        {/* Right fade */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 90,
            background: 'linear-gradient(to left, #FFF8F2, transparent)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />

        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: 18,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 10,
            paddingBottom: 18,
            willChange: 'transform',
          }}
        >
          {tripled.map((review, idx) => (
            <ReviewCard
              key={`${review.id}-${idx}`}
              review={review}
            />
          ))}
        </div>
      </div>

      {/*
        Hint
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <span style={{
            fontSize: '0.79rem',
            color: '#9B7456',
            background: 'rgba(212,169,106,0.12)',
            padding: '5px 15px',
            borderRadius: 50,
            display: 'inline-block'
          }}>
            Hover to pause · Scroll infinitely 🎨
          </span>
        </div>
      */}

    </div>
  )
}