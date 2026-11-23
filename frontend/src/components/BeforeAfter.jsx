import { useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/**
 * Drag (or use the arrow keys) to compare two photos of the same room.
 * The handle follows the pointer 1:1 and keeps tracking outside the frame.
 */
export default function BeforeAfter({ before, after, alt, ratio = '3/2' }) {
  const frameRef = useRef(null)
  const [pos, setPos] = useState(50)

  const moveTo = (clientX) => {
    const rect = frameRef.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX)
  }

  const onPointerMove = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX)
  }

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      className="relative cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-panel bg-surface"
      style={{ aspectRatio: ratio }}
    >
      <img src={after} alt={`${alt}, after`} draggable="false" className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before}
        alt={`${alt}, before`}
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">Before</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink backdrop-blur">After</span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lift">
          <FiChevronLeft size={16} className="-mr-0.5" />
          <FiChevronRight size={16} className="-ml-0.5" />
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare before and after"
        className="peer sr-only"
      />
      <span className="pointer-events-none absolute inset-0 rounded-panel ring-2 ring-inset ring-accent opacity-0 peer-focus-visible:opacity-100" />
    </div>
  )
}
