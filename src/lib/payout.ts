import type { PetGrade, FrequencyTier, BottleSize, Currency } from '../types'

// ─── Grade definitions ────────────────────────────────────────────────────────
export const PET_GRADES: Record<PetGrade, {
  name: string
  description: string
  rateNGN: number
}> = {
  'grade-a': {
    name: 'Grade A Clear',
    description: 'Transparent water & soda bottles, caps removed',
    rateNGN: 320,
  },
  'grade-b': {
    name: 'Grade B Coloured',
    description: 'Green, amber, blue soft drink containers',
    rateNGN: 240,
  },
  'mixed': {
    name: 'Mixed / Crushed',
    description: 'Unsorted, pre-crushed or mixed colour volume',
    rateNGN: 190,
  },
  'factory-baled': {
    name: 'Factory Baled',
    description: 'High-density compressed bales (>500 kg)',
    rateNGN: 360,
  },
}

// ─── Frequency tiers ─────────────────────────────────────────────────────────
export const FREQUENCY_TIERS: Record<FrequencyTier, {
  name: string
  description: string
  bonus: number  // fractional bonus, e.g. 0.05 = 5%
}> = {
  standard: { name: 'Standard One-Time', description: 'Base spot rate — no commitment', bonus: 0 },
  'bi-weekly': { name: 'Bi-Weekly Pickup', description: '+5% loyalty surge for regular suppliers', bonus: 0.05 },
  enterprise: { name: 'Enterprise SLA', description: '+10% bulk contract — priority truck dispatch', bonus: 0.10 },
}

// ─── Bottle specs ─────────────────────────────────────────────────────────────
export const BOTTLE_SPECS: Record<BottleSize, {
  label: string
  avgGrams: number
  bottlesPerKg: number
}> = {
  '500ml': { label: 'Standard 500ml', avgGrams: 25, bottlesPerKg: 40 },
  '1500ml': { label: 'Large 1.5L', avgGrams: 38, bottlesPerKg: 26 },
  '330ml': { label: 'Commercial 330ml', avgGrams: 20, bottlesPerKg: 50 },
}

// ─── Payout calculation ──────────────────────────────────────────────────────
export function calculatePayout(
  grade: PetGrade,
  volumeKg: number,
  tier: FrequencyTier,
  _currency: Currency = 'NGN'
): {
  grossNGN: number
  estimatedBottles: number
  co2Saved: number
} {
  const rateNGN = PET_GRADES[grade].rateNGN
  const bonus = FREQUENCY_TIERS[tier].bonus
  const base = volumeKg * rateNGN
  const grossNGN = Math.round(base * (1 + bonus))
  const estimatedBottles = Math.round(volumeKg * 25)   // ~40g avg
  const co2Saved = parseFloat((volumeKg * 1.5 / 1000).toFixed(2)) // tonnes

  return { grossNGN, estimatedBottles, co2Saved }
}

// ─── Weighbridge batch computation ──────────────────────────────────────────
export function computeWeighbridgeBatch(
  grossKg: number,
  tareKg: number,
  moistureRatio: number,  // 0–1
  grade: PetGrade,
  bottleSize: BottleSize,
  _currency: Currency = 'NGN'
): {
  rawNetKg: number
  cleanNetKg: number
  bottles: number
  payoutNGN: number
} {
  const rawNetKg = Math.max(0, grossKg - tareKg)
  const cleanNetKg = parseFloat((rawNetKg * (1 - moistureRatio)).toFixed(1))
  const bottles = Math.round(cleanNetKg * BOTTLE_SPECS[bottleSize].bottlesPerKg)
  const payoutNGN = Math.round(cleanNetKg * PET_GRADES[grade].rateNGN)

  return { rawNetKg, cleanNetKg, bottles, payoutNGN }
}
