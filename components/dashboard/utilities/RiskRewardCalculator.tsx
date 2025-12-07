'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencySymbols } from '@/lib/currency/config';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Risk/Reward Calculator
 * Calcola il rapporto rischio/rendimento e valuta la qualità del trade
 * PRO ONLY - Strumento essenziale per valutare setup
 */
export function RiskRewardCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const { currency } = useCurrency();
  
  const [entryPrice, setEntryPrice] = useState('100');
  const [stopLoss, setStopLoss] = useState('95');
  const [takeProfit, setTakeProfit] = useState('110');
  const [positionSize, setPositionSize] = useState('100');

  const results = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;
    const profit = parseFloat(takeProfit) || 0;
    const size = parseFloat(positionSize) || 0;

    if (entry <= 0 || stop <= 0 || profit <= 0 || size <= 0) {
      return null;
    }

    // Calcolo rischio e reward
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(profit - entry);
    const riskRewardRatio = reward / risk;
    
    // Valori monetari
    const riskAmount = risk * size;
    const rewardAmount = reward * size;
    
    // Win rate minimo richiesto per essere profittevole
    // Se R:R = 2:1, serve win rate > 33.3% per essere profittevole
    const minWinRate = (1 / (1 + riskRewardRatio)) * 100;
    
    // Valutazione trade
    let tradeQuality = 'Scarso';
    let qualityColor = 'text-red-400';
    if (riskRewardRatio >= 3) {
      tradeQuality = 'Eccellente';
      qualityColor = 'text-green-400';
    } else if (riskRewardRatio >= 2) {
      tradeQuality = 'Buono';
      qualityColor = 'text-green-300';
    } else if (riskRewardRatio >= 1.5) {
      tradeQuality = 'Accettabile';
      qualityColor = 'text-yellow-400';
    } else if (riskRewardRatio >= 1) {
      tradeQuality = 'Marginale';
      qualityColor = 'text-orange-400';
    }

    return {
      risk,
      reward,
      riskRewardRatio,
      riskAmount,
      rewardAmount,
      minWinRate,
      tradeQuality,
      qualityColor,
    };
  }, [entryPrice, stopLoss, takeProfit, positionSize]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Risk/Reward Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Valuta la qualità del trade analizzando il rapporto rischio/rendimento
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Risk/Reward Ratio:</strong> Rapporto tra potenziale perdita e guadagno. 
          Un buon trade ha almeno 2:1 (guadagni il doppio di quanto rischi). Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Entry Price ({currencySymbols[currency]}) *</span>
              <Tooltip content="Il prezzo a cui entri nel trade.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Stop Loss ({currencySymbols[currency]}) *</span>
              <Tooltip content="Il prezzo a cui esci se il trade va male. Deve essere più lontano dall'entry rispetto al take profit.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="95"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Take Profit ({currencySymbols[currency]}) *</span>
              <Tooltip content="Il prezzo target dove prendi profitto. Idealmente almeno 2x la distanza dello stop loss.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="110"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Dimensione Posizione (unità) *</span>
            <Tooltip content="Il numero di unità (azioni, contratti, etc.) che stai tradando.">
              <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            placeholder="100"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Rischio</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {formatCurrency(results.riskAmount)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.risk.toFixed(2)} {currencySymbols[currency]} per unità
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Reward</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {formatCurrency(results.rewardAmount)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.reward.toFixed(2)} {currencySymbols[currency]} per unità
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">Risk/Reward</div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {results.riskRewardRatio.toFixed(2)}:1
              </div>
              <div className={`text-xs font-semibold mt-1 ${results.qualityColor}`}>
                {results.tradeQuality}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi Trade</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Win Rate Minimo Richiesto:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.minWinRate.toFixed(1)}%
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">
                  <strong>Interpretazione:</strong> Con un R:R di {results.riskRewardRatio.toFixed(2)}:1, 
                  devi vincere almeno il {results.minWinRate.toFixed(1)}% dei trade per essere profittevole nel lungo termine.
                  {results.riskRewardRatio >= 2 && ' ✓ Buon rapporto!'}
                  {results.riskRewardRatio < 1.5 && ' ⚠️ Considera di migliorare il setup.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Risk/Reward Calculator"
        formulas={[
          {
            name: 'Risk',
            formula: 'Risk = |Entry Price - Stop Loss|',
            description: 'Distanza tra entry e stop loss'
          },
          {
            name: 'Reward',
            formula: 'Reward = |Take Profit - Entry Price|',
            description: 'Distanza tra entry e take profit'
          },
          {
            name: 'Risk/Reward Ratio',
            formula: 'R:R = Reward / Risk',
            description: 'Rapporto tra potenziale guadagno e rischio'
          },
          {
            name: 'Risk Amount',
            formula: 'Risk Amount = Risk × Position Size',
            description: 'Importo monetario a rischio'
          },
          {
            name: 'Reward Amount',
            formula: 'Reward Amount = Reward × Position Size',
            description: 'Importo monetario potenziale guadagno'
          },
          {
            name: 'Minimum Win Rate',
            formula: 'Min Win Rate = 1 / (1 + R:R) × 100%',
            description: 'Win rate minimo necessario per essere profittevole'
          },
        ]}
        assumptions={[
          'Stop loss e take profit vengono rispettati',
          'Nessun slippage considerato',
          'Win rate è costante nel tempo',
          'Risk/Reward ratio è rappresentativo del sistema',
        ]}
        references={[
          'Tharp, V. K. (2007). Trade Your Way to Financial Freedom. McGraw-Hill.',
          'Elder, A. (2002). Come Diventare un Trader. Il Sole 24 Ore.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
