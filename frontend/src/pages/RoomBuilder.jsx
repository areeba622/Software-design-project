// src/pages/RoomBuilder.jsx
//
// Room Builder wizard: room type → size & flooring → wallpaper → furniture →
// review → done. The server builds and prices the room (Builder + Strategy
// patterns); the review step shows the same estimate using the same formulas.

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
    FiChevronLeft, FiChevronRight, FiCheck, FiShoppingCart,
    FiArrowRight, FiAlertCircle, FiHome,
} from 'react-icons/fi'
import {
    FaCouch, FaBed, FaUtensils, FaWineGlassAlt, FaGamepad, FaBriefcase,
    FaChair, FaLightbulb, FaLayerGroup, FaDoorClosed, FaImage, FaPalette,
} from 'react-icons/fa'
import { productsApi, roomsApi } from '../api'
import { floorArea, wallArea } from '../lib/room'

import WarmHardwood from '../assets/floors/WarmHardwood.jpg'
import MattePorcelainTile from '../assets/floors/MattePorcelainTile.jpg'
import SoftWoolCarpet from '../assets/floors/SoftWoolCarpet.jpg'
import MicroCement from '../assets/floors/MicroCement.jpg'
import NaturalStone from '../assets/floors/NaturalStone.jpg'
import livingroom from '../assets/rooms/livingroom.jpg'
import bedroom from '../assets/rooms/bedroom.jpg'
import kitchen from '../assets/rooms/kitchen.jpg'
import diningroom from '../assets/rooms/diningroom.jpg'


const T = {
    ink: "#0F172A",
    clay: "#C2410C",
    stone: "#78716C",
    linen: "#FAFAF9",
    warm: "#E7DDD5",
    white: "#FFFFFF",
    gold: "#B08D57",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
// Matches Product.java's RoomType enum exactly — the backend GET endpoint
// needs one of these strings, so this list can't diverge from that enum.
const ROOM_TYPES = [
    { id: 'LIVING_ROOM', label: 'Living Room', poetic: 'The heart of the home', icon: FaCouch, accent: '#C2410C', image: livingroom },
    { id: 'BEDROOM', label: 'Bedroom', poetic: 'Where the day lets go', icon: FaBed, accent: '#8B5CF6', image: bedroom },
    { id: 'KITCHEN', label: 'Kitchen', poetic: 'Where stories get cooked up', icon: FaUtensils, accent: '#D97706', image: kitchen },
    { id: 'DINING_ROOM', label: 'Dining Room', poetic: 'Gathered, unhurried', icon: FaWineGlassAlt, accent: '#B45309', image: diningroom },
    { id: 'GAME_ROOM', label: 'Game Room', poetic: 'Where the score keeps climbing', icon: FaGamepad, accent: '#7C3AED', image: '' },
    { id: 'OFFICE', label: 'Office', poetic: 'Quiet, focused, yours', icon: FaBriefcase, accent: '#0F766E', image: '' },
]


const STYLE_META = {
    ALL: { label: 'All Styles', accent: T.ink },
    BOHEMIAN: { label: 'Bohemian', accent: '#F59E0B' },
    SCANDINAVIAN: { label: 'Scandinavian', accent: '#38BDF8' },
    MINIMALIST: { label: 'Minimalist', accent: '#64748B' },
}

// Category icons replace the old emoji fallback — consistent with the rest
// of the app (same set used in DesignQuiz.jsx).
const CATEGORY_ICONS = {
    BED: FaBed, CHAIR: FaChair, TABLE: FaLayerGroup, LAMP: FaLightbulb,
    RUG: FaLayerGroup, WARDROBE: FaDoorClosed, SOFA: FaCouch,
    FLOORING: FaLayerGroup, WALLPAPER: FaImage, DECOR: FaPalette, OTHER: FaChair,
}

function formatPKR(n) {
    return `PKR ${Math.round(n || 0).toLocaleString('en-PK')}`
}

// ─── Image with graceful fallback ──────────────────────────────────────────
function SafeImg({ src, alt, className, style, fallbackIcon: FallbackIcon }) {
    const [errored, setErrored] = useState(false)
    if (!src || errored) {
        return (
            <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFE9E0' }}>
                {FallbackIcon
                    ? <FallbackIcon size={24} color={T.stone} />
                    : <span style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.stone, padding: '0 10px', textAlign: 'center' }}>{alt}</span>
                }
            </div>
        )
    }
    return <img src={src} alt={alt} className={className} style={style} onError={() => setErrored(true)} />
}

function StepRail({ step, total = 6 }) {
    const labels = ['Room', 'Dimensions', 'Wallpaper', 'Products', 'Review', 'Done']
    return (
        <div className="flex items-center gap-2">
            {labels.slice(0, total).map((l, i) => {
                const n = i + 1
                const active = n === step
                const done = n < step
                return (
                    <div key={l} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300"
                            style={{ background: done || active ? T.ink : 'rgba(15,23,42,0.1)', color: done || active ? '#fff' : T.stone }}>
                            {done ? <FiCheck size={12} strokeWidth={3} /> : n}
                        </div>
                        <span className="hidden sm:inline text-[11px] uppercase tracking-widest font-semibold" style={{ color: active ? T.ink : T.stone, fontFamily: FONT }}>{l}</span>
                        {n < total && <div className="w-6 h-px" style={{ background: T.warm }} />}
                    </div>
                )
            })}
        </div>
    )
}

function ErrorBanner({ error }) {
    if (!error) return null
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mb-5 px-4 py-3 rounded-lg"
            style={{ background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fca5a5', fontFamily: FONT, fontSize: 13 }}
        >
            <FiAlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
        </motion.div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — ROOM TYPE PORTAL
// ═══════════════════════════════════════════════════════════════════════════
function Step1RoomType({ onSelect }) {
    const [pending, setPending] = useState(null)

    const handleClick = (roomId) => {
        setPending(roomId)
        setTimeout(() => onSelect(roomId), 420) // let the expand animation play first
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[11px] uppercase tracking-widest font-bold mb-3">Step 1</p>
                <h2 style={{ fontFamily: FONT }} className="text-4xl font-extrabold text-slate-900 tracking-tight">What room are you designing?</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ROOM_TYPES.map((room, i) => {
                    const Icon = room.icon
                    const isSelected = pending === room.id
                    return (
                        <motion.button
                            key={room.id}
                            layout
                            onClick={() => handleClick(room.id)}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0, gridColumn: isSelected ? 'span 2' : 'span 1' }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                            className="group relative rounded-3xl overflow-hidden aspect-[16/10] text-left"
                            style={{ boxShadow: isSelected ? `0 20px 50px ${room.accent}44` : '0 8px 24px rgba(15,23,42,0.08)' }}
                        >
                            <div className="absolute inset-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110">
                                <SafeImg src={room.image} alt={room.label} className="w-full h-full object-cover" fallbackIcon={Icon}
                                    style={{ background: `linear-gradient(135deg, ${room.accent}33, ${room.accent}11)` }} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <div style={{ color: room.accent }} className="mb-2"><Icon size={20} /></div>
                                <motion.h3 whileHover={{ y: -4 }} style={{ fontFamily: FONT }} className="text-2xl font-bold text-white">{room.label}</motion.h3>
                                <motion.p initial={{ opacity: 0, y: 8 }} whileHover={{ opacity: 1, y: 0 }} style={{ fontFamily: FONT }} className="text-sm italic text-white/80 mt-1">{room.poetic}</motion.p>
                            </div>
                            {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                    <FiCheck size={16} color={room.accent} strokeWidth={3} />
                                </motion.div>
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — DIMENSIONS + FLOORING (split-screen live preview)
// ═══════════════════════════════════════════════════════════════════════════
function Step2Dimensions({ roomType, flooringProducts, onSubmit, onBack }) {
    const [width, setWidth] = useState('')
    const [length, setLength] = useState('')
    const [flooring, setFlooring] = useState('')

    const w = parseFloat(width) || 0
    const l = parseFloat(length) || 0
    const area = w > 0 && l > 0 ? w * l : 0
    const canContinue = w > 0 && l > 0

    const selectedFlooringOption = flooringProducts.find(f => f.name === flooring)

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] -mx-6 -mt-4">
            {/* LEFT 60% — live preview */}
            <div className="relative lg:w-[60%] h-[280px] lg:h-auto overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div key={flooring || 'empty'} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }} className="absolute inset-0">
                        <SafeImg src={selectedFlooringOption?.imageUrl} alt={flooring || `${roomType?.replace('_', ' ')} floor preview`} className="w-full h-full object-cover"
                            style={{ background: 'linear-gradient(160deg,#1e293b,#0f172a)' }} />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                <AnimatePresence>
                    {area > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-72 rounded-2xl p-5"
                            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
                        >
                            <p style={{ fontFamily: FONT }} className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Total Area</p>
                            <p style={{ fontFamily: FONT }} className="text-2xl font-extrabold text-white">{area.toLocaleString()} sq ft</p>
                            {/* Note: flooring has no independent price on the backend — the
                  build endpoint returns the authoritative total once you continue. */}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT 40% — inputs */}
            <div className="lg:w-[40%] bg-white px-6 py-10 lg:px-10">
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[10px] uppercase tracking-widest font-bold">Step 2</p>
                <h2 style={{ fontFamily: FONT }} className="text-3xl font-extrabold text-slate-900 mt-2 mb-6 tracking-tight">Set the space</h2>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div>
                        <label style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1 block">Width (ft)</label>
                        <input type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none px-4 py-2.5 text-slate-900 font-semibold transition-colors" placeholder="e.g. 10" />
                    </div>
                    <div>
                        <label style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1 block">Length (ft)</label>
                        <input type="number" min="0" value={length} onChange={(e) => setLength(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none px-4 py-2.5 text-slate-900 font-semibold transition-colors" placeholder="e.g. 12" />
                    </div>
                </div>

                <label style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-2 block">Flooring (optional)</label>
                <div className="space-y-2 mb-10">
                    {flooringProducts.length === 0 && (
                        <p style={{ fontFamily: FONT }} className="text-xs text-slate-400 italic">No flooring options loaded — check that /api/products/category/FLOORING is reachable.</p>
                    )}
                    {flooringProducts.map((f) => {
                        const isSelected = flooring === f.name
                        const flooringTotal = area * f.priceInPKR
                        return (
                            <motion.button key={f.id} onClick={() => setFlooring(isSelected ? '' : f.name)}
                                whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left"
                                style={{ border: `2px solid ${isSelected ? T.ink : '#EEE8DF'}`, background: isSelected ? '#FAF7F2' : '#fff' }}>
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    <SafeImg src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" fallbackIcon={FaLayerGroup} />
                                </div>
                                <span style={{ fontFamily: FONT }} className="text-sm font-semibold text-slate-800 flex-1">
                                    {f.name} <span className="text-stone-500 font-normal ml-1">(+ {formatPKR(flooringTotal)})</span>
                                </span>
                                {isSelected && <FiCheck size={16} color={T.ink} />}
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <button onClick={onBack} className="flex items-center gap-2 rounded-lg border-2 px-4 py-2.5" style={{ borderColor: T.warm, fontFamily: FONT }}>
                        <FiChevronLeft size={15} /><span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Back</span>
                    </button>
                    <motion.button
                        onClick={() => canContinue && onSubmit(w, l, flooring)}
                        disabled={!canContinue}
                        whileHover={{ scale: canContinue ? 1.03 : 1 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-full px-6 py-2.5 font-bold text-sm"
                        style={{ fontFamily: FONT, background: canContinue ? T.ink : '#CBD5E1', color: '#fff', cursor: canContinue ? 'pointer' : 'not-allowed' }}
                    >
                        Continue <FiChevronRight size={15} />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — WALLPAPER (optional, like flooring)
// ═══════════════════════════════════════════════════════════════════════════
function Step3Wallpaper({ roomType, wallpaperProducts, area, onSubmit, onBack }) {
    const [wallpaper, setWallpaper] = useState('')
    const selectedWallpaperOption = wallpaperProducts.find(w => w.name === wallpaper)

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] -mx-6 -mt-4">
            {/* LEFT 60% — live preview */}
            <div className="relative lg:w-[60%] h-[280px] lg:h-auto overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div key={wallpaper || 'empty'} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }} className="absolute inset-0">
                        <SafeImg src={selectedWallpaperOption?.imageUrl} alt={wallpaper || `${roomType?.replace('_', ' ')} wall preview`} className="w-full h-full object-cover"
                            style={{ background: 'linear-gradient(160deg,#1e293b,#0f172a)' }} />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <AnimatePresence>
                    {area > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-72 rounded-2xl p-5"
                            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
                        >
                            <p style={{ fontFamily: FONT }} className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Wall Area</p>
                            <p style={{ fontFamily: FONT }} className="text-2xl font-extrabold text-white">{area.toLocaleString()} sq ft</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT 40% — inputs */}
            <div className="lg:w-[40%] bg-white px-6 py-10 lg:px-10">
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[10px] uppercase tracking-widest font-bold">Step 3</p>
                <h2 style={{ fontFamily: FONT }} className="text-3xl font-extrabold text-slate-900 mt-2 mb-6 tracking-tight">Set the walls</h2>

                <label style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-2 block">Wallpaper (optional)</label>
                <div className="space-y-2 mb-10">
                    {wallpaperProducts.length === 0 && (
                        <p style={{ fontFamily: FONT }} className="text-xs text-slate-400 italic">No wallpaper options loaded — check that /api/products/category/WALLPAPER is reachable.</p>
                    )}
                    {wallpaperProducts.map((w) => {
                        const isSelected = wallpaper === w.name
                        const wallpaperTotal = area * w.priceInPKR
                        return (
                            <motion.button key={w.id} onClick={() => setWallpaper(isSelected ? '' : w.name)}
                                whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left"
                                style={{ border: `2px solid ${isSelected ? T.ink : '#EEE8DF'}`, background: isSelected ? '#FAF7F2' : '#fff' }}>
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    {/* Wallpaper image will be attached here later */}
                                    <SafeImg src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" fallbackIcon={FaImage} />
                                </div>
                                <span style={{ fontFamily: FONT }} className="text-sm font-semibold text-slate-800 flex-1">
                                    {w.name} <span className="text-stone-500 font-normal ml-1">(+ {formatPKR(wallpaperTotal)})</span>
                                </span>
                                {isSelected && <FiCheck size={16} color={T.ink} />}
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <button onClick={onBack} className="flex items-center gap-2 rounded-lg border-2 px-4 py-2.5" style={{ borderColor: T.warm, fontFamily: FONT }}>
                        <FiChevronLeft size={15} /><span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Back</span>
                    </button>
                    <motion.button
                        onClick={() => onSubmit(wallpaper)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-full px-6 py-2.5 font-bold text-sm"
                        style={{ fontFamily: FONT, background: T.ink, color: '#fff' }}
                    >
                        Continue <FiChevronRight size={15} />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — PRODUCTS (real backend data — id-based selection, unchanged contract)
// ═══════════════════════════════════════════════════════════════════════════
function Step4Products({ roomType, products, selectedProducts, loading, error, onToggle, onSubmit, onBack }) {
    const [filterStyle, setFilterStyle] = useState('ALL')
    const [splash, setSplash] = useState(null)
    const dockRef = useRef(null)
    const cardRefs = useRef({})
    const [flying, setFlying] = useState([])
    const [showWarning, setShowWarning] = useState(false)

    const filtered = filterStyle === 'ALL' ? products : products.filter(p => p.aestheticStyle === filterStyle)
    const total = products
        .filter(p => selectedProducts.includes(p.id))
        .reduce((sum, p) => sum + (p.priceInPKR || 0), 0)

    const handleFilterClick = (style) => {
        setFilterStyle(style)
        if (style !== 'ALL') {
            setSplash(STYLE_META[style].accent)
            setTimeout(() => setSplash(null), 500)
        }
    }

    const handleToggle = (product) => {
        const alreadySelected = selectedProducts.includes(product.id)
        if (!alreadySelected) {
            const cardEl = cardRefs.current[product.id]
            const dockEl = dockRef.current
            if (cardEl && dockEl) {
                const from = cardEl.getBoundingClientRect()
                const to = dockEl.getBoundingClientRect()
                const key = `${product.id}-${Date.now()}`
                setFlying(items => [...items, {
                    key, src: product.imageUrl,
                    from: { x: from.left, y: from.top, w: from.width },
                    to: { x: to.left + 8, y: to.top + 8 },
                }])
                setTimeout(() => setFlying(items => items.filter(i => i.key !== key)), 600)
            }
            setShowWarning(false)
        }
        onToggle(product.id)
    }

    const handleSubmit = () => {
        if (selectedProducts.length === 0) {
            setShowWarning(true)
            setTimeout(() => setShowWarning(false), 3000)
            return
        }
        onSubmit()
    }

    return (
        <div className="pb-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[11px] uppercase tracking-widest font-bold mb-2">Step 4</p>
                <h2 style={{ fontFamily: FONT }} className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Select your furniture</h2>
                <p style={{ fontFamily: FONT }} className="text-slate-500">
                    Choose items to complete your {roomType ? roomType.toLowerCase().replace('_', ' ') : 'room'} (at least 1 required)
                </p>
            </motion.div>

            {/* Style filter pills */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {Object.entries(STYLE_META).map(([key, meta]) => (
                    <motion.button key={key} onClick={() => handleFilterClick(key)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold"
                        style={{
                            fontFamily: FONT,
                            border: `1.5px solid ${filterStyle === key ? meta.accent : T.warm}`,
                            background: filterStyle === key ? meta.accent : '#fff',
                            color: filterStyle === key ? '#fff' : T.stone,
                        }}>
                        {meta.label}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>{error && <ErrorBanner error={error} />}</AnimatePresence>

            {loading ? (
                <div className="text-center py-16" style={{ fontFamily: FONT, color: T.stone }}>
                    <div className="w-9 h-9 mx-auto mb-4 rounded-full animate-spin" style={{ border: `3px solid ${T.warm}`, borderTopColor: T.clay }} />
                    Loading products…
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16" style={{ fontFamily: FONT, color: T.stone }}>No products found for this style.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((product, i) => {
                        const isSelected = selectedProducts.includes(product.id)
                        const CategoryIcon = CATEGORY_ICONS[product.category] || FaChair
                        return (
                            <motion.button
                                key={product.id}
                                ref={(el) => { cardRefs.current[product.id] = el }}
                                onClick={() => handleToggle(product)}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                                className="text-left rounded-2xl overflow-hidden relative"
                                style={{ border: `2px solid ${isSelected ? T.clay : T.warm}`, background: isSelected ? '#FEF2EC' : '#fff' }}
                            >
                                {isSelected && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: T.clay }}>
                                        <FiCheck size={13} color="#fff" strokeWidth={3} />
                                    </motion.div>
                                )}
                                <div className="h-28 relative">
                                    <SafeImg src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" fallbackIcon={CategoryIcon}
                                        style={{ background: 'linear-gradient(135deg,#f5ede6,#ede8e3)' }} />
                                </div>
                                <div className="p-3">
                                    <h4 style={{ fontFamily: FONT }} className="text-xs font-bold text-slate-900 leading-tight mb-1">{product.name}</h4>
                                    <p style={{ fontFamily: FONT }} className="text-[11px] text-slate-500 mb-1">{product.aestheticStyle}</p>
                                    <p style={{ fontFamily: FONT, color: T.clay }} className="text-xs font-bold">{formatPKR(product.priceInPKR)}</p>
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            )}

            {/* Empty-selection warning bubble */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 rounded-full px-5 py-3 shadow-xl" style={{ background: T.ink, fontFamily: FONT }}>
                        <p className="text-white text-sm font-semibold whitespace-nowrap">Your room is looking a little empty! Pick at least 1 item to bring it to life.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flying thumbnails */}
            {flying.map(item => (
                <motion.img key={item.key} src={item.src}
                    initial={{ position: 'fixed', top: item.from.y, left: item.from.x, width: item.from.w, height: item.from.w, opacity: 1, zIndex: 60, borderRadius: 10 }}
                    animate={{ top: item.to.y, left: item.to.x, width: 32, height: 32, opacity: 0.3 }}
                    transition={{ duration: 0.5, ease: 'easeIn' }}
                    style={{ position: 'fixed', objectFit: 'cover', pointerEvents: 'none' }} />
            ))}

            {/* Floating selection dock */}
            <div ref={dockRef} className="fixed bottom-24 right-6 z-30 rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(10px)' }}>
                <FiShoppingCart size={16} color="#fff" />
                <div>
                    <p style={{ fontFamily: FONT }} className="text-white text-xs font-bold">{selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}</p>
                    <p style={{ fontFamily: FONT }} className="text-white/70 text-[11px]">{formatPKR(total)}</p>
                </div>
            </div>

            {/* Aesthetic filter splash */}
            <AnimatePresence>
                {splash && (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: [0, 1] }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="fixed inset-0 z-[90] pointer-events-none origin-left"
                        style={{ background: splash, opacity: 0.35 }} />
                )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-10">
                <motion.button onClick={onBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="rounded-lg border-2 px-6 py-3 font-bold text-sm" style={{ borderColor: T.warm, fontFamily: FONT, color: T.ink }}>
                    ← Back
                </motion.button>
                <motion.button onClick={handleSubmit} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="rounded-lg px-6 py-3 font-bold text-sm text-white"
                    style={{ fontFamily: FONT, background: selectedProducts.length > 0 ? T.clay : '#9ca3af', cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed' }}>
                    Review ({selectedProducts.length}) →
                </motion.button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5 — REVIEW
// ═══════════════════════════════════════════════════════════════════════════
function ReviewRoom({ roomType, width, length, flooring, wallpaper, flooringProducts, wallpaperProducts, selectedProducts, loading, error, onBuild, onBack }) {
    const area = floorArea(width, length)

    // Flooring is priced per sq ft of floor, wallpaper per sq ft of wall
    const floorPrice = flooring ? (flooringProducts.find(f => f.name === flooring)?.priceInPKR || 0) * area : 0
    const wallPrice = wallpaper ? (wallpaperProducts.find(w => w.name === wallpaper)?.priceInPKR || 0) * wallArea(width, length) : 0
    const furnPrice = selectedProducts.reduce((sum, p) => sum + (p?.priceInPKR || 0), 0)

    const estimatedTotal = floorPrice + wallPrice + furnPrice

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[11px] uppercase tracking-widest font-bold mb-2">Step 5</p>
                <h2 style={{ fontFamily: FONT }} className="text-3xl font-extrabold text-slate-900 tracking-tight">Review your room</h2>
            </motion.div>

            <AnimatePresence>{error && <ErrorBanner error={error} />}</AnimatePresence>

            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: `1.5px solid ${T.warm}` }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div>
                        <p style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Room</p>
                        <p style={{ fontFamily: FONT }} className="text-sm font-bold text-slate-900">{roomType?.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <p style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Dimensions</p>
                        <p style={{ fontFamily: FONT }} className="text-sm font-bold text-slate-900">{width} × {length} ft ({area.toLocaleString()} sq ft)</p>
                    </div>
                    <div>
                        <p style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Flooring</p>
                        <p style={{ fontFamily: FONT }} className="text-sm font-bold text-slate-900">
                            {flooring || '—'} {flooring ? <span className="text-stone-500 font-normal ml-1">({formatPKR(floorPrice)})</span> : ''}
                        </p>
                    </div>
                    <div>
                        <p style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Wallpaper</p>
                        <p style={{ fontFamily: FONT }} className="text-sm font-bold text-slate-900">
                            {wallpaper || '—'} {wallpaper ? <span className="text-stone-500 font-normal ml-1">({formatPKR(wallPrice)})</span> : ''}
                        </p>
                    </div>
                </div>

                <div className="h-px mb-6" style={{ background: T.warm }} />

                <p style={{ fontFamily: FONT }} className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Selected furniture ({selectedProducts.length})</p>
                <div className="space-y-2 mb-4">
                    {selectedProducts.filter(Boolean).map(p => {
                        const CategoryIcon = CATEGORY_ICONS[p.category] || FaChair
                        return (
                            <div key={p.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    <SafeImg src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" fallbackIcon={CategoryIcon} />
                                </div>
                                <p style={{ fontFamily: FONT }} className="text-sm font-semibold text-slate-800 flex-1">{p.name}</p>
                                <p style={{ fontFamily: FONT, color: T.clay }} className="text-sm font-bold">{formatPKR(p.priceInPKR)}</p>
                            </div>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1.5px solid ${T.warm}` }}>
                    <p style={{ fontFamily: FONT }} className="text-xs text-slate-500">Estimated Total (final price confirmed on build)</p>
                    <p style={{ fontFamily: FONT }} className="text-lg font-extrabold text-slate-900">{formatPKR(estimatedTotal)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <button onClick={onBack} className="rounded-lg border-2 px-6 py-3 font-bold text-sm" style={{ borderColor: T.warm, fontFamily: FONT, color: T.ink }}>← Back</button>
                <motion.button onClick={onBuild} disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
                    className="rounded-full px-8 py-3 font-bold text-sm text-white flex items-center gap-2"
                    style={{ fontFamily: FONT, background: T.ink, cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? 'Building…' : 'Build My Room'} {!loading && <FiArrowRight size={15} />}
                </motion.button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6 — SUCCESS
// ═══════════════════════════════════════════════════════════════════════════
function RoomBuilderSuccess({ room, loading, addedToCart, onAddToCart, onProceedToPayment, onContinueShopping }) {
    React.useEffect(() => {
        confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.35 }, colors: [T.clay, '#fff', T.ink] })
    }, [])

    return (
        <div className="max-w-lg mx-auto text-center py-10">
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className="bg-white rounded-3xl p-10" style={{ boxShadow: '0 20px 50px rgba(15,23,42,0.15)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: `${T.clay}22`, color: T.clay }}>
                    <FiCheck size={28} strokeWidth={3} />
                </motion.div>
                <p style={{ fontFamily: FONT, color: T.clay }} className="text-[11px] uppercase tracking-widest font-bold mb-2">Room Built</p>
                <h2 style={{ fontFamily: FONT }} className="text-2xl font-extrabold text-slate-900 mb-2">{room?.roomType?.replace('_', ' ') || 'Your Room'}</h2>
                <p style={{ fontFamily: FONT }} className="text-3xl font-extrabold mb-8" style={{ color: T.ink }}>{formatPKR(room?.totalPrice)}</p>

                <div className="flex flex-col gap-3">
                    <motion.button
                        onClick={onAddToCart} disabled={loading}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                        className="relative overflow-hidden rounded-full px-6 py-3 font-bold text-sm"
                        style={{ background: T.gold, color: '#fff', fontFamily: FONT }}
                    >
                        <motion.span initial={{ scaleY: 0 }} animate={{ scaleY: addedToCart ? 1 : 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ transformOrigin: 'bottom', background: '#059669', position: 'absolute', inset: 0 }} />
                        <span className="relative z-10">{addedToCart ? 'Added!' : loading ? 'Adding…' : 'Add to Cart'}</span>
                    </motion.button>

                    <motion.button
                        onClick={onProceedToPayment}
                        disabled={loading}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                        className="animate-pulse rounded-full px-6 py-3 font-bold text-sm text-white flex items-center justify-center gap-2"
                        style={{ background: T.ink, fontFamily: FONT, boxShadow: `0 0 0 4px ${T.ink}22, 0 10px 30px rgba(15,23,42,0.3)` }}
                    >
                        {loading ? 'Preparing…' : 'Proceed to Payment'} {!loading && <FiArrowRight size={15} />}
                    </motion.button>

                    <button onClick={onContinueShopping} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 mt-1" style={{ fontFamily: FONT }}>
                        <FiHome size={14} /> Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR — same default export name/props as before
// ═══════════════════════════════════════════════════════════════════════════
export default function RoomBuilder({ onBack, onProceedToPayment }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [roomType, setRoomType] = useState(null)
    const [width, setWidth] = useState(null)
    const [length, setLength] = useState(null)
    const [flooring, setFlooring] = useState('')
    const [wallpaper, setWallpaper] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([])
    const [products, setProducts] = useState([])
    const [flooringProducts, setFlooringProducts] = useState([])
    const [wallpaperProducts, setWallpaperProducts] = useState([])
    const [builtRoom, setBuiltRoom] = useState(null)
    const [addedToCart, setAddedToCart] = useState(false) // drives the short 'added' message
    const [roomInCart, setRoomInCart] = useState(false)   // the built room is already in the cart

    // ─── FETCH CATEGORIES ─────────────────────────────────────────────────────
    React.useEffect(() => {
        const controller = new AbortController()
        const opts = { signal: controller.signal }
        Promise.all([productsApi.byCategory('FLOORING', opts), productsApi.byCategory('WALLPAPER', opts)])
            .then(([floors, walls]) => {
                setFlooringProducts(floors)
                setWallpaperProducts(walls)
            })
            .catch(e => { if (e.name !== 'AbortError') setError(`Couldn't load flooring and wallpaper: ${e.message}`) })
        return () => controller.abort()
    }, [])

    // ─── STEP 1 ───────────────────────────────────────────────────────────────
    const handleRoomTypeSelect = (type) => {
        setRoomType(type)
        setStep(2)
    }

    // ─── STEP 2 ───────────────────────────────────────────────────────────────
    const handleDimensionsSubmit = (w, l, f) => {
        setWidth(w)
        setLength(l)
        setFlooring(f)
        fetchProductsForRoom(roomType)
        setStep(3)
    }

    const fetchProductsForRoom = async (type) => {
        setLoading(true)
        setError(null)
        try {
            setProducts(await productsApi.forRoom(type))
        } catch (e) {
            setError(`Unable to load products: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    // ─── STEP 3 ───────────────────────────────────────────────────────────────
    const handleWallpaperSubmit = (w) => {
        setWallpaper(w)
        setStep(4)
    }

    // ─── STEP 4 ───────────────────────────────────────────────────────────────
    const handleProductToggle = (productId) => {
        setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
    }

    const handleProductsSubmit = () => {
        if (selectedProducts.length === 0) {
            setError('Please select at least one product')
            return
        }
        setError(null)
        setStep(5)
    }

    // ─── STEP 5 ───────────────────────────────────────────────────────────────
    const handleBuildRoom = async () => {

        const validWidth = parseInt(width)
        const validLength = parseInt(length)
        if (!width || !length || isNaN(validWidth) || isNaN(validLength) || validWidth <= 0 || validLength <= 0) {
            setError('Please enter valid room dimensions (width and length must be greater than 0)')
            return
        }
        if (selectedProducts.length === 0) { setError('Please select at least one product'); return }

        setLoading(true)
        setError(null)
        try {
            // Send product ids so the server prices everything from the catalogue.
            const requestBody = {
                roomType,
                width: validWidth,
                length: validLength,
                flooringProductId: flooringProducts.find(f => f.name === flooring)?.id ?? null,
                wallpaperProductId: wallpaperProducts.find(w => w.name === wallpaper)?.id ?? null,
                furnitureProductIds: selectedProducts,
            }

            const room = await roomsApi.build(requestBody)
            setBuiltRoom(room)
            setRoomInCart(false)
            setStep(6)
        } catch (e) {
            setError(`Failed to build room: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    // ─── ADD BUILT ROOM TO CART ───────────────────────────────────────────────
    const handleAddToCart = async (roomId) => {
        if (roomInCart) { setAddedToCart(true); return } // already there: don't add a second one
        setLoading(true)
        setError(null)
        try {
            await roomsApi.addToCart(roomId)
            setRoomInCart(true)
            setAddedToCart(true)
            setTimeout(() => setAddedToCart(false), 2200)
        } catch (e) {
            setError(`Failed to add to cart: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    // ─── PROCEED TO PAYMENT (adds room to cart, fetches cartId) ────────────
    const handleProceedToPayment = async () => {
        if (!builtRoom) return
        setLoading(true)
        setError(null)
        try {
            // Put the room in the cart (once), then PaymentPage turns the cart into an order.
            if (!roomInCart) {
                await roomsApi.addToCart(builtRoom.roomId)
                setRoomInCart(true)
            }
            onProceedToPayment?.()
        } catch (e) {
            setError(`Payment setup failed: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const totalSteps = builtRoom ? 6 : 5

    return (
        <div style={{ minHeight: '100vh', background: T.linen }}>
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b" style={{ background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)', borderColor: T.warm }}>
                <button
                    onClick={() => (step === 1 ? onBack?.() : setStep(s => Math.max(1, s - 1)))}
                    className="flex items-center gap-2 rounded-lg border-2 px-3 py-1.5" style={{ borderColor: T.warm }}
                >
                    <FiChevronLeft size={16} />
                    <span style={{ fontFamily: FONT }} className="text-xs font-semibold uppercase tracking-widest text-slate-600">Back</span>
                </button>
                <StepRail step={step} total={totalSteps} />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32 }}>
                            <Step1RoomType onSelect={handleRoomTypeSelect} />
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32 }}>
                            <Step2Dimensions roomType={roomType} flooringProducts={flooringProducts} onSubmit={handleDimensionsSubmit} onBack={() => setStep(1)} />
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32 }}>
                            <Step3Wallpaper roomType={roomType} wallpaperProducts={wallpaperProducts} area={wallArea(width, length)} onSubmit={handleWallpaperSubmit} onBack={() => setStep(2)} />
                        </motion.div>
                    )}
                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32 }}>
                            <Step4Products
                                roomType={roomType}
                                products={products}
                                selectedProducts={selectedProducts}
                                loading={loading}
                                error={error}
                                onToggle={handleProductToggle}
                                onSubmit={handleProductsSubmit}
                                onBack={() => setStep(3)}
                            />
                        </motion.div>
                    )}
                    {step === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32 }}>
                            <ReviewRoom
                                roomType={roomType}
                                width={width}
                                length={length}
                                flooring={flooring}
                                wallpaper={wallpaper}
                                flooringProducts={flooringProducts}
                                wallpaperProducts={wallpaperProducts}
                                selectedProducts={selectedProducts.map(id => products.find(p => p.id === id))}
                                loading={loading}
                                error={error}
                                onBuild={handleBuildRoom}
                                onBack={() => setStep(4)}
                            />
                        </motion.div>
                    )}
                    {step === 6 && builtRoom && (
                        <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.32 }}>
                            <RoomBuilderSuccess
                                room={builtRoom}
                                loading={loading}
                                addedToCart={addedToCart}
                                onAddToCart={() => handleAddToCart(builtRoom.roomId)}
                                onProceedToPayment={handleProceedToPayment}
                                onContinueShopping={onBack}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}