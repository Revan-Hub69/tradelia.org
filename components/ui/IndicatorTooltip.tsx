'use client';

import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { getIndicatorTooltip } from '@/lib/data/indicator-tooltips';

interface IndicatorTooltipProps {
  indicatorId: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * IndicatorTooltip - Disattivato temporaneamente
 * Il drawer causava blocchi del sito, quindi è stato disattivato.
 * Mostra solo l'icona Info senza interazione.
 */
export function IndicatorTooltip({ indicatorId, children }: IndicatorTooltipProps) {
  const tooltipData = getIndicatorTooltip(indicatorId);

  if (!tooltipData) {
    return <>{children}</>;
  }

  // Mostra solo icona senza interazione per evitare blocchi
  return (
    <div className="inline-flex items-center gap-1">
      {children}
      <Info className="w-3 h-3 text-text-tertiary" />
    </div>
  );
}
