// src/components/BlogSection.jsx
// Standalone blog component — import into Dashboard (and optionally Catalog later)
// Usage: <BlogSection />

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight, FiClock, FiChevronRight } from 'react-icons/fi'

const C = {
    ink: "#1E252B",
    mustard: "#EAB308",
    pastelMuted: "#8C9296",
    creamBg: "#FAF9F5",
    gridLine: "#EAE8E2",
    accentBg: "#F1ECE3",
    white: "#FFFFFF",
    boho: "#D97706",
    scandi: "#0891B2",
    minimal: "#374151",
}
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

const ARTICLES = [
    {
        tag: 'SCANDINAVIAN',
        tagColor: { color: C.scandi, bg: '#E0F2FE' },
        title: 'How to nail the Scandinavian look without it feeling cold',
        excerpt: 'Warm wood tones, woven textiles, and a strict but soft neutral palette — the secret is in the materials, not just the colour.',
        readTime: '4 min read',
        /* PLACEHOLDER: src → Scandinavian interior blog cover photo (white walls, light wood, linen) */
        src: null,
    },
    {
        tag: 'BOHEMIAN',
        tagColor: { color: C.boho, bg: '#FEF3C7' },
        title: 'Bohemian layering: the art of more without the mess',
        excerpt: 'Boho isn\'t about clutter — it\'s intentional layering. Learn which patterns, plants, and textiles to combine for a curated free-spirit feel.',
        readTime: '6 min read',
        /* PLACEHOLDER: src → boho living room blog cover (rattan, plants, warm neutrals, macramé) */
        src: null,
    },
    {
        tag: 'MINIMALIST',
        tagColor: { color: C.minimal, bg: '#F3F4F6' },
        title: 'One room, one colour: the minimalist monochrome guide',
        excerpt: 'Tonal rooms are having a moment. Here\'s how to do all-white, all-beige, or all-charcoal without the space feeling sterile or cold.',
        readTime: '5 min read',
        /* PLACEHOLDER: src → minimalist monochrome room blog cover (clean lines, single tone) */
        src: null,
    },
    {
        tag: 'GUIDE',
        tagColor: { color: C.mustard, bg: '#FEF9C3' },
        title: 'Small bedroom? 8 tricks designers use to make it feel huge',
        excerpt: 'Mirrors, vertical storage, and the right rug size can transform even the tightest bedroom into a space that genuinely breathes.',
        readTime: '7 min read',
        /* PLACEHOLDER: src → small but beautiful, cleverly designed bedroom photo */
        src: null,
    },
]

function ImgPlaceholder({ label, src, style: s }) {
    return (
        <div style={{ position: 'relative', overflow: 'hidden', ...s }}>
            {src ? (
                <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.accentBg} 0%, ${C.gridLine} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px dashed ${C.pastelMuted}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16 }}>🖼</span>
                    </div>
                    <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.pastelMuted, letterSpacing: '0.06em', textAlign: 'center', padding: '0 8px' }}>{label}</span>
                </div>
            )}
        </div>
    )
}

function ArticleCard({ article, index, featured = false }) {
    const [hovered, setHov] = useState(false)
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.07 * index + 0.05, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                background: C.white,
                border: `1.5px solid ${hovered ? article.tagColor.color + '66' : C.gridLine}`,
                boxShadow: hovered ? '0 20px 48px -12px rgba(30,37,43,0.15)' : '0 4px 16px -6px rgba(30,37,43,0.05)',
                transition: 'all 0.26s ease',
                display: 'flex',
                flexDirection: featured ? 'row' : 'column',
                gridColumn: featured ? 'span 2' : 'span 1',
            }}
        >
            {/* Image */}
            <motion.div
                animate={{ scale: hovered ? 1.03 : 1 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
            >
                <ImgPlaceholder
                    label={article.title + ' — cover photo'}
                    src={article.src}
                    style={{
                        height: featured ? '100%' : 200,
                        width: featured ? 300 : '100%',
                        minHeight: featured ? 240 : undefined,
                    }}
                />
            </motion.div>

            {/* Body */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {/* Tag */}
                <motion.span
                    animate={{ x: hovered ? 2 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                        color: article.tagColor.color, background: article.tagColor.bg,
                        padding: '3px 9px', borderRadius: 4, alignSelf: 'flex-start',
                    }}
                >
                    {article.tag}
                </motion.span>

                {/* Title */}
                <motion.p
                    animate={{ color: hovered ? C.ink : C.ink }}
                    style={{
                        fontFamily: FONT, fontWeight: 800,
                        fontSize: featured ? 17 : 14,
                        color: C.ink, margin: 0, lineHeight: 1.35, letterSpacing: '-0.02em',
                    }}
                >
                    {article.title}
                </motion.p>

                {/* Excerpt */}
                <p style={{
                    fontFamily: FONT, fontSize: 12, color: C.pastelMuted,
                    margin: 0, lineHeight: 1.7,
                    display: '-webkit-box', WebkitLineClamp: featured ? 4 : 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {article.excerpt}
                </p>

                {/* Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${C.gridLine}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiClock size={11} color={C.pastelMuted} />
                        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.pastelMuted }}>{article.readTime}</span>
                    </div>
                    <motion.div animate={{ x: hovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                        <FiChevronRight size={14} color={hovered ? article.tagColor.color : C.pastelMuted} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export default function BlogSection() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-60px' })

    return (
        <section ref={ref} style={{ marginTop: '3.5rem' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}
            >
                <div>
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.mustard, letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}
                    >
                        FROM THE STUDIO
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.15, duration: 0.45 }}
                        style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.ink, letterSpacing: '-0.035em', margin: 0, lineHeight: 1.15 }}
                    >
                        Design ideas & guides
                    </motion.h2>
                </div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.2 }}
                    whileHover={{ gap: 10 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.mustard, background: 'none', border: 'none', cursor: 'pointer', transition: 'gap 0.2s' }}
                >
                    All articles <FiArrowRight size={13} />
                </motion.button>
            </motion.div>

            {/* Grid — first card featured (span 2), rest normal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {ARTICLES.map((article, i) => (
                    <ArticleCard key={i} article={article} index={i} featured={i === 0} />
                ))}
            </div>
        </section>
    )
}