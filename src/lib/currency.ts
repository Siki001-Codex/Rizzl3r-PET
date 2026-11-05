import type { Currency } from '../types'

const FX_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1500,
  GBP: 1 / 1900,
}

const SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
}

export function convertFromNGN(amountNGN: number, to: Currency): number {
  return amountNGN * FX_RATES[to]
}

export function formatMoney(amountNGN: number, currency: Currency): string {
  const converted = convertFromNGN(amountNGN, currency)
  const symbol = SYMBOLS[currency]

  if (currency === 'NGN') {
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(2)}M`
    if (converted >= 1_000) return `${symbol}${converted.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
    return `${symbol}${converted.toFixed(0)}`
  }

  // USD / GBP
  return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPerKg(rateNGN: number, currency: Currency): string {
  const converted = convertFromNGN(rateNGN, currency)
  const symbol = SYMBOLS[currency]
  if (currency === 'NGN') return `${symbol}${converted.toFixed(0)}/kg`
  return `${symbol}${converted.toFixed(2)}/kg`
}
