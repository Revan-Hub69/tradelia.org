import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
        {/* Skip Link - Accessibility WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="skip-link"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
