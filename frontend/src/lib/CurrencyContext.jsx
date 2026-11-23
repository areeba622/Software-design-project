import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { formatPrice } from './money'

const STORAGE_KEY = 'palette_currency'
const CurrencyContext = createContext(null)

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'USD' || saved === 'PKR' ? saved : null
  } catch {
    return null
  }
}

/**
 * The currency prices are shown in (PKR or USD). Starts from the user's
 * registration preference; a choice made in the app is remembered.
 */
export function CurrencyProvider({ children }) {
  const { user } = useAuth()
  const [currency, setCurrencyState] = useState(() => readSaved() || user?.currencyPreference || 'PKR')

  // When someone logs in without having picked a currency here, use their profile preference.
  useEffect(() => {
    if (!readSaved() && user?.currencyPreference) setCurrencyState(user.currencyPreference)
  }, [user])

  const setCurrency = useCallback((next) => {
    setCurrencyState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const format = useCallback((pkr) => formatPrice(pkr, currency), [currency])

  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, setCurrency, format])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

/** @returns {{ currency: 'PKR'|'USD', setCurrency: Function, format: (pkr:number) => string }} */
// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used inside <CurrencyProvider>')
  return context
}
