'use client'

import Link from 'next/link'
import { MethodIcon } from './icons/MethodIcon'

interface MethodNoteProps {
  summary: string
  href: string
}

export function MethodNote({ summary, href }: MethodNoteProps) {
  return (
    <aside className="my-12 mx-auto max-w-3xl px-6 lg:px-8">
      <div className="flex items-start gap-3">
        <MethodIcon className="w-5 h-5 text-[var(--muted)] flex-shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-3">
          <p className="text-[var(--muted)] leading-relaxed">
            {summary}
          </p>
          <Link
            href={href}
            className="inline-flex items-center text-[var(--accent)] font-semibold focus:outline-none focus:ring-[var(--focus-ring)]"
          >
            Approfondisci il metodo
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  )
}
