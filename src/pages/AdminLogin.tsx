import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { login } from '../lib/api'
import { Icon } from '../components/ui'

const DEMO_EMAIL = 'Sixtus7498@gmail.com'
const DEMO_PASS  = 'Sixtus55!!'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [status, setStatus]       = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg]   = useState('')
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    await new Promise(r => setTimeout(r, 1600))
    if (login(DEMO_EMAIL, password)) {
      navigate('/admin')
    } else {
      setStatus('error')
      setErrorMsg('Invalid credentials. Please enter the correct access key.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#010f05' }}>
      {/* Radial lime glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(155,229,100,0.07) 0%, transparent 70%)' }} aria-hidden="true" />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(155,229,100,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(155,229,100,0.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }} aria-hidden="true" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-sm relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-[#9BE564] transition-colors py-1 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:border-[#9BE564]/30">
            <Icon name="arrow_back" size={14} />
            <span>Return to Home</span>
          </Link>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">SECURE LOGIN</span>
        </div>
        <div className="glass-panel rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(155,229,100,0.12)', border: '1px solid rgba(155,229,100,0.3)' }}>
              <Icon name="recycling" size={30} className="text-[#9BE564]" />
            </div>
            <h1 className="text-white font-display font-extrabold text-lg tracking-wide">RIZZL3R PET CIRCULARITY</h1>
            <p className="text-[#9BE564] text-xs font-semibold tracking-widest uppercase mt-1">National Admin Operations Portal</p>
            <p className="text-white/40 text-xs mt-2">Nationwide Network (All 36 States &amp; FCT) · Secure Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email — read-only */}
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5" htmlFor="email">Whitelisted Root Admin Email</label>
              <div className="relative">
                <input id="email" type="email" value={DEMO_EMAIL} readOnly
                  className="w-full border border-white/10 rounded-xl px-4 py-3 text-white/60 text-sm focus:outline-none cursor-default pr-10"
                  style={{ background: 'rgba(255,255,255,0.03)' }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BE564]">
                  <Icon name="lock" size={14} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5" htmlFor="password">Superadmin Access Key</label>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); if (status === 'error') setStatus('idle') }}
                  placeholder="Enter access key…" autoComplete="current-password"
                  className={`w-full border ${status === 'error' ? 'border-red-500/60' : 'border-white/15'} rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50 transition-all`}
                  style={{ background: 'rgba(13,36,21,0.6)' }} />
                <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={16} />
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {status === 'error' && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs rounded-xl px-3 py-2 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }} role="alert">
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-[#021709] hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: '#9BE564' }}>
              {status === 'loading' ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Verifying Hash Tokens…</>
              ) : (
                <><Icon name="login" size={16} /> Authenticate</>
              )}
            </button>
          </form>

          {/* Bay + 2FA info */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">National Operations Hub</span>
              <span className="text-white/70 font-medium">Nationwide Bays (Lagos, Abuja, PH, Kano) — Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">2FA Device</span>
              <span className="text-[#2DD4BF] font-medium flex items-center gap-1">
                <Icon name="smartphone" size={12} /> +234 906 993 5434 · SYNCED
              </span>
            </div>
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Rizzl3r PET Recovery · <span className="text-[#9BE564]/40">DEMO PORTAL</span>
        </p>
      </motion.div>
    </div>
  )
}
