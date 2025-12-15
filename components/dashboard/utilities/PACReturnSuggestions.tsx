'use client';

import { Info, TrendingUp, Shield, Target, AlertCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/CustomTooltip';
import { cn } from '@/lib/utils/cn';

/**
 * MIFID-Friendly Return Suggestions for PAC Simulator
 * Based on academic finance literature and MIFID II compliance
 * 
 * References:
 * - Ibbotson & Associates (2021). Stocks, Bonds, Bills, and Inflation Yearbook
 * - Fama, E. F., & French, K. R. (2002). The Equity Premium. Journal of Finance
 * - MIFID II - Product Governance and Appropriateness Requirements
 */

interface ReturnSuggestion {
  label: string;
  value: number;
  riskLevel: 'conservative' | 'moderate' | 'balanced' | 'growth' | 'aggressive';
  description: string;
  academicNote: string;
  mifidWarning?: string;
  icon: typeof Info;
}

const suggestions: ReturnSuggestion[] = [
  {
    label: 'Portafoglio Conservativo',
    value: 3,
    riskLevel: 'conservative',
    description: 'Investimenti prevalentemente obbligazionari (70-80% obbligazioni, 20-30% azioni)',
    academicNote: 'Rendimento storico medio annuo: 2-4% (Ibbotson, 2021). Adatto a investitori con orizzonte temporale breve e bassa tolleranza al rischio.',
    mifidWarning: 'Rischio basso. Adatto a investitori conservativi con orizzonte temporale breve.',
    icon: Shield,
  },
  {
    label: 'Portafoglio Moderato',
    value: 4,
    riskLevel: 'moderate',
    description: 'Mix bilanciato obbligazioni-azioni (50-60% obbligazioni, 40-50% azioni)',
    academicNote: 'Rendimento storico medio annuo: 4-6% (Fama & French, 2002). Equilibrio tra rischio e rendimento per investitori moderati.',
    mifidWarning: 'Rischio medio-basso. Adatto a investitori con orizzonte temporale medio (5-10 anni).',
    icon: Target,
  },
  {
    label: 'Portafoglio Equilibrato',
    value: 5,
    riskLevel: 'balanced',
    description: 'Allocazione bilanciata (40-50% obbligazioni, 50-60% azioni)',
    academicNote: 'Rendimento storico medio annuo: 5-7% (Ibbotson, 2021). Strategia classica per investitori con orizzonte temporale medio-lungo.',
    mifidWarning: 'Rischio medio. Adatto a investitori con orizzonte temporale medio-lungo (10-15 anni).',
    icon: TrendingUp,
  },
  {
    label: 'Portafoglio Crescita',
    value: 7,
    riskLevel: 'growth',
    description: 'Prevalentemente azionario (20-30% obbligazioni, 70-80% azioni)',
    academicNote: 'Rendimento storico medio annuo: 7-9% (Fama & French, 2002). Strategia orientata alla crescita per investitori con alta tolleranza al rischio.',
    mifidWarning: 'Rischio medio-alto. Adatto a investitori con orizzonte temporale lungo (15+ anni) e alta tolleranza al rischio.',
    icon: TrendingUp,
  },
  {
    label: 'Portafoglio Aggressivo',
    value: 9,
    riskLevel: 'aggressive',
    description: 'Quasi completamente azionario (0-10% obbligazioni, 90-100% azioni)',
    academicNote: 'Rendimento storico medio annuo: 8-10% (Ibbotson, 2021). Massima esposizione al mercato azionario. Elevata volatilità attesa.',
    mifidWarning: 'Rischio alto. Adatto SOLO a investitori esperti con orizzonte temporale molto lungo (20+ anni) e altissima tolleranza al rischio.',
    icon: AlertCircle,
  },
];

interface PACReturnSuggestionsProps {
  onSelect: (value: number) => void;
  currentValue: number;
}

export function PACReturnSuggestions({ onSelect, currentValue }: PACReturnSuggestionsProps) {
  const getRiskColor = (riskLevel: ReturnSuggestion['riskLevel']) => {
    switch (riskLevel) {
      case 'conservative':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'moderate':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
      case 'balanced':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      case 'growth':
        return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
      case 'aggressive':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      default:
        return 'bg-bg-soft border-border-subtle text-text-secondary';
    }
  };

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-2">
            Suggerimenti Rendimento (MIFID Compliant)
          </h4>
          <p className="text-xs text-text-secondary mb-4">
            I seguenti valori sono basati su dati storici accademici e rappresentano rendimenti medi annui attesi nel lungo termine. 
            <strong className="text-text-primary"> I rendimenti passati non garantiscono risultati futuri.</strong> 
            Scegli in base al tuo profilo di rischio e orizzonte temporale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          const isSelected = Math.abs(parseFloat(String(currentValue)) - suggestion.value) < 0.5;
          
          return (
            <button
              key={suggestion.value}
              onClick={() => onSelect(suggestion.value)}
              className={cn(
                'text-left p-3 rounded-lg border-2 transition-all',
                'hover:scale-[1.02] hover:shadow-md',
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border-subtle bg-bg-surface hover:border-accent/40',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    'w-4 h-4',
                    isSelected ? 'text-accent' : 'text-text-tertiary'
                  )} />
                  <span className="text-sm font-semibold text-text-primary">
                    {suggestion.value}%
                  </span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-semibold border',
                  getRiskColor(suggestion.riskLevel)
                )}>
                  {suggestion.riskLevel === 'conservative' && 'Basso'}
                  {suggestion.riskLevel === 'moderate' && 'Medio-Basso'}
                  {suggestion.riskLevel === 'balanced' && 'Medio'}
                  {suggestion.riskLevel === 'growth' && 'Medio-Alto'}
                  {suggestion.riskLevel === 'aggressive' && 'Alto'}
                </span>
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
                        Nota MIFID: I rendimenti passati non garantiscono risultati futuri. Valuta attentamente il tuo profilo di rischio.
                      </p>
                    </div>
                  }
                  position="top"
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
            <strong>Avviso MIFID II:</strong> I rendimenti indicati sono stime basate su dati storici e non costituiscono garanzie. 
            Gli investimenti comportano rischi, incluso il rischio di perdita del capitale. 
            Valuta attentamente il tuo profilo di rischio, orizzonte temporale e obiettivi di investimento prima di prendere decisioni.
          </span>
        </p>
      </div>
    </div>
  );
}
