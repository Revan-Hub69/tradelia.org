'use client';

import type { ReactNode } from 'react';
import { ServiceWorkerProvider } from '@/components/notifications/ServiceWorkerProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DailyLoginCheck } from '@/components/gamification/DailyLoginCheck';
import { ModalProviders } from '@/components/dashboard/ModalProviders';
import { ClientOnly } from '@/components/common/ClientOnly';
import dynamic from 'next/dynamic';

// Lazy load non-critical components con ssr: false
const ProUtilities = dynamic(() => import('@/components/dashboard/ProUtilities').then(mod => ({ default: mod.ProUtilities })), {
  ssr: false,
  loading: () => null,
});

// Wrappare tutti i componenti client-side in ClientOnly per evitare hydration mismatch
const ClientDashboardHeader = dynamic(() => import('@/components/dashboard/DashboardHeader').then(mod => ({ default: mod.DashboardHeader })), {
  ssr: false,
});

const ClientServiceWorkerProvider = dynamic(() => import('@/components/notifications/ServiceWorkerProvider').then(mod => ({ default: mod.ServiceWorkerProvider })), {
  ssr: false,
});

const ClientInstallPrompt = dynamic(() => import('@/components/pwa/InstallPrompt').then(mod => ({ default: mod.InstallPrompt })), {
  ssr: false,
});

const ClientModalProviders = dynamic(() => import('@/components/dashboard/ModalProviders').then(mod => ({ default: mod.ModalProviders })), {
  ssr: false,
});

const ClientDailyLoginCheck = dynamic(() => import('@/components/gamification/DailyLoginCheck').then(mod => ({ default: mod.DailyLoginCheck })), {
  ssr: false,
});

/**
 * Dashboard Layout - COMPLETELY CLIENT-SIDE
 * Tutti i componenti sono caricati solo sul client per evitare hydration mismatch
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-bg-base">
        <div className="h-16 bg-bg-surface border-b border-border-default"></div>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Caricamento dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <ClientDashboardHeader />
      <ClientServiceWorkerProvider />
      <ClientInstallPrompt />
      <ClientDailyLoginCheck />
      <ProUtilities />
      <ClientModalProviders />
      {children}
    </ClientOnly>
  );
}
