import { createContext, useContext, useState, useEffect } from 'react'
import type { Currency } from '../types'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('NGN')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rizzl3r_currency') as Currency
      if (saved === 'NGN' || saved === 'USD' || saved === 'GBP') setCurrencyState(saved)
    } catch { /* ignore */ }
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    try { localStorage.setItem('rizzl3r_currency', c) } catch { /* ignore */ }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
