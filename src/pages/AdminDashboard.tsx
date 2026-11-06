import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { logout, getDeliveries, getDispatches, updateDispatchStatus, assignDriverToDispatch } from '../lib/api'
import { MOCK_HOURLY_VELOCITY, MOCK_TOTALIZER } from '../data/mockData'
import { useCurrency } from '../context/CurrencyContext'
import { formatMoney } from '../lib/currency'
import { Badge, Icon } from '../components/ui'
import type { Dispatch, Delivery, AssignedDriver } from '../types'

type AdminTab = 'analytics' | 'dispatches'

const FLEET_DRIVERS: AssignedDriver[] = [
  { name: 'Ibrahim Musa', phone: '+234 802 345 6789', vehicle: 'Isuzu 3.5T Flatbed (EKY-492-XA)' },
  { name: 'Chinedu Okafor', phone: '+234 813 908 1122', vehicle: 'Mitsubishi Canter (KJA-812-BD)' },
  { name: 'Babatunde Adeleke', phone: '+234 905 441 9900', vehicle: 'Toyota Dyna (LSR-301-TN)' },
  { name: 'Sunday Eze', phone: '+234 809 112 3344', vehicle: 'Ford Transit Van (APP-119-KL)' },
]

const STATUS_COLORS: Record<string, 'lime' | 'teal' | 'amber' | 'red' | 'surface'> = {
  Pending: 'amber',
  Accepted: 'lime',
  Assigned: 'teal',
  'En Route': 'teal',
  Completed: 'lime',
  Rejected: 'red',
  Cancelled: 'red',
}
const STATUS_OPTIONS: Dispatch['status'][] = ['Pending', 'Accepted', 'Assigned', 'En Route', 'Completed', 'Rejected']

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
  const [dispatchSearch, setDispatchSearch] = useState('')
  const [dispatchFilter, setDispatchFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Assigned' | 'En Route' | 'Completed' | 'Rejected'>('All')
  const [page, setPage]         = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null)

  // Driver Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [targetDispatch, setTargetDispatch] = useState<Dispatch | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<AssignedDriver>(FLEET_DRIVERS[0])
  const [isCustomDriver, setIsCustomDriver] = useState(false)
  const [customDriver, setCustomDriver] = useState<AssignedDriver>({ name: '', phone: '', vehicle: '' })

  const PER_PAGE = 6

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 4000)
  }

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
    // Auto-refresh every 10 seconds for real-time dispatch monitoring
    const interval = setInterval(() => {
      loadData(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  const pendingDispatches = useMemo(() => dispatches.filter(d => d.status === 'Pending'), [dispatches])
  const pendingCount = pendingDispatches.length
  const acceptedCount = useMemo(() => dispatches.filter(d => d.status === 'Accepted').length, [dispatches])
  const assignedCount = useMemo(() => dispatches.filter(d => d.status === 'Assigned').length, [dispatches])
  const completedCount = useMemo(() => dispatches.filter(d => d.status === 'Completed').length, [dispatches])
  const rejectedCount = useMemo(() => dispatches.filter(d => d.status === 'Rejected').length, [dispatches])
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
    let list = dispatches
    if (dispatchFilter !== 'All') {
      list = list.filter(d => d.status === dispatchFilter)
    }
    if (dispatchSearch.trim()) {
      const q = dispatchSearch.toLowerCase()
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.address.toLowerCase().includes(q) ||
        (d.assignedDriver?.name.toLowerCase().includes(q) ?? false)
      )
    }
    return list
  }, [dispatches, dispatchFilter, dispatchSearch])

  // Core Actions: Accept, Reject, Assign
  const handleAccept = async (id: string) => {
    await updateDispatchStatus(id, 'Accepted')
    showToast(`✓ Request ${id} ACCEPTED`, 'success')
    await loadData(false)
  }

  const handleReject = async (id: string) => {
    await updateDispatchStatus(id, 'Rejected')
    showToast(`✕ Request ${id} REJECTED`, 'danger')
    await loadData(false)
  }

  const handleOpenAssignModal = (disp: Dispatch) => {
    setTargetDispatch(disp)
    if (disp.assignedDriver) {
      const found = FLEET_DRIVERS.find(d => d.name === disp.assignedDriver?.name)
      if (found) {
        setSelectedDriver(found)
        setIsCustomDriver(false)
      } else {
        setCustomDriver(disp.assignedDriver)
        setIsCustomDriver(true)
      }
    } else {
      setSelectedDriver(FLEET_DRIVERS[0])
      setIsCustomDriver(false)
    }
    setAssignModalOpen(true)
  }

  const handleConfirmAssignDriver = async () => {
    if (!targetDispatch) return
    const driverToAssign = isCustomDriver ? customDriver : selectedDriver
    if (!driverToAssign.name.trim()) {
      showToast('Please specify a driver name', 'danger')
      return
    }

    await assignDriverToDispatch(targetDispatch.id, driverToAssign)
    setAssignModalOpen(false)
    showToast(`🚚 Driver ${driverToAssign.name} assigned to ${targetDispatch.id}`, 'info')
    await loadData(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateDispatchStatus(id, status as Dispatch['status'])
    showToast(`Status updated to ${status}`, 'info')
    await loadData(false)
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }
  const KPI = MOCK_TOTALIZER

  const SIDEBAR = [
    { icon: 'analytics',      label: 'Daily Intake Analytics', tab: 'analytics' as AdminTab, badge: null },
    { icon: 'local_shipping', label: 'Inbound Dispatches',     tab: 'dispatches' as AdminTab, badge: pendingCount > 0 ? `${pendingCount} Pending` : null },
  ]

  return (
    <div className="min-h-screen flex text-slate-100" style={{ background: '#010f05' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold backdrop-blur-xl ${
              toastMsg.type === 'success' ? 'bg-[#9BE564]/15 border-[#9BE564]/40 text-[#9BE564]' :
              toastMsg.type === 'danger'  ? 'bg-red-500/15 border-red-500/40 text-red-300' :
              'bg-teal-500/15 border-teal-500/40 text-teal-300'
            }`}
          >
            <Icon name={toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'danger' ? 'cancel' : 'local_shipping'} size={18} />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Assignment Modal */}
      <AnimatePresence>
        {assignModalOpen && targetDispatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setAssignModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 z-10 border border-[#9BE564]/30 shadow-2xl"
              style={{ background: 'rgba(8, 31, 16, 0.98)', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(155,229,100,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Icon name="local_shipping" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Assign Pickup Driver</h3>
                    <p className="text-white/50 text-xs">Dispatch ID: <span className="text-[#9BE564] font-mono font-bold">{targetDispatch.id}</span></p>
                  </div>
                </div>
                <button onClick={() => setAssignModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Icon name="close" size={16} />
                </button>
              </div>

              {/* Target info preview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Customer:</span>
                  <span className="text-white font-semibold">{targetDispatch.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Pickup Location:</span>
                  <span className="text-white font-medium truncate max-w-[240px]">{targetDispatch.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Volume / Date:</span>
                  <span className="text-[#9BE564] font-semibold">{targetDispatch.volumeRange} · {targetDispatch.targetDate}</span>
                </div>
              </div>

              {/* Driver Type Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => setIsCustomDriver(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    !isCustomDriver ? 'bg-[#9BE564] text-[#021709] shadow' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Verified Fleet Drivers ({FLEET_DRIVERS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDriver(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    isCustomDriver ? 'bg-[#9BE564] text-[#021709] shadow' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Custom Driver / 3rd Party
                </button>
              </div>

              {/* Driver selector list */}
              {!isCustomDriver ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-6">
                  {FLEET_DRIVERS.map(drv => {
                    const isSelected = selectedDriver.name === drv.name
                    return (
                      <div
                        key={drv.name}
                        onClick={() => setSelectedDriver(drv)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#9BE564]/15 border-[#9BE564] text-white shadow-[0_0_15px_rgba(155,229,100,0.15)]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-[#9BE564] text-[#021709]' : 'bg-white/10 text-white/60'
                          }`}>
                            <Icon name="person" size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{drv.name}</div>
                            <div className="text-[11px] text-white/50">{drv.vehicle}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-[#9BE564] block">{drv.phone}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#9BE564] text-[#021709]' : 'bg-white/10 text-white/40'}`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-white/60 text-xs block mb-1">Driver Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alabi Johnson"
                      value={customDriver.name}
                      onChange={e => setCustomDriver(c => ({ ...c, name: e.target.value }))}
                      className="w-full bg-[#0d2415] border border-white/20 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1">Driver Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={customDriver.phone}
                      onChange={e => setCustomDriver(c => ({ ...c, phone: e.target.value }))}
                      className="w-full bg-[#0d2415] border border-white/20 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1">Vehicle Description &amp; Plate #</label>
                    <input
                      type="text"
                      placeholder="e.g. Mercedes Van (APP-456-XY)"
                      value={customDriver.vehicle}
                      onChange={e => setCustomDriver(c => ({ ...c, vehicle: e.target.value }))}
                      className="w-full bg-[#0d2415] border border-white/20 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignDriver}
                  className="flex-1 py-3 rounded-xl bg-[#9BE564] text-[#021709] font-bold text-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(155,229,100,0.35)]"
                >
                  <Icon name="check" size={16} />
                  Confirm &amp; Assign Driver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 p-4 gap-1 fixed top-0 bottom-0 left-0 z-20" style={{ background: '#010f05' }}>
        <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(155,229,100,0.15)' }}>
            <Icon name="recycling" size={16} className="text-[#9BE564]" />
          </div>
          <div>
            <div className="text-white text-xs font-bold font-display">RIZZL3R PET</div>
            <div className="text-[#9BE564] text-[10px] tracking-widest font-mono">ADMIN OPS</div>
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

      {/* Main Container */}
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
              Updated {lastUpdated.toLocaleTimeString()} · Lagos Operations
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
          {/* ── TAB 1: ANALYTICS ──────────────────────────────── */}
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

          {/* ── TAB 2: INBOUND DISPATCHES ─────────────────────── */}
          {tab === 'dispatches' && (
            <div className="space-y-6">
              {/* Header & Search */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    Inbound Dispatch Requests
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#9BE564]/15 text-[#9BE564] border border-[#9BE564]/30">
                      {dispatches.length} Total
                    </span>
                  </h2>
                  <p className="text-white/40 text-xs mt-1">Accept, reject, and assign drivers to polymer collection orders</p>
                </div>

                <div className="relative w-full md:w-72">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <Icon name="search" size={15} />
                  </div>
                  <input
                    type="search"
                    placeholder="Search by ID, customer, driver..."
                    value={dispatchSearch}
                    onChange={e => setDispatchSearch(e.target.value)}
                    className="w-full bg-[#0d2415]/80 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                  />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto pb-1 sm:pb-1">
                {[
                  { label: 'All', count: dispatches.length, color: 'text-white' },
                  { label: 'Pending', count: pendingCount, color: 'text-amber-400' },
                  { label: 'Accepted', count: acceptedCount, color: 'text-[#9BE564]' },
                  { label: 'Assigned', count: assignedCount, color: 'text-teal-400' },
                  { label: 'Completed', count: completedCount, color: 'text-[#9BE564]' },
                  { label: 'Rejected', count: rejectedCount, color: 'text-red-400' },
                ].map(f => {
                  const isActive = dispatchFilter === f.label
                  return (
                    <button
                      key={f.label}
                      onClick={() => setDispatchFilter(f.label as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#9BE564] text-[#021709] shadow-[0_0_15px_rgba(155,229,100,0.3)]'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-[#021709]/20 text-[#021709]' : 'bg-white/10 ' + f.color
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* MOBILE VIEW: High-impact Touch Logistics Cards (block lg:hidden) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="block lg:hidden space-y-4">
                {displayedDispatches.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-8 text-center text-white/40 text-sm">
                    No dispatch requests found under this filter.
                  </div>
                ) : (
                  displayedDispatches.map(d => (
                    <div
                      key={d.id}
                      className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl space-y-4 relative overflow-hidden"
                      style={{ background: 'rgba(8, 31, 16, 0.7)' }}
                    >
                      {/* Top bar: ID, Target Date, Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-[#9BE564] tracking-wide">{d.id}</span>
                          <span className="text-[10px] text-white/40 font-medium">({d.targetDate})</span>
                        </div>
                        <Badge variant={STATUS_COLORS[d.status] || 'surface'}>{d.status}</Badge>
                      </div>

                      {/* Customer Details & Contact Pills */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-white font-bold text-base leading-tight">{d.customerName}</h4>
                            {d.email && <p className="text-white/40 text-[11px] truncate">{d.email}</p>}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-[#9BE564] bg-[#9BE564]/10 border border-[#9BE564]/20 px-2 py-0.5 rounded-full shrink-0">
                            {d.grade || 'mixed'}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-1.5 text-xs text-white/80">
                          <Icon name="location_on" size={14} className="text-[#9BE564] shrink-0 mt-0.5" />
                          <span className="leading-snug">{d.address}</span>
                        </div>

                        {/* Volume Range */}
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <Icon name="scale" size={14} className="text-teal-400 shrink-0" />
                          <span>Volume: <strong className="text-white">{d.volumeRange}</strong></span>
                        </div>

                        {/* Customer Notes */}
                        {d.notes && (
                          <div className="bg-white/5 rounded-xl p-2.5 text-[11px] text-white/70 italic border border-white/5">
                            “{d.notes}”
                          </div>
                        )}
                      </div>

                      {/* Quick Contact Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${d.phone}`}
                          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Icon name="call" size={13} className="text-[#9BE564]" />
                          Call Customer
                        </a>
                        <a
                          href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${d.customerName}, this is Rizzl3r PET Recovery regarding your pickup request ${d.id}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Icon name="chat" size={13} />
                          WhatsApp
                        </a>
                      </div>

                      {/* Assigned Driver Card (if assigned) */}
                      {d.assignedDriver && (
                        <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                              <Icon name="badge" size={16} />
                            </div>
                            <div>
                              <div className="text-white font-bold text-xs">{d.assignedDriver.name}</div>
                              <div className="text-teal-300/60 text-[10px]">{d.assignedDriver.vehicle}</div>
                            </div>
                          </div>
                          <a
                            href={`tel:${d.assignedDriver.phone}`}
                            className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-xl text-teal-300 text-xs border border-teal-500/30"
                            title="Call Driver"
                          >
                            <Icon name="call" size={14} />
                          </a>
                        </div>
                      )}

                      {/* ── CORE ACTION BUTTONS: ACCEPT, ASSIGNED, REJECT ── */}
                      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* ACCEPT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleAccept(d.id)}
                            disabled={d.status === 'Accepted'}
                            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                              d.status === 'Accepted'
                                ? 'bg-[#9BE564]/30 text-white/50 cursor-default'
                                : 'bg-[#9BE564] text-[#021709] hover:brightness-105 shadow-[0_0_15px_rgba(155,229,100,0.3)]'
                            }`}
                          >
                            <Icon name="check" size={15} />
                            {d.status === 'Accepted' ? 'ACCEPTED' : 'ACCEPT'}
                          </button>

                          {/* REJECT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleReject(d.id)}
                            disabled={d.status === 'Rejected'}
                            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                              d.status === 'Rejected'
                                ? 'bg-red-500/20 text-red-300/40 border border-red-500/20 cursor-default'
                                : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
                            }`}
                          >
                            <Icon name="close" size={15} />
                            {d.status === 'Rejected' ? 'REJECTED' : 'REJECT'}
                          </button>
                        </div>

                        {/* ASSIGN DRIVER BUTTON (Full width) */}
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(d)}
                          className="w-full py-3 rounded-xl font-bold text-xs bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-300 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)]"
                        >
                          <Icon name="local_shipping" size={16} />
                          {d.assignedDriver ? 'RE-ASSIGN DRIVER' : 'ASSIGN DRIVER'}
                        </button>

                        {/* Secondary status shortcuts if assigned */}
                        {d.status === 'Assigned' && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(d.id, 'En Route')}
                              className="py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-semibold"
                            >
                              Dispatch En Route →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(d.id, 'Completed')}
                              className="py-2 rounded-lg bg-[#9BE564]/10 border border-[#9BE564]/20 text-[#9BE564] text-[11px] font-semibold"
                            >
                              Mark Delivered ✓
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* DESKTOP VIEW: Clean High-Resolution Table (hidden lg:block) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="hidden lg:block glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        {['Request ID & Date', 'Customer & Contact', 'Pickup Location', 'Volume & Grade', 'Assigned Driver', 'Status', 'Control Actions'].map(h => (
                          <th key={h} className="text-left text-white/40 text-xs font-semibold px-5 py-4 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {displayedDispatches.length === 0 ? (
                        <tr><td colSpan={7} className="text-center text-white/30 py-16 text-sm">No dispatch requests found under this filter.</td></tr>
                      ) : (
                        displayedDispatches.map((d, i) => (
                          <tr key={d.id} className={`hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.005]' : ''}`}>
                            {/* ID & Date */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-[#9BE564] text-xs font-mono font-bold block">{d.id}</span>
                              <span className="text-white/40 text-[11px] block mt-0.5">{d.targetDate}</span>
                            </td>

                            {/* Customer & Contacts */}
                            <td className="px-5 py-4">
                              <span className="text-white font-bold block">{d.customerName}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <a href={`tel:${d.phone}`} className="text-white/70 hover:text-[#9BE564] text-xs font-mono transition-colors">
                                  {d.phone}
                                </a>
                                <span className="text-white/20">|</span>
                                <a
                                  href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${d.customerName}, this is Rizzl3r PET Recovery regarding your pickup request ${d.id}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                                >
                                  <Icon name="chat" size={11} /> WhatsApp
                                </a>
                              </div>
                            </td>

                            {/* Location & Notes */}
                            <td className="px-5 py-4 max-w-xs">
                              <div className="text-white/80 text-xs font-medium leading-snug">{d.address}</div>
                              {d.notes && <div className="text-white/40 text-[11px] mt-1 line-clamp-2 italic">“{d.notes}”</div>}
                            </td>

                            {/* Volume & Grade */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="text-white/80 text-xs font-medium">{d.volumeRange}</div>
                              <span className="inline-block mt-1 text-[10px] uppercase font-bold text-[#9BE564] bg-[#9BE564]/10 border border-[#9BE564]/20 px-2 py-0.5 rounded-full">
                                {d.grade || 'mixed'}
                              </span>
                            </td>

                            {/* Assigned Driver */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {d.assignedDriver ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                                    <Icon name="badge" size={13} />
                                  </div>
                                  <div>
                                    <div className="text-white font-bold text-xs leading-none">{d.assignedDriver.name}</div>
                                    <div className="text-white/40 text-[10px] mt-0.5">{d.assignedDriver.vehicle}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-white/30 text-xs italic">Unassigned</span>
                              )}
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge variant={STATUS_COLORS[d.status] || 'surface'}>{d.status}</Badge>
                            </td>

                            {/* ACTION BUTTONS: ACCEPT, ASSIGNED, REJECT */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {/* ACCEPT BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleAccept(d.id)}
                                  disabled={d.status === 'Accepted'}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                    d.status === 'Accepted'
                                      ? 'bg-[#9BE564]/20 text-[#9BE564]/60 cursor-default'
                                      : 'bg-[#9BE564] text-[#021709] hover:brightness-105 active:scale-95 shadow-[0_0_10px_rgba(155,229,100,0.3)]'
                                  }`}
                                  title="Accept pickup request"
                                >
                                  <Icon name="check" size={13} />
                                  ACCEPT
                                </button>

                                {/* ASSIGN DRIVER BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(d)}
                                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-300 flex items-center gap-1 transition-all active:scale-95"
                                  title="Assign driver to this pickup"
                                >
                                  <Icon name="local_shipping" size={13} />
                                  ASSIGN
                                </button>

                                {/* REJECT BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleReject(d.id)}
                                  disabled={d.status === 'Rejected'}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                    d.status === 'Rejected'
                                      ? 'bg-red-500/20 text-red-300/40 border border-red-500/20 cursor-default'
                                      : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 active:scale-95'
                                  }`}
                                  title="Reject pickup request"
                                >
                                  <Icon name="close" size={13} />
                                  REJECT
                                </button>

                                {/* Overflow dropdown for status overrides */}
                                <select
                                  value={d.status}
                                  onChange={e => handleStatusChange(d.id, e.target.value)}
                                  className="border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs bg-[#0d2415] focus:outline-none cursor-pointer"
                                  aria-label="Change status dropdown"
                                >
                                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
