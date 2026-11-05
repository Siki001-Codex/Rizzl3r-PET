import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createDispatch } from '../lib/api'
import { Icon } from './ui'
import type { PetGrade } from '../types'

const VOLUME_OPTIONS = [
  '< 50 kg (Small – Household)',
  '50 – 250 kg (Medium – School / SME)',
  '250 – 1,000 kg (Large – Hotel / Corporate)',
  '1,000 – 5,000 kg (Bulk – Industrial)',
  '5,000+ kg (Enterprise – Factory Baled)',
]

interface BookingFormProps {
  prefillGrade?: PetGrade
  prefillVolume?: number
}

export default function BookingForm({ prefillGrade, prefillVolume }: BookingFormProps) {
  const successRef = useRef<HTMLDivElement>(null)

  function matchVolume(kg: number): string {
    if (kg < 50) return VOLUME_OPTIONS[0]
    if (kg < 250) return VOLUME_OPTIONS[1]
    if (kg < 1000) return VOLUME_OPTIONS[2]
    if (kg < 5000) return VOLUME_OPTIONS[3]
    return VOLUME_OPTIONS[4]
  }

  const [form, setForm] = useState({
    name: '', whatsapp: '', email: '', address: '',
    volume: prefillVolume ? matchVolume(prefillVolume) : VOLUME_OPTIONS[0],
    targetDate: '', notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (prefillVolume) setForm(f => ({ ...f, volume: matchVolume(prefillVolume) }))
  }, [prefillVolume])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.whatsapp.match(/^[0-9+\s]{7,15}$/)) e.whatsapp = 'Enter a valid phone number'
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email'
    if (!form.address.trim()) e.address = 'Pickup address is required'
    if (!form.targetDate) e.targetDate = 'Please select a target date'
    else if (new Date(form.targetDate) < new Date()) e.targetDate = 'Date must be in the future'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('submitting')
    try {
      await createDispatch({
        customerName: form.name, phone: form.whatsapp, email: form.email,
        address: form.address, volumeRange: form.volume, targetDate: form.targetDate,
        notes: form.notes, grade: prefillGrade || 'mixed',
      })
      setStatus('success')
      setForm({ name: '', whatsapp: '', email: '', address: '', volume: VOLUME_OPTIONS[0], targetDate: '', notes: '' })
      setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    } catch { setStatus('error') }
  }

  const inputCls = (err?: string) =>
    `w-full bg-[#0d2415]/80 border ${err ? 'border-red-500/60' : 'border-white/15'} rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50 focus:border-[#9BE564]/40 transition-all`

  if (status === 'success') {
    return (
      <motion.div ref={successRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-[#9BE564]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check_circle" size={32} className="text-[#9BE564]" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Dispatch Request Received!</h3>
        <p className="text-white/60 text-sm mb-6">Our team will contact you within 2 hours to confirm your pickup slot.</p>
        <button onClick={() => setStatus('idle')} className="text-[#9BE564] text-sm hover:underline">Submit another request</button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 md:p-8 space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-1.5">Full Name / Organisation</label>
          <input id="name" type="text" placeholder="e.g. Babatunde Adeleke" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls(errors.name)} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-white/70 text-sm font-medium mb-1.5">WhatsApp Number</label>
          <input id="whatsapp" type="tel" placeholder="+234 906 993 5434" value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className={inputCls(errors.whatsapp)} />
          {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">Email Address (optional)</label>
        <input id="email" type="email" placeholder="you@example.com" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls(errors.email)} />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-white/70 text-sm font-medium mb-1.5">Pickup Address</label>
        <input id="address" type="text" placeholder="Street, Area, Lagos" value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls(errors.address)} />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="volume" className="block text-white/70 text-sm font-medium mb-1.5">Estimated Volume</label>
          <select id="volume" value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
            className={inputCls() + ' cursor-pointer'}>
            {VOLUME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="targetDate" className="block text-white/70 text-sm font-medium mb-1.5">Target Pickup Date</label>
          <input id="targetDate" type="date" value={form.targetDate} min={new Date().toISOString().split('T')[0]}
            onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className={inputCls(errors.targetDate)} />
          {errors.targetDate && <p className="text-red-400 text-xs mt-1">{errors.targetDate}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-white/70 text-sm font-medium mb-1.5">Additional Notes (optional)</label>
        <textarea id="notes" rows={3} placeholder="Access instructions, special requirements…" value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls() + ' resize-none'} />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          Something went wrong. Please try again or call 09069935434 directly.
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'}
        className="w-full py-4 rounded-xl bg-[#9BE564] text-[#021709] font-bold text-sm hover:bg-[#9BE564]/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {status === 'submitting' ? (
          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Submitting…</>
        ) : (
          <><Icon name="local_shipping" size={16} /> Book a Dispatch Pickup</>
        )}
      </button>
      <p className="text-center text-white/30 text-xs">Response within 2 hours · No commitment required</p>
    </form>
  )
}
