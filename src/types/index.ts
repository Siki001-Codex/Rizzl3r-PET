// ─── Currency ───────────────────────────────────────────────────────────────
export type Currency = 'NGN' | 'USD' | 'GBP'

// ─── PET Grades ─────────────────────────────────────────────────────────────
export type PetGrade = 'grade-a' | 'grade-b' | 'mixed' | 'factory-baled'

// ─── Frequency Tiers ─────────────────────────────────────────────────────────
export type FrequencyTier = 'standard' | 'bi-weekly' | 'enterprise'

// ─── Bottle Sizes ────────────────────────────────────────────────────────────
export type BottleSize = '500ml' | '1500ml' | '330ml'

// ─── Dispatch (booking form submission) ──────────────────────────────────────
export interface Dispatch {
  id: string
  customerName: string
  phone: string
  email: string
  address: string
  volumeRange: string
  targetDate: string
  notes?: string
  grade: PetGrade
  status: 'Pending' | 'Assigned' | 'En Route' | 'Completed' | 'Cancelled'
  createdAt: string
}

// ─── Weighbridge Delivery ────────────────────────────────────────────────────
export interface Delivery {
  id: string
  batchId: string
  supplier: string
  grade: string
  grossKg: number
  netKg: number
  payoutNGN: number
  purity: number
  bottleSize: BottleSize
  timestamp: string
}

// ─── Totalizer snapshot ──────────────────────────────────────────────────────
export interface Totalizer {
  grossKg: number
  tareDeductedKg: number
  netPETKg: number
  totalBottles: number
  dailyTarget: number
  dailyPayoutNGN: number
}

// ─── Hourly inflow data point ────────────────────────────────────────────────
export interface HourlyDataPoint {
  hour: string
  bottles: number
}

// ─── Auth session ────────────────────────────────────────────────────────────
export interface AuthSession {
  email: string
  token: string
  loggedAt: string
}
