'use client'

import { useEffect, useRef } from 'react'

interface DrawerSection {
  heading: string
  body: string
}

interface DrawerSource {
  label: string
  url: string
}

interface GlossaryDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  sections: DrawerSection[]
  sources: DrawerSource[]
}

export function GlossaryDrawer({ open, onClose, title, sections, sources }: GlossaryDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus trap and accessibility
  useEffect(() => {
    if (open) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the close button
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // ESC key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    } else {
      // Return focus when closing
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [open, onClose])

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--backdrop)]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        ref={dialogRef}
        className="bg-[var(--surface)] border border-[var(--br)] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--br)]">
          <h2 id="drawer-title" className="text-xl font-semibold text-[var(--ink)]">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:ring-[var(--focus-ring)] focus:outline-none"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {sections.map((section, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <h3 className="text-lg font-medium text-[var(--ink)] mb-3">
                {section.heading}
              </h3>
              <div className="text-[var(--muted)] leading-relaxed prose prose-invert max-w-none">
                <p>{section.body}</p>
              </div>
            </div>
          ))}

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[var(--br)]">
              <h4 className="text-sm font-medium text-[var(--ink)] mb-3">Fonti</h4>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:text-[var(--accent-2)] underline underline-offset-2 transition-colors focus:ring-[var(--focus-ring)] focus:outline-none rounded-sm"
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
