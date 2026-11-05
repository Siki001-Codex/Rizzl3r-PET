import { useEffect, useState, useRef } from 'react'

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function CountUp({ end, start = 0, duration = 2000, suffix = '', prefix = '', decimals = 0, className = '' }: CountUpProps) {
  const [value, setValue] = useState(start)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end); return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated.current) {
        animated.current = true
        let startTime: number | null = null
        const tick = (ts: number) => {
          if (!startTime) startTime = ts
          const pct = Math.min((ts - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - pct, 3)
          setValue(start + (end - start) * eased)
          if (pct < 1) requestAnimationFrame(tick)
          else setValue(end)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, start, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
