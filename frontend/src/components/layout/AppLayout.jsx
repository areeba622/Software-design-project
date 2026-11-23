import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PageLoader from '../PageLoader'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import CartDrawer from '../CartDrawer'
import CartNotice from '../CartNotice'

/** Header, page, footer. Pages scroll back to the top when the path changes. */
export default function AppLayout({ footer = true }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {footer && <SiteFooter />}
      <CartDrawer />
      <CartNotice />
    </div>
  )
}
