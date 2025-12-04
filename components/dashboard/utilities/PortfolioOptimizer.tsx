'use client';

import { useState, useMemo } from 'react';
import { PieChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';
import { RiskFreeRateSuggestions } from './RiskFreeRateSuggestions';

/**
 * Portfolio Optimizer (Markowitz)
 * Calcola allocazione ottimale portafoglio usando teoria moderna del portafoglio
 * PRO ONLY - Strumento avanzato per ottimizzazione portafoglio
 */
export function PortfolioOptimizer() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  
  const [assets, setAssets] = useState([
    { symbol: 'AAPL', weight: 30, return: 12, volatility: 20 },
    { symbol: 'MSFT', weight: 30, return: 11, volatility: 18 },
    { symbol: 'GOOGL', weight: 40, return: 10, volatility: 22 },
  ]);
  const [correlations, setCorrelations] = useState<Record<string, number>>({
    'AAPL-MSFT': 0.7,
    'AAPL-GOOGL': 0.6,
    'MSFT-GOOGL': 0.65,
  });
  const [riskFreeRate, setRiskFreeRate] = useState('2');

  const results = useMemo(() => {
    const rf = parseFloat(riskFreeRate) / 100 || 0;
    
    if (assets.length < 2) {
      return null;
    }

    // Calcolo rendimento atteso portafoglio
    const portfolioReturn = assets.reduce((sum, asset) => {
      return sum + (asset.weight / 100) * (asset.return / 100);
    }, 0);

    // Calcolo volatilità portafoglio (formula Markowitz)
    let portfolioVariance = 0;
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        const weightI = assets[i].weight / 100;
        const weightJ = assets[j].weight / 100;
        const volI = assets[i].volatility / 100;
        const volJ = assets[j].volatility / 100;
        
        let correlation = 0;
        if (i === j) {
          correlation = 1;
        } else {
          const key1 = `${assets[i].symbol}-${assets[j].symbol}`;
          const key2 = `${assets[j].symbol}-${assets[i].symbol}`;
          correlation = correlations[key1] || correlations[key2] || 0;
        }
        
        portfolioVariance += weightI * weightJ * volI * volJ * correlation;
      }
    }
    
    const portfolioVolatility = Math.sqrt(portfolioVariance) * 100;
    
    // Sharpe Ratio (senza moltiplicare per 100 - è già un rapporto)
    const sharpeRatio = portfolioVolatility > 0 
      ? (portfolioReturn - rf) / portfolioVolatility
      : 0;

    // Diversificazione (quanto il portafoglio è diversificato)
    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
    const herfindahlIndex = assets.reduce((sum, a) => {
      return sum + Math.pow(a.weight / totalWeight, 2);
    }, 0);
    const diversification = (1 - herfindahlIndex) * 100;

    // Valutazione
    let rating = 'Buono';
    let ratingColor = 'text-green-400';
    if (sharpeRatio < 0.5) {
      rating = 'Scarso';
      ratingColor = 'text-red-400';
    } else if (sharpeRatio < 1) {
      rating = 'Accettabile';
      ratingColor = 'text-yellow-400';
    } else if (sharpeRatio >= 2) {
      rating = 'Eccellente';
      ratingColor = 'text-green-300';
    }

    return {
      portfolioReturn: portfolioReturn * 100,
      portfolioVolatility,
      sharpeRatio,
      diversification,
      rating,
      ratingColor,
    };
  }, [assets, correlations, riskFreeRate]);

  const addAsset = () => {
    setAssets([...assets, { symbol: '', weight: 0, return: 0, volatility: 0 }]);
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: string, value: string) => {
    const newAssets = [...assets];
    newAssets[index] = {
      ...newAssets[index],
      [field]: field === 'symbol' ? value.toUpperCase() : parseFloat(value) || 0,
    };
    setAssets(newAssets);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>Portfolio Optimizer</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Calcola allocazione ottimale portafoglio usando la Teoria Moderna del Portafoglio (Markowitz)
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Teoria Moderna del Portafoglio:</strong> Massimizza il rendimento per un dato livello di rischio 
          attraverso la diversificazione. La correlazione tra asset è fondamentale per ridurre il rischio. 
          Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Assets Input */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary">Asset nel Portafoglio</h3>
          <button
            onClick={addAsset}
            className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            + Aggiungi Asset
          </button>
        </div>

        <div className="space-y-3">
          {assets.map((asset, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-bg-surface rounded-lg border border-border-subtle">
              <div>
                <label className="block text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
                  <span>Simbolo</span>
                  <Tooltip content="Il simbolo dell'asset (es. AAPL, MSFT).">
                    <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={asset.symbol}
                  onChange={(e) => updateAsset(index, 'symbol', e.target.value)}
                  placeholder="AAPL"
                  className="w-full px-3 py-1.5 text-sm bg-bg-soft border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
                  <span>Peso (%)</span>
                  <Tooltip content="La percentuale del portafoglio allocata a questo asset.">
                    <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={asset.weight}
                  onChange={(e) => updateAsset(index, 'weight', e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-1.5 text-sm bg-bg-soft border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
                  <span>Rendimento (%)</span>
                  <Tooltip content="Il rendimento atteso annuo dell'asset.">
                    <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={asset.return}
                  onChange={(e) => updateAsset(index, 'return', e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-1.5 text-sm bg-bg-soft border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
                  <span>Volatilità (%)</span>
                  <Tooltip content="La volatilità (deviazione standard) annua dell'asset.">
                    <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={asset.volatility}
                  onChange={(e) => updateAsset(index, 'volatility', e.target.value)}
                  placeholder="20"
                  className="w-full px-3 py-1.5 text-sm bg-bg-soft border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeAsset(index)}
                  className="w-full px-3 py-1.5 text-sm bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded transition-colors"
                  disabled={assets.length <= 2}
                >
                  Rimuovi
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <span>Tasso Risk-Free (%)</span>
            <Tooltip content="Il tasso di interesse risk-free per calcolare lo Sharpe Ratio. Vedi i suggerimenti MIFID compliant qui sotto.">
              <HelpCircle className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help" />
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">%</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Rendimento Atteso</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-accent">
                {results.portfolioReturn.toFixed(2)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Volatilità</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-text-primary">
                {results.portfolioVolatility.toFixed(2)}%
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1">Sharpe Ratio</div>
              <div className="text-lg sm:text-2xl font-bold text-accent">
                {results.sharpeRatio.toFixed(2)}
              </div>
              <div className={`text-xs font-semibold mt-1 ${results.ratingColor}`}>
                {results.rating}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-text-tertiary mb-1">Diversificazione</div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {results.diversification.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Analisi Portafoglio</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Totale Peso:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {assets.reduce((sum, a) => sum + a.weight, 0).toFixed(1)}%
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-tertiary">
                  <strong>Formula Markowitz:</strong> σ²p = Σᵢ Σⱼ wᵢ wⱼ σᵢ σⱼ ρᵢⱼ
                </p>
                <p className="text-xs text-text-tertiary mt-2">
                  <strong>Ottimizzazione:</strong> Un portafoglio ben diversificato (correlazioni basse) riduce il rischio 
                  senza sacrificare il rendimento. Obiettivo: massimizzare Sharpe Ratio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Portfolio Optimizer"
        formulas={[
          {
            name: 'Rendimento Portafoglio',
            formula: 'E(Rp) = Σᵢ wᵢ × E(Rᵢ)',
            description: 'Rendimento atteso portafoglio = somma pesata rendimenti asset'
          },
          {
            name: 'Varianza Portafoglio (Markowitz)',
            formula: 'σ²p = Σᵢ Σⱼ wᵢ wⱼ σᵢ σⱼ ρᵢⱼ',
            description: 'Varianza portafoglio dipende da pesi, volatilità e correlazioni tra asset'
          },
          {
            name: 'Volatilità Portafoglio',
            formula: 'σp = √σ²p',
            description: 'Deviazione standard del rendimento portafoglio'
          },
          {
            name: 'Sharpe Ratio',
            formula: 'SR = (E(Rp) - rf) / σp',
            description: 'Rendimento corretto per il rischio (rf = tasso risk-free)'
          },
          {
            name: 'Herfindahl Index',
            formula: 'H = Σᵢ (wᵢ / Σw)²',
            description: 'Misura concentrazione portafoglio (0 = perfettamente diversificato, 1 = concentrato)'
          },
        ]}
        assumptions={[
          'Rendimenti e volatilità costanti nel tempo',
          'Correlazioni tra asset stabili',
          'Nessun costo di transazione',
          'Distribuzione normale dei rendimenti',
          'Investitore razionale che massimizza utilità',
        ]}
        references={[
          'Markowitz, H. (1952). Portfolio Selection. The Journal of Finance, 7(1), 77-91.',
          'Sharpe, W. F. (1966). Mutual Fund Performance. The Journal of Business, 39(1), 119-138.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
