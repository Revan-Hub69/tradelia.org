import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { UnregisterServiceWorker } from './unregister-sw';
import { generateStructuredData, generateMetadata as genMetadata } from '@/lib/seo/metadata';
import { defaultLocale } from '@/lib/i18n/config';
// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';

const Header = dynamic(() => import('@/components/layout/Header').then(m => ({ default: m.Header })), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), {
  ssr: false,
});

const LegalConsent = dynamic(() => import('@/components/layout/LegalConsent').then(m => ({ default: m.LegalConsent })), {
  ssr: false,
});

const HtmlLang = dynamic(() => import('@/components/layout/HtmlLang').then(m => ({ default: m.HtmlLang })), {
  ssr: false,
});

const ToastContainer = dynamic(() => import('@/components/ui/Toast').then(m => ({ default: m.ToastContainer })), {
  ssr: false,
});

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disabled to avoid preload warnings when font isn't used immediately
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
  // Optimize font loading for LCP
  weight: ['400', '500', '600', '700'],
});

export async function generateMetadata() {
  // Default to Italian, but this will be overridden by nested layouts
  return genMetadata(defaultLocale);
}

export const viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const icons = {
  icon: [
    { url: '/favicon.svg', type: 'image/svg+xml' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
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
    <html lang={defaultLocale} data-theme="dark">
      <head>
        {/* Preconnect EARLY - before CSS to establish connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Critical CSS inline to prevent render blocking - Expanded for LCP optimization */}
        {/* This CSS is loaded immediately to prevent render blocking from external CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{
              --bg-base:#0a0e1a;--bg-soft:#131720;--bg-surface:#1a1f2e;--bg-elevated:#1f2533;--bg-hover:#242a38;
              --text-primary:#e8edf3;--text-secondary:#b8c5d1;--text-tertiary:#8b95a5;--text-muted:#a8b0bc;
              --accent:#1e40af;--accent-hover:#1e3a8a;--accent-active:#1e3a8a;
              --border-subtle:rgba(255,255,255,0.05);--border-default:rgba(255,255,255,0.08);--border-strong:rgba(255,255,255,0.12);--border-accent:rgba(59,130,246,0.2);
              --dash-bg-soft:#131720;--dash-surface:#1a1f2e;--dash-surface-elev:#1f2533;
              --dash-text:#e8edf3;--dash-text-soft:#b8c5d1;--dash-text-muted:#a8b0bc;
              --dash-accent:#1e40af;--dash-accent-hover:#1e3a8a;
              --dash-border:rgba(255,255,255,0.08);--dash-border-strong:rgba(255,255,255,0.12);--dash-border-accent:rgba(59,130,246,0.2);--dash-border-soft:rgba(255,255,255,0.05)
            }
            *{box-sizing:border-box;margin:0;padding:0}
            html{background-color:var(--bg-base);scroll-behavior:smooth;overflow-y:auto;font-size:16px}
            body{
              background-color:var(--bg-base);color:var(--text-primary);margin:0;padding:0;
              font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
              overflow-y:auto;line-height:1.75;-webkit-font-smoothing:antialiased;
              -moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility
            }
            section{display:block}
            .relative{position:relative}
            .min-h-\[90vh\]{min-height:90vh}
            .flex{display:flex}
            .items-center{align-items:center}
            .overflow-hidden{overflow:hidden}
            .py-24{padding-top:6rem;padding-bottom:6rem}
            #hero-title{
              color:var(--text-primary);font-weight:800;line-height:1.1;margin:0 0 1.5rem;
              max-width:80rem;margin-left:auto;margin-right:auto;text-align:center;
              letter-spacing:-0.025em;font-size:2.25rem;opacity:1;transform:none
            }
            #hero-title+p{
              color:var(--text-secondary);font-size:1.125rem;line-height:1.75rem;
              margin:0 0 2.5rem;max-width:48rem;margin-left:auto;margin-right:auto;
              text-align:center;font-weight:300;letter-spacing:-0.01em;opacity:1;transform:none
            }
            .gradient-text{background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%);
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
            @media(min-width:768px){
              .py-24{padding-top:8rem;padding-bottom:8rem}
              #hero-title{font-size:3.75rem}
              #hero-title+p{font-size:1.5rem}
            }
            @media(min-width:1024px){
              #hero-title{font-size:4.5rem}
              #hero-title+p{font-size:2.25rem}
            }
          `
        }} />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon - Standardizzato per coerenza */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.svg" />
        
        {/* Preload critical resources - only if used immediately */}
        {/* Logo preload removed - will be loaded when needed to avoid unused preload warning */}
        
        {/* Structured Data - EducationalOrganization + AI Search Optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData(defaultLocale)),
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
          <HtmlLang />
          <UnregisterServiceWorker />
          <div suppressHydrationWarning>
            <Header />
          </div>
          {/* IMPORTANTE: Per route dashboard, children è già completamente client-side */}
          {/* Non c'è bisogno di wrapper aggiuntivi - il layout dashboard gestisce tutto */}
          <main id="main-content" className="flex-1" tabIndex={-1} suppressHydrationWarning>
            {children}
          </main>
          <div suppressHydrationWarning>
            <Footer />
            <LegalConsent />
            <ToastContainer />
          </div>
        </div>
      </body>
    </html>
  );
}
