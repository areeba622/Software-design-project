/** Shown while a page's code is downloading. */
export default function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] items-center justify-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-ink" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
