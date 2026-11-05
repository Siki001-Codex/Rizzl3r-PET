import type { HourlyDataPoint, Totalizer } from '../types'

export const MOCK_HOURLY_VELOCITY: HourlyDataPoint[] = [
  { hour: '06h', bottles: 4200 },
  { hour: '07h', bottles: 8600 },
  { hour: '08h', bottles: 14100 },
  { hour: '09h', bottles: 19500 },
  { hour: '10h', bottles: 22800 },
  { hour: '11h', bottles: 28400 },
  { hour: '12h', bottles: 15200 },
  { hour: '13h', bottles: 12000 },
  { hour: '14h', bottles: 26600 },
  { hour: '15h', bottles: 18200 },
  { hour: '16h', bottles: 11600 },
  { hour: '17h', bottles: 8000 },
]

export const MOCK_TOTALIZER: Totalizer = {
  grossKg: 24650,
  tareDeductedKg: 16856,
  netPETKg: 7794,
  totalBottles: 194850,
  dailyTarget: 250000,
  dailyPayoutNGN: 2514800,
}
