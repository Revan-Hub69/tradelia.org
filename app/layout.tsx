import type { Metadata } from 'next'
import { Inter, IBM_Plex_Serif } from 'next/font/google'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const ibmPlexSerif = IBM_Plex_Serif({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'Tradelia - Cost & Execution Friction Analyzer',
  description: 'Analizza costi, esecuzione e compatibilità operativa tra il tuo stile di trading e le piattaforme disponibili.',
  keywords: [
    'trading costs analysis',
    'broker comparison',
    'execution friction',
    'CFD costs',
    'crypto trading fees',
    'financial analysis'
  ],
  authors: [{ name: 'Tradelia' }],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${inter.variable} ${ibmPlexSerif.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}