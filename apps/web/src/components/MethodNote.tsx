'use client'

import Link from 'next/link'
import { MethodIcon } from './icons/MethodIcon'

interface MethodNoteProps {
  summary: string
  href: string
}

export function MethodNote({ summary, href }: MethodNoteProps) {
  return (
    <aside className="my-12 mx-auto max-w-4xl px-6 lg:px-8">
      <div className="bg-[var(--surface)] border-l-4 border-[var(--accent)] pl-6 py-4 pr-4 rounded-r-lg">
        <div className="flex items-start space-x-4">
          <MethodIcon className="w-6 h-6 text-[var(--accent)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[var(--muted)] leading-relaxed mb-3">
              {summary}
            </p>
            <Link
              href={href}
              className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-2)] font-medium transition-colors focus:ring-[var(--focus-ring)] focus:outline-none rounded-sm"
            >
              Approfondisci il metodo →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
