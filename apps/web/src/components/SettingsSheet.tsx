'use client'

import Link from 'next/link'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  theme: 'dark' | 'light'
  textScale: 'small' | 'normal' | 'large'
  animations: 'on' | 'reduce'
  onThemeChange: (t: 'dark' | 'light') => void
  onTextScaleChange: (s: 'small' | 'normal' | 'large') => void
  onAnimationsChange: (a: 'on' | 'reduce') => void
  strings: {
    title: string
    closeLabel: string
    themeLabel: string
    darkLabel: string
    lightLabel: string
    animationsLabel: string
    animationsOn: string
    animationsReduce: string
    textSizeLabel: string
    textSmall: string
    textNormal: string
    textLarge: string
    accessLabel: string
    loginLabel: string
    signupLabel: string
    accessNote: string
  }
}

export function SettingsSheet({
  open,
  onClose,
  theme,
  textScale,
  animations,
  onThemeChange,
  onTextScaleChange,
  onAnimationsChange,
  strings,
}: SettingsSheetProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[var(--backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-label="Impostazioni rapide"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-[var(--surface)] border border-[var(--br)] rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--br)]">
            <h3 className="text-lg font-semibold text-[var(--ink)]">{strings.title}</h3>
            <button
              onClick={onClose}
              aria-label={strings.closeLabel}
              className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink)]">{strings.themeLabel}</p>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => onThemeChange(mode)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === mode ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-[var(--br)] text-[var(--muted)]'
                  }`}
                >
                  {mode === 'dark' ? strings.darkLabel : strings.lightLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink)]">{strings.animationsLabel}</p>
            <div className="flex gap-2">
              {(['on', 'reduce'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => onAnimationsChange(mode)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    animations === mode ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-[var(--br)] text-[var(--muted)]'
                  }`}
                >
                  {mode === 'on' ? strings.animationsOn : strings.animationsReduce}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink)]">{strings.textSizeLabel}</p>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'normal', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => onTextScaleChange(size)}
                  className={`px-3 py-2 rounded-lg border ${
                    textScale === size ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-[var(--br)] text-[var(--muted)]'
                  }`}
                >
                  {size === 'small' ? strings.textSmall : size === 'normal' ? strings.textNormal : strings.textLarge}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink)]">{strings.accessLabel}</p>
            <div className="flex gap-2">
              <Link href="/login" className="flex-1 btn-secondary justify-center">
                {strings.loginLabel}
              </Link>
              <Link href="/signup" className="flex-1 btn-primary justify-center">
                {strings.signupLabel}
              </Link>
            </div>
            <p className="text-xs text-[var(--muted)]">{strings.accessNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
