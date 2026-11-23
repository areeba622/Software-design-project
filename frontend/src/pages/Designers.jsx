import { useEffect, useMemo, useState } from 'react'
import { FiCopy, FiExternalLink, FiMail } from 'react-icons/fi'
import { designersApi } from '../api'
import { useCurrency } from '../lib/CurrencyContext'
import { STYLES, styleLabel } from '../lib/labels'
import Button from '../components/ui/Button'
import Sheet from '../components/ui/Sheet'

const BUDGETS = [
  { value: 'LOW', label: 'Under PKR 40,000', test: (r) => r < 40000 },
  { value: 'MID', label: 'PKR 40,000 to 70,000', test: (r) => r >= 40000 && r <= 70000 },
  { value: 'HIGH', label: 'Over PKR 70,000', test: (r) => r > 70000 },
]

const STYLE_TONE = { MINIMALIST: "bg-surface-2 text-ink", SCANDINAVIAN: "bg-sage-soft text-sage", BOHEMIAN: "bg-accent-soft text-accent" }
const toneFor = (style) => STYLE_TONE[(style || "").toUpperCase()] || "bg-surface text-ink"

const initials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-16 shrink-0 text-sm font-medium text-ink-2">{label}</span>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ value: null, label: 'Any' }, ...options].map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
              value === o.value ? 'bg-accent text-white' : "bg-white text-ink hover:bg-white/70"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
      <FiCopy size={14} /> {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function DesignersPage() {
  const { format } = useCurrency()
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState(null)
  const [budget, setBudget] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    designersApi
      .list({ signal: controller.signal })
      .then((data) => setDesigners(data || []))
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => !controller.signal.aborted && setLoading(false))
    return () => controller.abort()
  }, [])

  const filtered = useMemo(
    () =>
      designers.filter((d) => {
        const dStyle = (d.preferredStyleName || '').toUpperCase()
        const styleOk = !style || dStyle === style
        const budgetOk = !budget || BUDGETS.find((b) => b.value === budget).test(d.hourlyRatePKR || 0)
        return styleOk && budgetOk
      }),
    [designers, style, budget],
  )

  return (
    <div className="pb-24">
      <div className="bg-sand">
      <div className="page pb-8 pt-10 sm:pt-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="display text-[2.4rem] sm:text-[3rem]">Designers</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-2">
          Each designer works in one of Palette's three styles and charges by the hour. Contact them directly to plan a consultation.
        </p>
      </header>

      <div className="space-y-3 border-t border-line-strong/60 pt-6">
        <Segmented label="Style" options={STYLES.map((s) => ({ value: s, label: styleLabel(s) }))} value={style} onChange={setStyle} />
        <Segmented label="Rate" options={BUDGETS.map(({ value, label }) => ({ value, label: `${label} /hr` }))} value={budget} onChange={setBudget} />
      </div>
      </div>
      </div>

      <div className="page pt-10">

      {error ? (
        <div role="alert" className="rounded-panel bg-danger-soft px-6 py-5 text-[15px] text-danger">
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-panel bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-panel bg-surface px-6 py-16 text-center">
          <p className="text-[17px] font-semibold text-ink">No designers match both filters</p>
          <p className="mt-1.5 text-[15px] text-ink-2">Try any style, or a different rate.</p>
          <Button
            className="mt-6"
            onClick={() => {
              setStyle(null)
              setBudget(null)
            }}
          >
            Show all designers
          </Button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelected(d)}
                className="flex h-full w-full flex-col rounded-panel border border-line p-6 text-left transition-colors hover:border-line-strong hover:bg-surface/50"
              >
                <div className="flex items-center gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-medium ${toneFor(d.preferredStyleName)}`}>
                    {initials(d.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] font-semibold text-ink">{d.name}</span>
                    <span className="block truncate text-sm text-ink-2">{d.specialty}</span>
                  </span>
                </div>
                <p className="mt-5 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-2">{d.bio}</p>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${toneFor(d.preferredStyleName)}`}>{styleLabel(d.preferredStyleName)}</span>
                  <span className="tabular text-[15px] font-semibold text-ink">
                    {format(d.hourlyRatePKR)}
                    <span className="font-normal text-ink-3"> /hr</span>
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      </div>
      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Designer'} width={460}>
        {selected && (
          <div className="px-6 py-7">
            <div className="flex items-center gap-4">
              <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl font-medium ${toneFor(selected.preferredStyleName)}`}>
                {initials(selected.name)}
              </span>
              <div>
                <p className="text-[19px] font-semibold text-ink">{selected.name}</p>
                <p className="text-[15px] text-ink-2">{selected.specialty}</p>
              </div>
            </div>
            <p className="mt-6 text-[16px] leading-relaxed text-ink">{selected.bio}</p>
            <dl className="mt-7 divide-y divide-line border-y border-line text-[15px]">
              <div className="flex justify-between py-3.5">
                <dt className="text-ink-2">Style</dt>
                <dd className="font-medium text-ink">{styleLabel(selected.preferredStyleName)}</dd>
              </div>
              <div className="flex justify-between py-3.5">
                <dt className="text-ink-2">Hourly rate</dt>
                <dd className="tabular font-medium text-ink">{format(selected.hourlyRatePKR)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-2">Email</dt>
                <dd className="flex min-w-0 items-center gap-3">
                  <span className="select-all truncate font-medium text-ink">{selected.email}</span>
                  <CopyEmail email={selected.email} />
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3">
              <Button size="lg" block onClick={() => (window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent('Design consultation through Palette')}`)}>
                <FiMail size={17} /> Email {selected.name.split(' ')[0]}
              </Button>
              {selected.portfolioUrl && (
                <a
                  href={selected.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong text-[15px] font-semibold text-ink transition-colors hover:border-ink"
                >
                  <FiExternalLink size={16} /> View portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
