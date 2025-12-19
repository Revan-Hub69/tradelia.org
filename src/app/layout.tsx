import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/Footer'
import { SiteHeader } from '@/components/site/Header'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tradelia.org'),
  title: 'Tradelia | Guida decisionale indipendente per scelte finanziarie',
  description:
    'Basata su fonti ufficiali e criteri verificabili per far emergere costi, vincoli tecnici e tutele reali. Nessun ranking, nessuna promessa di rendimento.',
  openGraph: {
    title: 'Tradelia | Guida decisionale indipendente per scelte finanziarie',
    description:
      'Analisi istituzionale basata su fonti ufficiali per valutare costi nascosti, vincoli tecnici e tutele reali.',
    url: 'https://tradelia.org',
    siteName: 'Tradelia',
    locale: 'it_IT',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tradelia | Guida decisionale indipendente per scelte finanziarie',
    description:
      'Fonti ufficiali, criteri auditabili e zero ranking promozionali per scelte finanziarie più chiare.'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <a className="skip-to-content" href="#contenuto-principale">
          Salta al contenuto principale
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
