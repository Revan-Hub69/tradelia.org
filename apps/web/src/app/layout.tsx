import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { TradingProvider } from '../lib/contexts/TradingContext'
import { WebSocketProvider } from '../lib/contexts/WebSocketContext'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Tradelia',
  description: 'Comprendere il rischio nel mondo delle criptovalute',
  metadataBase: new URL('https://tradelia.ai'),
  openGraph: {
    title: 'Tradelia · Risk-first crypto education',
    description: 'Microlearning operativo, rischio consapevole, design cognitivo.',
    url: 'https://tradelia.ai',
    siteName: 'Tradelia',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og/tradelia-og.png',
        width: 1200,
        height: 630,
        alt: 'Tradelia · Comprendere il rischio nel mondo delle criptovalute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tradelia_ai',
    title: 'Tradelia · Risk-first crypto education',
    description: 'Microlearning operativo, rischio consapevole, design cognitivo.',
    images: ['/og/tradelia-og.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
