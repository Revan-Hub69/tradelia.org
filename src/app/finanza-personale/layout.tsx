import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { headers } from 'next/headers'

import { FinanzaPersonaleFooter } from '@/components/finanza-personale/Footer'
import { FinanzaPersonaleHeader } from '@/components/finanza-personale/Header'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Finanza personale | Tradelia',
  url: 'https://tradelia.org/finanza-personale',
  description:
    'Percorso standalone dedicato a conti, carte e banche con criteri verificabili e nessun tracking.',
  publisher: {
    '@type': 'Organization',
    name: 'Tradelia',
    url: 'https://tradelia.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://tradelia.org/icon.svg'
    }
  }
}

export const metadata: Metadata = {
  title: 'Finanza personale | Tradelia',
  description:
    'Percorso standalone dedicato a conti, carte e banche con criteri verificabili e nessun tracking.',
  alternates: {
    canonical: 'https://tradelia.org/finanza-personale'
  },
  openGraph: {
    title: 'Finanza personale | Tradelia',
    description:
      'Percorso standalone dedicato a conti, carte e banche con criteri verificabili e nessun tracking.',
    url: 'https://tradelia.org/finanza-personale',
    siteName: 'Tradelia',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'Tradelia'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finanza personale | Tradelia',
    description:
      'Percorso standalone dedicato a conti, carte e banche con criteri verificabili e nessun tracking.',
    images: ['/og.svg']
  },
  icons: {
    icon: '/icon.svg'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default async function FinanzaPersonaleLayout({ children }: { children: ReactNode }) {
  const headerList = await headers()
  const nonce = headerList.get('x-nonce') ?? undefined

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Script
        id="tradelia-finanza-personale-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        nonce={nonce}
      />
      <FinanzaPersonaleHeader />
      <main>{children}</main>
      <FinanzaPersonaleFooter />
    </div>
  )
}
