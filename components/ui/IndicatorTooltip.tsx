'use client';

import { ReactNode, useState } from 'react';
import { Info, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { getIndicatorTooltip, IndicatorTooltip as IndicatorTooltipType } from '@/lib/data/indicator-tooltips';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

interface IndicatorTooltipProps {
  indicatorId: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function IndicatorTooltip({ indicatorId, children, side = 'right' }: IndicatorTooltipProps) {
  const { locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const tooltipData = getIndicatorTooltip(indicatorId);

  if (!tooltipData) {
    return <>{children}</>;
  }

  // Disattivato temporaneamente per evitare blocchi
  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsOpen(true);
  // };

  return (
    <>
      <div 
        className="inline-flex items-center gap-1"
        // onClick={handleClick}
        // role="button"
        // tabIndex={0}
        // onKeyDown={(e) => {
        //   if (e.key === 'Enter' || e.key === ' ') {
        //     e.preventDefault();
        //     setIsOpen(true);
        //   }
        // }}
        aria-label={locale === 'it' ? 'Dettagli indicatore (disattivato)' : 'Indicator details (disabled)'}
      >
        {children}
        <Info className="w-3 h-3 text-text-tertiary" />
      </div>

      {/* Drawer disattivato temporaneamente */}
      {false && (
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={tooltipData.name}
        side={side}
        size="lg"
      >
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {tooltipData.description}
            </p>
          </div>

          {/* How to Use */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">
                {locale === 'it' ? 'Come Usare' : 'How to Use'}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {tooltipData.howToUse}
            </p>
          </div>

          {/* Interpretation */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {locale === 'it' ? 'Interpretazione' : 'Interpretation'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-green-400">
                    {locale === 'it' ? 'Positivo: ' : 'Positive: '}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {tooltipData.interpretation.positive}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-red-400">
                    {locale === 'it' ? 'Negativo: ' : 'Negative: '}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {tooltipData.interpretation.negative}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-text-tertiary">
                    {locale === 'it' ? 'Neutro: ' : 'Neutral: '}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {tooltipData.interpretation.neutral}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic References */}
          {tooltipData.academicReferences.length > 0 && (
            <div className="pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-text-primary">
                  {locale === 'it' ? 'Riferimenti Accademici' : 'Academic References'}
                </span>
              </div>
              <div className="space-y-3">
                {tooltipData.academicReferences.map((ref, index) => (
                  <div key={index} className="text-sm text-text-secondary">
                    <div className="font-semibold text-text-primary mb-1">
                      {ref.authors} ({ref.year})
                    </div>
                    <div className="italic text-text-tertiary mb-1">
                      {ref.title}
                    </div>
                    {ref.keyFindings && (
                      <div className="mt-1 text-text-secondary text-xs">
                        <span className="font-medium">{locale === 'it' ? 'Risultati chiave: ' : 'Key findings: '}</span>
                        {ref.keyFindings}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Drawer>
      )}
    </>
  );
}
