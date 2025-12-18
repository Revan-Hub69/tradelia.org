import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Tradelia — Market Intelligence Cripto | Risk & Context Engine',
  description: 'Capisci il rischio del mercato cripto prima di fare qualsiasi operazione. Dati ufficiali in streaming + analisi contestuale. Nessun segnale, nessuna promessa di profitto. Educational only.',
  keywords: 'crypto risk, market intelligence, bitcoin risk, crypto analysis, market context, risk management, crypto education',
  authors: [{ name: 'Tradelia' }],
  creator: 'Tradelia',
  publisher: 'Tradelia',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://tradelia.org',
    title: 'Tradelia — Market Intelligence Cripto',
    description: 'Capisci il rischio del mercato cripto prima di fare qualsiasi operazione. Educational only.',
    siteName: 'Tradelia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tradelia - Market Intelligence Cripto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tradelia — Market Intelligence Cripto',
    description: 'Capisci il rischio del mercato cripto prima di fare qualsiasi operazione.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="theme-color" content="#0ea5e9" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Tradelia",
              "description": "Market Intelligence Cripto - Risk & Context Engine",
              "url": "https://tradelia.org",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "creator": {
                "@type": "Organization",
                "name": "Tradelia"
              }
            })
          }}
        />
      </head>
      <body className="antialiased">
        <div className="min-h-screen bg-dark-900">
          {children}
        </div>
      </body>
    </html>
  )
}