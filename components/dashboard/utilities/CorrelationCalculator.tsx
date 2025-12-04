'use client';

import { useState, useMemo } from 'react';
import { Link2, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Correlation Calculator
 * Calcola correlazione tra due serie di rendimenti
 * PRO ONLY - Strumento per analisi dipendenza tra asset
 */
export function CorrelationCalculator() {
  const { t } = useTranslations();
  
  const [asset1Returns, setAsset1Returns] = useState('5, -2, 3, 1, 4, 2, -1, 3');
  const [asset2Returns, setAsset2Returns] = useState('3, -1, 2, 0, 3, 1, -2, 2');
  const [asset1Name, setAsset1Name] = useState('Asset A');
  const [asset2Name, setAsset2Name] = useState('Asset B');

  const results = useMemo(() => {
    const returns1 = asset1Returns
      .split(/[,\n]/)
      .map(r => parseFloat(r.trim()))
      .filter(r => !isNaN(r));
    
    const returns2 = asset2Returns
      .split(/[,\n]/)
      .map(r => parseFloat(r.trim()))
      .filter(r => !isNaN(r));

    if (returns1.length < 2 || returns2.length < 2 || returns1.length !== returns2.length) {
      return null;
    }

    // Calcolo media
    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

    // Calcolo covarianza campionaria (usa n-1 per correzione di Bessel)
    let covariance = 0;
    for (let i = 0; i < returns1.length; i++) {
      covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
    }
    covariance = returns1.length > 1 ? covariance / (returns1.length - 1) : 0;

    // Calcolo deviazioni standard campionarie (usa n-1 per correzione di Bessel)
    const variance1 = returns1.length > 1 
      ? returns1.reduce((sum, r) => sum + Math.pow(r - mean1, 2), 0) / (returns1.length - 1)
      : 0;
    const variance2 = returns2.length > 1
      ? returns2.reduce((sum, r) => sum + Math.pow(r - mean2, 2), 0) / (returns2.length - 1)
      : 0;
    const stdDev1 = Math.sqrt(variance1);
    const stdDev2 = Math.sqrt(variance2);

    // Correlazione: ρ = Cov(X,Y) / (σX × σY)
    const correlation = (stdDev1 * stdDev2) > 0 
      ? covariance / (stdDev1 * stdDev2) 
      : 0;

    // Interpretazione
    let interpretation = 'Nessuna correlazione';
    let interpretationColor = 'text-text-secondary';
    if (correlation > 0.7) {
      interpretation = 'Forte correlazione positiva';
      interpretationColor = 'text-green-400';
    } else if (correlation > 0.3) {
      interpretation = 'Correlazione positiva moderata';
      interpretationColor = 'text-green-300';
    } else if (correlation > -0.3) {
      interpretation = 'Correlazione debole';
      interpretationColor = 'text-yellow-400';
    } else if (correlation > -0.7) {
      interpretation = 'Correlazione negativa moderata';
      interpretationColor = 'text-orange-400';
    } else {
      interpretation = 'Forte correlazione negativa';
      interpretationColor = 'text-red-400';
    }

    return {
      correlation,
      covariance,
      stdDev1,
      stdDev2,
      mean1,
      mean2,
      interpretation,
      interpretationColor,
      sampleSize: returns1.length,
    };
  }, [asset1Returns, asset2Returns]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>Correlation Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola la correlazione tra due asset per valutare la diversificazione del portafoglio
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Correlazione:</strong> Misura quanto due asset si muovono insieme. 
          Correlazione +1 = si muovono identicamente, -1 = si muovono opposti, 0 = indipendenti. 
          Per diversificazione ottimale, cerca correlazioni basse o negative. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Nome Asset 1</span>
              <Tooltip content="Nome identificativo del primo asset (es. AAPL, S&P 500).">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="text"
              value={asset1Name}
              onChange={(e) => setAsset1Name(e.target.value)}
              placeholder="Asset A"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Nome Asset 2</span>
              <Tooltip content="Nome identificativo del secondo asset.">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="text"
              value={asset2Name}
              onChange={(e) => setAsset2Name(e.target.value)}
              placeholder="Asset B"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Rendimenti {asset1Name} (%)</span>
              <Tooltip content="Inserisci i rendimenti periodici separati da virgola o a capo. Devono essere dello stesso numero di periodi dell'asset 2.">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <textarea
              value={asset1Returns}
              onChange={(e) => setAsset1Returns(e.target.value)}
              placeholder="5, -2, 3, 1, 4, 2, -1, 3"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Rendimenti {asset2Name} (%)</span>
              <Tooltip content="Inserisci i rendimenti periodici separati da virgola o a capo. Devono essere dello stesso numero di periodi dell'asset 1.">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <textarea
              value={asset2Returns}
              onChange={(e) => setAsset2Returns(e.target.value)}
              placeholder="3, -1, 2, 0, 3, 1, -2, 2"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                <span>Correlazione</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-accent">
                {results.correlation.toFixed(4)}
              </div>
              <div className={`text-xs font-semibold mt-1 ${results.interpretationColor}`}>
                {results.interpretation}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Covarianza</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.covariance.toFixed(4)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1">Campioni</div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.sampleSize}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Statistiche</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary mb-2">{asset1Name}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Media:</span>
                    <span className="text-text-primary">{results.mean1.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Std Dev:</span>
                    <span className="text-text-primary">{results.stdDev1.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-text-secondary mb-2">{asset2Name}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Media:</span>
                    <span className="text-text-primary">{results.mean2.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Std Dev:</span>
                    <span className="text-text-primary">{results.stdDev2.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-tertiary">
                <strong>Formula:</strong> ρ = Cov(X,Y) / (σX × σY)
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                <strong>Interpretazione:</strong> 
                {results.correlation > 0.5 && ' Alta correlazione positiva - asset si muovono insieme, poca diversificazione.'}
                {results.correlation > 0 && results.correlation <= 0.5 && ' Correlazione positiva moderata - qualche diversificazione.'}
                {results.correlation > -0.5 && results.correlation <= 0 && ' Correlazione debole/negativa - buona diversificazione.'}
                {results.correlation <= -0.5 && ' Alta correlazione negativa - ottima diversificazione, asset si muovono opposti.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Correlation Calculator"
        formulas={[
          {
            name: 'Media Campionaria',
            formula: 'x̄ = (1/n) × Σᵢ xᵢ',
            description: 'Media aritmetica dei rendimenti'
          },
          {
            name: 'Covarianza Campionaria',
            formula: 'Cov(X,Y) = (1/(n-1)) × Σᵢ (xᵢ - x̄)(yᵢ - ȳ)',
            description: 'Misura come due variabili variano insieme (usa n-1 per correzione Bessel)'
          },
          {
            name: 'Varianza Campionaria',
            formula: 'Var(X) = (1/(n-1)) × Σᵢ (xᵢ - x̄)²',
            description: 'Misura dispersione rendimenti (usa n-1 per correzione Bessel)'
          },
          {
            name: 'Deviazione Standard',
            formula: 'σ = √Var(X)',
            description: 'Radice quadrata della varianza'
          },
          {
            name: 'Correlazione di Pearson',
            formula: 'ρ = Cov(X,Y) / (σX × σY)',
            description: 'Misura correlazione lineare tra -1 e +1'
          },
        ]}
        assumptions={[
          'Relazione lineare tra variabili',
          'Distribuzione normale o approssimativamente normale',
          'Campione rappresentativo',
          'Nessuna autocorrelazione temporale',
          'Varianza costante (omoschedasticità)',
        ]}
        references={[
          'Pearson, K. (1896). Mathematical Contributions to the Theory of Evolution. Philosophical Transactions of the Royal Society.',
          'Rodgers, J. L., & Nicewander, W. A. (1988). Thirteen Ways to Look at the Correlation Coefficient. The American Statistician, 42(1), 59-66.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
