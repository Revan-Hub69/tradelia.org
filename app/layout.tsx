import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
        {/* Structured Data - EducationalOrganization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Tradelia AI',
              url: 'https://tradelia.org',
              description:
                'Formazione finanziaria gratuita basata su framework AI proprietari verificabili',
              educationalCredentialAwarded: 'Certificate',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Percorsi Formativi',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Course',
                      name: 'Formazione Finanziaria',
                      description: 'Percorsi formativi completi sui mercati finanziari',
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="dashboard-container">
          <DashboardHeader />
          <main id="main-content">{children}</main>
          <DashboardFooter />
        </div>
      </body>
    </html>
  );
}
