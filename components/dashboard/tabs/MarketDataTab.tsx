'use client';

import { useState, useMemo, memo, useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { IndicatorFilters } from '../market-data/IndicatorFilters';
import { IndicatorGrid } from '../market-data/IndicatorGrid';

// Lazy load NewsFeed per performance
const NewsFeed = lazy(() => import('../NewsFeed').then(m => ({ default: m.NewsFeed })));

const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

export type IndicatorCategory = 'all' | 'stock' | 'economic' | 'crypto' | 'forex' | 'commodity' | 'market';
export type IndicatorType = 'all' | 'free' | 'pro';
export type ViewMode = 'grid' | 'list';

/**
 * Market Data Tab - Tutti gli indicatori organizzati per categoria
 * Filtri sticky, search, vista griglia o lista
 * Best Practice 2026: URL params sync, SEO-friendly, Performance optimized
 */
function MarketDataTabContent() {
  const [category, setCategory] = useState<IndicatorCategory>('all');
  const [type, setType] = useState<IndicatorType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with URL params (client-side only, wrapped in Suspense)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category') as IndicatorCategory;
    const urlType = params.get('type') as IndicatorType;
    const urlViewMode = params.get('viewMode') as ViewMode;
    const urlSearch = params.get('search') || '';

    if (urlCategory) setCategory(urlCategory);
    if (urlType) setType(urlType);
    if (urlViewMode) setViewMode(urlViewMode);
    if (urlSearch) setSearchQuery(urlSearch);
  }, []);

  // Update URL when state changes (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (type !== 'all') params.set('type', type);
      if (viewMode !== 'grid') params.set('viewMode', viewMode);
      if (searchQuery) params.set('search', searchQuery);

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      
      window.history.replaceState({}, '', newUrl);
    }, 300); // Debounce URL updates

    return () => clearTimeout(timeoutId);
  }, [category, type, viewMode, searchQuery]);

  return (
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
      <IndicatorGrid
        category={category}
        type={type}
        viewMode={viewMode}
        searchQuery={searchQuery}
      />

      {/* News Feed - Feed RSS completo */}
      <Suspense fallback={<ComponentSkeleton />}>
        <NewsFeed />
      </Suspense>
    </div>
  );
}

export const MarketDataTab = memo(function MarketDataTab() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ComponentSkeleton />}>
        <MarketDataTabContent />
      </Suspense>
    </ErrorBoundary>
  );
});
