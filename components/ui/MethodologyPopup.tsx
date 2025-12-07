'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MethodologyNote {
  title: string;
  description: string;
  academicReference?: string;
  methodology?: string;
  limitations?: string;
}

interface MethodologyPopupProps {
  notes: MethodologyNote;
  trigger?: React.ReactNode;
  className?: string;
}

/**
 * Methodology Popup
 * 
 * Standard Tradelia AI - Popup con note metodologiche
 * Mostra informazioni accademiche e metodologiche su ogni indicatore/feature
 */
export function MethodologyPopup({ notes, trigger, className }: MethodologyPopupProps) {
  const { locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        'inline-flex items-center gap-1 text-xs text-text-secondary',
        'hover:text-blue-400 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent rounded'
      )}
      aria-label={locale === 'it' ? 'Note metodologiche' : 'Methodology notes'}
    >
      <Info className="w-3 h-3" />
      {locale === 'it' ? 'Note Metodologiche' : 'Methodology Notes'}
    </button>
  );

  return (
    <>
      {trigger || defaultTrigger}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={cn(
              'bg-bg-surface border border-border-subtle rounded-xl shadow-2xl',
              'max-w-2xl w-full max-h-[90vh] overflow-y-auto',
              'transform transition-all',
              className
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-bg-surface border-b border-border-subtle p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  {notes.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {locale === 'it' ? 'Note Metodologiche' : 'Methodology Notes'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'p-2 rounded-lg hover:bg-bg-soft transition-colors',
                  'text-text-secondary hover:text-text-primary'
                )}
                aria-label={locale === 'it' ? 'Chiudi' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">
                  {locale === 'it' ? 'Descrizione' : 'Description'}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {notes.description}
                </p>
              </div>

              {/* Academic Reference */}
              {notes.academicReference && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {notes.academicReference}
                  </p>
                </div>
              )}

              {/* Methodology */}
              {notes.methodology && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    {locale === 'it' ? 'Metodologia' : 'Methodology'}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {notes.methodology}
                  </p>
                </div>
              )}

              {/* Limitations */}
              {notes.limitations && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    {locale === 'it' ? 'Limitazioni' : 'Limitations'}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed italic">
                    {notes.limitations}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-bg-soft border-t border-border-subtle p-4">
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                  'bg-accent text-white hover:bg-accent-hover',
                  'focus:outline-none focus:ring-2 focus:ring-accent'
                )}
              >
                {locale === 'it' ? 'Chiudi' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
