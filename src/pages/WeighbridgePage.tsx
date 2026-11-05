import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { logDelivery, getDeliveries, getTotalizer, logout } from '../lib/api'
import { computeWeighbridgeBatch, BOTTLE_SPECS, PET_GRADES } from '../lib/payout'
import { formatMoney } from '../lib/currency'
import { useCurrency } from '../context/CurrencyContext'
import { Badge, Icon } from '../components/ui'
import { MOCK_TOTALIZER } from '../data/mockData'
import type { PetGrade, Delivery, BottleSize } from '../types'

type SimState = 'idle' | 'ramping' | 'settled'

export default function WeighbridgePage() {
  const navigate = useNavigate()
  const { currency } = useCurrency()

  const [grossKg, setGrossKg]         = useState(3450)
  const [tareKg, setTareKg]           = useState(1620)
  const [moisturePct, setMoisturePct] = useState(2.5)
  const [grade, setGrade]             = useState<PetGrade>('grade-a')
  const [bottleSize, setBottleSize]   = useState<BottleSize>('500ml')
  const [simState, setSimState]       = useState<SimState>('idle')
  const [driftActive, setDriftActive] = useState(false)
  const [streamPaused, setStreamPaused] = useState(false)
  const [telemetry, setTelemetry]     = useState({ hz: 60, snr: 42.1, latency: 2.3 })
  const [deliveries, setDeliveries]   = useState<Delivery[]>([])
  const [totalizer, setTotalizer]     = useState(MOCK_TOTALIZER)
  const [logStatus, setLogStatus]     = useState<'idle' | 'success' | 'error'>('idle')

  const driftRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const telRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function loadData() {
      const [dels, tot] = await Promise.all([getDeliveries(), getTotalizer()])
      setDeliveries(dels)
      setTotalizer(tot)
    }
    loadData()
  }, [])

  // Telemetry ticker
  useEffect(() => {
    if (!streamPaused) {
      telRef.current = setInterval(() => setTelemetry({ hz: 58 + Math.random() * 4, snr: 40 + Math.random() * 5, latency: 1.8 + Math.random() * 1.4 }), 950)
    }
    return () => { if (telRef.current) clearInterval(telRef.current) }
  }, [streamPaused])

  // Drift effect
  useEffect(() => {
    if (driftActive) driftRef.current = setInterval(() => setGrossKg(g => parseFloat((g + (Math.random() * 2 - 1) * 0.9).toFixed(1))), 950)
    else if (driftRef.current) clearInterval(driftRef.current)
    return () => { if (driftRef.current) clearInterval(driftRef.current) }
  }, [driftActive])

  const simulateTruckArrival = useCallback(() => {
    if (simState === 'ramping') return
    setSimState('ramping'); setDriftActive(false)
    const target = 4250, duration = 2400, start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setGrossKg(parseFloat((target * (1 - Math.pow(1 - t, 3))).toFixed(1)))
      if (t < 1) requestAnimationFrame(animate)
      else { setSimState('settled'); setDriftActive(true) }
    }
    requestAnimationFrame(animate)
  }, [simState])

  const triggerTareAutoBalance = () => setTareKg(parseFloat(grossKg.toFixed(1)))

  const batch = computeWeighbridgeBatch(grossKg, tareKg, moisturePct / 100, grade, bottleSize, currency)
  const rawNet = Math.max(0, grossKg - tareKg)
  const progress = Math.min((totalizer.totalBottles / totalizer.dailyTarget) * 100, 100)

  const handleLogBatch = async () => {
    if (batch.cleanNetKg <= 0) { setLogStatus('error'); return }
    try {
      const d = await logDelivery({ grossKg: parseFloat(grossKg.toFixed(1)), netKg: batch.cleanNetKg, grade: PET_GRADES[grade].name, payoutNGN: batch.payoutNGN, purity: parseFloat((99 - moisturePct * 0.5).toFixed(1)), bottleSize, supplier: 'Walk-in Supplier' })
      setDeliveries(prev => [d, ...prev])
      const updatedTot = await getTotalizer()
      setTotalizer(updatedTot)
      setLogStatus('success')
      setTimeout(() => setLogStatus('idle'), 3000)
    } catch { setLogStatus('error') }
  }

  const ScaleInput = ({ label, value, onChange, highlight }: { label: string; value: number; onChange: (v: number) => void; highlight?: boolean }) => (
    <div>
      <label className="text-white/50 text-xs block mb-2">{label}</label>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} step="0.1" min="0"
          className={`w-full border ${highlight ? 'border-[#9BE564]/40' : 'border-white/15'} rounded-xl px-4 py-3 text-2xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50 pr-10`}
          style={{ background: highlight ? 'rgba(155,229,100,0.05)' : 'rgba(13,36,21,0.6)', color: highlight ? '#9BE564' : 'rgba(255,255,255,0.7)' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">kg</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#010f05' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center gap-4" style={{ background: 'rgba(1,15,5,0.95)', backdropFilter: 'blur(12px)' }}>
        <Link to="/admin" className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg border border-white/5 hover:border-white/15 bg-white/5" title="Back to Admin Dashboard">
          <Icon name="arrow_back" size={16} />
        </Link>
        <Link to="/" className="text-white/40 hover:text-[#9BE564] transition-colors p-1.5 rounded-lg border border-white/5 hover:border-white/15 bg-white/5 flex items-center gap-1.5 text-xs font-medium" title="Back to Website Home">
          <Icon name="home" size={15} />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">Live Scale · Weighbridge Computer</h1>
          <p className="text-white/40 text-xs">Lagos Central Bay #1</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span className={`flex items-center gap-1 ${streamPaused ? 'text-amber-400' : 'text-[#9BE564]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${streamPaused ? 'bg-amber-400' : 'bg-[#9BE564] animate-pulse'}`} />
            {streamPaused ? 'PAUSED' : 'LIVE'}
          </span>
          <span className="hidden sm:inline">Hz: {telemetry.hz.toFixed(1)}</span>
          <span className="hidden sm:inline">SNR: {telemetry.snr.toFixed(1)} dB</span>
          <span className="hidden sm:inline">Lat: {telemetry.latency.toFixed(1)} ms</span>
          <button onClick={() => { logout(); navigate('/admin/login') }} className="text-white/30 hover:text-red-400 transition-colors ml-2" aria-label="Sign out">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </header>

      {/* Simulation controls */}
      <div className="border-b border-white/10 px-4 sm:px-8 py-3 flex flex-wrap gap-2 items-center" style={{ background: 'rgba(8,31,16,0.5)' }}>
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider mr-1">Sim:</span>
        {[
          { label: simState === 'ramping' ? 'Truck Arriving…' : 'Truck Ramp (0→4,250 kg)', icon: 'local_shipping', onClick: simulateTruckArrival, active: simState !== 'idle', disabled: simState === 'ramping' },
          { label: `Strain Drift ${driftActive ? '(Active)' : '(Off)'}`, icon: 'vibration', onClick: () => setDriftActive(d => !d), active: driftActive, disabled: false },
          { label: 'Tare Auto-Balance', icon: 'balance', onClick: triggerTareAutoBalance, active: false, disabled: false },
          { label: streamPaused ? 'Resume Stream' : 'Pause Stream', icon: streamPaused ? 'play_arrow' : 'pause', onClick: () => setStreamPaused(p => !p), active: streamPaused, disabled: false },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50
              ${btn.active ? 'bg-[#9BE564]/15 border-[#9BE564]/30 text-[#9BE564]' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}>
            <Icon name={btn.icon} size={13} /> {btn.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-3 gap-6">
        {/* ── LEFT: inputs + results ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scale inputs */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-5">Digital Scale Weigh-In</div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <ScaleInput label="Gross Weight (kg)" value={grossKg} onChange={setGrossKg} highlight />
              <ScaleInput label="Tare Weight (kg)"  value={tareKg}  onChange={setTareKg} />
              <div>
                <label className="text-white/50 text-xs block mb-2">Raw Net (kg)</label>
                <div className="border border-white/5 rounded-xl px-4 py-3 text-2xl font-mono text-white" style={{ background: 'rgba(13,36,21,0.4)' }}>
                  {rawNet.toFixed(1)}<span className="text-xs text-white/30 ml-1">kg</span>
                </div>
              </div>
            </div>

            {/* Moisture */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/50 text-xs">Moisture / Contamination Deduction</label>
                <span className="text-[#9BE564] text-sm font-bold">{moisturePct.toFixed(1)}%</span>
              </div>
              <input type="range" min={0} max={10} step={0.1} value={moisturePct} onChange={e => setMoisturePct(Number(e.target.value))}
                className="w-full accent-[#9BE564] h-2 rounded-full" />
              <div className="flex justify-between text-white/20 text-xs mt-1"><span>0%</span><span>10%</span></div>
            </div>

            {/* Bottle size + grade */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs block mb-2">Bottle Size</label>
                <div className="flex gap-2">
                  {(Object.entries(BOTTLE_SPECS) as [BottleSize, typeof BOTTLE_SPECS[BottleSize]][]).map(([k, s]) => (
                    <button key={k} onClick={() => setBottleSize(k)} aria-pressed={bottleSize === k}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${bottleSize === k ? 'border-[#9BE564]/60 text-[#9BE564]' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                      style={bottleSize === k ? { background: 'rgba(155,229,100,0.12)' } : {}}>
                      {k}<br/><span className="font-normal opacity-70">{s.avgGrams}g</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-2">PET Grade</label>
                <select value={grade} onChange={e => setGrade(e.target.value as PetGrade)}
                  className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                  style={{ background: 'rgba(13,36,21,0.6)' }}>
                  {(Object.entries(PET_GRADES) as [PetGrade, typeof PET_GRADES[PetGrade]][]).map(([k, g]) => (
                    <option key={k} value={k}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Computed results */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-5">Computed Output</div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Clean Net Weight',   value: `${batch.cleanNetKg.toFixed(1)}`, unit: 'kg',      sub: `After ${moisturePct}% deduction` },
                { label: 'Computed Bottles',   value: batch.bottles.toLocaleString(),   unit: 'btls',    sub: `${BOTTLE_SPECS[bottleSize].avgGrams}g avg` },
                { label: 'Payout',             value: formatMoney(batch.payoutNGN, currency), unit: '', sub: PET_GRADES[grade].name },
              ].map(c => (
                <div key={c.label} className="rounded-2xl p-4" style={{ background: 'rgba(155,229,100,0.08)', border: '1px solid rgba(155,229,100,0.2)' }}>
                  <div className="text-white/50 text-xs mb-1">{c.label}</div>
                  <div className="text-[#9BE564] text-2xl font-bold font-mono">{c.value}<span className="text-sm font-normal ml-1">{c.unit}</span></div>
                  <div className="text-white/30 text-xs mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            <button onClick={handleLogBatch} disabled={batch.cleanNetKg <= 0}
              className="w-full py-4 rounded-xl font-bold text-[#021709] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: '#9BE564' }}>
              <Icon name="add_circle" size={18} /> Capture Scale Weight &amp; Log Batch
            </button>

            <AnimatePresence>
              {logStatus === 'success' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 rounded-xl px-4 py-3 text-[#9BE564] text-sm flex items-center gap-2 border border-[#9BE564]/25" style={{ background: 'rgba(155,229,100,0.08)' }} role="status">
                  <Icon name="check_circle" size={16} /> Batch logged · Delivery table updated · Totalizer incremented
                </motion.div>
              )}
              {logStatus === 'error' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 rounded-xl px-4 py-3 text-red-400 text-sm border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }} role="alert">
                  Error: Net weight must be positive. Check gross/tare values.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick spot */}
          <SpotComputer currency={currency} grade={grade} bottleSize={bottleSize} />

          {/* Recent deliveries */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Recent Deliveries ({deliveries.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Batch', 'Supplier', 'Grade', 'Net (kg)', 'Bottles', 'Payout', 'Time'].map(h => (
                      <th key={h} className="text-left text-white/30 font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveries.slice(0, 10).map((d, i) => (
                    <tr key={d.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <td className="px-4 py-3 font-mono text-white/40">{d.batchId}</td>
                      <td className="px-4 py-3 text-white/70">{d.supplier}</td>
                      <td className="px-4 py-3"><Badge variant={d.grade.includes('Grade A') ? 'lime' : 'teal'}>{d.grade}</Badge></td>
                      <td className="px-4 py-3 text-white/70">{d.netKg.toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/60">{Math.round(d.netKg * 25).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#9BE564] font-medium">{formatMoney(d.payoutNGN, currency)}</td>
                      <td className="px-4 py-3 text-white/30">{d.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT: totalizer ── */}
        <div className="space-y-5">
          {/* Totalizer */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-5">Cumulative Scale Totalizer</div>
            <div className="space-y-3">
              {[
                { label: 'Total Gross Weight', value: `${totalizer.grossKg.toLocaleString()} kg` },
                { label: 'Tare Deducted',      value: `${totalizer.tareDeductedKg.toLocaleString()} kg` },
                { label: 'Net PET Weight',      value: `${totalizer.netPETKg.toLocaleString()} kg`,       hi: true },
                { label: 'Total Bottles Today', value: totalizer.totalBottles.toLocaleString(),            hi: true },
              ].map(item => (
                <div key={item.label} className={`flex justify-between items-center py-2 ${item.hi ? 'border-t border-white/10' : ''}`}>
                  <span className="text-white/50 text-xs">{item.label}</span>
                  <span className={`font-bold text-sm ${item.hi ? 'text-[#9BE564]' : 'text-white/70'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/50">Daily Quota Progress</span>
                <span className="text-[#9BE564] font-bold">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: '#9BE564' }} />
              </div>
              <div className="flex justify-between text-xs mt-1 text-white/30">
                <span>{totalizer.totalBottles.toLocaleString()} bottles</span>
                <span>{totalizer.dailyTarget.toLocaleString()} target</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-white/50 text-xs">Today's Total Payout</span>
              <span className="text-[#9BE564] font-bold">{formatMoney(totalizer.dailyPayoutNGN, currency)}</span>
            </div>
          </div>

          {/* Tare calibration */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Tare Calibration</div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-white/50">Current Tare</span><span className="text-white font-mono">{tareKg.toFixed(1)} kg</span></div>
              <div className="flex justify-between text-xs"><span className="text-white/50">Last Calibration</span><span className="text-white/40">Today 06:00</span></div>
              <button onClick={triggerTareAutoBalance}
                className="w-full py-2.5 rounded-xl border border-[#9BE564]/30 text-[#9BE564] text-xs font-semibold hover:bg-[#9BE564]/10 transition-colors">
                Zero Tare to Current Gross
              </button>
            </div>
          </div>

          {/* EPR */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">EPR Compliance</div>
            <p className="text-white/40 text-xs mb-3">SHA-256 audit hash generated per batch. Download for Scope 3 reporting.</p>
            <button className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-xs font-medium hover:border-white/20 transition-colors flex items-center justify-center gap-2">
              <Icon name="download" size={14} /> Export Compliance Hash
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpotComputer({ currency, grade, bottleSize }: { currency: string; grade: PetGrade; bottleSize: BottleSize }) {
  const [spotKg, setSpotKg] = useState(100)
  const result = computeWeighbridgeBatch(spotKg + 500, 500, 0.025, grade, bottleSize, currency as Parameters<typeof computeWeighbridgeBatch>[5])
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Quick Spot Weight Computer</div>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="spot-kg" className="text-white/50 text-xs block mb-2">Enter net weight (kg)</label>
          <input id="spot-kg" type="number" value={spotKg} onChange={e => setSpotKg(Number(e.target.value))} min={0}
            className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
            style={{ background: 'rgba(13,36,21,0.6)' }} />
        </div>
        <div className="flex-1 rounded-xl p-3 border border-[#9BE564]/20" style={{ background: 'rgba(155,229,100,0.08)' }}>
          <div className="text-white/40 text-xs">Instant yield</div>
          <div className="text-[#9BE564] font-bold">{formatMoney(result.payoutNGN, currency as Parameters<typeof formatMoney>[1])}</div>
          <div className="text-white/30 text-xs">{result.bottles.toLocaleString()} bottles</div>
        </div>
      </div>
    </div>
  )
}
