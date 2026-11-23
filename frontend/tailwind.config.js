// Colours come from the CSS variables in src/style.css, so Tailwind classes
// and hand-written CSS always agree.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // Hover styles only apply on devices with a real pointer, so taps don't leave things highlighted.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: token('ink'), 2: token('ink-2'), 3: token('ink-3') },
        canvas: token('canvas'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        accent: { DEFAULT: token('accent'), hover: token('accent-hover'), soft: token('accent-soft') },
        sand: token('sand'),
        sage: { DEFAULT: token('sage'), soft: token('sage-soft') },
        cocoa: token('cocoa'),
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Merriweather', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        card: '12px',
        panel: '16px',
      },
      boxShadow: {
        overlay: '0 24px 48px -12px rgb(27 23 20 / 0.22), 0 2px 6px rgb(27 23 20 / 0.06)',
        lift: '0 8px 24px -10px rgb(27 23 20 / 0.18)',
      },
      maxWidth: {
        page: '80rem',
      },
    },
  },
  plugins: [],
}
