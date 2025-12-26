import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Tradelia · Micro-lezioni finanziarie',
    template: '%s | Tradelia',
  },
  description: 'Raccolta di micro-lezioni statiche per evitare errori finanziari comuni. Contenuti educativi, nessuna consulenza.',
  keywords: [
    'educazione finanziaria', 'microlearning', 'errori finanziari', 'investimenti consapevoli', 'finanza personale'
  ],
  authors: [{ name: 'Tradelia' }],
  creator: 'Tradelia',
  publisher: 'Tradelia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tradelia.org'),
  alternates: {
    canonical: 'https://tradelia.org',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Tradelia · Micro-lezioni finanziarie',
    description: 'Micro-lezioni statiche per ridurre errori finanziari. Nessuna consulenza, solo contenuti educativi.',
    url: 'https://tradelia.org',
    siteName: 'Tradelia',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og/tradelia-og.png',
        width: 1200,
        height: 630,
        alt: 'Tradelia · Micro-lezioni finanziarie',
        type: 'image/png',
      },
      {
        url: '/og/tradelia-og-square.png',
        width: 400,
        height: 400,
        alt: 'Tradelia Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tradelia_ai',
    creator: '@tradelia_ai',
    title: 'Tradelia · Micro-lezioni finanziarie',
    description: 'Micro-lezioni statiche per ridurre errori finanziari. Nessuna consulenza, solo contenuti educativi.',
    images: [{
      url: '/og/tradelia-og.png',
      alt: 'Tradelia · Micro-lezioni finanziarie'
    }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tradelia" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Tradelia',
              url: 'https://tradelia.org',
              logo: 'https://tradelia.org/favicon.svg',
              description: 'Raccolta di micro-lezioni educative sugli errori finanziari.',
              sameAs: [
                'https://twitter.com/tradelia_ai'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: 'https://tradelia.org'
              },
              foundingDate: '2025',
              knowsAbout: [
                'Educazione finanziaria',
                'Gestione del rischio personale',
                'Errori di investimento',
                'Decisioni consapevoli'
              ]
            }),
          }}
        />
      </head>
      <body className={inter.className} data-theme="dark">
        {children}
      </body>
    </html>
  )
}
