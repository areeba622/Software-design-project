export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Soft Pastel Brand Palette ──────────────────────────
        'peach': {
          DEFAULT: '#FFCBA4',   // soft warm peach
          dark:    '#E8A87C',
          light:   '#FFE5D0',
          pale:    '#FFF5EE',
        },
        'hazel': {
          DEFAULT: '#D4A96A',   // muted golden hazel
          dark:    '#B8895A',
          light:   '#E8C898',
          pale:    '#FAF0E0',
        },
        'lavender': {
          DEFAULT: '#C5B4E3',   // soft dusty lavender
          dark:    '#A894CC',
          light:   '#DDD4F2',
          pale:    '#F3EFFE',
        },
        'sage': {
          DEFAULT: '#A8C5B0',   // muted sage green
          dark:    '#7EA88A',
          light:   '#C8DECE',
          pale:    '#EDF5F0',
        },
        'coral': {
          DEFAULT: '#F2A89A',   // pastel coral
          dark:    '#D98878',
          light:   '#F8C8C0',
          pale:    '#FEF0EE',
        },
        'amber-warm': {
          DEFAULT: '#F0C080',
          light:   '#F8D8A8',
          pale:    '#FEF5E4',
        },

        // ── Legacy names (backwards compat) ───────────────────
        'pastel-mustard': '#D4A96A',
        'pastel-lavender': '#C5B4E3',
        'pastel-mint':     '#A8C5B0',
        'pastel-peach':    '#FFCBA4',
        'pastel-cream':    '#FFF8F2',
        'palette-light':   '#FAFAF9',
        'palette-dark':    '#3A2518',
        'palette-orange':  '#C8865A',

        // ── Warm neutrals ──────────────────────────────────────
        'warm-cream': '#FFF8F2',
        'warm-blush': '#FFF0E6',
        'warm-sand':  '#F5E8D0',
        'warm-dark':  '#3A2518',

        // ── Editorial palette (plaster/rust/moss/ochre) ────────
        // Used for the hero, editorial grid, and collection cards.
        // NOTE: named 'moss' instead of 'sage' to avoid colliding
        // with the existing pastel 'sage' token above — they are
        // two different colors, don't merge them.
        'plaster':  '#EDE7DD',
        'paper':    '#F8F5EF',
        'ink':      '#2B2420',
        'ink-soft': '#5A5148',
        'rust': {
          DEFAULT: '#B15A38',
          deep:    '#8F452A',
        },
        'moss':     '#5B6B52',
        'ochre':    '#C99A3E',
        'hairline': '#D8CFC0',
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        display:  ['Playfair Display', 'Georgia', 'serif'],
        jomolhari: ['Jomolhari', 'serif'],
      },
      backgroundImage: {
        'gradient-warm':   'linear-gradient(135deg, #FFF8F2 0%, #FFE8D8 30%, #F0EAF8 65%, #EAF3EC 100%)',
        'gradient-hero':   'linear-gradient(145deg, #FFF5EB 0%, #FFE8D8 18%, #F8EFF8 45%, #EDF5F0 72%, #FFF5E8 100%)',
        'gradient-pastel': 'linear-gradient(135deg, #FFF8F2, #FFE8D8)',
      },
      boxShadow: {
        'soft':   '0 4px 24px rgba(180,140,100,0.10)',
        'medium': '0 8px 40px rgba(180,140,100,0.18)',
        'warm':   '0 8px 32px rgba(212,169,106,0.20)',
        'glow':   '0 0 30px rgba(212,169,106,0.25)',
      },
      animation: {
        'drift':      'drift 12s ease-in-out infinite',
        'float':      'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 6s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%':      { transform: 'translate(20px, -15px) rotate(3deg)' },
          '66%':      { transform: 'translate(-10px, 10px) rotate(-2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.18, transform: 'scale(1)' },
          '50%':      { opacity: 0.28, transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-emerald-50', 'text-emerald-700', 'border-emerald-200',
    'bg-red-50',     'text-red-600',     'border-red-200',
  ],
}