'use client';

import { ReactNode } from 'react';
import { Info, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getIndicatorTooltip, IndicatorTooltip as IndicatorTooltipType } from '@/lib/data/indicator-tooltips';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

interface IndicatorTooltipProps {
  indicatorId: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function IndicatorTooltip({ indicatorId, children, side = 'top' }: IndicatorTooltipProps) {
  const { locale } = useTranslations();
  const tooltipData = getIndicatorTooltip(indicatorId);

  if (!tooltipData) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {children}
            <Info className="w-3 h-3 text-text-tertiary hover:text-accent transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-md p-4 bg-bg-surface border border-border-subtle shadow-xl z-[100]"
        >
          <div className="space-y-3">
            {/* Header */}
            <div>
              <h4 className="font-semibold text-text-primary text-sm mb-1">
                {tooltipData.name}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {tooltipData.description}
              </p>
            </div>

            {/* How to Use */}
            <div className="pt-2 border-t border-border-subtle">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-xs font-semibold text-text-primary">
                  {locale === 'it' ? 'Come Usare' : 'How to Use'}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {tooltipData.howToUse}
              </p>
            </div>

            {/* Interpretation */}
            <div className="pt-2 border-t border-border-subtle">
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-green-400">
                      {locale === 'it' ? 'Positivo: ' : 'Positive: '}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {tooltipData.interpretation.positive}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-red-400">
                      {locale === 'it' ? 'Negativo: ' : 'Negative: '}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {tooltipData.interpretation.negative}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic References */}
            {tooltipData.academicReferences.length > 0 && (
              <div className="pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3 h-3 text-accent" />
                  <span className="text-xs font-semibold text-text-primary">
                    {locale === 'it' ? 'Riferimenti Accademici' : 'Academic References'}
                  </span>
                </div>
                <div className="space-y-1">
                  {tooltipData.academicReferences.map((ref, index) => (
                    <div key={index} className="text-xs text-text-secondary">
                      <div className="font-medium">
                        {ref.authors} ({ref.year})
                      </div>
                      <div className="italic text-text-tertiary">
                        {ref.title}
                      </div>
                      {ref.keyFindings && (
                        <div className="mt-0.5 text-text-tertiary">
                          {ref.keyFindings}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
