import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext'
import { Icon } from '../ui'
import type { Currency } from '../../types'

const CURRENCIES: Currency[] = ['NGN', 'USD', 'GBP']
const CURRENCY_SYMBOLS: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£' }

interface NavbarProps {
  onOpenCalculator?: () => void
  onScrollTo?: (id: string) => void
}

export default function Navbar({ onOpenCalculator, onScrollTo }: NavbarProps) {
  const { currency, setCurrency } = useCurrency()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Services', id: 'services' },
    { label: 'Rates', id: 'rates' },
    { label: 'About', id: 'journey' },
    { label: 'Contact', id: 'booking' },
  ]

  const handleNavClick = useCallback((id: string) => {
    setMobileOpen(false)
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (onScrollTo) onScrollTo(id)
    else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [onScrollTo])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isLanding
            ? 'bg-[#021709]/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo acting as Home Link — scrolls to top if already on home */}
            <Link
              to="/"
              onClick={(e) => {
                if (isLanding) {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                setMobileOpen(false)
              }}
              className="flex items-center gap-2 group cursor-pointer"
              aria-label="Rizzl3r PET Recovery home"
            >
              <div className="w-9 h-9 rounded-xl bg-[#9BE564]/20 border border-[#9BE564]/40 flex items-center justify-center group-hover:bg-[#9BE564]/30 transition-colors">
                <Icon name="recycling" size={20} className="text-[#9BE564]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-sm font-display tracking-wide leading-none block">RIZZL3R PET</span>
                <span className="text-[#9BE564] text-[10px] font-medium tracking-widest uppercase leading-none">Recovery</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            {isLanding && (
              <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-white/70 hover:text-[#9BE564] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE564]/50 rounded cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Currency toggle */}
              <div className="flex items-center bg-surface-800/60 border border-white/10 rounded-full p-0.5 gap-0.5" role="group" aria-label="Currency selector">
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE564]/50 ${
                      currency === c
                        ? 'bg-[#9BE564] text-[#021709] shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                    aria-pressed={currency === c}
                    aria-label={`Switch to ${c}`}
                  >
                    {CURRENCY_SYMBOLS[c]}
                  </button>
                ))}
              </div>

              {/* Estimate Payout CTA */}
              <button
                onClick={onOpenCalculator}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9BE564] text-[#021709] text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(155,229,100,0.35)] cursor-pointer"
              >
                <Icon name="calculate" size={15} />
                Estimate Payout
              </button>

              {/* Admin Portal Shortcut Button */}
              <Link
                to="/admin/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                title="Admin Portal"
              >
                <Icon name="lock" size={13} className="text-[#9BE564]" />
                Admin
              </Link>

              {/* Mobile menu toggle */}
              {isLanding && (
                <button
                  className="md:hidden p-2 text-white/70 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE564]/50 cursor-pointer"
                  onClick={() => setMobileOpen(v => !v)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                >
                  <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/10 bg-[#021709]/98 backdrop-blur-xl"
            >
              <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left px-4 py-3 text-white/80 hover:text-[#9BE564] hover:bg-white/5 rounded-xl transition-colors text-sm font-medium flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    {link.id === 'hero' && <Icon name="home" size={16} className="text-[#9BE564]/60" />}
                  </button>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2 flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); onOpenCalculator?.() }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9BE564] text-[#021709] font-bold text-sm"
                  >
                    <Icon name="calculate" size={16} />
                    Estimate Payout
                  </button>
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10"
                  >
                    <Icon name="lock" size={15} className="text-[#9BE564]" />
                    Admin Portal
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
