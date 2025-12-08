'use client';

import { ReactNode } from 'react';
import { getIndicatorTooltip } from '@/lib/data/indicator-tooltips';

interface IndicatorTooltipProps {
  indicatorId: string;
  children: ReactNode;
}

/**
 * IndicatorTooltip - Mostra solo spiegazione standalone
 * Nessun drawer o interazione, solo testo esplicativo
 */
export function IndicatorTooltip({ indicatorId, children }: IndicatorTooltipProps) {
  const tooltipData = getIndicatorTooltip(indicatorId);

  if (!tooltipData) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col gap-1">
      {children}
      <p className="text-xs text-text-tertiary leading-relaxed border-l-2 border-l-accent/30 pl-2">
        {tooltipData.description}
      </p>
    </div>
  );
}
