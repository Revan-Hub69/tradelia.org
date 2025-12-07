'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';
import { RiskFreeRateSuggestions } from './RiskFreeRateSuggestions';

/**
 * Sharpe Ratio Calculator
 * Calcola il rapporto di Sharpe per valutare il rendimento corretto per il rischio
 * PRO ONLY - Metriche avanzate di performance
 */
export function SharpeRatioCalculator() {
  const { t } = useTranslations();
  
  const [returns, setReturns] = useState('');
  const [riskFreeRate, setRiskFreeRate] = useState('2');

  const results = useMemo(() => {
    const returnsList = returns
      .split(/[,\n]/)
      .map(r => parseFloat(r.trim()))
      .filter(r => !isNaN(r));
    
    const rf = parseFloat(riskFreeRate) / 100 || 0;

    if (returnsList.length < 2) {
      return null;
    }

    // Calcolo media rendimenti
    const avgReturn = returnsList.reduce((sum, r) => sum + r, 0) / returnsList.length;
    
    // Calcolo deviazione standard campionaria (usa n-1 per correzione di Bessel)
    const variance = returnsList.length > 1
      ? returnsList.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returnsList.length - 1)
      : 0;
    const stdDev = Math.sqrt(variance);
    
    // Sharpe Ratio = (Return - RiskFreeRate) / StdDev
    const sharpeRatio = stdDev > 0 ? (avgReturn - rf) / stdDev : 0;
    
    // Annualizzazione (assumendo rendimenti mensili)
    const sharpeAnnualized = sharpeRatio * Math.sqrt(12);
    
    // Valutazione
    let rating = 'Scarso';
    let ratingColor = 'text-red-400';
    if (sharpeAnnualized >= 2) {
      rating = 'Eccellente';
      ratingColor = 'text-green-400';
    } else if (sharpeAnnualized >= 1.5) {
      rating = 'Molto Buono';
      ratingColor = 'text-green-300';
    } else if (sharpeAnnualized >= 1) {
      rating = 'Buono';
      ratingColor = 'text-yellow-400';
    } else if (sharpeAnnualized >= 0.5) {
      rating = 'Accettabile';
      ratingColor = 'text-orange-400';
    }

    return {
      avgReturn,
      stdDev,
      sharpeRatio,
      sharpeAnnualized,
      rating,
      ratingColor,
      returnsCount: returnsList.length,
    };
  }, [returns, riskFreeRate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Sharpe Ratio Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola il rapporto di Sharpe per valutare il rendimento corretto per il rischio
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Sharpe Ratio:</strong> Misura il rendimento in eccesso rispetto al tasso risk-free, 
          diviso per la volatilità. Un valore &gt;1 è considerato buono, &gt;2 eccellente. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Rendimenti Periodici (%) *</span>
            <Tooltip content="Inserisci i rendimenti periodici separati da virgola o a capo. Esempio: 5, -2, 3, 1, 4 (rendimenti mensili o settimanali).">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <textarea
            value={returns}
            onChange={(e) => setReturns(e.target.value)}
            placeholder="5, -2, 3, 1, 4, 2, -1, 3, 2, 1"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
            rows={4}
          />
          <p className="text-xs text-text-secondary mt-1">
            Inserisci almeno 2 rendimenti separati da virgola o a capo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Tasso Risk-Free Annuo (%) *</span>
            <Tooltip content="Il tasso di rendimento risk-free (es. rendimento obbligazioni governative). Tipicamente 1-3% annuo. Vedi i suggerimenti MIFID compliant qui sotto.">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <div className="relative mb-4">
            <input
              type="number"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              placeholder="2"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              max="10"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">%</span>
          </div>
          {/* Suggerimenti MIFID Compliant */}
          <RiskFreeRateSuggestions
            onSelect={(value) => setRiskFreeRate(String(value))}
            currentValue={parseFloat(riskFreeRate) || 0}
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Rendimento Medio</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.avgReturn.toFixed(2)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Volatilità (Std Dev)</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.stdDev.toFixed(2)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">Sharpe Ratio (Ann.)</div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {results.sharpeAnnualized.toFixed(2)}
              </div>
              <div className={`text-xs font-semibold mt-1 ${results.ratingColor}`}>
                {results.rating}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Interpretazione</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Rendimento Medio:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.avgReturn.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Volatilità:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.stdDev.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Rendimenti Analizzati:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.returnsCount}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">
                  <strong>Formula:</strong> Sharpe Ratio = (Rendimento Medio - Risk-Free Rate) / Volatilità
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  <strong>Interpretazione:</strong> Un Sharpe Ratio &gt;1 indica un buon rendimento corretto per il rischio. 
                  Valori &gt;2 sono considerati eccellenti. {results.sharpeAnnualized >= 1 && '✓ Buon risultato!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Sharpe Ratio Calculator"
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
            name: 'Deviazione Standard',
            formula: 'σ = √σ²',
            description: 'Volatilità dei rendimenti'
          },
          {
            name: 'Sharpe Ratio',
            formula: 'SR = (μ - rf) / σ',
            description: 'Rendimento corretto per il rischio (rf = tasso risk-free)'
          },
          {
            name: 'Sharpe Ratio Annualizzato',
            formula: 'SR_annual = SR × √periods_per_year',
            description: 'Sharpe Ratio annualizzato (assumendo rendimenti mensili: √12)'
          },
        ]}
        assumptions={[
          'Rendimenti normalmente distribuiti',
          'Tasso risk-free costante',
          'Rendimenti indipendenti e identicamente distribuiti (i.i.d.)',
          'Nessun costo di transazione',
          'Per annualizzazione: assumiamo rendimenti mensili (√12)',
        ]}
        references={[
          'Sharpe, W. F. (1966). Mutual Fund Performance. The Journal of Business, 39(1), 119-138.',
          'Sharpe, W. F. (1994). The Sharpe Ratio. The Journal of Portfolio Management, 21(1), 49-58.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
