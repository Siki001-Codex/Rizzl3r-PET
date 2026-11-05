import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'
import { PET_GRADES, FREQUENCY_TIERS, calculatePayout } from '../lib/payout'
import { formatMoney, formatPerKg } from '../lib/currency'
import { Modal } from './ui'
import { Icon } from './ui'
import type { PetGrade, FrequencyTier, Currency } from '../types'

const GRADE_ICONS: Record<PetGrade, string> = {
  'grade-a': 'water_drop',
  'grade-b': 'palette',
  'mixed': 'shuffle',
  'factory-baled': 'inventory_2',
}

const VOLUME_PRESETS = [50, 250, 1000, 2500]

interface CalculatorModalProps {
  open: boolean
  onClose: () => void
  onBookPickup: (grade: PetGrade, volume: number) => void
  initialGrade?: PetGrade
  initialVolume?: number
}

export default function CalculatorModal({ open, onClose, onBookPickup, initialGrade, initialVolume }: CalculatorModalProps) {
  const { currency, setCurrency } = useCurrency()
  const [step, setStep] = useState(1)
  const [grade, setGrade] = useState<PetGrade>(initialGrade || 'grade-a')
  const [volume, setVolume] = useState(initialVolume || 500)
  const [volumeInput, setVolumeInput] = useState(String(initialVolume || 500))
  const [tier, setTier] = useState<FrequencyTier>('standard')

  const result = calculatePayout(grade, volume, tier, currency)
  const gradeInfo = PET_GRADES[grade]
  const tierInfo = FREQUENCY_TIERS[tier]

  useEffect(() => {
    if (open) {
      setStep(1)
      if (initialGrade) setGrade(initialGrade)
      if (initialVolume) { setVolume(initialVolume); setVolumeInput(String(initialVolume)) }
    }
  }, [open, initialGrade, initialVolume])

  const handleVolumeInput = (val: string) => {
    setVolumeInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) setVolume(Math.min(n, 50000))
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🌿 Rizzl3r PET Recovery Quote\n\nGrade: ${gradeInfo.name}\nVolume: ${volume} kg\nFrequency: ${tierInfo.name}\nEstimated Payout: ${formatMoney(result.grossNGN, currency)}\n\nI'd like to schedule a pickup. Please confirm availability.\n\n📞 09069935434`
    )
    window.open(`https://wa.me/2349069935434?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const CURRENCIES: Currency[] = ['NGN', 'USD', 'GBP']
  const SYMBOLS: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£' }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon name="calculate" size={18} className="text-[#9BE564]" />
            <span className="text-white font-bold">Payout Calculator</span>
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 gap-0.5 mr-8">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${currency === c ? 'bg-[#9BE564] text-[#021709]' : 'text-white/60 hover:text-white'}`}
                aria-pressed={currency === c}>{SYMBOLS[c]}</button>
            ))}
          </div>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => s < step && setStep(s)}
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all
                ${step === s ? 'bg-[#9BE564] text-[#021709]' : step > s ? 'bg-[#9BE564]/30 text-[#9BE564]' : 'bg-white/10 text-white/40'}
                ${s < step ? 'cursor-pointer' : 'cursor-default'}`}>
              {step > s ? <Icon name="check" size={12} /> : s}
            </button>
            {s < 3 && <div className={`flex-1 h-px w-8 ${step > s ? 'bg-[#9BE564]/60' : 'bg-white/10'}`} />}
          </div>
        ))}
        <span className="text-white/40 text-xs ml-2">
          {step === 1 ? 'Select Grade' : step === 2 ? 'Set Volume & Frequency' : 'Your Payout'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Grade */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-white font-semibold mb-4">What grade of PET bottles are you supplying?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(PET_GRADES) as [PetGrade, typeof PET_GRADES[PetGrade]][]).map(([key, g]) => (
                <button key={key} onClick={() => setGrade(key)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 ${grade === key ? 'border-[#9BE564] bg-[#9BE564]/10 ring-1 ring-[#9BE564]/40' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                  aria-pressed={grade === key}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${grade === key ? 'bg-[#9BE564]/20' : 'bg-white/10'}`}>
                      <Icon name={GRADE_ICONS[key]} size={20} className={grade === key ? 'text-[#9BE564]' : 'text-white/50'} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{g.name}</div>
                      <div className="text-[#9BE564] text-sm font-bold">{formatPerKg(g.rateNGN, currency)}</div>
                      <div className="text-white/50 text-xs mt-1">{g.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="mt-6 w-full py-3 rounded-xl bg-[#9BE564] text-[#021709] font-bold hover:bg-[#9BE564]/90 transition-colors flex items-center justify-center gap-2">
              Continue <Icon name="arrow_forward" size={16} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Volume + Frequency */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-white font-semibold mb-4">Volume &amp; Collection Frequency</h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="vol-slider" className="text-white/70 text-sm">Estimated Volume (kg)</label>
                <input type="number" value={volumeInput} onChange={e => handleVolumeInput(e.target.value)}
                  className="w-24 bg-[#0d2415] border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#9BE564]/50"
                  min={1} max={50000} />
              </div>
              <input id="vol-slider" type="range" min={1} max={5000} value={Math.min(volume, 5000)}
                onChange={e => { const v = Number(e.target.value); setVolume(v); setVolumeInput(String(v)) }}
                className="w-full accent-[#9BE564] h-2 rounded-full" />
              <div className="flex justify-between text-white/30 text-xs mt-1"><span>1 kg</span><span>5,000 kg</span></div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {VOLUME_PRESETS.map(p => (
                  <button key={p} onClick={() => { setVolume(p); setVolumeInput(String(p)) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${volume === p ? 'bg-[#9BE564]/20 border-[#9BE564]/40 text-[#9BE564]' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                    {p.toLocaleString()} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white/70 text-sm mb-3 block">Collection Frequency</label>
              <div className="flex flex-col gap-2">
                {(Object.entries(FREQUENCY_TIERS) as [FrequencyTier, typeof FREQUENCY_TIERS[FrequencyTier]][]).map(([key, t]) => (
                  <button key={key} onClick={() => setTier(key)}
                    className={`text-left p-3 rounded-xl border transition-all ${tier === key ? 'border-[#9BE564]/60 bg-[#9BE564]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                    aria-pressed={tier === key}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium text-sm">{t.name}</span>
                        <span className="text-white/50 text-xs ml-2">{t.description}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.bonus > 0 ? 'bg-[#9BE564]/20 text-[#9BE564]' : 'bg-white/10 text-white/50'}`}>
                        {t.bonus > 0 ? `+${(t.bonus * 100).toFixed(0)}%` : 'Base Rate'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm flex items-center gap-1">
                <Icon name="arrow_back" size={16} /> Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-[#9BE564] text-[#021709] font-bold hover:bg-[#9BE564]/90 transition-colors flex items-center justify-center gap-2">
                Calculate Payout <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payout result */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-white font-semibold mb-4">Your Estimated Payout</h3>
            <div className="bg-[#9BE564]/10 border border-[#9BE564]/30 rounded-2xl p-5 mb-5">
              <div className="flex flex-wrap gap-2 mb-4">
                {[gradeInfo.name, `${volume.toLocaleString()} kg`, tierInfo.name].map(tag => (
                  <span key={tag} className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/60">{tag}</span>
                ))}
              </div>
              <div className="text-4xl font-bold text-[#9BE564] mb-1">{formatMoney(result.grossNGN, currency)}</div>
              <div className="text-white/40 text-sm mb-4">
                {currency !== 'NGN' && <span className="mr-3">≈ {formatMoney(result.grossNGN, 'NGN')}</span>}
                {currency !== 'USD' && <span>≈ {formatMoney(result.grossNGN, 'USD')}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-[#9BE564] text-xl font-bold">{result.estimatedBottles.toLocaleString()}</div>
                  <div className="text-white/50 text-xs">Bottles Diverted</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-[#9BE564] text-xl font-bold">{result.co2Saved.toFixed(1)} t</div>
                  <div className="text-white/50 text-xs">CO₂ Saved</div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                {[
                  { label: 'Base rate', value: formatPerKg(gradeInfo.rateNGN, currency) },
                  { label: 'Volume', value: `${volume.toLocaleString()} kg` },
                  { label: `Frequency bonus`, value: `+${(tierInfo.bonus * 100).toFixed(0)}%` },
                  { label: 'Gross payout', value: formatMoney(result.grossNGN, currency), highlight: true },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between text-sm ${row.highlight ? 'text-white font-semibold pt-2 border-t border-white/10' : 'text-white/50'}`}>
                    <span>{row.label}</span>
                    <span className={row.highlight ? 'text-[#9BE564]' : ''}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { onBookPickup(grade, volume); onClose() }}
                className="flex-1 py-3 rounded-xl bg-[#9BE564] text-[#021709] font-bold hover:bg-[#9BE564]/90 transition-colors flex items-center justify-center gap-2">
                <Icon name="local_shipping" size={16} /> Lock In Rate &amp; Book Pickup
              </button>
              <button onClick={handleWhatsApp}
                className="flex-1 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-600/30 transition-colors flex items-center justify-center gap-2 text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share via WhatsApp
              </button>
            </div>
            <button onClick={() => setStep(1)} className="mt-3 w-full text-center text-white/40 hover:text-white/60 text-sm transition-colors">
              ← Recalculate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
