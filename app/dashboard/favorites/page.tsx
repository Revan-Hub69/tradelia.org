'use client';

import dynamic from 'next/dynamic';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

// Favorites è già un componente client-side
const Favorites = dynamic(
  () => import('@/components/dashboard/Favorites').then(m => ({ default: m.Favorites })),
  {
    ssr: false,
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-base" suppressHydrationWarning>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Caricamento preferiti...</p>
    </div>
  </div>
);

export default function FavoritesPage() {
  return (
    <ErrorBoundary>
      <NoSSR fallback={<LoadingFallback />}>
        <div suppressHydrationWarning>
          <DashboardTabs />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Preferiti
              </h1>
              <p className="text-text-secondary">
                I tuoi contenuti salvati per accesso rapido
              </p>
            </div>
            <Favorites />
          </div>
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
