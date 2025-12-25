'use client'

import { useEffect, useRef } from 'react'

interface Section {
  title: string
  body: string
}

interface Source {
  label: string
  url: string
}

interface MethodologyDrawerProps {
  open: boolean
  onClose: () => void
  kicker: string
  title: string
  referencesLabel: string
  closeLabel: string
  sections: Section[]
  sources: Source[]
}

export function MethodologyDrawer({ open, onClose, kicker, title, referencesLabel, closeLabel, sections, sources }: MethodologyDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--backdrop)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Note metodologiche e riferimenti"
    >
      <div className="bg-[var(--surface)] border border-[var(--br)] rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--br)]">
          <div>
            <p className="text-sm text-[var(--muted)] uppercase tracking-wide">{kicker}</p>
            <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:ring-[var(--focus-ring)] focus:outline-none"
            aria-label={closeLabel}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--ink)]">{section.title}</h3>
              <p className="text-[var(--muted)] leading-relaxed">{section.body}</p>
            </div>
          ))}

          {sources.length > 0 && (
            <div className="pt-4 border-t border-[var(--br)] space-y-3">
              <h4 className="text-sm font-semibold text-[var(--ink)] uppercase tracking-wide">{referencesLabel}</h4>
              <ul className="space-y-2">
                {sources.map((source, idx) => (
                  <li key={idx}>
                    <a
                      className="text-[var(--accent)] hover:text-[var(--accent-2)] underline underline-offset-2"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
