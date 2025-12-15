'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

interface IndicatorsGridProps {
  children: React.ReactNode;
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * IndicatorsGrid - Layout responsive ottimizzato per indicatori
 * 
 * Best Practice:
 * - Mobile: 1 colonna (stack verticale)
 * - Tablet: 2 colonne
 * - Desktop: 3 colonne
 * - Large Desktop: 3-4 colonne (dipende da size)
 * 
 * Gap ottimizzato per leggibilità e spacing
 */
export const IndicatorsGrid = memo(function IndicatorsGrid({
  children,
  viewMode = 'grid',
  className,
}: IndicatorsGridProps) {
  if (viewMode === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1',                    // Mobile: 1 colonna
        'sm:grid-cols-1',                 // Small: 1 colonna (mantieni stack)
        'md:grid-cols-2',                 // Tablet: 2 colonne
        'lg:grid-cols-3',                 // Desktop: 3 colonne
        'xl:grid-cols-3',                 // Large Desktop: 3 colonne (standard)
        '2xl:grid-cols-4',                // Extra Large: 4 colonne (solo per compact)
        className
      )}
    >
      {children}
    </div>
  );
});
