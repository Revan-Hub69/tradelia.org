'use client';

import { memo } from 'react';
import { VIXIndicator, YieldCurveIndicator, StockIndexesIndicator } from '@/components/indicators';
import { Skeleton } from '@/components/ui/Skeleton';

// Mapping indicatori implementati
const IMPLEMENTED_INDICATORS: Record<string, React.ComponentType> = {
  'vix': VIXIndicator,
  'yield-curve': YieldCurveIndicator,
  'spy': StockIndexesIndicator, // S&P 500 è parte di Stock Indexes
};

interface IndicatorCardWrapperProps {
  indicatorId: string;
  viewMode: 'grid' | 'list';
}

/**
 * Wrapper che mostra i nuovi componenti indicatori accademici
 * per quelli implementati, altrimenti mostra il componente base
 */
export const IndicatorCardWrapper = memo(function IndicatorCardWrapper({
  indicatorId,
  viewMode,
}: IndicatorCardWrapperProps) {
  const IndicatorComponent = IMPLEMENTED_INDICATORS[indicatorId];

  if (IndicatorComponent) {
    return (
      <div className={viewMode === 'list' ? 'w-full' : ''}>
        <IndicatorComponent />
      </div>
    );
  }

  // Fallback: mostra skeleton per indicatori non ancora implementati
  return (
    <div className="bg-background-secondary/50 rounded-xl p-6 border border-border">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-20 w-full" />
      <p className="text-sm text-text-tertiary mt-4 text-center">
        {indicatorId} - In arrivo
      </p>
    </div>
  );
});
