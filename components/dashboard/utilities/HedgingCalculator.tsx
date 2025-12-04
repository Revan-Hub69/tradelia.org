'use client';

import { useState, useMemo } from 'react';
import { Shield, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencySymbols } from '@/lib/currency/config';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

/**
 * Hedging Calculator
 * Calcola la copertura ottimale per ridurre il rischio di portafoglio
 * PRO ONLY - Strumento avanzato per trader esperti
 */
export function HedgingCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const { currency } = useCurrency();
  
  const [portfolioValue, setPortfolioValue] = useState('100000');
  const [hedgeRatio, setHedgeRatio] = useState('50');
  const [correlation, setCorrelation] = useState('-0.7');
  const [hedgeCost, setHedgeCost] = useState('0.5');

  const results = useMemo(() => {
    const portfolio = parseFloat(portfolioValue) || 0;
    const ratio = parseFloat(hedgeRatio) / 100 || 0;
    const corr = parseFloat(correlation) || 0;
    const cost = parseFloat(hedgeCost) / 100 || 0;

    // Validazione input robusta
    if (portfolio <= 0 || ratio < 0 || ratio > 100 || 
        isNaN(portfolio) || isNaN(ratio) || isNaN(corr) || isNaN(cost) ||
        corr < -1 || corr > 1) {
      return null;
    }

    // Calcolo hedging ottimale
    // Hedge Amount = Portfolio Value × Hedge Ratio
    const hedgeAmount = portfolio * (ratio / 100);
    
    // Riduzione rischio usando formula varianza portafoglio hedged
    // σ²_hedged = w²_p * σ²_p + w²_h * σ²_h + 2 * w_p * w_h * σ_p * σ_h * ρ
    // Assumendo stessa volatilità per portafoglio e hedge (σ_p = σ_h = 1 per semplicità)
    // e pesi normalizzati: w_p = 1 - ratio/100, w_h = ratio/100
    const w_p = 1 - (ratio / 100);
    const w_h = ratio / 100;
    // Varianza portafoglio hedged (normalizzata)
    const varianceHedged = Math.pow(w_p, 2) + Math.pow(w_h, 2) + 2 * w_p * w_h * corr;
    // Varianza portafoglio originale (normalizzata a 1)
    const varianceOriginal = 1;
    // Riduzione rischio = (σ_original - σ_hedged) / σ_original
    const riskReduction = 1 - Math.sqrt(varianceHedged);
    const riskReductionPercent = Math.max(0, Math.min(100, riskReduction * 100));
    
    // Costo hedging annuale
    const annualCost = hedgeAmount * cost;
    
    // Efficienza hedging (risk reduction / cost)
    const efficiency = riskReductionPercent / (cost * 100);

    return {
      hedgeAmount,
      riskReductionPercent,
      annualCost,
      efficiency,
      remainingExposure: portfolio - hedgeAmount,
    };
  }, [portfolioValue, hedgeRatio, correlation, hedgeCost]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>Hedging Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola la copertura ottimale per ridurre il rischio del tuo portafoglio
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Hedging:</strong> Strategia per ridurre il rischio di perdite 
          investendo in asset correlati negativamente. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Valore Portafoglio ({currencySymbols[currency]}) *</span>
            <Tooltip content="Il valore totale del portafoglio che vuoi coprire. Questo è l'esposizione totale al rischio.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={portfolioValue}
            onChange={(e) => setPortfolioValue(e.target.value)}
            placeholder="100000"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Hedge Ratio (%) *</span>
            <Tooltip content="La percentuale del portafoglio da coprire. 50% significa coprire metà dell'esposizione. Range consigliato: 30-70%.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={hedgeRatio}
            onChange={(e) => setHedgeRatio(e.target.value)}
            placeholder="50"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
            max="100"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Correlazione (-1 a 1) *</span>
            <Tooltip content="La correlazione tra portafoglio e strumento di copertura. -1 = perfetta correlazione negativa (ideale), 0 = nessuna correlazione, +1 = perfetta correlazione positiva (non utile per hedging).">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={correlation}
            onChange={(e) => setCorrelation(e.target.value)}
            placeholder="-0.7"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="-1"
            max="1"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Costo Hedging Annuo (%) *</span>
            <Tooltip content="Il costo annuale dell'hedging (es. costi di opzioni, futures, swap). Tipicamente 0.5-2% annuo.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
            </Tooltip>
          </label>
          <input
            type="number"
            value={hedgeCost}
            onChange={(e) => setHedgeCost(e.target.value)}
            placeholder="0.5"
            className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            min="0"
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
                <Shield className="w-3.5 h-3.5" />
                <span>Importo Hedging</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-accent">
                {formatCurrency(results.hedgeAmount)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Riduzione Rischio</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {results.riskReductionPercent.toFixed(1)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Costo Annuo</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {formatCurrency(results.annualCost)}
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi Dettagliata</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Esposizione Residua:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(results.remainingExposure)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Efficienza Hedging:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {results.efficiency.toFixed(2)}x
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-tertiary">
                  <strong>Nota:</strong> L'hedging riduce il rischio ma limita anche i guadagni potenziali. 
                  Valuta sempre il trade-off tra protezione e costo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
