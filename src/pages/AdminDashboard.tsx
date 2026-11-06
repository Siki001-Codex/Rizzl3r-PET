import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { logout, getDeliveries, getDispatches, updateDispatchStatus } from '../lib/api'
import { MOCK_HOURLY_VELOCITY, MOCK_TOTALIZER } from '../data/mockData'
import { useCurrency } from '../context/CurrencyContext'
import { formatMoney } from '../lib/currency'
import { Badge, Icon } from '../components/ui'
import type { Dispatch, Delivery } from '../types'

type AdminTab = 'analytics' | 'dispatches'

const STATUS_COLORS: Record<string, 'lime' | 'teal' | 'amber' | 'red' | 'surface'> = {
  Pending: 'amber', Assigned: 'teal', 'En Route': 'teal', Completed: 'lime', Cancelled: 'red',
}
const STATUS_OPTIONS = ['Pending', 'Assigned', 'En Route', 'Completed', 'Cancelled']

function NavItem({ icon, label, active, badge, onClick }: { icon: string; label: string; active: boolean; badge?: string | null; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'text-[#9BE564] border border-[#9BE564]/25' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
      style={active ? { background: 'rgba(155,229,100,0.1)' } : {}}>
      <div className="flex items-center gap-3">
        <Icon name={icon} size={16} />
        {label}
      </div>
      {badge && (
        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const { currency } = useCurrency()
  const [tab, setTab]           = useState<AdminTab>('analytics')
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [search, setSearch]     = useState('')
  const [dispatchFilter, setDispatchFilter] = useState<'All' | 'Pending' | 'Assigned' | 'En Route' | 'Completed'>('All')
  const [page, setPage]         = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const PER_PAGE = 6

  const loadData = useCallback(async (spinner = false) => {
    if (spinner) setIsRefreshing(true)
    try {
      const [dels, disps] = await Promise.all([getDeliveries(), getDispatches()])
      setDeliveries(dels)
      setDispatches(disps)
      setLastUpdated(new Date())
    } finally {
      if (spinner) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
    // Live polling every 10 seconds for real-time dispatch updates
    const interval = setInterval(() => {
      loadData(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  const pendingDispatches = useMemo(() => dispatches.filter(d => d.status === 'Pending'), [dispatches])
  const pendingCount = pendingDispatches.length
  const latestPending = pendingDispatches[0]

  const filteredDeliveries = useMemo(() =>
    deliveries.filter(d =>
      d.supplier.toLowerCase().includes(search.toLowerCase()) ||
      d.grade.toLowerCase().includes(search.toLowerCase()) ||
      d.batchId.toLowerCase().includes(search.toLowerCase())
    ), [deliveries, search])

  const pagedDeliveries = filteredDeliveries.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filteredDeliveries.length / PER_PAGE)

  const displayedDispatches = useMemo(() => {
    if (dispatchFilter === 'All') return dispatches
    return dispatches.filter(d => d.status === dispatchFilter)
  }, [dispatches, dispatchFilter])

  const handleStatusChange = async (id: string, status: string) => {
    await updateDispatchStatus(id, status as Dispatch['status'])
    await loadData(false)
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }
  const KPI = MOCK_TOTALIZER

  const SIDEBAR = [
    { icon: 'analytics',      label: 'Daily Intake Analytics', tab: 'analytics' as AdminTab, badge: null },
    { icon: 'local_shipping', label: 'Inbound Dispatches',     tab: 'dispatches' as AdminTab, badge: pendingCount > 0 ? `${pendingCount} Pending` : null },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#010f05' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 p-4 gap-1 fixed top-0 bottom-0 left-0 z-20" style={{ background: '#010f05' }}>
        <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(155,229,100,0.15)' }}>
            <Icon name="recycling" size={16} className="text-[#9BE564]" />
          </div>
          <div>
            <div className="text-white text-xs font-bold font-display">RIZZL3R PET</div>
            <div className="text-[#9BE564] text-[10px] tracking-widest">ADMIN PORTAL</div>
          </div>
        </div>

        {SIDEBAR.map(s => (
          <NavItem key={s.tab} icon={s.icon} label={s.label} active={tab === s.tab} badge={s.badge} onClick={() => setTab(s.tab)} />
        ))}
        <Link to="/admin/weighbridge"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all">
          <Icon name="scale" size={16} /> Weighbridge Feed
        </Link>

        <div className="mt-auto border-t border-white/10 pt-4 space-y-1">
          <Link to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-[#9BE564] hover:bg-[#9BE564]/5 transition-all">
            <Icon name="home" size={16} /> Back to Website
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <Icon name="logout" size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-3" style={{ background: 'rgba(1,15,5,0.95)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-sm sm:text-base">{tab === 'analytics' ? 'Daily Intake Analytics' : 'Inbound Dispatches'}</h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#9BE564] bg-[#9BE564]/10 border border-[#9BE564]/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9BE564] animate-pulse"></span>
                Live Sync
              </span>
            </div>
            <p className="text-white/40 text-xs">
              Updated {lastUpdated.toLocaleTimeString()} · {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile nav pills */}
            <div className="flex lg:hidden items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => setTab('analytics')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${tab === 'analytics' ? 'bg-[#9BE564] text-[#021709]' : 'text-white/60'}`}>
                <Icon name="analytics" size={14} />
                <span>Analytics</span>
              </button>
              <button onClick={() => setTab('dispatches')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${tab === 'dispatches' ? 'bg-[#9BE564] text-[#021709]' : 'text-white/60'}`}>
                <Icon name="local_shipping" size={14} />
                <span>Dispatches</span>
                {pendingCount > 0 && (
                  <span className="bg-amber-400 text-[#021709] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <Link to="/admin/weighbridge" className="p-1.5 text-white/40 hover:text-white" title="Weighbridge">
                <Icon name="scale" size={14} />
              </Link>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="p-2 text-white/50 hover:text-white rounded-lg border border-white/5 bg-white/5 hover:border-white/15 transition-all"
              title="Refresh database"
            >
              <Icon name="refresh" size={16} className={isRefreshing ? 'animate-spin text-[#9BE564]' : ''} />
            </button>

            {/* Back to website */}
            <Link to="/" className="text-white/40 hover:text-[#9BE564] transition-colors p-2 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-white/5 bg-white/5 hover:border-white/15" title="Go to Website">
              <Icon name="home" size={16} />
              <span className="hidden md:inline">Website</span>
            </Link>

            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg" aria-label="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {/* ── ANALYTICS ──────────────────────────────── */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              {/* Alert banner for pending dispatches */}
              {pendingCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon name="local_shipping" size={22} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                        <span>{pendingCount} Pending Dispatch Request{pendingCount > 1 ? 's' : ''} Received</span>
                        <span className="bg-amber-400 text-[#021709] text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">Action Required</span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">
                        Latest: <strong className="text-white">{latestPending?.customerName}</strong> ({latestPending?.volumeRange}) • {latestPending?.address} • Phone: {latestPending?.phone}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setTab('dispatches')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#9BE564] text-[#021709] text-xs font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(155,229,100,0.3)]">
                    Review Inbound Dispatches <Icon name="arrow_forward" size={14} />
                  </button>
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Bottles Today',    value: KPI.totalBottles.toLocaleString(), sub: `Target: ${KPI.dailyTarget.toLocaleString()}`, icon: 'water_drop', pct: (KPI.totalBottles / KPI.dailyTarget * 100).toFixed(1) + '%' },
                  { label: 'Net PET Weight',   value: `${KPI.netPETKg.toLocaleString()} kg`, sub: `${KPI.grossKg.toLocaleString()} kg gross`, icon: 'scale',      pct: null },
                  { label: 'Daily Payout',     value: formatMoney(KPI.dailyPayoutNGN, currency), sub: 'All grades',       icon: 'payments',   pct: null },
                  { label: 'Truck Turnaround', value: '4.8 min',  sub: 'Avg per delivery',   icon: 'timer',      pct: null },
                ].map(k => (
                  <div key={k.label} className="glass-panel rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Icon name={k.icon} size={20} className="text-[#9BE564]" />
                      {k.pct && <span className="text-[#9BE564] text-xs font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(155,229,100,0.12)' }}>{k.pct}</span>}
                    </div>
                    <div className="text-white font-bold text-xl mb-0.5">{k.value}</div>
                    <div className="text-white/40 text-xs">{k.label}</div>
                    <div className="text-white/30 text-xs mt-1">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart + Grade split */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Grade bars */}
                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-5 text-sm">Grade Segregation</h2>
                  {[
                    { label: 'Grade A Clear',   pct: 62.9, color: '#9BE564' },
                    { label: 'Grade B Coloured', pct: 24.8, color: '#2DD4BF' },
                    { label: 'Mixed / Unsorted', pct: 12.3, color: '#6B7280' },
                  ].map(g => (
                    <div key={g.label} className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/60">{g.label}</span>
                        <span className="font-bold" style={{ color: g.color }}>{g.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ background: g.color }} />
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-5 border-t border-white/10">
                    <h3 className="text-white/60 text-xs font-semibold mb-3">Intake Stream Split</h3>
                    {[
                      { label: 'Commercial',  pct: 42 },
                      { label: 'Residential', pct: 28 },
                      { label: 'Schools',     pct: 16 },
                      { label: 'Cleanups',    pct: 14 },
                    ].map(s => (
                      <div key={s.label} className="mb-2.5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50">{s.label}</span>
                          <span className="text-white/60">{s.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ background: 'rgba(45,212,191,0.6)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hourly bar chart */}
                <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
                  <h2 className="text-white font-semibold mb-5 text-sm">Hourly Inflow (Bottles)</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MOCK_HOURLY_VELOCITY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0F3D1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)' }} cursor={{ fill: 'rgba(155,229,100,0.05)' }} />
                      <Bar dataKey="bottles" radius={[4, 4, 0, 0]}>
                        {MOCK_HOURLY_VELOCITY.map((_, i) => (
                          <Cell key={i} fill={i === MOCK_HOURLY_VELOCITY.length - 1 ? '#9BE564' : 'rgba(155,229,100,0.35)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Deliveries table */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <h2 className="text-white font-semibold text-sm">Delivery Log</h2>
                  <div className="relative w-full sm:w-64">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="search" size={14} className="text-white/30" /></div>
                    <input type="search" placeholder="Search supplier, grade, batch…" value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1) }}
                      className="w-full border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50 placeholder-white/30"
                      style={{ background: 'rgba(13,36,21,0.6)' }} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Batch ID', 'Supplier', 'Grade', 'Gross (kg)', 'Net (kg)', 'Payout', 'Purity', 'Time'].map(h => (
                          <th key={h} className="text-left text-white/40 text-xs font-semibold px-5 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDeliveries.length === 0 ? (
                        <tr><td colSpan={8} className="text-center text-white/30 py-10">No deliveries found</td></tr>
                      ) : pagedDeliveries.map((d, i) => (
                        <tr key={d.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                          <td className="px-5 py-3.5 font-mono text-white/50 text-xs">{d.batchId}</td>
                          <td className="px-5 py-3.5 text-white font-medium">{d.supplier}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={d.grade === 'Grade A Clear' ? 'lime' : d.grade === 'Grade B Coloured' ? 'teal' : 'surface'}>{d.grade}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-white/60">{d.grossKg.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-white">{d.netKg.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-[#9BE564] font-medium">{formatMoney(d.payoutNGN, currency)}</td>
                          <td className="px-5 py-3.5 text-white/60">{d.purity}%</td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">{d.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white/40 text-xs">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs disabled:opacity-30 hover:border-white/20 transition-colors">← Prev</button>
                      <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs disabled:opacity-30 hover:border-white/20 transition-colors">Next →</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hardware strip */}
              <div className="glass-panel rounded-2xl p-5 flex flex-wrap gap-6 items-center">
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider">System Status</div>
                {[
                  { label: 'NIR Sorter A',  ok: true },
                  { label: 'NIR Sorter B',  ok: true },
                  { label: 'Weighbridge #1', ok: true },
                  { label: 'Baler Unit',    ok: false },
                  { label: 'EPR Hash Sync', ok: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${s.ok ? 'bg-[#9BE564] animate-pulse' : 'bg-amber-400'}`} aria-hidden="true" />
                    <span className={s.ok ? 'text-white/60' : 'text-amber-400'}>{s.label}</span>
                  </div>
                ))}
                <button className="ml-auto text-xs text-[#9BE564] border border-[#9BE564]/30 rounded-lg px-3 py-1.5 hover:bg-[#9BE564]/10 transition-colors">
                  Export EPR Hash
                </button>
              </div>
            </div>
          )}

          {/* ── DISPATCHES ─────────────────────────────── */}
          {tab === 'dispatches' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-white font-bold text-lg">Inbound Dispatch Requests</h2>
                  <p className="text-white/40 text-xs">Customer collection requests booked via the website</p>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 flex-wrap">
                  {(['All', 'Pending', 'Assigned', 'En Route', 'Completed'] as const).map(f => {
                    const count = f === 'All' ? dispatches.length : dispatches.filter(d => d.status === f).length
                    return (
                      <button key={f} onClick={() => setDispatchFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          dispatchFilter === f ? 'bg-[#9BE564] text-[#021709] font-bold shadow' : 'text-white/60 hover:text-white'
                        }`}>
                        {f} <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['ID & Date', 'Customer', 'Contact', 'Location & Notes', 'Volume / Grade', 'Status', 'Change Status'].map(h => (
                          <th key={h} className="text-left text-white/40 text-xs font-semibold px-5 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDispatches.length === 0 ? (
                        <tr><td colSpan={7} className="text-center text-white/30 py-12 text-sm">No dispatch requests found under this filter.</td></tr>
                      ) : displayedDispatches.map((d, i) => (
                        <tr key={d.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-[#9BE564] text-xs font-mono font-bold block">{d.id}</span>
                            <span className="text-white/40 text-[11px] block">{d.targetDate}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-white font-medium block">{d.customerName}</span>
                            {d.email && <span className="text-white/40 text-xs block">{d.email}</span>}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <a href={`tel:${d.phone}`} className="text-white/70 hover:text-[#9BE564] text-xs font-mono block transition-colors">
                              {d.phone}
                            </a>
                            <a href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-0.5">
                              <Icon name="chat" size={12} /> WhatsApp
                            </a>
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <div className="text-white/80 text-xs font-medium">{d.address}</div>
                            {d.notes && <div className="text-white/40 text-[11px] mt-1 line-clamp-2 italic">“{d.notes}”</div>}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-white/70 text-xs">{d.volumeRange}</div>
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-[#9BE564] bg-[#9BE564]/10 border border-[#9BE564]/20 px-1.5 py-0.5 rounded">
                              {d.grade || 'mixed'}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <Badge variant={STATUS_COLORS[d.status] || 'surface'}>{d.status}</Badge>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)}
                              className="border border-white/10 rounded-lg px-2.5 py-1.5 text-white/80 text-xs focus:outline-none focus:ring-1 focus:ring-[#9BE564]/50 cursor-pointer"
                              style={{ background: 'rgba(13,36,21,0.8)' }} aria-label={`Status for ${d.customerName}`}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
