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


const LayoutFallback = () => (
  <div className="min-h-screen bg-bg-base" suppressHydrationWarning>
    <div className="h-16 bg-bg-surface border-b border-border-default"></div>
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading dashboard...</p>
      </div>
    </div>
  </div>
);

/**
 * EN Dashboard Layout - COMPLETELY CLIENT-SIDE, NO HYDRATION
 * Best Practice: Stesso approccio del layout dashboard principale
 */
export default function DashboardEnLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
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
