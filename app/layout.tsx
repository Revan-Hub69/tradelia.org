import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { generateMetadata as genMetadata, generateStructuredData } from '@/lib/seo/metadata';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = genMetadata('it');
  metadataBase: new URL('https://tradelia.org'),
  title: {
    default: 'Tradelia AI · Formazione Finanziaria Gratuita',
    template: '%s · Tradelia AI',
  },
  description:
    'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.',
  keywords: [
    'formazione finanziaria',
    'educazione finanziaria',
    'framework AI',
    'MiFID II',
    'analisi mercati',
    'trading education',
    'financial education',
    'formazione gratuita',
  ],
  authors: [{ name: 'Tradelia AI' }],
  creator: 'Tradelia AI',
  publisher: 'Tradelia AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://tradelia.org',
    siteName: 'Tradelia AI',
    title: 'Tradelia AI · Formazione Finanziaria Gratuita',
    description:
      'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.',
    images: [
      {
        url: 'https://tradelia.org/img/tradelia_og_vC_white_clean.png',
        width: 1200,
        height: 630,
        alt: 'Tradelia AI - Formazione Finanziaria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tradelia AI · Formazione Finanziaria Gratuita',
    description:
      'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.',
    images: ['https://tradelia.org/img/tradelia_og_vC_white_clean.png'],
    creator: '@tradelia_ai',
    site: '@tradelia_ai',
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
  alternates: {
    canonical: 'https://tradelia.org',
    languages: {
      'it-IT': 'https://tradelia.org',
      'en-US': 'https://tradelia.org/en',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tradelia AI',
  },
};

export const viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" data-theme="dark">
      <head>
        {/* Structured Data - EducationalOrganization + AI Search Optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData('it')),
          }}
        />
        {/* AI Search Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href="https://tradelia.org" />
        <link rel="alternate" hrefLang="it" href="https://tradelia.org" />
        <link rel="alternate" hrefLang="en" href="https://tradelia.org/en" />
        <link rel="alternate" hrefLang="x-default" href="https://tradelia.org" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
