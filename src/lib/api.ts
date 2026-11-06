import type { Dispatch, Delivery, Totalizer, AuthSession, PetGrade, BottleSize } from '../types'
import { supabase, isSupabaseConfigured } from './supabase'

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  DISPATCHES: 'rizzl3r_dispatches_v2',
  DELIVERIES: 'rizzl3r_deliveries_v2',
  TOTALIZER: 'rizzl3r_totalizer_v2',
  AUTH: 'rizzl3r_auth_v2',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch { return fallback }
}

function write<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota exceeded */ }
}

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_DISPATCHES: Dispatch[] = [
  {
    id: 'DSP-1092',
    customerName: 'Landmark Grand Hospitality',
    phone: '09069935434',
    email: 'operations@landmarkgrand.ng',
    address: 'Plot 3 & 4 Water Corporation Road, Victoria Island, Lagos',
    volumeRange: '1,000 – 5,000 kg (Bulk – Industrial)',
    targetDate: '2024-10-25',
    grade: 'grade-a',
    notes: 'Large banquet haul. Transparent clear PET only. Gate security pass required.',
    status: 'Pending',
    createdAt: '2024-10-24T13:45:00Z',
  },
  {
    id: 'DSP-1091',
    customerName: 'Lekki Phase 1 Estate Residents Association',
    phone: '08023456789',
    email: 'environment@lekki-phase1.org',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    volumeRange: '5,000+ kg (Enterprise – Factory Baled)',
    targetDate: '2024-10-25',
    grade: 'grade-a',
    notes: 'Community curbside bins collected across 12 zones.',
    status: 'Assigned',
    createdAt: '2024-10-24T11:20:00Z',
  },
  {
    id: 'DSP-1090',
    customerName: 'Eko Atlantic Coast Cleanup Force',
    phone: '08133445566',
    email: 'dispatch@eko-cleanup.org',
    address: 'Eko Atlantic Boulevard, Victoria Island, Lagos',
    volumeRange: '1,000 – 5,000 kg (Bulk – Industrial)',
    targetDate: '2024-10-24',
    grade: 'mixed',
    notes: 'Beach reclamation sacks. High moisture deduction expected.',
    status: 'En Route',
    createdAt: '2024-10-24T08:15:00Z',
  },
  {
    id: 'DSP-1089',
    customerName: 'Ikeja University Eco-Campus Network',
    phone: '08055667788',
    email: 'green@ikeja-campus.edu.ng',
    address: 'University Road, Ikeja, Lagos',
    volumeRange: '250 – 1,000 kg (Large – Hotel / Corporate)',
    targetDate: '2024-10-24',
    grade: 'grade-a',
    notes: 'Campus drive volume. Student welfare scholarship account credited.',
    status: 'Completed',
    createdAt: '2024-10-23T15:30:00Z',
  },
  {
    id: 'DSP-1088',
    customerName: 'Silverbird Galleria & Lounges',
    phone: '07033221100',
    email: 'facility@silverbird.ng',
    address: '133 Ahmadu Bello Way, Victoria Island, Lagos',
    volumeRange: '250 – 1,000 kg (Large – Hotel / Corporate)',
    targetDate: '2024-10-23',
    grade: 'grade-b',
    notes: 'Multiplex beverage plastic, mostly amber and green soft drinks.',
    status: 'Completed',
    createdAt: '2024-10-23T09:10:00Z',
  },
]

const SEED_DELIVERIES: Delivery[] = [
  { id: '1', batchId: '#RZ-8842', supplier: 'Grand Palms Hotel & Suites', grade: 'Grade A Clear', grossKg: 3450, netKg: 650, payoutNGN: 208000, purity: 99.4, bottleSize: '500ml', timestamp: '14:22 WAT' },
  { id: '2', batchId: '#RZ-8841', supplier: 'Lekki Phase 1 Residential Fleet', grade: 'Grade B Coloured', grossKg: 2156, netKg: 336, payoutNGN: 80640, purity: 98.1, bottleSize: '500ml', timestamp: '13:58 WAT' },
  { id: '3', batchId: '#RZ-8839', supplier: 'Eko Atlantic Coast Cleanup Force', grade: 'Mixed / Crushed', grossKg: 4672, netKg: 1272, payoutNGN: 241680, purity: 96.3, bottleSize: '1500ml', timestamp: '11:15 WAT' },
  { id: '4', batchId: '#RZ-8837', supplier: 'Ikeja University Eco-Campus', grade: 'Grade A Clear', grossKg: 1980, netKg: 480, payoutNGN: 153600, purity: 99.1, bottleSize: '500ml', timestamp: '09:44 WAT' },
  { id: '5', batchId: '#RZ-8835', supplier: 'Marina Bay Commercial Towers', grade: 'Grade A Clear', grossKg: 2940, netKg: 520, payoutNGN: 166400, purity: 99.6, bottleSize: '330ml', timestamp: '08:20 WAT' },
  { id: '6', batchId: '#RZ-8832', supplier: 'Obalende Community Micro-Sorters', grade: 'Grade B Coloured', grossKg: 850, netKg: 270, payoutNGN: 64800, purity: 97.8, bottleSize: '500ml', timestamp: '07:15 WAT' },
]

const SEED_TOTALIZER: Totalizer = {
  grossKg: 24650,
  tareDeductedKg: 16856,
  netPETKg: 7794,
  totalBottles: 194850,
  dailyTarget: 250000,
  dailyPayoutNGN: 2514800,
}

// Auto-seed on first load
function ensureSeeded() {
  if (!localStorage.getItem(KEYS.DISPATCHES)) write(KEYS.DISPATCHES, SEED_DISPATCHES)
  if (!localStorage.getItem(KEYS.DELIVERIES)) write(KEYS.DELIVERIES, SEED_DELIVERIES)
  if (!localStorage.getItem(KEYS.TOTALIZER)) write(KEYS.TOTALIZER, SEED_TOTALIZER)
}

// ─── Dispatches ──────────────────────────────────────────────────────────────
export async function getDispatches(): Promise<Dispatch[]> {
  let supaDispatches: Dispatch[] = []

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dispatches')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        supaDispatches = data.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name,
          phone: row.phone,
          email: row.email,
          address: row.address,
          volumeRange: row.volume_range,
          targetDate: row.target_date,
          notes: row.notes,
          grade: row.grade,
          status: row.status,
          createdAt: row.created_at,
        }))
      } else if (error) {
        console.warn('Supabase fetch error:', error)
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local:', e)
    }
  }

  ensureSeeded()
  const localList = read<Dispatch[]>(KEYS.DISPATCHES, SEED_DISPATCHES)

  if (supaDispatches.length > 0) {
    const supaIds = new Set(supaDispatches.map(d => d.id))
    const extraLocal = localList.filter(d => !supaIds.has(d.id))
    return [...supaDispatches, ...extraLocal]
  }

  return localList
}

export async function createDispatch(input: {
  customerName: string; phone: string; email: string; address: string
  volumeRange: string; targetDate: string; notes?: string; grade: PetGrade
}): Promise<Dispatch> {
  const id = `DSP-${1000 + Math.floor(Math.random() * 9000)}`
  const now = new Date().toISOString()
  const dispatch: Dispatch = { ...input, id, status: 'Pending', createdAt: now }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('dispatches').insert([{
        id,
        customer_name: input.customerName,
        phone: input.phone,
        email: input.email || null,
        address: input.address,
        volume_range: input.volumeRange,
        target_date: input.targetDate,
        notes: input.notes || null,
        grade: input.grade || 'mixed',
        status: 'Pending',
        created_at: now
      }])
      if (error) {
        console.error('Supabase dispatch insert error:', error)
      } else {
        console.log('Successfully saved dispatch to Supabase:', id)
      }
    } catch (e) {
      console.warn('Supabase insert failed, stored in localStorage:', e)
    }
  }

  ensureSeeded()
  const list = read<Dispatch[]>(KEYS.DISPATCHES, SEED_DISPATCHES)
  write(KEYS.DISPATCHES, [dispatch, ...list.filter(d => d.id !== id)])
  return dispatch
}

export async function updateDispatchStatus(id: string, status: Dispatch['status']): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('dispatches').update({ status }).eq('id', id)
      if (error) console.error('Supabase update status error:', error)
    } catch (e) {
      console.warn('Supabase update failed:', e)
    }
  }

  const list = await getDispatches()
  const updated = list.map(d => d.id === id ? { ...d, status } : d)
  write(KEYS.DISPATCHES, updated)
}

// ─── Deliveries ──────────────────────────────────────────────────────────────
export async function getDeliveries(): Promise<Delivery[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          batchId: row.batch_id,
          supplier: row.supplier,
          grade: row.grade,
          grossKg: Number(row.gross_kg),
          netKg: Number(row.net_kg),
          payoutNGN: Number(row.payout_ngn),
          purity: Number(row.purity),
          bottleSize: row.bottle_size as BottleSize,
          timestamp: row.timestamp,
        }))
      }
    } catch (e) {
      console.warn('Supabase deliveries fetch failed, falling back to local:', e)
    }
  }

  ensureSeeded()
  return read<Delivery[]>(KEYS.DELIVERIES, SEED_DELIVERIES)
}

export async function logDelivery(input: {
  grossKg: number; netKg: number; grade: string; payoutNGN: number
  purity: number; bottleSize: BottleSize; supplier: string
}): Promise<Delivery> {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WAT`
  const id = String(Date.now())
  const batchId = `#RZ-${9000 + Math.floor(Math.random() * 999)}`

  const delivery: Delivery = {
    ...input,
    id,
    batchId,
    timestamp: timeStr,
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('deliveries').insert([{
        id,
        batch_id: batchId,
        supplier: input.supplier,
        grade: input.grade,
        gross_kg: input.grossKg,
        net_kg: input.netKg,
        payout_ngn: input.payoutNGN,
        purity: input.purity,
        bottle_size: input.bottleSize,
        timestamp: timeStr,
        created_at: now.toISOString()
      }])
    } catch (e) {
      console.warn('Supabase delivery insert failed:', e)
    }
  }

  ensureSeeded()
  const list = read<Delivery[]>(KEYS.DELIVERIES, SEED_DELIVERIES)
  const updated = [delivery, ...list]
  write(KEYS.DELIVERIES, updated)

  // Update totalizer
  const tot = await getTotalizer()
  const bottles = Math.round(input.netKg * 25)
  const newTot: Totalizer = {
    ...tot,
    grossKg: tot.grossKg + input.grossKg,
    netPETKg: tot.netPETKg + input.netKg,
    totalBottles: tot.totalBottles + bottles,
    dailyPayoutNGN: tot.dailyPayoutNGN + input.payoutNGN,
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('totalizer').update({
        gross_kg: newTot.grossKg,
        net_pet_kg: newTot.netPETKg,
        total_bottles: newTot.totalBottles,
        daily_payout_ngn: newTot.dailyPayoutNGN,
        updated_at: new Date().toISOString()
      }).eq('id', 1)
    } catch (e) {
      console.warn('Supabase totalizer update failed:', e)
    }
  }

  write(KEYS.TOTALIZER, newTot)
  return delivery
}

// ─── Totalizer ───────────────────────────────────────────────────────────────
export async function getTotalizer(): Promise<Totalizer> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('totalizer').select('*').eq('id', 1).single()
      if (!error && data) {
        return {
          grossKg: Number(data.gross_kg),
          tareDeductedKg: Number(data.tare_deducted_kg),
          netPETKg: Number(data.net_pet_kg),
          totalBottles: Number(data.total_bottles),
          dailyTarget: Number(data.daily_target),
          dailyPayoutNGN: Number(data.daily_payout_ngn),
        }
      }
    } catch (e) {
      console.warn('Supabase totalizer fetch failed:', e)
    }
  }

  ensureSeeded()
  return read<Totalizer>(KEYS.TOTALIZER, SEED_TOTALIZER)
}

// ─── Auth ────────────────────────────────────────────────────────────────────
const DEMO_EMAIL = 'Sixtus7498@gmail.com'
const DEMO_PASS = 'Sixtus55!!'

export function login(email: string, pass: string): boolean {
  if (email.toLowerCase() === DEMO_EMAIL.toLowerCase() && pass === DEMO_PASS) {
    const session: AuthSession = { email, token: `tok_${Date.now()}`, loggedAt: new Date().toISOString() }
    write(KEYS.AUTH, session)
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(KEYS.AUTH)
}

export function getAuthSession(): AuthSession | null {
  return read<AuthSession | null>(KEYS.AUTH, null)
}
