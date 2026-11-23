import { AnimatePresence, motion } from 'framer-motion'
import { FiCheck, FiX } from 'react-icons/fi'
import { useCart } from '../lib/CartContext'

/** Small confirmation after an item is added; it stays out of the way and offers the cart. */
export default function CartNotice() {
  const { notice, dismissNotice, openDrawer } = useCart()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[150] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-cocoa py-3 pl-4 pr-2 text-white shadow-overlay"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
              <FiCheck size={15} />
            </span>
            <p className="min-w-0 flex-1 leading-tight">
              <span className="block text-[14px] font-semibold">Added to your cart</span>
              {notice.name && <span className="mt-0.5 block truncate text-[13px] text-white/70">{notice.name}</span>}
            </p>
            <button
              type="button"
              onClick={openDrawer}
              className="shrink-0 rounded-full px-3 py-2 text-[14px] font-semibold text-white underline-offset-4 hover:underline"
            >
              View cart
            </button>
            <button type="button" onClick={dismissNotice} aria-label="Dismiss" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:text-white">
              <FiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
