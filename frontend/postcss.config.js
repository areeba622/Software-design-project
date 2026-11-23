import { fileURLToPath } from 'node:url'

export default {
  plugins: {
    // Resolve the Tailwind config next to this file, whatever directory the dev server was started from.
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) },
    autoprefixer: {},
  },
}
