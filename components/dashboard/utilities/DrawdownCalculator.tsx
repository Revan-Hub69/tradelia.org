'use client';

import { useState, useMemo } from 'react';
import { TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

/**
 * Drawdown Calculator
 * Calcola il drawdown massimo e il recovery time
 * PRO ONLY - Metriche avanzate di rischio
 */
export function DrawdownCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  
  const [equityValues, setEquityValues] = useState('');
  const [initialCapital, setInitialCapital] = useState('100000');

  const results = useMemo(() => {
    const values = equityValues
      .split(/[,\n]/)
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v > 0);
    
    const capital = parseFloat(initialCapital) || 0;

    if (values.length < 2 || capital <= 0) {
      return null;
    }

    // Trova il picco massimo fino a ogni punto
    let peak = values[0];
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let maxDrawdownStart = 0;
    let maxDrawdownEnd = 0;
    let recoveryTime = 0;
    let currentDrawdownStart = 0;
    let inDrawdown = false;

    values.forEach((value, index) => {
      if (value > peak) {
        peak = value;
        if (inDrawdown) {
          // Recovery
          const drawdownDuration = index - currentDrawdownStart;
          if (drawdownDuration > recoveryTime) {
            recoveryTime = drawdownDuration;
          }
          inDrawdown = false;
        }
      } else {
        const drawdown = peak - value;
        const drawdownPercent = (drawdown / peak) * 100;
        
        if (drawdownPercent > maxDrawdownPercent) {
          maxDrawdownPercent = drawdownPercent;
          maxDrawdown = drawdown;
          maxDrawdownStart = currentDrawdownStart;
          maxDrawdownEnd = index;
        }
        
        if (!inDrawdown) {
          inDrawdown = true;
          currentDrawdownStart = index;
        }
      }
    });

    // Calcola drawdown attuale se siamo ancora in drawdown
    const currentValue = values[values.length - 1];
    const currentPeak = Math.max(...values);
    const currentDrawdown = currentPeak - currentValue;
    const currentDrawdownPercent = (currentDrawdown / currentPeak) * 100;

    // Valutazione
    let rating = 'Basso';
    let ratingColor = 'text-green-400';
    if (maxDrawdownPercent >= 50) {
      rating = 'Critico';
      ratingColor = 'text-red-400';
    } else if (maxDrawdownPercent >= 30) {
      rating = 'Alto';
      ratingColor = 'text-orange-400';
    } else if (maxDrawdownPercent >= 20) {
      rating = 'Moderato';
      ratingColor = 'text-yellow-400';
    }

    return {
      maxDrawdown,
      maxDrawdownPercent,
      maxDrawdownStart,
      maxDrawdownEnd,
      recoveryTime,
      currentDrawdown,
      currentDrawdownPercent,
      peak,
      currentValue,
      rating,
      ratingColor,
      valuesCount: values.length,
    };
  }, [equityValues, initialCapital]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>Drawdown Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola il drawdown massimo e analizza il rischio del portafoglio
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Drawdown:</strong> La perdita massima dal picco al minimo. 
          Un drawdown &lt;20% è considerato accettabile, &gt;50% è critico. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Valori Equity (sequenza temporale) *</span>
            <Tooltip content="Inserisci i valori dell'equity nel tempo, separati da virgola o a capo. Esempio: 100000, 105000, 98000, 102000 (valori del portafoglio nel tempo).">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <textarea
            value={equityValues}
            onChange={(e) => setEquityValues(e.target.value)}
            placeholder="100000, 105000, 98000, 102000, 110000, 95000"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
            rows={4}
          />
          <p className="text-xs text-text-tertiary mt-1">
            Inserisci almeno 2 valori separati da virgola o a capo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Capitale Iniziale</span>
            <Tooltip content="Il capitale iniziale del portafoglio (opzionale, usato per calcoli assoluti).">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(e.target.value)}
            placeholder="100000"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            step="1000"
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Max Drawdown</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {results.maxDrawdownPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {formatCurrency(results.maxDrawdown)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Drawdown Attuale</span>
              </div>
              <div className={`text-lg sm:text-2xl font-bold ${results.currentDrawdownPercent > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {results.currentDrawdownPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {formatCurrency(results.currentDrawdown)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1">Valutazione Rischio</div>
              <div className={`text-lg sm:text-2xl font-bold ${results.ratingColor}`}>
                {results.rating}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi Dettagliata</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Picco Massimo:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(results.peak)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Valore Attuale:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(results.currentValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Periodi Analizzati:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.valuesCount}
                </span>
              </div>
              {results.recoveryTime > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Tempo Recovery Max:</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {results.recoveryTime} periodi
                  </span>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-tertiary">
                  <strong>Drawdown:</strong> Perdita dal picco al minimo. Un drawdown &lt;20% è accettabile, 
                  &gt;50% è critico e richiede revisione della strategia. {results.maxDrawdownPercent < 20 && '✓ Rischio contenuto!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
