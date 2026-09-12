import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import before from '../assets/beforeAfter/before.jpg';
import after from '../assets/beforeAfter/after.jpg';
import before1 from '../assets/beforeAfter/before1.jpg';
import after1 from '../assets/beforeAfter/after1.jpg';

// Before/After image pairs
// Use your own images from public/products folder, or fallback to Unsplash for demo
const IMAGE_PAIRS = [
    {
        id: 1,
        name: 'Minimalist Living Room',
        before: before, // Dull generic room
        after: after, // Your minimal styled room
    },
    {
        id: 2,
        name: 'Scandinavian Bedroom',

        before: before1, // Cluttered bedroom
        after: after1, // Your scandinavian styled bedroom
    },
]

export default function BeforeAfterSlider() {
    const [sliderPos, setSliderPos] = useState(50)
    const [currentPair, setCurrentPair] = useState(0)
    const containerRef = useRef(null)
    const isDragging = useRef(false)
    const [imageError, setImageError] = useState(false)

    const handleMouseDown = () => { isDragging.current = true }
    const handleMouseUp = () => { isDragging.current = false }

    const handleMouseMove = (e) => {
        if (!isDragging.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPos(percentage)
    }

    // Touch support
    const handleTouchMove = (e) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.touches[0].clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPos(percentage)
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const handlePrevPair = () => {
        setCurrentPair((prev) => (prev - 1 + IMAGE_PAIRS.length) % IMAGE_PAIRS.length)
        setSliderPos(50)
    }

    const handleNextPair = () => {
        setCurrentPair((prev) => (prev + 1) % IMAGE_PAIRS.length)
        setSliderPos(50)
    }

    const currentImages = IMAGE_PAIRS[currentPair]

    return (
        <div className="w-full">
            {/* Slider Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="relative w-full h-[calc(100vh-6rem)] rounded-2xl overflow-hidden cursor-col-resize shadow-medium bg-slate-200"
                style={{ userSelect: 'none' }}
            >
                {/* ── BEFORE (full width, underneath) ── */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("${currentImages.before}")`,
                        // `cover` fills the frame edge-to-edge regardless of the photo's
                        // aspect ratio — `contain` was leaving grey letterboxing on the sides.
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    {/* Subtle dark overlay for before state */}
                    <div className="absolute inset-0 bg-black bg-opacity-20" />

                    {/* Loading skeleton for before image */}
                    {imageError && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-600 font-semibold">Before Image</p>
                                <p className="text-sm text-gray-500">Uninspired, generic space</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── AFTER (clipped from the left by sliderPos) ── */}
                <div
                    className="absolute top-0 left-0 h-full overflow-hidden"
                    style={{
                        width: `${sliderPos}%`,
                        transition: isDragging.current ? 'none' : 'width 0.15s ease',
                    }}
                >
                    <div
                        className="absolute top-0 left-0 h-full"
                        style={{
                            width: `${100 / (sliderPos / 100)}%`,
                            backgroundImage: `url("${currentImages.after}")`,
                            // Same fix as the "before" layer — cover, not contain.
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />

                    {/* Warm pastel color wash on the "after" side */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pastel-peach to-transparent opacity-20 pointer-events-none" />
                </div>

                {/* ── Draggable Divider Line ── */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
                    style={{
                        left: `${sliderPos}%`,
                        transform: 'translateX(-50%)',
                        boxShadow: '0 0 15px rgba(0,0,0,0.3)',
                    }}
                />

                {/* ── Before Label ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-6 left-6 z-15"
                >
                    <div className="bg-slate-900 bg-opacity-60 backdrop-blur-md text-white text-xs font-bold tracking-widest px-4 py-2 rounded-full">
                        BEFORE
                    </div>
                </motion.div>

                {/* ── After Label (fades in when slider moves) ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: sliderPos > 20 ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-6 left-6 z-15"
                >
                    <div className="bg-pastel-mustard bg-opacity-75 backdrop-blur-md text-slate-900 text-xs font-bold tracking-widest px-4 py-2 rounded-full">
                        AFTER ✦
                    </div>
                </motion.div>

                {/* ── Transformation Title ── */}
                <motion.div
                    key={currentPair}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-6 left-6 z-15"
                >
                    <p className="text-white text-sm font-semibold drop-shadow-md">
                        {currentImages.name}
                    </p>
                </motion.div>

                {/* Drag hint (fades once moved) — this is now the only "how do I use this"
                    affordance since the circular handle icon was removed. */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: sliderPos !== 50 ? 0 : 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-15 pointer-events-none"
                >
                    <div className="bg-white bg-opacity-80 backdrop-blur-md text-slate-900 text-xs font-semibold px-5 py-2 rounded-full">
                        ← Drag to explore →
                    </div>
                </motion.div>
            </motion.div>

            {/* Navigation Buttons + Indicator */}
            <div className="flex items-center justify-between mt-8 px-4">
                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                    {IMAGE_PAIRS.map((pair, idx) => (
                        <motion.button
                            key={pair.id}
                            onClick={() => {
                                setCurrentPair(idx)
                                setSliderPos(50)
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentPair
                                ? 'bg-pastel-mustard w-8'
                                : 'bg-slate-300 hover:bg-slate-400'
                                }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        />
                    ))}
                </div>

                {/* Previous/Next Buttons */}
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={handlePrevPair}
                        whileHover={{ scale: 1.1, backgroundColor: '#E8DFF0' }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 hover:shadow-soft transition-all"
                        aria-label="Previous transformation"
                    >
                        <FiChevronLeft size={20} />
                    </motion.button>

                    <div className="text-sm font-semibold text-slate-600">
                        {currentPair + 1} / {IMAGE_PAIRS.length}
                    </div>

                    <motion.button
                        onClick={handleNextPair}
                        whileHover={{ scale: 1.1, backgroundColor: '#F1ECE3' }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-pastel-mustard bg-opacity-30 flex items-center justify-center text-slate-900 hover:shadow-soft transition-all"
                        aria-label="Next transformation"
                    >
                        <FiChevronRight size={20} />
                    </motion.button>
                </div>

                {/* Empty div for spacing */}
                <div className="w-8" />
            </div>
        </div>
    )
}