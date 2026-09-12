import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import backgroundPic from './assets/background.webp';
import AmbientCorner from './assets/AmbientCorner.jpg';
import DiningVignette from './assets/DiningVignette.jpg';
import ChandelierAccent from './assets/ChandelierAccent.jpg';
import FabricTextures from './assets/FabricTextures.jpg';
import BedsideDetail from './assets/BedsideDetail.jpg';
import CozyLiving from './assets/CozyLiving.jpg';
import ReviewsCarousel from './components/Reviewscarousel';
import BohemianStyleImg from './assets/styles/bohemian.jpg';
import minimalistStyleImg from './assets/styles/minimalist.jpg';
import scandinavianStyleImg from './assets/styles/scandinavian.jpg';
import ayesha from './assets/designers/ayesha.jpg';
import marco from './assets/designers/marco.jpg';
import farah from './assets/designers/farah.jpg';
import livingRoomImg from './assets/rooms/LivingRoom.jpg';
import diningRoomImg from './assets/rooms/diningRoom.jpg';
import kitchenImg from './assets/rooms/kitchen.jpg';
import bedRoomImg from './assets/rooms/bedRoom.jpg';
import PaletteLogoFan from './components/PaletteLogoFan';

// ==========================================
// REUSABLE IMAGE SYSTEM WITH SOLID FALLBACK
// ==========================================
function SafeImage({ src, alt }) {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F4F1EA] border border-[#EBE7DF] transition-all duration-300">
        <span className="text-[#66635F] text-[10px] tracking-widest uppercase font-mono px-4 text-center">
          {alt || 'Palette Space'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setIsError(true)}
      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

// ==========================================
// REUSABLE MOTION HELPERS (fade-up on scroll into view)
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

// ==========================================
// PARALLAX TILE — wraps an image so it drifts opposite the
// cursor on hover. Reuses the same math as the hero's mouse
// parallax, just scoped to one tile instead of the whole page.
// The child image must be allowed to overflow its container
// (we scale it up 112% so the drift never reveals an edge).
// ==========================================
function ParallaxTile({ children, className = '', strength = 16 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * strength, y: py * strength });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      <motion.div
        animate={{ x: tilt.x, y: tilt.y }}
        transition={{ type: 'spring', stiffness: 140, damping: 18, mass: 0.4 }}
        className="absolute inset-[-6%] w-[112%] h-[112%]"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ==========================================
// INTERACTIVE GRID WRAPPER — a soft brand-colored glow that
// trails the cursor across a section. Ties the "alive" feeling
// to the actual brand palette instead of generic motion.
// ==========================================
function CursorGlowSection({ children, glowColor = 'rgba(177,90,56,0.28)', className = '' }) {
  const glowX = useMotionValue(-400);
  const glowY = useMotionValue(-400);
  const springX = useSpring(glowX, { stiffness: 55, damping: 22 });
  const springY = useSpring(glowY, { stiffness: 55, damping: 22 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  return (
    <div className={`relative ${className}`} onMouseMove={handleMove}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          left: springX,
          top: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

// ==========================================
// STYLE QUIZ DATA — the app's 3 real styles (unchanged)
// ==========================================
const styleOptions = [
  {
    id: 'scandi',
    label: 'Scandinavian',
    color: '#DCCBAE',
    img: scandinavianStyleImg,
    desc: 'Light woods, quiet lines, and calm negative space — furniture that never shouts.',
    match: 92,
  },
  {
    id: 'boho',
    label: 'Bohemian',
    color: '#C8865A',
    img: BohemianStyleImg,
    desc: 'Layered textiles, terracotta warmth, and global textures collected over time.',
    match: 88,
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    color: '#6B5B4A',
    img: minimalistStyleImg,
    desc: 'Pared-back forms, restrained palettes, and furniture with nothing to spare.',
    match: 90,
  },
];

// ==========================================
// DESIGNER PORTFOLIO DATA (unchanged)
// ==========================================
// TODO — real project photos:
// Each designer below has img: '' (empty) on purpose — SafeImage will show a
// labeled placeholder box until a real photo is added. Suggested photo per
// designer (aim for a well-lit, styled room shot that matches their tag):
const designers = [
  {
    id: 'Modern',
    name: 'Aisha K.',
    tag: 'Modern Minimalist',
    img: ayesha, // TODO: bright, uncluttered living/dining room — clean lines, one statement piece, lots of negative space
    quote: '"Aisha turned our cluttered living room into something we actually want to sit in."',
    rotate: -6,
    offsetX: -18,
  },
  {
    id: 'Bohemian',
    name: 'Marco D.',
    tag: 'Classic Bohemian',
    img: marco, // TODO: layered textiles, warm terracotta tones, plants, and mixed textures — a lived-in, collected-over-time feel
    quote: '"Marco has an eye for layering colour and texture without it ever feeling busy."',
    rotate: 4,
    offsetX: 0,
  },
  {
    id: 'Scandinavian',
    name: 'Farah I.',
    tag: 'Cozy Scandinavian',
    img: farah, // TODO: pale wood tones, soft linen, candlelight — a warm Nordic-cabin feel
    quote: '"Farah made our small apartment feel twice as bright and twice as calm."',
    rotate: 7,
    offsetX: 18,
  },
];

// ==========================================
// COLLECTION CARDS DATA — replaces the old sampleProducts
// featured-catalogue grid. No name/price shown here on purpose:
// the app supports both PKR and USD, so pricing only appears once
// a user is signed in and a currency is resolved (see ProductCatalog).
// This section sells *categories*, not SKUs.
// ==========================================
const collections = [
  {
    id: 'living-room',
    label: 'Living Room',
    blurb: 'Sofas, coffee tables & more',
    img: livingRoomImg,
    tint: 'rgba(177,90,56,0.55)',   // rust
  },
  {
    id: 'dining-room',
    label: 'Dining Room',
    blurb: 'Tables & seating for gathering',
    img: diningRoomImg,
    tint: 'rgba(201,154,62,0.55)', // ochre
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    blurb: 'Fixtures & storage essentials',
    img: kitchenImg,
    tint: 'rgba(91,107,82,0.55)',  // moss
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    blurb: 'Beds, nightstands & textiles',
    img: bedRoomImg,
    tint: 'rgba(43,36,32,0.6)',    // ink
  },
];

// ==========================================
// DESIGNER DECK CARD — isolates the tilt-on-hover interaction (unchanged)
// ==========================================
function DesignerDeckCard({ d, isActive, onSelect }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const transform = isActive
    ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05) translateX(0px) translateY(0px)`
    : `rotate(${d.rotate}deg) scale(0.9) translateX(${d.offsetX}px) translateY(22px)`;

  return (
    <button
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="absolute w-64 md:w-72 aspect-[4/5] rounded-2xl overflow-hidden shadow-xl transition-[transform,opacity,filter] duration-500 ease-out"
      style={{
        transform,
        zIndex: isActive ? 20 : 10,
        opacity: isActive ? 1 : 0.8,
        filter: isActive ? 'none' : 'saturate(0.85)',
      }}
    >
      <SafeImage src={d.img} alt={`${d.name} — ${d.tag} portfolio project`} />
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <p className="text-white text-sm font-medium">{d.name}</p>
        <p className="text-white/80 text-[10px] uppercase tracking-widest">{d.tag}</p>
      </div>
    </button>
  );
}

// ==========================================
// MAIN LANDING PAGE COMPONENT
// ==========================================
export default function LandingPage({ onQuiz, onLogin, onRegister, onRoomBuilder }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // `scrolled` drives the glass-blur intensity; `pastHero` drives nav text/bg
  // contrast — separated so the nav doesn't flip to dark text while still
  // sitting over the dark hero photo.
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight * 0.9;
      setPastHero(window.scrollY > heroHeight - 90);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleHeroMouseMove = (e) => { setMouse({ x: (e.clientX / window.innerWidth) - 0.5, y: (e.clientY / window.innerHeight) - 0.5 }); };
  // Interactive quiz teaser state
  const [selectedStyle, setSelectedStyle] = useState(null);
  const activeStyle = styleOptions.find((s) => s.id === selectedStyle);

  // Interactive designer deck state
  const [selectedDesigner, setSelectedDesigner] = useState(designers[0].id);
  const activeDesigner = designers.find((d) => d.id === selectedDesigner);

  const processSteps = ['Share your vision', 'Get matched', 'Bring it to life'];

  // Nav is "on light background" (paper) once pastHero is true.
  const navOnLight = pastHero;

  return (
    <div className="min-h-screen bg-[#ded2ba] text-[#1C1C1C] font-sans antialiased selection:bg-[#343E4D] selection:text-white">

      {/* ═══════════════════════════════════════════════
          FLOATING GLASS NAVBAR
          - Pill shape, curved corners, inner top highlight stroke
          - Translucent-over-dark while still on the hero photo,
            fades to a near-opaque paper surface once past it, and
            gets slightly more opaque again as the user scrolls
            further (so long light-background pages stay readable).
      ═══════════════════════════════════════════════ */}
      <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4">
        <nav
          className={`w-full max-w-5xl flex justify-between items-center px-7 py-3.5 rounded-full border transition-all duration-500 ${navOnLight
            ? scrolled
              ? 'bg-paper/95 border-hairline text-ink shadow-[0_8px_32px_rgba(43,36,32,0.12)]'
              : 'bg-paper/70 border-hairline/70 text-ink shadow-[0_8px_24px_rgba(43,36,32,0.08)]'
            : 'bg-white/10 border-white/25 text-white backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)]'
            }`}
          style={{
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: navOnLight
              ? 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 32px rgba(43,36,32,0.10)'
              : 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          <div className="flex space-x-6 text-xs uppercase tracking-widest font-medium">
            <a href="#info" className="relative group/nav pb-1">
              Info
              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-current transition-all duration-300 group-hover/nav:w-full" />
            </a>
            <a href="#shop" className="relative group/nav pb-1">
              Services
              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-current transition-all duration-300 group-hover/nav:w-full" />
            </a>
          </div>

          <PaletteLogoFan dark={navOnLight} />

          <button onClick={() => onLogin ? onLogin() : navigate('/login')} className="text-xs uppercase tracking-widest font-medium relative group/nav pb-1">
            Sign in
            <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-current transition-all duration-300 group-hover/nav:w-full" />
          </button>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════════ */}
      <header ref={heroRef} onMouseMove={handleHeroMouseMove} className="relative h-[90vh] w-full flex items-center justify-center bg-[#F4F1EA] overflow-hidden group">
        <motion.div>
          <SafeImage src={backgroundPic} alt="Warm terracotta living room with natural fabrics" />
        </motion.div>

        {/* Bottom-weighted scrim — darker where the headline/button sit,
            lighter near the top so the room's ceiling/light stays visible.
            Replaces the old flat bg-black/5, which was too light for real
            text contrast against a bright photo like this one. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="font-jomolhari text-5xl md:text-7xl font-normal text-white leading-tight max-w-4xl drop-shadow-md"
          >
            Designing <span className="text-ochre">Spaces</span> That<br />
            Feel Like Home
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="font-jomolhari mt-6 text-white/90 text-base md:text-lg max-w-xl drop-shadow-sm"
          >
            Premium furniture crafted for beautiful spaces and better living.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/login')}
            className="mt-8 px-9 py-3.5 bg-ink text-white text-xs font-semibold uppercase tracking-widest rounded-full shadow-md hover:bg-black transition-colors duration-300"
          >
           
            Shop Now
          </motion.button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          2. ASYMMETRIC EDITORIAL GRID ("Perfect Lines")
          - 6 image tiles now (was 5) for a fuller composition
          - every tile hover-parallaxes toward the cursor
          - a soft rust glow trails the cursor across the section
      ═══════════════════════════════════════════════ */}
      <CursorGlowSection glowColor="rgba(177,90,56,0.22)">
        <section id="info" className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6 }}
              className="md:col-span-4 space-y-8"
            >
              <ParallaxTile className="aspect-[4/3] w-full shadow-xs">
                <SafeImage src={DiningVignette} alt="Dining Vignette" />
              </ParallaxTile>
              <ParallaxTile className="aspect-[3/4] w-full shadow-xs md:translate-x-6">
                <SafeImage src={BedsideDetail} alt="Bedside Detail" />
              </ParallaxTile>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-4 text-center px-4 py-8 md:py-0 z-10 space-y-8"
            >
              <ParallaxTile className="aspect-square w-23 mx-auto rounded-full" strength={10}>
                <SafeImage src={ChandelierAccent} alt="Chandelier Accent" />
              </ParallaxTile>

              <div>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1C1C1C] leading-tight mb-6">
                  Creating <span className="italic">perfect</span> lines and imposing presence
                </h2>
                <p className="text-[#66635F] text-xs md:text-sm leading-relaxed font-light max-w-sm mx-auto mb-8">
                  Developed the concept of exclusivity, Palette features timeless furniture with natural fabrics,
                  curved lines, plenty of interiors and robust design, which can be incorporated into any decor project.
                </p>
                <button className="relative group/link text-[11px] uppercase tracking-widest font-semibold pb-1">
                  Read About Us
                  <span className="absolute left-0 -bottom-0 w-full h-px bg-[#1C1C1C] scale-x-100 group-hover/link:scale-x-0 origin-right transition-transform duration-300" />
                  <span className="absolute left-0 -bottom-0 w-full h-px bg-[#1C1C1C] scale-x-0 group-hover/link:scale-x-100 origin-left transition-transform duration-300" />
                </button>
              </div>

              {/* NEW — extra tile for a fuller, more complete composition */}
              <ParallaxTile className="aspect-[16/9] w-full shadow-xs" strength={12}>
                <SafeImage src={AmbientCorner} alt="Ambient Corner Detail" />
              </ParallaxTile>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-4 space-y-8 md:text-right"
            >
              <ParallaxTile className="aspect-[4/3] w-2/3 ml-auto shadow-xs">
                <SafeImage src={FabricTextures} alt="Fabric Textures" />
              </ParallaxTile>
              <ParallaxTile className="aspect-[4/5] w-full shadow-xs md:-translate-x-4">
                <SafeImage src={CozyLiving} alt="Cozy Living Setup" />
              </ParallaxTile>
            </motion.div>

          </div>
        </section>
      </CursorGlowSection>

      {/* ═══════════════════════════════════════════════
          3. INTERACTIVE STYLE QUIZ — "Find Your Palette" (unchanged)
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F1EA] via-[#EFE6D8] to-[#F0EBE3]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#C8865A]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#8FA89A]/20 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp} transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="block w-8 h-[2px] bg-[#C8865A] rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C8865A]">Style Quiz</span>
              <span className="block w-8 h-[2px] bg-[#C8865A] rounded-full" />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1C1C1C] leading-tight mb-4">
              Discover Your <span className="italic">Interior</span> Aesthetic
            </h2>
            <p className="text-[#66635F] text-sm md:text-base leading-relaxed font-light max-w-lg mx-auto">
              Tap a mood below for a quick preview, then take the full quiz for your complete match.
            </p>
          </motion.div>

          {/* Swatch picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {styleOptions.map((style, i) => (
              <motion.button
                key={style.id}
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedStyle(style.id === selectedStyle ? null : style.id)}
                className={`group relative rounded-2xl overflow-hidden aspect-[4/3] border-2 ${selectedStyle === style.id
                  ? 'border-[#1C1C1C] shadow-lg'
                  : 'border-transparent hover:border-[#1C1C1C]/30'
                  }`}
              >
                <div className="absolute inset-0" style={{ backgroundColor: style.color }}>
                  {style.img && <SafeImage src={style.img} alt={`${style.label} interior style`} />}
                </div>
                <span className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-medium uppercase tracking-widest drop-shadow-sm">
                  {style.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Live preview panel */}
          <div
            className={`relative rounded-2xl overflow-hidden transition-all duration-500 ease-out ${activeStyle ? 'max-h-96 opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'
              }`}
          >
            <AnimatePresence mode="wait">
              {activeStyle && (
                <motion.div
                  key={activeStyle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="relative px-8 py-10 md:px-12 md:py-12 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${activeStyle.color}22, ${activeStyle.color}55)`,
                  }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                    <div
                      className="w-20 h-20 rounded-2xl flex-shrink-0 shadow-md overflow-hidden"
                      style={{ backgroundColor: activeStyle.color }}
                    >
                      {activeStyle.img && <SafeImage src={activeStyle.img} alt={`${activeStyle.label} preview`} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1C1C] mb-2">
                        {activeStyle.label}
                      </h3>
                      <p className="text-[#4A4540] text-sm leading-relaxed font-light max-w-md mb-4">
                        {activeStyle.desc}
                      </p>
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activeStyle.match}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full rounded-full bg-[#1C1C1C]"
                          />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1C1C1C]">
                          {activeStyle.match}% match
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuiz && onQuiz()}
              
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#1C1C1C] text-white text-xs font-medium uppercase tracking-widest rounded-full shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              Take the Full Quiz
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. COLLECTIONS — replaces the old featured-products grid.
          No names/prices here — the app supports both PKR and USD,
          so pricing is shown once a currency is resolved after
          sign-in (see ProductCatalog). This sells categories, not
          SKUs. Every card routes straight to sign-in, since the
          catalogue behind it is a protected route either way.
      ═══════════════════════════════════════════════ */}
      
{/* ═══════════════════════════════════════════
    4. COLLECTIONS
═══════════════════════════════════════════════ */}
<section
  id="shop"
  className="border-t border-[#EBE7DF] bg-plaster px-4 sm:px-6 py-16 md:py-20"
>
  <div className="max-w-7xl mx-auto">

    {/* Heading */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="text-center mb-10 md:mb-14"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-rust">
        Shop by room
      </span>

      <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1C1C] tracking-wide mt-3">
        Our Collections
      </h3>
    </motion.div>


    {/* ═══════════════════════════════════════════════
        COLLECTION GRID
        
        Desktop:
        
        ┌─────────────────────────┬──────────────────┐
        │                         │                  │
        │                         │     Dining       │
        │       Living Room      │                  │
        │                         ├──────────────────┤
        │                         │                  │
        │                         │     Kitchen      │
        │                         │                  │
        └─────────────────────────┴──────────────────┘
        ┌────────────────────────────────────────────┐
        │                  Bedroom                    │
        └────────────────────────────────────────────┘
    ═══════════════════════════════════════════════ */}
    <div
      className="
        grid
        grid-cols-1
        gap-4
        md:gap-5

        lg:grid-cols-12
        lg:grid-rows-[250px_250px]
      "
    >

      {/* ═══════════════════════════════════════
          LIVING ROOM
      ═══════════════════════════════════════ */}
      <motion.button
        onClick={() => onLogin ? onLogin() : navigate('/login')}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-2xl
          shadow-md

          lg:col-span-7
          lg:row-span-2

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1C1C1C]
        "
      >
        <div className="relative w-full h-full min-h-[320px]">

          <SafeImage
            src={collections[0].img}
            alt={collections[0].label}
          />

          {/* Gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${collections[0].tint}, transparent)`,
            }}
          />

          {/* Content */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-5
              sm:p-6
              pointer-events-none
            "
          >
            <h4 className="text-white font-serif text-xl sm:text-2xl md:text-3xl">
              {collections[0].label}
            </h4>

            <p className="text-white/85 text-xs sm:text-sm mt-1">
              {collections[0].blurb}
            </p>

            <span
              className="
                inline-flex
                items-center
                mt-3
                bg-white
                text-ink
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-widest
                font-semibold
                px-4
                py-2
                rounded-full
              "
            >
              Explore more »
            </span>
          </div>
        </div>
      </motion.button>


      {/* ═══════════════════════════════════════
          DINING ROOM
      ═══════════════════════════════════════ */}
      <motion.button
        onClick={() => onLogin ? onLogin() : navigate('/login')}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -4 }}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-2xl
          shadow-md

          lg:col-span-5
          lg:row-start-1
          lg:col-start-8

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1C1C1C]
        "
      >
        <div className="relative w-full h-full min-h-[180px]">

          <SafeImage
            src={collections[1].img}
            alt={collections[1].label}
          />

          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${collections[1].tint}, transparent)`,
            }}
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-4
              sm:p-5
              pointer-events-none
            "
          >
            <h4 className="text-white font-serif text-lg sm:text-xl">
              {collections[1].label}
            </h4>

            <p className="text-white/85 text-[10px] sm:text-xs mt-0.5">
              {collections[1].blurb}
            </p>

            <span
              className="
                inline-flex
                items-center
                mt-2.5
                bg-white
                text-ink
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-widest
                font-semibold
                px-3.5
                py-1.5
                rounded-full
              "
            >
              Explore more »
            </span>
          </div>
        </div>
      </motion.button>


      {/* ═══════════════════════════════════════
          KITCHEN
      ═══════════════════════════════════════ */}
      <motion.button
        onClick={() => onLogin ? onLogin() : navigate('/login')}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ y: -4 }}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-2xl
          shadow-md

          lg:col-span-5
          lg:row-start-2
          lg:col-start-8

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1C1C1C]
        "
      >
        <div className="relative w-full h-full min-h-[180px]">

          <SafeImage
            src={collections[2].img}
            alt={collections[2].label}
          />

          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${collections[2].tint}, transparent)`,
            }}
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-4
              sm:p-5
              pointer-events-none
            "
          >
            <h4 className="text-white font-serif text-lg sm:text-xl">
              {collections[2].label}
            </h4>

            <p className="text-white/85 text-[10px] sm:text-xs mt-0.5">
              {collections[2].blurb}
            </p>

            <span
              className="
                inline-flex
                items-center
                mt-2.5
                bg-white
                text-ink
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-widest
                font-semibold
                px-3.5
                py-1.5
                rounded-full
              "
            >
              Explore more »
            </span>
          </div>
        </div>
      </motion.button>


      {/* ═══════════════════════════════════════
          BEDROOM
      ═══════════════════════════════════════ */}
      <motion.button
        onClick={() => onLogin ? onLogin() : navigate('/login')}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.25 }}
        whileHover={{ y: -4 }}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-2xl
          shadow-md

          lg:col-span-12

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1C1C1C]
        "
      >
        <div
          className="
            relative
            w-full
            h-[280px]
            sm:h-[300px]
            lg:h-[430px]
          "
        >

          <SafeImage
            src={collections[3].img}
            alt={collections[3].label}
          />

          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${collections[3].tint}, transparent)`,
            }}
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-4
              sm:p-5
              md:p-6

              flex
              flex-col
              sm:flex-row
              sm:items-end
              sm:justify-between

              gap-4
              pointer-events-none
            "
          >
            <div>
              <h4 className="text-white font-serif text-xl sm:text-2xl md:text-3xl">
                {collections[3].label}
              </h4>

              <p className="text-white/85 text-xs sm:text-sm mt-1">
                {collections[3].blurb}
              </p>
            </div>

            <span
              className="
                self-start
                sm:self-auto
                bg-white
                text-ink
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-widest
                font-semibold
                px-4
                py-2
                rounded-full
                whitespace-nowrap
              "
            >
              Explore more »
            </span>
          </div>
        </div>
      </motion.button>

    </div>
  </div>
</section>

      {/* ═══════════════════════════════════════════════
          5. WORK WITH A DESIGNER — Interactive Portfolio Deck (unchanged)
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FBF6EE] py-20 md:py-24">
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#B08D57]/15 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-[#C8865A]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* Text Content */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6 }}
              className="space-y-6 md:pr-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="block w-8 h-[2px] bg-[#B08D57] rounded-full" />
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#B08D57]">Expert Guidance</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1C1C1C] leading-tight">
                Work with a <span className="italic">Designer</span>
              </h2>
              <p className="text-[#66635F] text-sm md:text-base leading-relaxed font-light max-w-md">
                From concept to completion — collaborate with our vetted interior
                designers to bring your vision to life. Browse a few of their recent
                projects, then find the one whose eye matches yours.
              </p>

              {/* 3-step process strip */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-1">
                {processSteps.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#66635F] font-medium">{step}</span>
                    </div>
                    {i < processSteps.length - 1 && <span className="w-4 h-px bg-[#1C1C1C]/20" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Style filter pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {designers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDesigner(d.id)}
                    className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-medium transition-all duration-300 border ${selectedDesigner === d.id
                      ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                      : 'bg-transparent text-[#1C1C1C] border-[#1C1C1C]/25 hover:border-[#1C1C1C]'
                      }`}
                  >
                    {d.tag.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Dynamic testimonial tied to the selected designer — sample copy;
                  swap for a real client quote once you have one on file. */}
              <div className="min-h-[3.5rem]">
                <AnimatePresence mode="wait">
                  {activeDesigner && (
                    <motion.p
                      key={activeDesigner.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-[#4A4540] text-sm italic font-light leading-relaxed max-w-md"
                    >
                      {activeDesigner.quote}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust stat line — plain text, no boxed stat cards */}
              <p className="text-[11px] uppercase tracking-widest text-[#66635F]/80">
                4.9★ average rating · 120+ projects delivered
              </p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/designers')}
                className="group inline-flex items-center gap-2.5 px-7 py-3 bg-transparent text-[#1C1C1C] text-xs font-medium uppercase tracking-widest rounded-full border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-colors duration-300 mt-2"
              >
                Browse All Designers
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Interactive stacked portfolio deck */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center"
            >
              <div className="relative h-[420px] w-full flex items-center justify-center">
                {designers.map((d) => (
                  <DesignerDeckCard
                    key={d.id}
                    d={d}
                    isActive={d.id === selectedDesigner}
                    onSelect={() => setSelectedDesigner(d.id)}
                  />
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {designers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDesigner(d.id)}
                    aria-label={`Show ${d.name}`}
                    className={`h-2 rounded-full transition-all duration-300 ${selectedDesigner === d.id ? 'bg-[#1C1C1C] w-6' : 'bg-[#1C1C1C]/25 w-2 hover:bg-[#1C1C1C]/45'
                      }`}
                  />
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. REVIEWS CAROUSEL (unchanged)
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#FFF8F2]">
        <ReviewsCarousel />
      </section>

      {/* ═══════════════════════════════════════════════
          7. FOOTER (unchanged)
      ═══════════════════════════════════════════════ */}
      {/* TODO: replace the placeholder email, WhatsApp number, and Instagram
          handle below with Palette's real ones. */}
      <footer className="bg-[#343E4D] text-white px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          <div className="space-y-4">
            <PaletteLogoFan dark={false} size="lg" />
            <p className="text-gray-300 text-xs leading-relaxed max-w-xs">
              Timeless furniture with natural fabrics, curved lines, and robust
              design for any decor project.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-white/60">Explore</h4>
            <div className="flex flex-col space-y-2 text-sm text-gray-300">
              <a href="#info" className="hover:text-white hover:translate-x-1 transition-all w-fit">Info</a>
              <a href="#shop" className="hover:text-white hover:translate-x-1 transition-all w-fit">Shop</a>
              <a href="/designers" className="hover:text-white hover:translate-x-1 transition-all w-fit">Designers</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-white/60">Get in Touch</h4>
            <div className="flex flex-col space-y-3 text-sm text-gray-300">
              <a href="mailto:hello@palette.com" className="flex items-center gap-3 hover:text-white transition-colors w-fit">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                </svg>
                hello@palette.com
              </a>
              <a href="https://wa.me/920000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors w-fit">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.94 9.94 0 004.79 1.22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2c-1.53 0-3.02-.41-4.31-1.19l-.31-.18-3.11.82.83-3.03-.2-.31A8.18 8.18 0 013.84 12c0-4.53 3.68-8.2 8.2-8.2s8.2 3.67 8.2 8.2-3.67 8.2-8.2 8.2zm4.5-6.13c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02s-.43.06-.66.31c-.23.25-.86.84-.86 2.06s.88 2.4 1 2.56c.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z" />
                </svg>
                +92 300 0000000
              </a>
              <a href="https://instagram.com/palette.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors w-fit">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                @palette.app
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-[11px] text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} Palette. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}