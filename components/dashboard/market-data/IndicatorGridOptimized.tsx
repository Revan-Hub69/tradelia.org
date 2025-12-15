'use client';

/**
 * IndicatorGridOptimized - Best Practice 2026
 * 
 * Ottimizzazioni implementate:
 * - Virtual scrolling per performance (88+ indicatori)
 * - Lazy loading con Intersection Observer
 * - Memoization avanzata
 * - Error boundaries per resilienza
 * - Accessibility (WCAG 2.1 AA)
 * - SEO-friendly rendering
 */

import { useMemo, memo, useCallback, useState, useEffect, useRef } from 'react';
import { INDICATOR_TOOLTIPS } from '@/lib/data/indicator-tooltips';
import { IndicatorCardWrapper } from './IndicatorCardWrapper';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import type { IndicatorCategory, IndicatorType, ViewMode } from '../tabs/MarketDataTab';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

// Virtual scrolling configuration
const ITEMS_PER_PAGE = 20;
const LOAD_MORE_THRESHOLD = 5;

interface IndicatorGridOptimizedProps {
  category: IndicatorCategory;
  type: IndicatorType;
  viewMode: ViewMode;
  searchQuery: string;
}

// Import indicator categories from existing mapping
import { INDICATOR_CATEGORIES } from './IndicatorGrid';

/**
 * Virtual Scrolling Hook
 */
function useVirtualScroll<T>(
  items: T[],
  itemHeight: number = 300,
  containerHeight: number = 800
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: ITEMS_PER_PAGE });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + LOAD_MORE_THRESHOLD, items.length);
      
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [items.length, itemHeight, containerHeight]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
  };
}

/**
 * Intersection Observer Hook for Lazy Loading
 */
function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = { rootMargin: '100px' }
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}

/**
 * Optimized Indicator Grid with Virtual Scrolling & Lazy Loading
 */
export const IndicatorGridOptimized = memo(function IndicatorGridOptimized({
  category,
  type,
  viewMode,
  searchQuery,
}: IndicatorGridOptimizedProps) {
  const t = useTranslations();
  const [loadedIndicators, setLoadedIndicators] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get all indicators for current category
  const allIndicators = useMemo(() => {
    if (category === 'all') {
      return Object.values(INDICATOR_CATEGORIES).flat();
    }
    return INDICATOR_CATEGORIES[category] || [];
  }, [category]);

  // Filter by type (free/pro)
  const PRO_INDICATORS = useMemo(() => [
    'momentum-composite',
    'volatility-composite',
    'sentiment-composite',
    'etf-rotations',
    'cot-reports',
    'technical-indicators',
    'aaii-sentiment',
    'insider-trading',
    'economic-calendar',
    'global-pmi',
    'global-inflation',
    'global-central-bank-rates',
    'currency-strength-index',
    'order-flow-imbalance',
    'cumulative-delta',
    'volume-profile',
    'fibonacci-retracements',
    'support-resistance-levels',
    'ichimoku-cloud',
    'adx',
    'parabolic-sar',
    'funding-rates',
    'long-short-ratio',
    'stablecoin-supply-ratio',
    'crypto-correlation-matrix',
    'exchange-netflows',
    'european-economic-indicators',
  ], []);

  const filteredByType = useMemo(() => {
    if (type === 'all') return allIndicators;
    if (type === 'free') return allIndicators.filter(id => !PRO_INDICATORS.includes(id));
    return allIndicators.filter(id => PRO_INDICATORS.includes(id));
  }, [allIndicators, type, PRO_INDICATORS]);

  // Filter by search query
  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;

    const query = searchQuery.toLowerCase();
    return filteredByType.filter((id) => {
      const tooltip = INDICATOR_TOOLTIPS[id];
      if (!tooltip) return id.toLowerCase().includes(query);
      
      return (
        tooltip.name.toLowerCase().includes(query) ||
        tooltip.description.toLowerCase().includes(query) ||
        id.toLowerCase().includes(query)
      );
    });
  }, [filteredByType, searchQuery]);

  // Virtual scrolling for large lists
  const { visibleItems, totalHeight, offsetY, containerRef } = useVirtualScroll(
    filteredIndicators,
    300,
    800
  );

  // Load more on scroll
  const loadMoreRef = useIntersectionObserver(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredIndicators.length));
  });

  // Group indicators by category for better organization
  const groupedIndicators = useMemo(() => {
    if (viewMode === 'list') {
      return { all: filteredIndicators };
    }

    const groups: Record<string, string[]> = {};
    filteredIndicators.forEach((id) => {
      const tooltip = INDICATOR_TOOLTIPS[id];
      const group = tooltip?.academicReferences?.[0]?.authors?.split(',')[0] || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(id);
    });

    return groups;
  }, [filteredIndicators, viewMode]);

  // Memoized render function
  const renderIndicator = useCallback((indicatorId: string) => {
    const isLoaded = loadedIndicators.has(indicatorId);
    
    return (
      <ErrorBoundary key={indicatorId} fallback={<div className="h-[300px] bg-bg-soft rounded-xl" />}>
        {isLoaded ? (
          <IndicatorCardWrapper indicatorId={indicatorId} viewMode={viewMode} />
        ) : (
          <div
            ref={targetRef => {
              if (targetRef && !isLoaded) {
                // Lazy load on intersection
                const observer = new IntersectionObserver(
                  ([entry]) => {
                    if (entry.isIntersecting) {
                      setLoadedIndicators(prev => new Set([...prev, indicatorId]));
                      observer.disconnect();
                    }
                  },
                  { rootMargin: '200px' }
                );
                observer.observe(targetRef);
              }
            }}
          >
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        )}
      </ErrorBoundary>
    );
  }, [viewMode, loadedIndicators]);

  if (filteredIndicators.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Nessun indicatore trovato</p>
        <p className="text-text-tertiary text-sm mt-2">
          Prova a modificare i filtri o la ricerca
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Count - SEO Friendly */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">{filteredIndicators.length}</span> indicatori trovati
        {category !== 'all' && ` in ${category}`}
        {type !== 'all' && ` (${type})`}
      </div>

      {/* Grid/List View */}
      {viewMode === 'grid' ? (
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          style={{ height: '800px', overflowY: 'auto' }}
          role="list"
          aria-label={`${filteredIndicators.length} indicatori di mercato`}
        >
          {/* Virtual scrolling container */}
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleItems.map((indicatorId) => renderIndicator(indicatorId))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedIndicators).map(([group, indicators]) => (
            <div key={group} className="space-y-4">
              {group !== 'all' && (
                <h3 className="text-lg font-semibold text-text-primary">{group}</h3>
              )}
              <div className="space-y-4">
                {indicators.slice(0, visibleCount).map((indicatorId) => renderIndicator(indicatorId))}
              </div>
              {indicators.length > visibleCount && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                  <Skeleton className="h-4 w-32" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
