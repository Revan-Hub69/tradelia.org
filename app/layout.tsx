import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { UnregisterServiceWorker } from './unregister-sw';

const Header = dynamic(() => import('@/components/layout/Header').then(m => ({ default: m.Header })), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), {
  ssr: false,
});

const LegalConsent = dynamic(() => import('@/components/layout/LegalConsent').then(m => ({ default: m.LegalConsent })), {
  ssr: false,
});
import { generateStructuredData, generateMetadata as genMetadata } from '@/lib/seo/metadata';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
});

export async function generateMetadata() {
  return genMetadata('it');
}

export const viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const icons = {
  icon: [
    { url: '/logos/tradelia-icon.svg', type: 'image/svg+xml' },
    { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
  ],
  apple: [
    { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" data-theme="dark">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/logos/tradelia-icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="shortcut icon" href="/logos/tradelia-icon.svg" />
        
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
      <body className={inter.className} suppressHydrationWarning>
        {/* Skip Link - Accessibility WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="skip-link"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        <div className="min-h-screen flex flex-col" suppressHydrationWarning>
          <UnregisterServiceWorker />
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer />
          <LegalConsent />
        </div>
      </body>
    </html>
  );
}
