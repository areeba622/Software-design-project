/** The Palette mark: four colour swatches, like paint chips on a board. */
export function LogoMark({ size = 22, tone = 'dark' }) {
  const base = tone === 'light' ? '#FFFFFF' : '#1B1714'
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="11" height="11" rx="2.5" fill={base} />
      <rect x="16" y="1" width="11" height="11" rx="2.5" fill="#C4522A" />
      <rect x="1" y="16" width="11" height="11" rx="2.5" fill="#C4522A" fillOpacity="0.4" />
      <rect x="16" y="16" width="11" height="11" rx="2.5" fill={base} fillOpacity="0.2" />
    </svg>
  )
}

export default function Logo({ tone = 'dark', size = 'md' }) {
  const text = size === 'lg' ? 'text-[28px]' : 'text-[21px]'
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size === 'lg' ? 26 : 22} tone={tone} />
      <span
        className={`font-display font-medium leading-none tracking-[-0.01em] ${text} ${tone === 'light' ? 'text-white' : 'text-ink'}`}
      >
        Palette
      </span>
    </span>
  )
}
