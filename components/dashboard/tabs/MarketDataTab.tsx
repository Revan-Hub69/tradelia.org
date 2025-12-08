'use client';

import { useState, useMemo, memo } from 'react';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { IndicatorFilters } from '../market-data/IndicatorFilters';
import { IndicatorGrid } from '../market-data/IndicatorGrid';

const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

export type IndicatorCategory = 'all' | 'stock' | 'crypto' | 'forex' | 'commodity';
export type IndicatorType = 'all' | 'free' | 'pro';
export type ViewMode = 'grid' | 'list';

/**
 * Market Data Tab - Tutti gli indicatori organizzati per categoria
 * Filtri sticky, search, vista griglia o lista
 */
export const MarketDataTab = memo(function MarketDataTab() {
  const [category, setCategory] = useState<IndicatorCategory>('all');
  const [type, setType] = useState<IndicatorType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-8">
        {/* Filtri Sticky */}
        <div className="sticky top-[96px] z-30 bg-bg-base border-b border-border-subtle pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <IndicatorFilters
            category={category}
            type={type}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onCategoryChange={setCategory}
            onTypeChange={setType}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Grid degli indicatori */}
        <Suspense fallback={<ComponentSkeleton />}>
          <IndicatorGrid
            category={category}
            type={type}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
});
