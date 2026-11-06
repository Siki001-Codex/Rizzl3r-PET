import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CalculatorModal from '../components/CalculatorModal'
import BookingForm from '../components/BookingForm'
import { CountUp, Icon } from '../components/ui'
import { useCurrency } from '../context/CurrencyContext'
import { formatMoney, formatPerKg } from '../lib/currency'
import { PET_GRADES, calculatePayout } from '../lib/payout'
import type { PetGrade } from '../types'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

const LI = '#9BE564'   // lime
const TE = '#2DD4BF'   // teal

const SERVICES = [
  { icon: 'home',         title: 'Doorstep Residential Bins',    desc: 'Scheduled bottle collection from residential estates and gated communities nationwide across Nigeria. Cashless payout via bank transfer.' },
  { icon: 'store',        title: 'Commercial Hospitality Buyback', desc: 'Dedicated account managers for hotels, restaurants and event venues. Volume-tiered rates, monthly reconciliation.' },
  { icon: 'school',       title: 'Educational & Faith Drives',   desc: 'Structured eco-drives for schools, mosques and churches. Certificates of participation and leaderboard rankings.' },
  { icon: 'celebration',  title: 'Zero-Waste Festival Recovery', desc: 'On-site recovery stations at concerts, markets and sports events. Real-time weight reporting and crowd engagement.' },
  { icon: 'science',      title: 'Sanitized Flake Supply',       desc: 'Optical-sorted, food-grade PET flakes supplied to converters. Purity ≥ 99.4%. DIN EN 15343 compliant batches.' },
  { icon: 'verified',     title: 'ESG Verification & Credits',   desc: 'Audited impact reports for corporate ESG filings. Certified mass-balance documentation for Scope 3 reporting.' },
]

const JOURNEY = [
  { num: '01', title: 'Smart Collection',      desc: 'Doorstep bins, commercial contracts and community drives gather PET bottles across all 36 States & FCT Abuja.' },
  { num: '02', title: 'Optical & Manual Sort', desc: 'Conveyor-fed near-infrared sorter classifies Grade A, B, mixed and coloured streams. Human QC at each hand-sort station.' },
  { num: '03', title: 'Digital Weigh & Pay',   desc: 'Calibrated weighbridge logs every batch. Instant bank transfer or mobile money payout calculated at locked-in grade rate.' },
  { num: '04', title: 'Baling & Circular Supply', desc: 'Hydraulic baler produces 420 kg/m³ bales shipped to converters for food-grade rPET pellets and fibre.' },
]

const SECTORS = [
  { icon: 'family_restroom', label: 'Households',           desc: 'Doorstep pickup, cash in hand' },
  { icon: 'school',          label: 'Schools',              desc: 'Eco-drives & leaderboards' },
  { icon: 'mosque',          label: 'Faith Communities',    desc: 'Congregation recycling drives' },
  { icon: 'hotel',           label: 'Hotels & Hospitality', desc: 'Volume contracts, monthly billing' },
  { icon: 'business',        label: 'Corporate',            desc: 'ESG-certified mass-balance reports' },
  { icon: 'festival',        label: 'Events & Festivals',   desc: 'On-site zero-waste stations' },
]

const TESTIMONIALS = [
  { name: 'Babatunde Adeleke', role: 'Waste Aggregator, Surulere', avatar: 'B', amount: '₦480,000/mo',
    quote: 'Rizzl3r consistently pays ₦480,000 a month for our aggregate. The digital weighbridge eliminates every dispute we used to have with middlemen.' },
  { name: 'Chidinma Nwosu',   role: 'School Coordinator, Lekki',   avatar: 'C', amount: '12,000 bottles',
    quote: 'Our students diverted 12,000 bottles in one term. The payout lands in the school account before the truck leaves the gate — no chasing invoices.' },
  { name: 'Femi Alabi',       role: 'Events Manager, VI',          avatar: 'F', amount: '94% recovery rate',
    quote: 'We deployed Rizzl3r\'s zero-waste stations at a 20,000-attendee festival. 94% of plastic was recovered. Our sponsor loved the ESG report.' },
]

export default function LandingPage() {
  const { currency } = useCurrency()
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcGrade, setCalcGrade] = useState<PetGrade | undefined>()
  const [calcVolume, setCalcVolume] = useState<number | undefined>()
  const [prefillGrade, setPrefillGrade] = useState<PetGrade | undefined>()
  const [prefillVolume, setPrefillVolume] = useState<number | undefined>()
  const [estGrade, setEstGrade] = useState<PetGrade>('grade-a')
  const [estVolume, setEstVolume] = useState(500)
  const estResult = calculatePayout(estGrade, estVolume, 'standard', currency)
  const bookingRef = useRef<HTMLElement>(null)

  const openCalculator = useCallback((grade?: PetGrade, volume?: number) => {
    setCalcGrade(grade); setCalcVolume(volume); setCalcOpen(true)
  }, [])

  const handleBookPickup = useCallback((grade: PetGrade, volume: number) => {
    setPrefillGrade(grade); setPrefillVolume(volume)
    setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <Navbar onOpenCalculator={() => openCalculator()} onScrollTo={scrollTo} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(155,229,100,0.07)' }} />
          <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(45,212,191,0.07)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border" style={{ background: 'rgba(155,229,100,0.1)', borderColor: 'rgba(155,229,100,0.3)' }}>
                <span className="w-2 h-2 bg-[#9BE564] rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-[#9BE564] text-xs font-semibold tracking-wide">LIVE · 14,820 kg Collected Today · +18% Surge</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                <span className="text-white">Nigeria's Smartest</span><br />
                <span className="text-[#9BE564]">PET Recovery</span><br />
                <span className="text-white">Network</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
                Instant, transparent payouts. Optical-sorted bales. ESG-certified circularity. We collect from households, schools, hotels and factories nationwide across Nigeria — and pay before the truck leaves your gate.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => openCalculator()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[#021709] hover:opacity-90 active:scale-95 transition-all shadow-lg"
                  style={{ background: LI, boxShadow: `0 4px 24px rgba(155,229,100,0.35)` }}>
                  <Icon name="calculate" size={18} /> Calculate My Earnings
                </button>
                <button onClick={() => scrollTo('booking')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/30 transition-all">
                  <Icon name="local_shipping" size={18} /> Schedule Pickup
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: TE }} aria-hidden="true" />
                  <span>94% Fleet Capacity</span>
                </div>
                <div className="w-px h-4 bg-white/10" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  <Icon name="verified" size={14} className="text-[#9BE564]" />
                  <span>DIN EN 15343 Certified</span>
                </div>
              </div>
            </motion.div>

            {/* Right — glassmorphic card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 glass-panel rounded-3xl flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(155,229,100,0.15)', border: '1px solid rgba(155,229,100,0.3)' }}>
                    <Icon name="recycling" size={40} className="text-[#9BE564]" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#9BE564]">99.4%</div>
                    <div className="text-white/60 text-sm">Optical Sort Purity</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Icon name="sensors" size={12} className="text-[#2DD4BF]" />
                    <span className="text-[#2DD4BF] text-xs font-medium">NIR Sorter Stream A — ACTIVE</span>
                  </div>
                </div>
                {/* Floating badge: certification */}
                <div className="absolute -top-4 -right-4 glass-panel rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(155,229,100,0.2)' }}>
                      <Icon name="verified_user" size={14} className="text-[#9BE564]" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">DIN EN 15343</div>
                      <div className="text-[#9BE564] text-[10px]">Certified · 2024</div>
                    </div>
                  </div>
                </div>
                {/* Floating badge: weight */}
                <div className="absolute -bottom-4 -left-4 glass-panel rounded-2xl p-3 shadow-xl">
                  <div className="text-white/50 text-[10px] mb-1">Today's Net Weight</div>
                  <div className="text-[#9BE564] text-xl font-bold">7,794 kg</div>
                  <div className="text-xs" style={{ color: TE }}>↑ 18% vs yesterday</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────── */}
      <section className="py-14 border-y border-white/10" style={{ background: 'rgba(8,31,16,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 2450000, suffix: '+', label: 'PET Bottles Diverted',     icon: 'water_drop', decimals: 0 },
              { value: 185000,  suffix: ' kg', label: 'Landfill Saved',          icon: 'eco',        decimals: 0 },
              { value: 42500000, suffix: '', label: 'Distributed to Suppliers', icon: 'payments',   decimals: 0, isNGN: true },
              { value: 99.4,   suffix: '%', label: 'Optical Sort Purity',       icon: 'verified',   decimals: 1 },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-panel rounded-2xl p-5 text-center">
                <Icon name={stat.icon} size={22} className="text-[#9BE564] mb-2 mx-auto block" />
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.isNGN
                    ? formatMoney(stat.value, currency)
                    : <CountUp end={stat.value} decimals={stat.decimals} duration={2} suffix={stat.suffix} />
                  }
                </div>
                <div className="text-white/50 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTLE TO BALE ───────────────────────────────────── */}
      <section id="journey" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">The Process</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">From Bottle to Bale</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">Every PET bottle passes through a fully audited, digitally-tracked circularity chain.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-5">
            {JOURNEY.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="text-5xl font-bold font-display absolute top-3 right-4 leading-none" style={{ color: 'rgba(155,229,100,0.1)' }} aria-hidden="true">{step.num}</div>
                <div className="text-[#9BE564] text-xs font-bold tracking-widest mb-3">{step.num}</div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section id="services" className="py-20" style={{ background: 'rgba(8,31,16,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">What We Do</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">End-to-End Recovery Services</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">From your doorstep to certified circular supply — six services, one trusted partner.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc, i) => (
              <motion.div key={svc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-panel rounded-2xl p-6 hover:border-[#9BE564]/30 transition-colors group cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity" style={{ background: 'rgba(155,229,100,0.12)', border: '1px solid rgba(155,229,100,0.2)' }}>
                  <Icon name={svc.icon} size={20} className="text-[#9BE564]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{svc.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RATES + INLINE ESTIMATOR ─────────────────────────── */}
      <section id="rates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Rate cards */}
            <motion.div {...fadeUp}>
              <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">Live Rates</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2 mb-6">Transparent, Grade-Based Pricing</h2>
              <div className="space-y-3">
                {(Object.entries(PET_GRADES) as [PetGrade, typeof PET_GRADES[PetGrade]][]).map(([key, g]) => (
                  <div key={key} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#9BE564]/30 transition-colors">
                    <div>
                      <div className="text-white font-semibold text-sm">{g.name}</div>
                      <div className="text-white/50 text-xs mt-0.5">{g.description}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[#9BE564] text-xl font-bold">{formatPerKg(g.rateNGN, currency)}</div>
                      {currency !== 'NGN' && <div className="text-white/30 text-xs">{formatPerKg(g.rateNGN, 'NGN')}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-4">* Rates locked in at weighbridge capture. Enterprise bonuses above 5,000 kg.</p>
            </motion.div>

            {/* Inline estimator */}
            <motion.div id="estimator" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              className="glass-panel rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="bolt" size={20} className="text-[#9BE564]" />
                <h3 className="text-white font-bold text-lg">Live Value Estimator</h3>
              </div>
              <div className="mb-5">
                <label className="text-white/60 text-sm mb-2 block">PET Grade</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(PET_GRADES) as [PetGrade, typeof PET_GRADES[PetGrade]][]).map(([key, g]) => (
                    <button key={key} onClick={() => setEstGrade(key)} aria-pressed={estGrade === key}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${estGrade === key ? 'border-[#9BE564]/60 bg-[#9BE564]/15 text-[#9BE564]' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="est-vol" className="text-white/60 text-sm">Volume</label>
                  <span className="text-white font-bold text-sm">{estVolume.toLocaleString()} kg</span>
                </div>
                <input id="est-vol" type="range" min={1} max={5000} value={estVolume} onChange={e => setEstVolume(Number(e.target.value))} className="w-full accent-[#9BE564] h-2 rounded-full" />
                <div className="flex justify-between text-white/30 text-xs mt-1"><span>1 kg</span><span>5,000 kg</span></div>
              </div>
              <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(155,229,100,0.08)', border: '1px solid rgba(155,229,100,0.2)' }}>
                <div className="text-white/50 text-xs mb-1">Estimated Payout</div>
                <div className="text-3xl font-bold text-[#9BE564] mb-1">{formatMoney(estResult.grossNGN, currency)}</div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>≈ {estResult.estimatedBottles.toLocaleString()} bottles</span>
                  <span>· {estResult.co2Saved.toFixed(1)} t CO₂</span>
                </div>
              </div>
              <button onClick={() => openCalculator(estGrade, estVolume)}
                className="w-full py-3 rounded-xl border border-[#9BE564]/40 text-[#9BE564] font-semibold text-sm hover:bg-[#9BE564]/10 transition-colors flex items-center justify-center gap-2">
                <Icon name="open_in_full" size={16} /> Launch Advanced Calculator
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ─────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'rgba(8,31,16,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">Who We Serve</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Built for Every Sector</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SECTORS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                className="glass-panel rounded-2xl p-5 text-center hover:border-[#9BE564]/30 transition-colors group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:opacity-80 transition-opacity" style={{ background: 'rgba(155,229,100,0.12)' }}>
                  <Icon name={s.icon} size={22} className="text-[#9BE564]" />
                </div>
                <div className="text-white font-semibold text-sm mb-1">{s.label}</div>
                <div className="text-white/40 text-xs">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">Testimonials</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Trusted by Suppliers Across Nigeria</h2>
            <p className="text-xs text-white/30 mt-2">* Testimonials are illustrative — demo site</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className="glass-panel rounded-2xl p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#9BE564]" style={{ background: 'rgba(155,229,100,0.2)' }}>
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-white/50 text-xs">{t.role}</div>
                  </div>
                  <div className="text-[#9BE564] text-xs font-bold rounded-full px-2 py-1 flex-shrink-0 text-center" style={{ background: 'rgba(155,229,100,0.1)' }}>{t.amount}</div>
                </div>
                <blockquote className="text-white/60 text-sm leading-relaxed flex-1">"{t.quote}"</blockquote>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, j) => <Icon key={j} name="star" size={14} className="text-[#9BE564] fill-[#9BE564]" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING FORM ─────────────────────────────────────── */}
      <section id="booking" ref={bookingRef} className="py-20" style={{ background: 'rgba(8,31,16,0.4)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div {...fadeUp}>
              <span className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase">Book a Dispatch</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">Schedule Your Pickup Today</h2>
              <p className="text-white/60 leading-relaxed mb-8">Fill in your details and our logistics team will confirm a pickup slot within 2 hours. No minimum volume. No commitment required.</p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: 'schedule',     text: 'Confirmation within 2 hours' },
                  { icon: 'payments',     text: 'Payout on the same day as pickup' },
                  { icon: 'inventory_2',  text: 'No minimum volume threshold' },
                  { icon: 'receipt_long', text: 'Digital weighbridge receipt every time' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 text-white/60 text-sm">
                    <Icon name={item.icon} size={16} className="text-[#9BE564] flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="text-white/50 text-xs mb-1">Prefer to call?</div>
                <a href="tel:09069935434" className="text-[#9BE564] font-bold text-lg hover:underline">09069935434</a>
                <div className="text-white/30 text-xs mt-1">Mon – Sat · 7:00am – 7:00pm WAT</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
              <BookingForm prefillGrade={prefillGrade} prefillVolume={prefillVolume} />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── CALCULATOR MODAL ─────────────────────────────────── */}
      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} onBookPickup={handleBookPickup} initialGrade={calcGrade} initialVolume={calcVolume} />

      {/* ── FABs ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">
        <a href="https://wa.me/2349069935434" target="_blank" rel="noopener noreferrer"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform bg-emerald-600" aria-label="Chat on WhatsApp">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <button onClick={() => openCalculator()}
          className="flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform active:scale-95 text-[#021709]"
          style={{ background: LI, boxShadow: `0 4px 20px rgba(155,229,100,0.4)` }} aria-label="Open payout calculator">
          <Icon name="bolt" size={16} /> Estimate Payout
        </button>
      </div>
    </>
  )
}
