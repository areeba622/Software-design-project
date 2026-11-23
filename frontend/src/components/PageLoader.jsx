/** Shown while a page's code is downloading. */
export default function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <span className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
