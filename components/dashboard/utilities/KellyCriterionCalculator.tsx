'use client';

import { useState, useMemo } from 'react';
import { Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Kelly Criterion Calculator
 * Calcola la percentuale ottimale del capitale da investire
 * PRO ONLY - Formula matematica per position sizing ottimale
 */
export function KellyCriterionCalculator() {
  const { t } = useTranslations();
  
  const [winRate, setWinRate] = useState('60'); // %
  const [avgWin, setAvgWin] = useState('2'); // multiplo del rischio
  const [avgLoss, setAvgLoss] = useState('1'); // multiplo del rischio
  const [accountSize, setAccountSize] = useState('100000');

  const results = useMemo(() => {
    const p = parseFloat(winRate) / 100 || 0; // probabilità di vincita
    const winMultiplier = parseFloat(avgWin) || 0; // guadagno medio (multiplo del rischio)
    const lossMultiplier = parseFloat(avgLoss) || 0; // perdita media (multiplo del rischio)
    const q = 1 - p; // probabilità di perdita
    const account = parseFloat(accountSize) || 0;

    if (p <= 0 || p >= 1 || winMultiplier <= 0 || lossMultiplier <= 0 || account <= 0) {
      return null;
    }

    // Kelly Criterion: f* = (p * b - q) / b
    // dove b = win/loss ratio (guadagno medio / perdita media)
    const b = winMultiplier / lossMultiplier;
    const kellyPercent = ((p * b - q) / b) * 100;
    
    // Kelly Fraction (conservativo): usa metà del Kelly per ridurre rischio
    const halfKelly = kellyPercent / 2;
    const quarterKelly = kellyPercent / 4;

    // Importi in valuta
    const kellyAmount = (account * kellyPercent) / 100;
    const halfKellyAmount = (account * halfKelly) / 100;
    const quarterKellyAmount = (account * quarterKelly) / 100;

    // Valutazione
    let recommendation = 'Conservativo';
    let recommendationColor = 'text-green-400';
    if (kellyPercent > 25) {
      recommendation = 'Troppo Aggressivo';
      recommendationColor = 'text-red-400';
    } else if (kellyPercent > 15) {
      recommendation = 'Aggressivo';
      recommendationColor = 'text-orange-400';
    } else if (kellyPercent > 10) {
      recommendation = 'Moderato';
      recommendationColor = 'text-yellow-400';
    }

    // Expected Value (in percentuale del rischio)
    const expectedValue = (p * winMultiplier - q * lossMultiplier) * 100; // %

    return {
      kellyPercent: Math.max(0, kellyPercent),
      halfKelly,
      quarterKelly,
      kellyAmount,
      halfKellyAmount,
      quarterKellyAmount,
      recommendation,
      recommendationColor,
      expectedValue,
      edge: p * b - q, // vantaggio matematico
      winLossRatio: b, // rapporto win/loss
    };
  }, [winRate, avgWin, avgLoss, accountSize]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Kelly Criterion Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola la percentuale ottimale del capitale da investire usando la formula di Kelly
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Kelly Criterion:</strong> Formula matematica che calcola la percentuale ottimale 
          del capitale da investire per massimizzare la crescita nel lungo termine. 
          <strong className="text-text-primary"> Best Practice:</strong> Usa metà o un quarto del Kelly per ridurre il rischio. 
          Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Win Rate (%) *</span>
            <Tooltip content="La percentuale di trade vincenti. Esempio: 60% significa che vinci 6 trade su 10.">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={winRate}
            onChange={(e) => setWinRate(e.target.value)}
            placeholder="60"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Media Win (multiplo rischio) *</span>
              <Tooltip content="Quanto guadagni in media quando vinci, espresso come multiplo del rischio. Esempio: 2 significa che guadagni il doppio di quanto rischi.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={avgWin}
              onChange={(e) => setAvgWin(e.target.value)}
              placeholder="2"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0.1"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Media Loss (multiplo rischio) *</span>
              <Tooltip content="Quanto perdi in media quando perdi, espresso come multiplo del rischio. Tipicamente 1 (perdi quanto rischi).">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={avgLoss}
              onChange={(e) => setAvgLoss(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0.1"
              step="0.1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Capitale Account</span>
            <Tooltip content="Il capitale totale disponibile (opzionale, usato per calcoli in valuta).">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            placeholder="100000"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            step="1000"
          />
        </div>
      </div>

      {/* Results */}
      {results && results.kellyPercent > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Kelly Full</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {results.kellyPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.kellyAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Half Kelly (Consigliato)</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {results.halfKelly.toFixed(2)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.halfKellyAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Quarter Kelly (Conservativo)</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.quarterKelly.toFixed(2)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.quarterKellyAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Valutazione:</span>
                <span className={`text-sm font-semibold ${results.recommendationColor}`}>
                  {results.recommendation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Win/Loss Ratio:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.winLossRatio.toFixed(2)}:1
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Edge (Vantaggio):</span>
                <span className="text-sm font-semibold text-text-primary">
                  {(results.edge * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Expected Value:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.expectedValue.toFixed(2)}%
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">
                  <strong>Formula:</strong> Kelly% = (WinRate × AvgWin - LossRate) / AvgWin
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  <strong>Raccomandazione:</strong> Il Kelly Full massimizza la crescita ma è molto rischioso. 
                  Usa Half Kelly o Quarter Kelly per un approccio più conservativo e sostenibile nel lungo termine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results && results.kellyPercent <= 0 && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4">
          <p className="text-sm text-red-400">
            <strong>Attenzione:</strong> Con questi parametri, il Kelly Criterion indica di non investire. 
            Il sistema non ha un edge positivo (WinRate × AvgWin &lt; LossRate).
          </p>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Kelly Criterion Calculator"
        formulas={[
          {
            name: 'Kelly Criterion',
            formula: 'f* = (p × b - q) / b',
            description: 'f* = Percentuale ottimale capitale, p = Probabilità vincita, b = Win/Loss ratio, q = 1 - p'
          },
          {
            name: 'Win/Loss Ratio',
            formula: 'b = AvgWin / AvgLoss',
            description: 'Rapporto tra guadagno medio e perdita media'
          },
          {
            name: 'Expected Value',
            formula: 'EV = p × WinMultiplier - q × LossMultiplier',
            description: 'Valore atteso del sistema di trading'
          },
        ]}
        assumptions={[
          'Distribuzione di probabilità stabile nel tempo',
          'Win rate e payoff ratio costanti',
          'Capitalizzazione continua',
          'Nessun limite di capitale',
          'Kelly Full è teorico - in pratica usare Half o Quarter Kelly',
        ]}
        references={[
          'Kelly, J. L. (1956). A New Interpretation of Information Rate. Bell System Technical Journal, 35(4), 917-926.',
          'Thorp, E. O. (2006). The Kelly Criterion in Blackjack Sports Betting, and the Stock Market. In Handbook of Asset and Liability Management.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
