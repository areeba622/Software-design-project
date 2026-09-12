import React from 'react';

// ==========================================
// PALETTE LOGO — "Fanned swatch strip" concept
// Four rotated color chips fanned like a paint-store swatch
// card, sitting before the wordmark. Colors and geometry are
// exact — this is a direct port of the approved concept, not
// a reinterpretation.
//
// This is a separate file from PaletteLogo.jsx (the animated
// rainbow-letter wordmark) on purpose — that component is a
// different, still-unused concept. Nothing here replaces it;
// pick one final direction when you're ready and retire the
// other.
// ==========================================

const CHIPS = [
  { x: 0,  y: 6, rotate: -8, cx: 5,  cy: 16, fill: '#B15A38' }, // rust
  { x: 12, y: 3, rotate: -3, cx: 17, cy: 15, fill: '#C99A3E' }, // ochre
  { x: 24, y: 2, rotate: 3,  cx: 29, cy: 14, fill: '#5B6B52' }, // moss
  { x: 36, y: 4, rotate: 8,  cx: 41, cy: 15, fill: '#8B6244' }, // deep clay
];

export default function PaletteLogoFan({ dark = true, size = 'md', className = '' }) {
  const sizeMap = {
    sm: { svgW: 42, svgH: 24, textClass: 'text-base' },
    md: { svgW: 52, svgH: 30, textClass: 'text-lg' },
    lg: { svgW: 68, svgH: 40, textClass: 'text-2xl' },
  };
  const { svgW, svgH, textClass } = sizeMap[size] ?? sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg width={svgW} height={svgH} viewBox="0 0 52 30" role="img" aria-label="Palette logo mark">
        {CHIPS.map((c, i) => (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width="10"
            height="20"
            rx="2"
            fill={c.fill}
            transform={`rotate(${c.rotate} ${c.cx} ${c.cy})`}
          />
        ))}
      </svg>
      <span
        className={`font-display ${textClass} tracking-wide lowercase ${dark ? 'text-ink' : 'text-white'}`}
      >
        palette
      </span>
    </div>
  );
}