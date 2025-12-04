'use client';

import { Info, AlertCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';

/**
 * Generic MIFID-Friendly Suggestions Component
 * Reusable component for providing academic-based suggestions with MIFID compliance
 */

export interface Suggestion {
  label: string;
  value: number;
  description: string;
  academicNote: string;
  mifidWarning?: string;
  category?: string;
}

interface MIFIDSuggestionsProps {
  title: string;
  description: string;
  suggestions: Suggestion[];
  onSelect: (value: number) => void;
  currentValue: number;
  unit?: string;
  type?: 'rate' | 'percentage' | 'amount' | 'other';
}

export function MIFIDSuggestions({
  title,
  description,
  suggestions,
  onSelect,
  currentValue,
  unit = '%',
  type = 'rate',
}: MIFIDSuggestionsProps) {
  const isSelected = (value: number) => {
    const current = parseFloat(String(currentValue)) || 0;
    return Math.abs(current - value) < 0.5;
  };

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-2">
            {title}
          </h4>
          <p className="text-xs text-text-secondary mb-4">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion) => {
          const selected = isSelected(suggestion.value);
          
          return (
            <button
              key={suggestion.value}
              onClick={() => onSelect(suggestion.value)}
              className={cn(
                'text-left p-3 rounded-lg border-2 transition-all',
                'hover:scale-[1.02] hover:shadow-md',
                selected
                  ? 'border-accent bg-accent/10'
                  : 'border-border-subtle bg-bg-surface hover:border-accent/40',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-text-primary">
                  {suggestion.value}{unit}
                </span>
                {suggestion.category && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-soft text-text-tertiary border border-border-subtle">
                    {suggestion.category}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-text-primary mb-1">
                {suggestion.label}
              </p>
              <p className="text-xs text-text-secondary mb-2">
                {suggestion.description}
              </p>
              {suggestion.mifidWarning && (
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-semibold text-xs mb-1">{suggestion.mifidWarning}</p>
                      <p className="text-xs opacity-90">{suggestion.academicNote}</p>
                      <p className="text-[10px] opacity-75 mt-2 italic">
                        Nota MIFID: I valori indicati sono stime basate su dati storici e non costituiscono garanzie.
                      </p>
                    </div>
                  }
                  placement="top"
                >
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 cursor-help">
                    <AlertCircle className="w-3 h-3" />
                    <span>Avviso MIFID</span>
                  </div>
                </Tooltip>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-4">
        <p className="text-xs text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Avviso MIFID II:</strong> I valori indicati sono stime basate su dati storici e non costituiscono garanzie. 
            Valuta attentamente il tuo profilo di rischio, orizzonte temporale e obiettivi prima di prendere decisioni.
          </span>
        </p>
      </div>
    </div>
  );
}
