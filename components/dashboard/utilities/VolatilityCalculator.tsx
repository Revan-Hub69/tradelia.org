'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Volatility Calculator
 * Calcola la volatilità (deviazione standard) di una serie di rendimenti
 * PRO ONLY - Metriche avanzate di rischio
 */
export function VolatilityCalculator() {
  const { t } = useTranslations();
  
  const [returns, setReturns] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const results = useMemo(() => {
    const returnsList = returns
      .split(/[,\n]/)
      .map(r => parseFloat(r.trim()))
      .filter(r => !isNaN(r));
    
    if (returnsList.length < 2) {
      return null;
    }

    // Calcolo media rendimenti
    const avgReturn = returnsList.reduce((sum, r) => sum + r, 0) / returnsList.length;
    
    // Calcolo varianza campionaria (usa n-1 per correzione di Bessel)
    const variance = returnsList.length > 1
      ? returnsList.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returnsList.length - 1)
      : 0;
    
    // Volatilità (deviazione standard)
    const volatility = Math.sqrt(variance);
    
    // Annualizzazione in base al periodo
    let annualizationFactor = 1;
    switch (period) {
      case 'daily':
        annualizationFactor = Math.sqrt(252); // Trading days per anno
        break;
      case 'weekly':
        annualizationFactor = Math.sqrt(52);
        break;
      case 'monthly':
        annualizationFactor = Math.sqrt(12);
        break;
      case 'yearly':
        annualizationFactor = 1;
        break;
    }
    
    const annualizedVolatility = volatility * annualizationFactor;
    
    // Valutazione volatilità
    let rating = 'Bassa';
    let ratingColor = 'text-green-400';
    if (annualizedVolatility >= 30) {
      rating = 'Molto Alta';
      ratingColor = 'text-red-400';
    } else if (annualizedVolatility >= 20) {
      rating = 'Alta';
      ratingColor = 'text-orange-400';
    } else if (annualizedVolatility >= 10) {
      rating = 'Media';
      ratingColor = 'text-yellow-400';
    }
    
    return {
      avgReturn,
      variance,
      volatility,
      annualizedVolatility,
      rating,
      ratingColor,
      count: returnsList.length,
    };
  }, [returns, period]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Volatility Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola la volatilità (deviazione standard) di una serie di rendimenti
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Volatilità:</strong> Misura della variabilità dei rendimenti. 
          Una volatilità alta indica maggiore rischio ma anche maggiore potenziale di guadagno. 
          Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Input */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Rendimenti Periodici (%)</span>
            <Tooltip content="Inserisci i rendimenti periodici separati da virgola o andata a capo. Esempio: 2, -1, 3, 0.5, -2, 1.5">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <textarea
            value={returns}
            onChange={(e) => setReturns(e.target.value)}
            placeholder="2, -1, 3, 0.5, -2, 1.5, 2.5, -0.5, 1, 0"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
            rows={4}
          />
          <p className="text-xs text-text-secondary mt-1">
            Inserisci almeno 2 rendimenti per calcolare la volatilità
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Periodo dei Rendimenti</span>
            <Tooltip content="Seleziona il periodo dei rendimenti per calcolare correttamente la volatilità annualizzata">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="daily">Giornaliero</option>
            <option value="weekly">Settimanale</option>
            <option value="monthly">Mensile</option>
            <option value="yearly">Annuale</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Volatilità Annualizzata</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {results.annualizedVolatility.toFixed(2)}%
              </div>
              <div className={`text-xs font-semibold mt-1 ${results.ratingColor}`}>
                {results.rating}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Volatilità Periodica</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.volatility.toFixed(4)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.count} osservazioni
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">
                Media Rendimenti
              </div>
              <div className="text-lg font-bold text-text-primary">
                {results.avgReturn.toFixed(4)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">
                Varianza
              </div>
              <div className="text-lg font-bold text-text-primary">
                {results.variance.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-2">Interpretazione</h4>
            <div className="space-y-2 text-xs sm:text-sm text-text-secondary">
              <p>
                <strong>Volatilità Annualizzata:</strong> {results.annualizedVolatility.toFixed(2)}% indica una volatilità <strong className={results.ratingColor}>{results.rating.toLowerCase()}</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Volatilità &lt; 10%: Bassa - Investimenti conservativi</li>
                <li>Volatilità 10-20%: Media - Investimenti bilanciati</li>
                <li>Volatilità 20-30%: Alta - Investimenti aggressivi</li>
                <li>Volatilità &gt; 30%: Molto Alta - Investimenti molto rischiosi</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Volatility Calculator"
        formulas={[
          {
            name: 'Media Rendimenti',
            formula: 'μ = (1/n) × Σᵢ Rᵢ',
            description: 'Media aritmetica dei rendimenti periodici'
          },
          {
            name: 'Varianza Campionaria',
            formula: 'σ² = (1/(n-1)) × Σᵢ (Rᵢ - μ)²',
            description: 'Varianza campionaria (usa n-1 per correzione Bessel)'
          },
          {
            name: 'Volatilità (Deviazione Standard)',
            formula: 'σ = √σ²',
            description: 'Radice quadrata della varianza'
          },
          {
            name: 'Volatilità Annualizzata',
            formula: 'σ_annual = σ_period × √periods_per_year',
            description: 'Volatilità scalata all\'anno (√252 per daily, √52 per weekly, √12 per monthly)'
          },
        ]}
        assumptions={[
          'Rendimenti normalmente distribuiti',
          'Rendimenti indipendenti e identicamente distribuiti (i.i.d.)',
          'Varianza costante nel tempo (omoschedasticità)',
          'Nessuna autocorrelazione temporale',
          'Per annualizzazione: 252 giorni trading/anno (daily), 52 settimane/anno (weekly), 12 mesi/anno (monthly)',
        ]}
        references={[
          'Hull, J. C. (2022). Options, Futures, and Other Derivatives. Pearson.',
          'Bodie, Z., Kane, A., & Marcus, A. J. (2021). Investments. McGraw-Hill.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
