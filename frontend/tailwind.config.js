export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'palette-dark': '#0F172A',
        'palette-orange': '#C2410C',
        'palette-light': '#FAFAF9',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-emerald-50',
    'text-emerald-700',
    'border-emerald-200',
    'bg-red-50',
    'text-red-600',
    'border-red-200',
  ],
}