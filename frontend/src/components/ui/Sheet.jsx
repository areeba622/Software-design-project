import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiX } from 'react-icons/fi'

/**
 * A panel that slides in from the right edge and leaves the same way.
 * Escape, the close button and the dimmed page all close it; focus moves
 * into the panel and returns to whatever opened it.
 */
export default function Sheet({ open, onClose, title, width = 440, children, footer }) {
  const panelRef = useRef(null)
  const closeRef = useRef(onClose)
  const reduce = useReducedMotion()

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbar}px`
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => panelRef.current?.querySelector('[data-autofocus]')?.focus())
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [open])

  const spring = reduce ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.38 }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-y-0 right-0 flex w-full flex-col bg-canvas shadow-overlay"
            style={{ maxWidth: width }}
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={spring}
          >
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-6">
              <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
              <button
                type="button"
                data-autofocus
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink"
              >
                <FiX size={20} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <footer className="shrink-0 border-t border-line bg-canvas px-5 py-5 sm:px-6">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
