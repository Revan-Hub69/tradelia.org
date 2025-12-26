import { useEffect } from 'react'

interface AIAssistantDrawerProps {
  open: boolean
  onClose: () => void
}

export function AIAssistantDrawer({ open, onClose }: AIAssistantDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-[var(--surface)] border border-[var(--br)] rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--br)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-kicker">AI Assistant</span>
              <h2 className="text-2xl font-bold text-[var(--ink)] mt-2">Crypto Risk Assistant</h2>
            </div>
            <button onClick={onClose} className="btn-ghost" aria-label="Close AI Assistant">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[var(--muted)]">AI Assistant feature coming soon. This will provide intelligent assistance for crypto risk assessment and decision making.</p>
        </div>
      </div>
    </div>
  )
}