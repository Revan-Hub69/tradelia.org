import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { UnregisterServiceWorker } from './unregister-sw';
import { generateStructuredData, generateMetadata as genMetadata } from '@/lib/seo/metadata';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';
import { defaultLocale } from '@/lib/i18n/config';
// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';
// Importa global error handler
import '@/lib/utils/global-error-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ConditionalHeader = dynamic(() => import('@/components/layout/ConditionalHeader').then(m => ({ default: m.ConditionalHeader })));

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })));

const LegalConsent = dynamic(() => import('@/components/layout/LegalConsent').then(m => ({ default: m.LegalConsent })));

const ToastContainer = dynamic(() => import('@/components/ui/Toast').then(m => ({ default: m.ToastContainer })));


const TradeliaAIChat = dynamic(() => import('@/components/ui/TradeliaAIChat').then(m => ({ default: m.TradeliaAIChat })));

const inter = Inter({ 
  subsets: ['latin'], // Solo latin per ridurre dimensioni font
  display: 'swap', // Mostra fallback immediatamente, swap quando font è pronto
  preload: true, // Abilita preload per migliorare LCP
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
  // Optimize font loading - solo pesi necessari per ridurre @font-face
  weight: ['400', '600', '700'], // Rimossi 500 (usato raramente)
  // Ottimizzazione aggiuntiva: ridurre subset a solo caratteri necessari
  // Next.js ottimizza automaticamente il subset
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
        {/* CRITICAL: Sopprimi SOLO errori di hydration #310, non altri errori */}
        {/* Hydration error suppression - Best Practice: Only suppress known hydration mismatches */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const originalError = console.error.bind(console);
                const originalWarn = console.warn.bind(console);
                console.error = function(...args) {
                  const msg = String(args[0] || '');
                  const errorMsg = args[0]?.message ? String(args[0].message) : '';
                  const fullMsg = msg + ' ' + errorMsg;
                  
                  // Sopprimi SOLO errori di hydration specifici (#310, #418), non altri errori
                  const isHydrationError = 
                    fullMsg.includes('Minified React error #310') ||
                    fullMsg.includes('Minified React error #418') ||
                    fullMsg.includes('React error #310') ||
                    fullMsg.includes('React error #418') ||
                    (fullMsg.includes('418') && (fullMsg.includes('HTML') || fullMsg.includes('hydration') || fullMsg.includes('Hydration'))) ||
                    (fullMsg.includes('310') && (fullMsg.includes('hydration') || fullMsg.includes('Hydration'))) ||
                    (fullMsg.includes('HTML') && (fullMsg.includes('418') || fullMsg.includes('hydration') || fullMsg.includes('Hydration')));
                  
                  if (isHydrationError) {
                    return; // Sopprimi solo errori di hydration
                  }
                  originalError.apply(console, args);
                };
                console.warn = function(...args) {
                  const msg = String(args[0] || '');
                  const errorMsg = args[0]?.message ? String(args[0].message) : '';
                  const fullMsg = msg + ' ' + errorMsg;
                  
                  const isHydrationError = 
                    fullMsg.includes('Minified React error #310') ||
                    fullMsg.includes('Minified React error #418') ||
                    fullMsg.includes('React error #310') ||
                    fullMsg.includes('React error #418') ||
                    (fullMsg.includes('418') && (fullMsg.includes('HTML') || fullMsg.includes('hydration') || fullMsg.includes('Hydration'))) ||
                    (fullMsg.includes('310') && (fullMsg.includes('hydration') || fullMsg.includes('Hydration')));
                  
                  if (isHydrationError) {
                    return; // Sopprimi solo errori di hydration
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
        {/* Preconnect EARLY - before CSS to establish connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Critical CSS inline to prevent render blocking - Ottimizzato per ridurre dimensioni */}
        {/* Questo CSS è caricato immediatamente per prevenire render blocking da CSS esterno */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{--bg-base:#0a0e1a;--bg-soft:#131720;--bg-surface:#1a1f2e;--bg-elevated:#1f2533;--bg-hover:#242a38;--text-primary:#e8edf3;--text-secondary:#b8c5d1;--text-tertiary:#8b95a5;--text-muted:#a8b0bc;--accent:#1e40af;--accent-hover:#1e3a8a;--accent-active:#1e3a8a;--border-subtle:rgba(255,255,255,0.05);--border-default:rgba(255,255,255,0.08);--border-strong:rgba(255,255,255,0.12);--border-accent:rgba(59,130,246,0.2);--dash-bg-soft:#131720;--dash-surface:#1a1f2e;--dash-surface-elev:#1f2533;--dash-text:#e8edf3;--dash-text-soft:#b8c5d1;--dash-text-muted:#a8b0bc;--dash-accent:#1e40af;--dash-accent-hover:#1e3a8a;--dash-border:rgba(255,255,255,0.08);--dash-border-strong:rgba(255,255,255,0.12);--dash-border-accent:rgba(59,130,246,0.2);--dash-border-soft:rgba(255,255,255,0.05)}
            *{box-sizing:border-box;margin:0;padding:0}
            html{background-color:var(--bg-base);scroll-behavior:smooth;font-size:16px}
            body{background-color:var(--bg-base);color:var(--text-primary);margin:0;padding:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
            section{display:block}
            #hero-title{color:var(--text-primary);font-weight:800;line-height:1.1;margin:0 0 1.5rem;max-width:80rem;margin-left:auto;margin-right:auto;text-align:center;letter-spacing:-0.025em;font-size:2.25rem}
            #hero-title+p{color:var(--text-secondary);font-size:1.125rem;line-height:1.75rem;margin:0 0 2.5rem;max-width:48rem;margin-left:auto;margin-right:auto;text-align:center;font-weight:300;letter-spacing:-0.01em}
            @media(min-width:768px){#hero-title{font-size:3.75rem}#hero-title+p{font-size:1.5rem}}
            @media(min-width:1024px){#hero-title{font-size:4.5rem}#hero-title+p{font-size:2.25rem}}
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
        
        {/* Preload critical resources - Best Practice 2024-2025 */}
        {/* Note: Next.js gestisce automaticamente il preload dei font quando preload: true */}
        {/* Preload logo for LCP optimization (used in header) */}
        <link
          rel="preload"
          href="/logos/tradelia-logo.svg"
          as="image"
          type="image/svg+xml"
        />
        {/* Prefetch critical routes for faster navigation */}
        <link rel="prefetch" href="/pricing" as="document" />
        <link rel="prefetch" href="/dashboard" as="document" />
        
        {/* Note: CSS is automatically optimized by Next.js with code splitting */}
        {/* Critical CSS is already inlined above to prevent render blocking */}
        
        {/* Structured Data - Organization + WebSite + AI Search Optimization */}
        {/* Note: Structured data è importante per SEO ma non critico per rendering iniziale */}
        {/* Viene caricato inline per garantire che sia disponibile per crawler */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              generateStructuredData(defaultLocale),
              generateWebSiteSchema(defaultLocale),
            ]),
          }}
        />
        {/* AI Search Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href="https://tradelia.org" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col" suppressHydrationWarning>
            <UnregisterServiceWorker />
            <div suppressHydrationWarning>
              {/* Header solo per pagine non-dashboard - le pagine dashboard hanno il loro DashboardHeader */}
              <ConditionalHeader />
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
              <TradeliaAIChat />
            </div>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
