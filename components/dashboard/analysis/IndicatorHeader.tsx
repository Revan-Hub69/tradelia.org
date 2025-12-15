'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { MethodologyPopup } from '@/components/ui/MethodologyPopup';
import { Info } from 'lucide-react';
import { MethodologyNote } from './IndicatorMethodologyNotes';

interface IndicatorHeaderProps {
  title: string;
  methodology: MethodologyNote;
  className?: string;
}

/**
 * Indicator Header with Methodology Popup
 * 
 * Standard Tradelia AI - Discrete methodology notes
 * Shows title with small info icon that opens popup
 */
export function IndicatorHeader({ title, methodology, className = '' }: IndicatorHeaderProps) {
  const { locale } = useTranslations();

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <MethodologyPopup
        notes={methodology}
        trigger={
          <button
            className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded p-1"
            aria-label={locale === 'it' ? 'Note metodologiche' : 'Methodology notes'}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {locale === 'it' ? 'Note' : 'Notes'}
            </span>
          </button>
        }
      />
    </div>
  );
}
