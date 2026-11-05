import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-secondary text-[#081F10] hover:brightness-105 shadow-[0_0_20px_rgba(155,229,100,0.35)] hover:shadow-[0_0_24px_rgba(155,229,100,0.55)] border border-secondary-fixed',
      secondary:
        'bg-transparent text-on-surface border border-white/20 hover:border-tertiary hover:bg-tertiary/10 hover:text-white',
      ghost:
        'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
      danger:
        'bg-red-950/40 text-red-300 border border-red-500/40 hover:bg-red-900/50 hover:border-red-400',
      glass:
        'bg-surface-container-high/90 text-on-surface border border-white/10 hover:border-secondary/40 hover:bg-surface-bright backdrop-blur-md shadow-md',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="material-symbols-outlined text-[18px] animate-spin">
            progress_activity
          </span>
        ) : (
          icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="inline-flex shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

