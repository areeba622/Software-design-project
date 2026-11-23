import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Logo from './layout/Logo'

/**
 * Split sign-in layout: a slow slideshow of rooms on the left (laptops and up),
 * the form on the right. Phones get the form alone.
 */
export default function AuthLayout({ slides, title, subtitle, children, footer }) {
  const [slide, setSlide] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length, reduce])

  const current = slides[slide]

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="relative hidden w-[52%] overflow-hidden bg-cocoa lg:flex lg:flex-col">
        <AnimatePresence initial={false}>
          <motion.img
            key={slide}
            src={current.img}
            alt=""
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: current.position || 'center' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

        <Link to="/" className="relative z-10 m-10 self-start" aria-label="Palette home">
          <Logo tone="light" />
        </Link>

        <div className="relative z-10 mt-auto p-10 pb-12">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45 }}>
              <p className="max-w-md font-display text-[2.1rem] font-medium leading-[1.15] tracking-[-0.01em] text-white">{current.tagline}</p>
              <p className="mt-2 text-[15px] text-white/70">{current.sub}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.tagline}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === slide}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-surface px-6 py-8 sm:px-10">
        <Link to="/" className="self-start lg:hidden" aria-label="Palette home">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[22rem]"
          >
            <h1 className="display text-[2rem]">{title}</h1>
            <p className="mt-2 text-[16px] text-ink-2">{subtitle}</p>
            <div className="mt-9">{children}</div>
            <p className="mt-8 text-center text-[15px] text-ink-2">{footer}</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

/** Underlined text field used by the sign-in forms. */
export function AuthField({ id, label, aside, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  )
}

export const authInputClass =
  'block h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[16px] text-ink shadow-[0_1px_2px_rgb(56_36_28/0.04)] transition-[border-color,box-shadow] placeholder:text-ink-3/70 hover:border-ink-3 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15'
