'use client';

import { memo, useState, useEffect } from 'react';
import { Filter, Search, Grid, List, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import type { IndicatorCategory, IndicatorType, ViewMode } from '../tabs/MarketDataTab';

interface IndicatorFiltersProps {
  category: IndicatorCategory;
  type: IndicatorType;
  viewMode: ViewMode;
  searchQuery: string;
  onCategoryChange: (category: IndicatorCategory) => void;
  onTypeChange: (type: IndicatorType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (query: string) => void;
}

/**
 * Indicator Filters - Filtri sticky per Market Data Tab
 * Categoria, Tipo, Vista, Search
 */
export const IndicatorFilters = memo(function IndicatorFilters({
  category,
  type,
  viewMode,
  searchQuery,
  onCategoryChange,
  onTypeChange,
  onViewModeChange,
  onSearchChange,
}: IndicatorFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Sync debounced value with parent
  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  // Sync parent value with local (e.g., from URL)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const categories: { value: IndicatorCategory; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'stock', label: 'Stock & Market' },
    { value: 'economic', label: 'Economic & Macro' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodity', label: 'Commodity' },
    { value: 'market', label: 'Market Data & Events' },
  ];

  const types: { value: IndicatorType; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'PRO' },
  ];

  const hasActiveFilters = category !== 'all' || type !== 'all' || localSearchQuery.trim() !== '';

  const clearFilters = () => {
    setLocalSearchQuery('');
    onCategoryChange('all');
    onTypeChange('all');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar - Optimized with debounce */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          type="text"
          placeholder="Cerca indicatori..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-10 w-full"
          aria-label="Cerca indicatori"
        />
        {localSearchQuery && (
          <button
            onClick={() => setLocalSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Cancella ricerca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Row - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
        {/* Category Filter - Scrollabile su mobile */}
        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
          <Filter className="w-4 h-4 text-text-tertiary flex-shrink-0 hidden sm:block" />
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryChange(cat.value)}
                className={cn(
                  'h-8 px-2 sm:px-3 text-xs whitespace-nowrap flex-shrink-0',
                  category === cat.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1">
            {types.map((t) => (
              <Button
                key={t.value}
                variant={type === t.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTypeChange(t.value)}
                className={cn(
                  'h-8 px-2 sm:px-3 text-xs whitespace-nowrap',
                  type === t.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle & Clear - Allineati a destra */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-l border-border-subtle pl-2 sm:pl-3">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'h-8 w-8 p-0',
                viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary'
              )}
              aria-label="Vista griglia"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={cn(
                'h-8 w-8 p-0',
                viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary'
              )}
              aria-label="Vista lista"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 sm:px-3 text-xs text-text-tertiary hover:text-text-primary whitespace-nowrap"
              aria-label="Rimuovi tutti i filtri"
            >
              <X className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
