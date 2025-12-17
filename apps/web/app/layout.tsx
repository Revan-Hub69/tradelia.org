import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Tradelia — Analisi Quantitativa Crypto',
  description: 'Indicatori crypto istituzionali basati su ricerca accademica. Analisi quantitative real-time senza segnali di trading.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  )
}
