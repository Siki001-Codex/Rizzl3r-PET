import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && dialogRef.current) {
        const els = dialogRef.current.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
        if (!els.length) return
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus()
        }
      }
    }

    window.addEventListener('keydown', handler)
    setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('button,input,[tabindex]')?.focus()
    }, 50)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
      prevFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-3xl bg-surface-800 border border-secondary/30 shadow-2xl z-10`}
        style={{ background: 'rgba(8, 31, 16, 0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(155,229,100,0.1)' }}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-900/80 backdrop-blur-md rounded-t-3xl">
            <div className="flex-1 text-white font-bold">{title}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="ml-2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
