import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  dark: 'bg-cocoa text-white hover:bg-cocoa/90',
  secondary: 'bg-canvas text-ink border border-line-strong hover:border-ink',
  ghost: 'text-ink hover:bg-surface',
  inverse: 'bg-white text-ink hover:bg-white/90',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-12 px-7 text-base gap-2',
}

/** Pill button. Pass `to` to render a router link with the same look. */
export default function Button({ variant = 'primary', size = 'md', to, className = '', block, children, ...props }) {
  const classes = [
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold',
    'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    block ? 'w-full' : '',
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
