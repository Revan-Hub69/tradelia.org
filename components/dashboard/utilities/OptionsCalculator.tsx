'use client';

import { useState, useMemo } from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencySymbols } from '@/lib/currency/config';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';
import { VolatilitySuggestions } from './VolatilitySuggestions';
import { RiskFreeRateSuggestions } from './RiskFreeRateSuggestions';

/**
 * Options Calculator
 * Calcola valore teorico e greche per opzioni Call e Put
 * PRO ONLY - Strumento avanzato per trader di opzioni
 */
export function OptionsCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const { currency } = useCurrency();
  
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [stockPrice, setStockPrice] = useState('100');
  const [strikePrice, setStrikePrice] = useState('100');
  const [timeToExpiry, setTimeToExpiry] = useState('30'); // giorni
  const [volatility, setVolatility] = useState('20'); // %
  const [riskFreeRate, setRiskFreeRate] = useState('2'); // %
  const [dividendYield, setDividendYield] = useState('0'); // %

  // Black-Scholes Model
  const results = useMemo(() => {
    const S = parseFloat(stockPrice) || 0;
    const K = parseFloat(strikePrice) || 0;
    const T = (parseFloat(timeToExpiry) || 0) / 365; // anni
    const sigma = (parseFloat(volatility) || 0) / 100;
    const r = (parseFloat(riskFreeRate) || 0) / 100;
    const q = (parseFloat(dividendYield) || 0) / 100;

    // Validazione input
    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0 || isNaN(S) || isNaN(K) || isNaN(T) || isNaN(sigma)) {
      return null;
    }

    // Evita divisione per zero
    if (sigma * Math.sqrt(T) === 0) {
      return null;
    }

    // Black-Scholes calculations
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Cumulative normal distribution approximation
    const N = (x: number) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2.0);
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return 0.5 * (1.0 + sign * y);
    };

    const N_d1 = N(d1);
    const N_d2 = N(d2);
    const N_neg_d1 = N(-d1);
    const N_neg_d2 = N(-d2);

    let optionPrice = 0;
    let intrinsicValue = 0;
    let timeValue = 0;

    if (optionType === 'call') {
      optionPrice = S * Math.exp(-q * T) * N_d1 - K * Math.exp(-r * T) * N_d2;
      intrinsicValue = Math.max(S - K, 0);
      timeValue = optionPrice - intrinsicValue;
    } else {
      optionPrice = K * Math.exp(-r * T) * N_neg_d2 - S * Math.exp(-q * T) * N_neg_d1;
      intrinsicValue = Math.max(K - S, 0);
      timeValue = optionPrice - intrinsicValue;
    }

    // Greeks (con protezione da divisione per zero)
    const sqrtT = Math.sqrt(T);
    const sqrt2PiT = Math.sqrt(2 * Math.PI * T);
    const expNegQ = Math.exp(-q * T);
    const expNegR = Math.exp(-r * T);
    const expNegD1Sq = Math.exp(-0.5 * d1 * d1);
    
    const delta = optionType === 'call' ? expNegQ * N_d1 : -expNegQ * N_neg_d1;
    // Gamma = e^(-qT) * φ(d1) / (S * σ * √(2πT))
    // dove φ(d1) = e^(-0.5*d1²) / √(2π)
    // Quindi: Gamma = e^(-qT) * e^(-0.5*d1²) / (S * σ * √(2πT))
    const gamma = sqrt2PiT > 0 ? (expNegQ * expNegD1Sq) / (S * sigma * sqrt2PiT) : 0;
    const theta = sqrt2PiT > 0 
      ? (-(S * expNegQ * expNegD1Sq * sigma) / (2 * sqrt2PiT) 
        - r * K * expNegR * (optionType === 'call' ? N_d2 : N_neg_d2)
        + q * S * expNegQ * (optionType === 'call' ? N_d1 : N_neg_d1)) / 365
      : 0;
    // Vega = S * e^(-qT) * φ(d1) * √T / 100
    // dove φ(d1) = e^(-0.5*d1²) / √(2π)
    // Quindi: Vega = S * e^(-qT) * e^(-0.5*d1²) * √T / (100 * √(2π))
    const sqrt2Pi = Math.sqrt(2 * Math.PI);
    const vega = sqrt2Pi > 0 ? (S * expNegQ * expNegD1Sq * sqrtT) / (100 * sqrt2Pi) : 0;
    const rho = (K * T * expNegR * (optionType === 'call' ? N_d2 : -N_neg_d2)) / 100;

    // Moneyness
    let moneyness = 'ATM';
    if (optionType === 'call') {
      if (S > K * 1.05) moneyness = 'ITM';
      else if (S < K * 0.95) moneyness = 'OTM';
    } else {
      if (S < K * 0.95) moneyness = 'ITM';
      else if (S > K * 1.05) moneyness = 'OTM';
    }

    return {
      optionPrice: Math.max(optionPrice, 0),
      intrinsicValue,
      timeValue,
      delta,
      gamma,
      theta,
      vega,
      rho,
      moneyness,
      d1,
      d2,
    };
  }, [optionType, stockPrice, strikePrice, timeToExpiry, volatility, riskFreeRate, dividendYield]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Options Calculator</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola valore teorico e greche per opzioni Call e Put usando il modello Black-Scholes
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Black-Scholes Model:</strong> Modello matematico per valutare opzioni. 
          Le greche misurano la sensibilità del prezzo dell'opzione ai cambiamenti dei parametri. 
          Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Option Type */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <label className="block text-sm font-medium text-text-secondary mb-3">Tipo Opzione *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOptionType('call')}
            className={`p-4 rounded-lg border transition-all ${
              optionType === 'call'
                ? 'bg-accent/10 border-accent/40 text-blue-400'
                : 'bg-bg-surface border-border-subtle text-text-secondary hover:border-accent/20'
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-2" />
            <div className="font-semibold">Call</div>
            <div className="text-xs opacity-75">Diritto di acquisto</div>
          </button>
          <button
            onClick={() => setOptionType('put')}
            className={`p-4 rounded-lg border transition-all ${
              optionType === 'put'
                ? 'bg-accent/10 border-accent/40 text-blue-400'
                : 'bg-bg-surface border-border-subtle text-text-secondary hover:border-accent/20'
            }`}
          >
            <TrendingDown className="w-5 h-5 mx-auto mb-2" />
            <div className="font-semibold">Put</div>
            <div className="text-xs opacity-75">Diritto di vendita</div>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Prezzo Stock ({currencySymbols[currency]}) *</span>
              <Tooltip content="Il prezzo corrente dell'asset sottostante.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Strike Price ({currencySymbols[currency]}) *</span>
              <Tooltip content="Il prezzo di esercizio dell'opzione.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Tempo a Scadenza (giorni) *</span>
              <Tooltip content="Il numero di giorni rimanenti fino alla scadenza dell'opzione.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={timeToExpiry}
              onChange={(e) => setTimeToExpiry(e.target.value)}
              placeholder="30"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="1"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Volatilità Implicita (%) *</span>
              <Tooltip content="La volatilità attesa dell'asset, tipicamente 15-30% per azioni, 50-100% per crypto. Vedi i suggerimenti MIFID compliant qui sotto.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <div className="relative mb-4">
              <input
                type="number"
                value={volatility}
                onChange={(e) => setVolatility(e.target.value)}
                placeholder="20"
                className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                min="0"
                max="200"
                step="0.1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">%</span>
            </div>
            {/* Suggerimenti MIFID Compliant */}
            <VolatilitySuggestions
              onSelect={(value) => setVolatility(String(value))}
              currentValue={parseFloat(volatility) || 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Tasso Risk-Free (%) *</span>
              <Tooltip content="Il tasso di interesse risk-free (es. rendimento obbligazioni governative). Vedi i suggerimenti MIFID compliant qui sotto.">
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>Dividend Yield (%)</span>
              <Tooltip content="Il rendimento da dividendi dell'asset (0% se non paga dividendi).">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={dividendYield}
              onChange={(e) => setDividendYield(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">Prezzo Opzione</div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {formatCurrency(results.optionPrice)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">Valore Intrinseco</div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {formatCurrency(results.intrinsicValue)}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-secondary mb-1">Valore Temporale</div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {formatCurrency(results.timeValue)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {results.moneyness}
              </div>
            </div>
          </div>

          {/* Greeks */}
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Greeks (Sensibilità)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <div className="text-xs text-text-secondary mb-1">Delta</div>
                <div className="text-sm font-bold text-text-primary">{results.delta.toFixed(4)}</div>
                <div className="text-xs text-text-secondary mt-1">Sensibilità a prezzo</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Gamma</div>
                <div className="text-sm font-bold text-text-primary">{results.gamma.toFixed(4)}</div>
                <div className="text-xs text-text-secondary mt-1">Variazione Delta</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Theta</div>
                <div className="text-sm font-bold text-red-400">{results.theta.toFixed(4)}</div>
                <div className="text-xs text-text-secondary mt-1">Decadimento tempo</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Vega</div>
                <div className="text-sm font-bold text-text-primary">{results.vega.toFixed(4)}</div>
                <div className="text-xs text-text-secondary mt-1">Sensibilità volatilità</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Rho</div>
                <div className="text-sm font-bold text-text-primary">{results.rho.toFixed(4)}</div>
                <div className="text-xs text-text-secondary mt-1">Sensibilità tasso</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-secondary">
                <strong>Nota:</strong> I valori sono calcolati usando il modello Black-Scholes. 
                I prezzi reali possono differire per liquidità, spread bid-ask e altri fattori di mercato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Options Calculator"
        formulas={[
          {
            name: 'Black-Scholes d1',
            formula: 'd1 = (ln(S/K) + (r - q + 0.5×σ²)×T) / (σ×√T)',
            description: 'S = Stock price, K = Strike, r = Risk-free rate, q = Dividend yield, σ = Volatility, T = Time to expiry'
          },
          {
            name: 'Black-Scholes d2',
            formula: 'd2 = d1 - σ×√T',
            description: 'd2 per calcolo probabilità esercizio'
          },
          {
            name: 'Call Option',
            formula: 'C = S×e^(-qT)×N(d1) - K×e^(-rT)×N(d2)',
            description: 'C = Call price, N() = Cumulative normal distribution'
          },
          {
            name: 'Put Option',
            formula: 'P = K×e^(-rT)×N(-d2) - S×e^(-qT)×N(-d1)',
            description: 'P = Put price'
          },
          {
            name: 'Delta (Call)',
            formula: 'Δ = e^(-qT)×N(d1)',
            description: 'Sensibilità prezzo opzione a variazione prezzo stock'
          },
          {
            name: 'Gamma',
            formula: 'Γ = e^(-qT)×φ(d1) / (S×σ×√(2πT))',
            description: 'Variazione Delta, dove φ(d1) = e^(-0.5×d1²) / √(2π)'
          },
          {
            name: 'Theta',
            formula: 'Θ = -(S×e^(-qT)×φ(d1)×σ) / (2×√(2πT)) - r×K×e^(-rT)×N(d2) + q×S×e^(-qT)×N(d1)',
            description: 'Decadimento temporale (per giorno)'
          },
          {
            name: 'Vega',
            formula: 'ν = S×e^(-qT)×φ(d1)×√T / (100×√(2π))',
            description: 'Sensibilità a variazione volatilità (per 1% cambio)'
          },
          {
            name: 'Rho',
            formula: 'ρ = K×T×e^(-rT)×N(d2) / 100',
            description: 'Sensibilità a variazione tasso risk-free (per 1% cambio)'
          },
        ]}
        assumptions={[
          'Mercato efficiente e senza arbitraggio',
          'Volatilità costante nel tempo',
          'Tasso risk-free costante',
          'Nessun dividendo o dividend yield costante',
          'Distribuzione log-normale dei prezzi',
          'Nessun costo di transazione',
        ]}
        references={[
          'Black, F., & Scholes, M. (1973). The Pricing of Options and Corporate Liabilities. Journal of Political Economy, 81(3), 637-654.',
          'Hull, J. C. (2022). Options, Futures, and Other Derivatives. Pearson.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
