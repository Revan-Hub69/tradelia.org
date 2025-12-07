'use client';

import type { ReactNode } from 'react';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import dynamic from 'next/dynamic';

// Tutti i componenti caricati SOLO sul client - NO SSR, NO HYDRATION
const DashboardHeader = dynamic(() => import('@/components/dashboard/DashboardHeader').then(mod => ({ default: mod.DashboardHeader })), {
  ssr: false,
});

const ServiceWorkerProvider = dynamic(() => import('@/components/notifications/ServiceWorkerProvider').then(mod => ({ default: mod.ServiceWorkerProvider })), {
  ssr: false,
});

const InstallPrompt = dynamic(() => import('@/components/pwa/InstallPrompt').then(mod => ({ default: mod.InstallPrompt })), {
  ssr: false,
});

const ModalProviders = dynamic(() => import('@/components/dashboard/ModalProviders').then(mod => ({ default: mod.ModalProviders })), {
  ssr: false,
});

const DailyLoginCheck = dynamic(() => import('@/components/gamification/DailyLoginCheck').then(mod => ({ default: mod.DailyLoginCheck })), {
  ssr: false,
});


const LayoutFallback = () => (
  <div className="min-h-screen bg-bg-base" suppressHydrationWarning>
    <div className="h-16 bg-bg-surface border-b border-border-default"></div>
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Caricamento dashboard...</p>
      </div>
    </div>
  </div>
);

/**
 * Dashboard Layout - COMPLETELY CLIENT-SIDE, NO HYDRATION
 * Usa NoSSR per prevenire completamente l'hydration mismatch
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {/* Critical CSS inline per dashboard - previene render blocking */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Dashboard critical styles - inline per LCP */
          #modules-view{min-height:600px;display:flex;flex-direction:column;gap:3rem}
          .dashboardHero{position:relative;margin-bottom:3rem;padding:2.5rem;background:radial-gradient(140% 140% at 0% 0%,rgba(30,64,175,.35),rgba(10,14,26,.9));border:1px solid rgba(59,130,246,.25);border-radius:24px;box-shadow:0 30px 80px rgba(15,23,42,.35);overflow:hidden;display:grid;grid-template-columns:minmax(0,1.8fr) minmax(260px,1fr);gap:2.5rem;align-items:stretch;min-height:280px}
          #dashboard-hero-title{font-size:clamp(2.6rem,4vw,3.4rem);font-weight:800;letter-spacing:-.03em;margin:0 0 1rem;color:#f8fafc;min-height:120px}
          .dashboardHeroContent{position:relative;z-index:2;max-width:760px}
          .dashboardHeroSubtitle{font-size:.9rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(199,210,254,.85);margin:1.5rem 0 .5rem;min-height:24px}
        `
      }} />
      <NoSSR fallback={<LayoutFallback />}>
        <div suppressHydrationWarning style={{ minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
          <ErrorBoundary>
            <DashboardHeader />
          </ErrorBoundary>
          <ErrorBoundary>
            <ServiceWorkerProvider />
          </ErrorBoundary>
          <ErrorBoundary>
            <InstallPrompt />
          </ErrorBoundary>
          <ErrorBoundary>
            <DailyLoginCheck />
          </ErrorBoundary>
          <ErrorBoundary>
            <ModalProviders />
          </ErrorBoundary>
          <div 
            suppressHydrationWarning 
            style={{ 
              width: '100%', 
              maxWidth: '100%', 
              overflowX: 'hidden',
              paddingTop: '90px' // Account for fixed header height
            }}
          >
            {children}
          </div>
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
