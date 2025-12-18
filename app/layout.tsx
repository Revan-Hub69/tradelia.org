import type { Metadata } from 'next'
import '../globals.css'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tradelia',
  description: 'Sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi',
  url: 'https://tradelia.org',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR'
  },
  provider: {
    '@type': 'Organization',
    name: 'Tradelia',
    description: 'Sistema indipendente di verifica servizi finanziari'
  },
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Cos\'è Tradelia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tradelia è un sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi. Non è consulenza finanziaria.'
        }
      },
      {
        '@type': 'Question', 
        name: 'Quando usare Tradelia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Prima di aprire un conto, collegare una carta, usare un wallet, scegliere un exchange o affidare soldi a un broker.'
        }
      }
    ]
  }
}

export const metadata: Metadata = {
  title: {
    default: 'Tradelia - Sistema indipendente di verifica servizi finanziari',
    template: '%s | Tradelia'
  },
  description: 'Sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi. Verifica prima di scegliere.',
  keywords: [
    'verifica servizi finanziari',
    'controllo costi nascosti',
    'analisi indipendente',
    'conti correnti',
    'wallet crypto',
    'exchange',
    'broker',
    'limiti servizi finanziari',
    'costi reali',
    'vincoli paese'
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
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://tradelia.org',
    title: 'Tradelia - Sistema indipendente di verifica servizi finanziari',
    description: 'Sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi.',
    siteName: 'Tradelia',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tradelia - Verifica prima di scegliere',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tradelia - Sistema indipendente di verifica servizi finanziari',
    description: 'Sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}