import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiCheck, FiSearch, FiSliders, FiX } from 'react-icons/fi'
import { productsApi } from '../api'
import { useCurrency } from '../lib/CurrencyContext'
import { CATEGORIES, ROOMS, STYLES, categoryLabel, roomLabel, styleLabel } from '../lib/labels'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import Button from '../components/ui/Button'
import Sheet from '../components/ui/Sheet'

const PRICE_CAPS = [10000, 25000, 50000, 100000]

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'name', label: 'Name, A to Z' },
]

function FilterGroup({ title, options, value, onChange }) {
  return (
    <div role="group" aria-label={title} className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <h2 className="mb-2 text-[15px] font-semibold text-ink">{title}</h2>
      <ul className="-mx-2 space-y-px">
        {options.map((o) => {
          const active = value === o.value
          const empty = o.count === 0 && !active
          return (
            <li key={String(o.value)}>
              <button
                type="button"
                aria-pressed={active}
                disabled={empty}
                onClick={() => onChange(active ? null : o.value)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left text-[15px] transition-colors ${
                  active ? 'font-medium text-ink' : 'text-ink-2 hover:bg-surface hover:text-ink'
                } disabled:cursor-default disabled:text-ink-3/60 disabled:hover:bg-transparent`}
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                    active ? 'border-accent bg-accent text-white' : 'border-line-strong'
                  }`}
                  aria-hidden="true"
                >
                  {active && <FiCheck size={11} strokeWidth={3} />}
                </span>
                <span className="flex-1">{o.label}</span>
                {o.count != null && <span className="tabular text-[13px] text-ink-3">{o.count}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ProductCatalog({ defaultCategory, pageTitle, pageSubtitle }) {
  const { format } = useCurrency()

  // Filters live in the URL (?q=&category=&room=&style=&maxPrice=&sort=) so a
  // filtered view can be shared, bookmarked, and survives a refresh.
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const category = params.get('category') || defaultCategory || null
  const room = params.get('room') || null
  const style = params.get('style') || null
  const maxPrice = Number(params.get('maxPrice')) || null
  const sort = params.get('sort') || 'recommended'

  const setParam = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === null || value === undefined || value === '' || value === 'recommended') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )

  const [query, setQuery] = useState(search)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setQuery(search), [search])

  // Typing updates the URL after a short pause; the server does the text search.
  useEffect(() => {
    if (query === search) return
    const t = setTimeout(() => setParam('q', query.trim() ? query : null), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const keyword = search.trim()
    setLoading(true)
    setError(null)
    const call = keyword ? productsApi.search(keyword, { signal: controller.signal }) : productsApi.list({ signal: controller.signal })
    call
      .then((list) => setAllProducts(Array.isArray(list) ? list : []))
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [search, reloadKey])

  const matches = (p, skip) =>
    (skip === 'category' || !category || p.category === category) &&
    (skip === 'room' || !room || p.roomType === room) &&
    (skip === 'style' || !style || p.aestheticStyle === style) &&
    (skip === 'price' || !maxPrice || p.priceInPKR <= maxPrice)

  const products = useMemo(() => {
    const list = allProducts.filter((p) => matches(p))
    if (sort === 'price-asc') list.sort((a, b) => a.priceInPKR - b.priceInPKR)
    if (sort === 'price-desc') list.sort((a, b) => b.priceInPKR - a.priceInPKR)
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts, category, room, style, maxPrice, sort])

  // Each option shows how many results it would give with the other filters kept.
  const countFor = (skip, test) => allProducts.filter((p) => matches(p, skip) && test(p)).length

  const groups = [
    {
      key: 'category',
      title: 'Category',
      value: category,
      options: CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c), count: countFor('category', (p) => p.category === c) })).filter(
        (o) => o.count > 0 || o.value === category,
      ),
    },
    {
      key: 'room',
      title: 'Room',
      value: room,
      options: ROOMS.map((r) => ({ value: r, label: roomLabel(r), count: countFor('room', (p) => p.roomType === r) })),
    },
    {
      key: 'style',
      title: 'Style',
      value: style,
      options: STYLES.map((s) => ({ value: s, label: styleLabel(s), count: countFor('style', (p) => p.aestheticStyle === s) })),
    },
    {
      key: 'maxPrice',
      title: 'Price',
      value: maxPrice,
      options: PRICE_CAPS.map((cap) => ({ value: cap, label: `Under ${format(cap)}`, count: countFor('price', (p) => p.priceInPKR <= cap) })),
    },
  ]

  const chips = [
    category && category !== defaultCategory && { key: 'category', label: categoryLabel(category) },
    room && { key: 'room', label: roomLabel(room) },
    style && { key: 'style', label: styleLabel(style) },
    maxPrice && { key: 'maxPrice', label: `Under ${format(maxPrice)}` },
    search && { key: 'q', label: `“${search}”` },
  ].filter(Boolean)

  const clearAll = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  const filters = (
    <div>
      {groups.map((g) => (
        <FilterGroup key={g.key} title={g.title} options={g.options} value={g.value} onChange={(v) => setParam(g.key, v)} />
      ))}
    </div>
  )

  const title = pageTitle || (style ? `${styleLabel(style)} furniture` : room ? `${roomLabel(room)} furniture` : 'Shop all')

  return (
    <div className="pb-24">
      <div className="bg-sand">
      <div className="page pb-8 pt-10 sm:pt-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="display text-[2.4rem] sm:text-[3rem]">{title}</h1>
        <p className="mt-2 text-[17px] text-ink-2">
          {pageSubtitle || 'Furniture, lighting, rugs and finishes. Filter by room, style and budget.'}
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <FiSearch size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sofas, oak, rattan…"
            className="h-12 w-full rounded-full border border-line-strong/70 bg-white pl-11 pr-11 text-[15px] text-ink transition-colors placeholder:text-ink-3 hover:border-line-strong focus:border-ink focus:bg-canvas focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2"
            >
              <FiX size={16} />
            </button>
          )}
        </label>
        <div className="flex gap-3">
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <FiSliders size={16} /> Filters{chips.length ? ` (${chips.length})` : ''}
          </Button>
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-full border border-line-strong bg-canvas pl-5 pr-10 text-[15px] font-medium text-ink hover:border-ink focus:border-ink focus:outline-none sm:w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-2" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
        </div>
      </div>

      </div>
      </div>

      <div className="page">
      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          {filters}
        </aside>

        <section aria-live="polite" aria-busy={loading}>
          <div className="mb-6 flex min-h-[2rem] flex-wrap items-center gap-2">
            <p className="tabular mr-2 text-[15px] text-ink-2">
              {loading ? 'Loading products…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
            </p>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => (c.key === 'q' ? setQuery('') : setParam(c.key, null))}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface pl-3 pr-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                {c.label}
                <FiX size={14} aria-label="Remove filter" />
              </button>
            ))}
            {chips.length > 1 && (
              <button type="button" onClick={clearAll} className="ml-1 text-sm font-medium text-ink-2 underline underline-offset-4 hover:text-ink">
                Clear all
              </button>
            )}
          </div>

          {error ? (
            <div className="rounded-panel border border-line px-6 py-16 text-center">
              <p className="text-[17px] font-semibold text-ink">Products didn't load</p>
              <p className="mt-1.5 text-[15px] text-ink-2">{error}</p>
              <Button className="mt-6" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-panel bg-surface px-6 py-20 text-center">
              <p className="text-[17px] font-semibold text-ink">No products match these filters</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-ink-2">
                {search ? `Nothing found for “${search}”. Try a broader word like “chair” or “oak”.` : 'Remove a filter or two to see more.'}
              </p>
              <Button className="mt-6" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} eager={i < 6} />
              ))}
            </div>
          )}
        </section>
      </div>

      </div>
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        width={400}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={clearAll}>
              Clear all
            </Button>
            <Button className="flex-[2]" onClick={() => setFiltersOpen(false)}>
              Show {products.length} {products.length === 1 ? 'product' : 'products'}
            </Button>
          </div>
        }
      >
        <div className="px-5 py-5 sm:px-6">{filters}</div>
      </Sheet>
    </div>
  )
}
