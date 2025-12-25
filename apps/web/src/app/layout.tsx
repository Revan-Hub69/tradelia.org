import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { TradingProvider } from '../lib/contexts/TradingContext'
import { WebSocketProvider } from '../lib/contexts/WebSocketContext'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Tradelia · Risk-first crypto education',
    template: '%s | Tradelia'
  },
  description: 'Microlearning operativo per comprendere i rischi nel mondo delle criptovalute. Design cognitivo, analisi tecnica, gestione del rischio consapevole. Non consulenza finanziaria.',
  keywords: [
    'criptovalute', 'crypto', 'bitcoin', 'ethereum', 'rischio', 'trading', 'educazione finanziaria',
    'analisi tecnica', 'risk management', 'microlearning', 'blockchain', 'finanza digitale'
  ],
  authors: [{ name: 'Tradelia Team' }],
  creator: 'Tradelia',
  publisher: 'Tradelia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tradelia.ai'),
  alternates: {
    canonical: 'https://tradelia.ai',
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
    title: 'Tradelia · Risk-first crypto education',
    description: 'Microlearning operativo per comprendere i rischi nel mondo delle criptovalute. Design cognitivo, analisi tecnica, gestione del rischio consapevole.',
    url: 'https://tradelia.ai',
    siteName: 'Tradelia',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og/tradelia-og.png',
        width: 1200,
        height: 630,
        alt: 'Tradelia · Microlearning operativo per il rischio consapevole nelle criptovalute',
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
    title: 'Tradelia · Risk-first crypto education',
    description: 'Microlearning operativo per comprendere i rischi nel mondo delle criptovalute. Design cognitivo, analisi tecnica, gestione del rischio consapevole.',
    images: [{
      url: '/og/tradelia-og.png',
      alt: 'Tradelia · Microlearning operativo per il rischio consapevole nelle criptovalute'
    }],
  },
  other: {
    'article:author': 'Tradelia Team',
    'article:publisher': 'https://tradelia.ai',
    'article:section': 'Education',
    'article:tag': 'Crypto Education',
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
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tradelia AI" />

        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://tradelia.ai" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Tradelia',
              url: 'https://tradelia.ai',
              logo: 'https://tradelia.ai/favicon.svg',
              description: 'Educazione al rischio crypto con microlearning operativo e design cognitivo.',
              sameAs: [
                'https://twitter.com/tradelia_ai'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: 'https://tradelia.ai'
              },
              foundingDate: '2024',
              knowsAbout: [
                'Cryptocurrency Risk Management',
                'Technical Analysis',
                'Financial Education',
                'Blockchain Technology'
              ]
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Tradelia',
              url: 'https://tradelia.ai',
              description: 'Microlearning operativo per comprendere i rischi nel mondo delle criptovalute.',
              inLanguage: 'it-IT',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://tradelia.ai/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              },
              publisher: {
                '@type': 'Organization',
                name: 'Tradelia'
              }
            }),
          }}
        />

        {/* Structured Data - Educational Content */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: 'Risk Management in Cryptocurrency',
              description: 'Corso educativo sul rischio consapevole nelle criptovalute attraverso microlearning operativo.',
              provider: {
                '@type': 'Organization',
                name: 'Tradelia'
              },
              educationalLevel: 'intermediate',
              teaches: [
                'Risk Assessment',
                'Technical Analysis',
                'Portfolio Management',
                'Market Psychology'
              ],
              educationalUse: 'professional development',
              learningResourceType: 'interactive course'
            }),
          }}
        />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />

        {/* CSP Header */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googletagmanager.com;
            style-src 'self' 'unsafe-inline' fonts.googleapis.com;
            font-src 'self' fonts.gstatic.com;
            img-src 'self' data: https: blob:;
            connect-src 'self' *.supabase.co *.tradelia.ai wss: ws:;
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
            upgrade-insecure-requests;
          "
        />
      </head>
      <body className={inter.className} data-theme="dark">
        <TradingProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </TradingProvider>
        <Toaster position="top-right" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
