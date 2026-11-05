import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated' | 'highlight' | 'flat';
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'base', hoverEffect = false, children, ...props }, ref) => {
    const baseStyles = 'relative rounded-2xl transition-all duration-300 overflow-hidden';

    const variants = {
      base: 'bg-surface-container/75 backdrop-blur-xl border border-white/10 shadow-xl',
      elevated:
        'bg-surface-container-high/90 backdrop-blur-2xl border border-secondary/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
      highlight:
        'bg-gradient-to-br from-primary-container/80 via-surface-container/70 to-surface-container-low/90 backdrop-blur-xl border border-secondary/40 shadow-2xl',
      flat: 'bg-surface-container-low border border-outline-variant/30',
    };

    const hoverStyles = hoverEffect
      ? 'hover:border-secondary/50 hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.65),0_0_20px_rgba(155,229,100,0.15)] hover:-translate-y-0.5'
      : '';

    return (
      <div
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], hoverStyles, className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

