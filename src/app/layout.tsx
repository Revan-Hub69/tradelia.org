import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'Tradelia — Analisi costi operativi',
  description:
    'Tool di analisi informativa dei costi operativi e dell’attrito nei mercati finanziari.'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="it">
      <body className="bg-white text-slate-900">
        {children}
      </body>
    </html>
  )
}
