'use client';

import { useState, useMemo, memo } from 'react';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Favorites } from '../Favorites';
import { Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

type FavoriteType = 'all' | 'indicator' | 'report' | 'analysis';

/**
 * Favorites Tab - Solo contenuti salvati dall'utente
 * Organizzati per tipo: Indicatori, Report, Analisi
 */
export const FavoritesTab = memo(function FavoritesTab() {
  const { t, locale } = useTranslations();
  const [type, setType] = useState<FavoriteType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const types: { value: FavoriteType; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'indicator', label: 'Indicatori' },
    { value: 'report', label: 'Report' },
    { value: 'analysis', label: 'Analisi' },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-8">
        <SectionBanner
          title="I Tuoi Preferiti"
          description="Tutti i contenuti che hai salvato: indicatori, report, analisi. Organizza e accedi rapidamente ai tuoi contenuti preferiti."
        />

        {/* Filtri */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              type="text"
              placeholder="Cerca nei preferiti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <div className="flex gap-1">
              {types.map((t) => (
                <Button
                  key={t.value}
                  variant={type === t.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setType(t.value)}
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
        </div>

        {/* Favorites List */}
        <Suspense fallback={<ComponentSkeleton />}>
          <Favorites type={type} searchQuery={searchQuery} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
});
