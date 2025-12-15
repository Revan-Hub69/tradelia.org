'use client';

import React, { Suspense, lazy, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import '@/lib/utils/suppress-hydration-errors';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// Lazy load tab components
const OverviewTab = lazy(() => import('./tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));
const MarketDataTab = lazy(() => import('./tabs/MarketDataTab').then(m => ({ default: m.MarketDataTab })));
const AnalysisTab = lazy(() => import('./tabs/AnalysisTab').then(m => ({ default: m.AnalysisTab })));
const FavoritesTab = lazy(() => import('./tabs/FavoritesTab').then(m => ({ default: m.FavoritesTab })));

// Skeleton component ottimizzato
const TabSkeleton = () => (
  <div className="space-y-6 pb-8">
    <Skeleton className="h-16 w-full mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <Skeleton className="h-64 w-full mb-6" />
    <Skeleton className="h-48 w-full" />
  </div>
);

/**
 * DashboardShell - Container principale con tab switching
 * Best Practices:
 * - Code splitting per ogni tab
 * - Lazy loading completo
 * - Performance ottimizzata
 */
export function DashboardShell() {
  const pathname = usePathname();

  // Determina tab attivo basato sul pathname
  const activeTab = useMemo(() => {
    if (!pathname) return 'overview';
    
    const normalizedPath = pathname.replace(/^\/en/, '');
    
    if (normalizedPath === '/dashboard' || normalizedPath === '/it/dashboard' || normalizedPath === '/en/dashboard') {
      return 'overview';
    } else if (normalizedPath.includes('/dashboard/market-data')) {
      return 'market-data';
    } else if (normalizedPath.includes('/dashboard/analysis')) {
      return 'analysis';
    } else if (normalizedPath.includes('/dashboard/favorites')) {
      return 'favorites';
    } else if (normalizedPath.includes('/dashboard/settings')) {
      return 'settings';
    }
    
    return 'overview';
  }, [pathname]);

  return (
    <ErrorBoundary>
      <main
        id="dashboard-main"
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl container-mobile"
        role="main"
        aria-label="Dashboard principale"
        suppressHydrationWarning
      >
        <div
          className={cn(
            "min-h-[600px]",
            "pt-6"
          )}
          role="region"
          aria-label="Contenuti dashboard"
        >
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'market-data' && <MarketDataTab />}
            {activeTab === 'analysis' && <AnalysisTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <p className="text-text-secondary">Le impostazioni sono disponibili nella pagina dedicata.</p>
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </ErrorBoundary>
  );
}
