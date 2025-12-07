'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Commodity {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  timestamp: string;
}

interface CommoditiesData {
  commodities: Commodity[];
  timestamp: string;
  aiReading: string;
}

/**
 * Commodities Indicator
 *
 * Major Commodities
 * - Gold (XAU/USD)
 * - Oil (WTI Crude)
 * - Silver
 *
 * Academic Reference: Commodity Futures Theory, Inflation Hedging
 * Data Source: Alpha Vantage API
 * Updates: Every 5 minutes
 */
export default function CommoditiesIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<CommoditiesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const response = await fetch('/api/market-indicators/commodities', {
          // Cache for 5 minutes
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json();
            setError(errorData.error || 'Commodities not available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Commodities');
        }

        const commoditiesData = await response.json();
        setData(commoditiesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Commodities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommodities();
    // Update every 5 minutes
    const interval = setInterval(fetchCommodities, 300000);
    return () => clearInterval(interval);
  }, []);

  // Memoize commodity cards for performance
  const commodityCards = useMemo(() => {
    if (!data) return null;

    return data.commodities.map((commodity) => {
      const isPositive = commodity.change >= 0;
      const isNegative = commodity.change < 0;
      const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-text-secondary';

      return (
        <div
          key={commodity.symbol}
          className="bg-bg-soft rounded-lg border border-border-subtle p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {commodity.name}
              </h3>
              <p className="text-xs text-text-secondary">
                {commodity.symbol === 'GOLD'
                  ? locale === 'it'
                    ? 'Safe haven, hedge contro inflazione'
                    : 'Safe haven, inflation hedge'
                  : commodity.symbol === 'OIL'
                    ? locale === 'it'
                      ? 'Indicatore domanda economica globale'
                      : 'Global economic demand indicator'
                    : locale === 'it'
                      ? 'Correlato a gold, più volatile'
                      : 'Correlated to gold, more volatile'}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              ${commodity.price.toFixed(2)}
              <span className="text-sm font-normal text-text-secondary ml-1">
                /{commodity.unit}
              </span>
            </span>
            <div className={cn('flex items-center gap-1 text-sm', changeColor)}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>
                {commodity.change >= 0 ? '+' : ''}
                {commodity.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    });
  }, [data, locale]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-secondary">
          {locale === 'it' ? 'Caricamento Commodities...' : 'Loading Commodities...'}
        </div>
      </div>
    );
  }

  if (error || !data || data.commodities.length === 0) {
    const isNotAvailable = error?.includes('not available') || error?.includes('ALPHA_VANTAGE_API_KEY');

    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        {isNotAvailable ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-soft flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-text-primary font-semibold mb-2">
              {locale === 'it' ? 'Prossimamente disponibile' : 'Coming soon'}
            </p>
            <p className="text-sm text-text-secondary mb-2">
              {locale === 'it' ? 'Commodities (Alpha Vantage)' : 'Commodities (Alpha Vantage)'}
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. Richiede ALPHA_VANTAGE_API_KEY (gratuita da https://www.alphavantage.co/support/#api-key).'
                : 'We are working on the integration. Requires ALPHA_VANTAGE_API_KEY (free from https://www.alphavantage.co/support/#api-key).'}
            </p>
          </div>
        ) : (
          <div className="text-red-400">
            {locale === 'it'
              ? 'Errore nel caricamento delle Commodities'
              : 'Error loading Commodities'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          {locale === 'it' ? 'Commodities' : 'Commodities'}
        </h2>
        <p className="text-sm text-text-secondary">
          {locale === 'it'
            ? 'Oro, Petrolio, Argento - Indicatori macroeconomici'
            : 'Gold, Oil, Silver - Macroeconomic Indicators'}
        </p>
      </div>

      {/* Commodities Grid */}
      <div className="grid grid-cols-1 gap-4">
        {commodityCards}
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-secondary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            {locale === 'it'
              ? 'Commodity Futures Theory - Inflation Hedging'
              : 'Commodity Futures Theory - Inflation Hedging'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Le commodities (oro, petrolio, argento) sono beni fisici scambiati su mercati globali. Considerate hedge contro inflazione e indicatori di sentiment macroeconomico.'
              : 'Commodities (gold, oil, silver) are physical goods traded on global markets. Considered inflation hedges and macroeconomic sentiment indicators.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Prezzi futures da Alpha Vantage. Gold e Silver in USD/oz, Oil in USD/bbl. Riflettono domanda/offerta globale e sentiment macroeconomico.'
              : 'Futures prices from Alpha Vantage. Gold and Silver in USD/oz, Oil in USD/bbl. Reflect global supply/demand and macroeconomic sentiment.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerli Accademicamente */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Interpretazione Accademica' : 'Academic Interpretation'}
        </p>
        <div className="text-xs text-text-secondary space-y-1">
          <p>
            <strong>Gold:</strong>{' '}
            {locale === 'it'
              ? 'Considerato safe haven e hedge contro inflazione. Aumenti: possibile fuga verso qualità, inflazione, debolezza dollaro. Diminuzioni: forza dollaro, riduzione paura.'
              : 'Considered safe haven and inflation hedge. Increases: possible flight to quality, inflation, dollar weakness. Decreases: dollar strength, reduced fear.'}
          </p>
          <p>
            <strong>Oil:</strong>{' '}
            {locale === 'it'
              ? 'Indicatore di domanda economica globale. Aumenti: crescita economica, tensioni geopolitiche. Diminuzioni: debolezza economica, eccesso offerta.'
              : 'Global economic demand indicator. Increases: economic growth, geopolitical tensions. Decreases: economic weakness, supply excess.'}
          </p>
          <p>
            <strong>Silver:</strong>{' '}
            {locale === 'it'
              ? 'Correlato a gold ma più volatile. Usato in industria e come investimento. Aumenti: sentiment positivo, domanda industriale. Diminuzioni: debolezza economica.'
              : 'Correlated to gold but more volatile. Used in industry and as investment. Increases: positive sentiment, industrial demand. Decreases: economic weakness.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Le commodities possono essere influenzate da fattori specifici (geopolitica, produzione) oltre a sentiment macroeconomico. Richiedono contesto per interpretazione corretta.'
              : 'Commodities can be influenced by specific factors (geopolitics, production) beyond macroeconomic sentiment. Require context for correct interpretation.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 3: Lettura AI */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading ||
            (locale === 'it'
              ? 'Analisi commodities in corso...'
              : 'Analyzing commodities...')}
        </p>
        <p className="text-xs text-text-secondary mt-2">
          {locale === 'it'
            ? 'Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.'
            : 'Descriptive analysis based on current data. Does not constitute financial advice.'}
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-text-secondary text-center">
        {locale === 'it' ? 'Aggiornato' : 'Updated'}:{' '}
        {new Date(data.timestamp).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US')}
      </div>
    </div>
  );
}
