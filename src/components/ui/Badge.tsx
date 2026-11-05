import type { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'teal' | 'surface' | 'outline' | 'amber' | 'red'
}

const STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  lime:    'bg-[#9BE564]/15 text-[#9BE564] border border-[#9BE564]/30',
  teal:    'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30',
  surface: 'bg-white/8 text-white/60 border border-white/10',
  outline: 'bg-transparent text-white/50 border border-white/15',
  amber:   'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  red:     'bg-red-500/15 text-red-300 border border-red-500/30',
}

export function Badge({ variant = 'lime', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full text-xs px-2.5 py-1 ${STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
