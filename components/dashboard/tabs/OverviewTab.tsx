'use client';

import { Suspense, lazy, memo } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// Lazy load components per performance
const AccountBanner = lazy(() => import('../AccountBanner').then(m => ({ default: m.AccountBanner })));
const QuickStats = lazy(() => import('../overview/QuickStats').then(m => ({ default: m.QuickStats })));
const KeyIndicators = lazy(() => import('../overview/KeyIndicators').then(m => ({ default: m.KeyIndicators })));
const MainChart = lazy(() => import('../overview/MainChart').then(m => ({ default: m.MainChart })));
const NewsPreview = lazy(() => import('../overview/NewsPreview').then(m => ({ default: m.NewsPreview })));
const EventsPreview = lazy(() => import('../overview/EventsPreview').then(m => ({ default: m.EventsPreview })));

const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

/**
 * Overview Tab - Dashboard Principale
 * Vista d'insieme rapida e operativa con solo contenuti essenziali
 * Best Practice: Mobile-first, lazy loading, progressive disclosure
 */
export const OverviewTab = memo(function OverviewTab() {
  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-8">
        {/* Account Banner - Critical, load immediately */}
        <Suspense fallback={<Skeleton className="h-16 w-full mb-4" />}>
          <AccountBanner />
        </Suspense>

        {/* Quick Stats - Critical, load immediately */}
        <Suspense fallback={<ComponentSkeleton />}>
          <QuickStats />
        </Suspense>

        {/* Indicatori Chiave - Critical, load immediately */}
        <Suspense fallback={<ComponentSkeleton />}>
          <KeyIndicators />
        </Suspense>

        {/* Grafico Multi-Asset - Above fold, lazy loaded */}
        <Suspense fallback={<ComponentSkeleton />}>
          <MainChart />
        </Suspense>

        {/* News Preview - Below fold, lazy loaded */}
        <Suspense fallback={<ComponentSkeleton />}>
          <NewsPreview />
        </Suspense>

        {/* Events Preview - Below fold, lazy loaded */}
        <Suspense fallback={<ComponentSkeleton />}>
          <EventsPreview />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
});
