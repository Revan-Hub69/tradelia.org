'use client';

import { memo } from 'react';
import { Filter, Search, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const categories: { value: IndicatorCategory; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'stock', label: 'Stock' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodity', label: 'Commodity' },
  ];

  const types: { value: IndicatorType; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'PRO' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          type="text"
          placeholder="Cerca indicatori..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <div className="flex gap-1">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryChange(cat.value)}
                className={cn(
                  'h-8 px-3 text-xs',
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
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {types.map((t) => (
              <Button
                key={t.value}
                variant={type === t.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTypeChange(t.value)}
                className={cn(
                  'h-8 px-3 text-xs',
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

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 ml-auto">
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
      </div>
    </div>
  );
});
