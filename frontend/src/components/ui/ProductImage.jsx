import { useState } from 'react'
import { FiImage } from 'react-icons/fi'

const parseRatio = (ratio) => {
  const [w, h] = String(ratio).split('/').map(Number)
  return w && h ? w / h : 1
}

/**
 * A product photo in a fixed-ratio frame.
 *
 * fit="auto" decides per image once it loads: photos close to the frame's
 * shape fill it (a small, centred crop), while much wider or taller photos
 * — usually cut-outs on white — are shown whole with breathing room, so a
 * bed or a set of plates is never sliced off at the edges.
 */
export default function ProductImage({ src, alt, ratio = '4/5', fit = 'auto', position = 'center', className = '', eager, label }) {
  const natural = ratio === 'natural'
  const [state, setState] = useState(src ? 'loading' : 'error')
  const [mode, setMode] = useState(fit === 'auto' ? 'cover' : fit)
  const [naturalRatio, setNaturalRatio] = useState(null)
  const frame = parseRatio(ratio)

  const onLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    if (natural) {
      // The frame takes the photo's own shape (within sane limits), so nothing is cropped.
      const r = w / h
      const clamped = Math.min(1.5, Math.max(0.62, r))
      setNaturalRatio(clamped)
      setMode(clamped === r ? 'cover' : 'contain')
    } else if (fit === 'auto') {
      const delta = w / h / frame
      setMode(delta > 1.15 || delta < 0.66 ? 'contain' : 'cover')
    }
    setState('ready')
  }

  return (
    <div
      className={`relative overflow-hidden bg-surface ${className}`}
      style={{ aspectRatio: natural ? naturalRatio || 0.8 : ratio }}
    >
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={onLoad}
          onError={() => setState('error')}
          style={{ objectPosition: position }}
          className={[
            'absolute inset-0 h-full w-full transition-[opacity,transform] duration-500 ease-out',
            mode === 'contain' ? 'object-contain p-[9%] mix-blend-multiply' : 'object-cover',
            state === 'ready' ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-3">
          <FiImage size={22} aria-hidden="true" />
          {label && <span className="px-4 text-center text-xs font-medium">{label}</span>}
        </div>
      )}
    </div>
  )
}
