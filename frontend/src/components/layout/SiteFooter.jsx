import { Link } from 'react-router-dom'
import { PKR_PER_USD } from '../../lib/money'
import Logo from './Logo'

const COLUMNS = [
  {
    title: 'Shop by room',
    links: [
      { to: '/catalog?room=LIVING_ROOM', label: 'Living room' },
      { to: '/catalog?room=BEDROOM', label: 'Bedroom' },
      { to: '/catalog?room=DINING_ROOM', label: 'Dining room' },
      { to: '/catalog?room=KITCHEN', label: 'Kitchen' },
      { to: '/catalog?room=OFFICE', label: 'Home office' },
    ],
  },
  {
    title: 'Plan your space',
    links: [
      { to: '/room-builder', label: 'Room planner' },
      { to: '/quiz', label: 'Style quiz' },
      { to: '/designers', label: 'Hire a designer' },
      { to: '/flooring-wallpaper', label: 'Flooring and wallpaper' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { to: '/dashboard', label: 'Overview' },
      { to: '/orders', label: 'Orders' },
      { to: '/register', label: 'Create account' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-cocoa text-white">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            Furniture, finishes and design help for homes in Pakistan, picked by room and by style.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[15px] text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="page flex flex-col gap-2 border-t border-white/10 py-6 text-[13px] text-white/55 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Palette. A university software design project.</p>
        <p className="tabular">Prices are set in PKR. USD is shown at PKR {PKR_PER_USD} to $1.</p>
      </div>
    </footer>
  )
}
