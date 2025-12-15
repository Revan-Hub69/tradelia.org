'use client';

import { useState, useMemo } from 'react';
import { Target, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Tooltip } from '@/components/ui/CustomTooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Position Sizing Calculator
 * Calcola la dimensione ottimale della posizione basata su rischio e stop loss
 * PRO ONLY - Strumento avanzato per risk management
 */
export function PositionSizingCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  
  const [accountSize, setAccountSize] = useState('100000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [entryPrice, setEntryPrice] = useState('100');
  const [stopLoss, setStopLoss] = useState('95');
  const [riskReward, setRiskReward] = useState('2');

  const results = useMemo(() => {
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) / 100 || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;
    const rr = parseFloat(riskReward) || 0;

    // Validazione input robusta
    if (account <= 0 || risk <= 0 || entry <= 0 || stop <= 0 || entry === stop || 
        isNaN(account) || isNaN(risk) || isNaN(entry) || isNaN(stop) || isNaN(rr)) {
      return null;
    }
    
    // Verifica che stop loss sia nella direzione corretta
    if (rr > 0 && entry > stop) {
      // Long trade: stop deve essere sotto entry
    } else if (rr > 0 && entry < stop) {
      // Short trade: stop deve essere sopra entry
    }

    // Calcolo position sizing
    const riskAmount = account * risk; // Quanto siamo disposti a perdere
    const priceRisk = Math.abs(entry - stop); // Rischio per unità
    const positionSize = riskAmount / priceRisk; // Numero di unità
    
    // Valore posizione
    const positionValue = positionSize * entry;
    
    // Potenziale perdita (se stop loss viene colpito)
    const potentialLoss = positionSize * priceRisk;
    
    // Potenziale guadagno (basato su risk/reward ratio)
    const potentialGain = potentialLoss * rr;
    const targetPrice = entry + (entry - stop) * rr;
    
    // Percentuale del portafoglio
    const portfolioPercent = (positionValue / account) * 100;

    return {
      positionSize: Math.floor(positionSize),
      positionValue,
      potentialLoss,
      potentialGain,
      targetPrice,
      portfolioPercent,
      riskAmount,
    };
  }, [accountSize, riskPercent, entryPrice, stopLoss, riskReward]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>Position Sizing Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola la dimensione ottimale della posizione basata sul rischio massimo accettabile
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Position Sizing:</strong> Regola fondamentale del risk management. 
          Non rischiare mai più del 1-2% del capitale per trade. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Capitale Account (€) *</span>
            <Tooltip content="Il capitale totale disponibile per il trading. Questo è il tuo account size.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
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

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Rischio per Trade (%) *</span>
            <Tooltip content="La percentuale del capitale che sei disposto a rischiare. Best practice: 1-2% per trade. Mai superare il 5%.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="2"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0.1"
            max="10"
            step="0.1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Prezzo Entry (€) *</span>
              <Tooltip content="Il prezzo a cui entri nella posizione.">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
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
              <span>Stop Loss (€) *</span>
              <Tooltip content="Il prezzo a cui esci se il trade va contro di te. Deve essere diverso dal prezzo di entry.">
                <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
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
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Risk/Reward Ratio *</span>
            <Tooltip content="Il rapporto rischio/rendimento. 2:1 significa che guadagni il doppio di quanto rischi. Minimo consigliato: 1.5:1.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={riskReward}
            onChange={(e) => setRiskReward(e.target.value)}
            placeholder="2"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0.5"
            max="10"
            step="0.1"
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Dimensione Posizione</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-accent">
                {results.positionSize.toLocaleString()} unità
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Valore Posizione</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {formatCurrency(results.positionValue)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                ({results.portfolioPercent.toFixed(1)}% del capitale)
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Rischio Massimo</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {formatCurrency(results.potentialLoss)}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi Trade</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Prezzo Target:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(results.targetPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Potenziale Guadagno:</span>
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(results.potentialGain)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Rischio Rischio:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {riskReward}:1
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-tertiary">
                  <strong>Formula:</strong> Position Size = (Account × Risk%) / (Entry Price - Stop Loss)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Position Sizing Calculator"
        formulas={[
          {
            name: 'Risk Amount',
            formula: 'Risk = Account Size × Risk Percentage',
            description: 'Importo massimo che siamo disposti a perdere per trade'
          },
          {
            name: 'Price Risk per Unit',
            formula: 'Price Risk = |Entry Price - Stop Loss|',
            description: 'Differenza tra prezzo entry e stop loss'
          },
          {
            name: 'Position Size',
            formula: 'Size = Risk Amount / Price Risk',
            description: 'Numero di unità da acquistare/vendere'
          },
          {
            name: 'Position Value',
            formula: 'Value = Position Size × Entry Price',
            description: 'Valore totale della posizione'
          },
          {
            name: 'Potential Loss',
            formula: 'Loss = Position Size × Price Risk',
            description: 'Perdita potenziale se lo stop loss viene raggiunto'
          },
          {
            name: 'Potential Gain',
            formula: 'Gain = Position Size × (Take Profit - Entry Price)',
            description: 'Guadagno potenziale se il take profit viene raggiunto'
          },
        ]}
        assumptions={[
          'Stop loss viene rispettato (nessun slippage)',
          'Entry price è quello effettivo di esecuzione',
          'Risk percentage è costante per tutti i trade',
          'Nessun costo di transazione considerato',
        ]}
        references={[
          'Tharp, V. K. (2007). Trade Your Way to Financial Freedom. McGraw-Hill.',
          'Van Tharp Institute. Position Sizing Strategies.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
