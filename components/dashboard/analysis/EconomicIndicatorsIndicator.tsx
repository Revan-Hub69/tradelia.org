'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { IndicatorHeader } from './IndicatorHeader';
import { getEconomicIndicatorsMethodology } from './IndicatorMethodologyNotes';

interface EconomicIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  change?: number;
  changePercent?: number;
  lastUpdate: string;
  description: string;
  academicReference: string;
}

interface EconomicIndicatorsData {
  indicators: EconomicIndicator[];
  timestamp: string;
  aiReading: string;
}

/**
 * Economic Indicators Indicator
 *
 * Federal Reserve Economic Data (FRED) - Official US Economic Indicators
 *
 * Academic References:
 * - GDP: National Bureau of Economic Research (NBER)
 * - CPI: Bureau of Labor Statistics (BLS)
 * - Unemployment: Bureau of Labor Statistics (BLS)
 * - Fed Funds Rate: Federal Reserve
 *
 * Data Source: FRED API (Federal Reserve)
 * Updates: Daily (economic data updates on schedule)
 */
export default function EconomicIndicatorsIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<EconomicIndicatorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEconomicIndicators = async () => {
      try {
        const response = await fetch('/api/market-indicators/economic', {
          // Cache for 1 hour (economic data updates daily)
          next: { revalidate: 3600 },
        });
        
        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json();
            setError(errorData.error || 'Economic indicators not available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Economic Indicators');
        }

        const indicatorsData = await response.json();
        setData(indicatorsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Economic Indicators');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEconomicIndicators();
    // Update every hour (economic data doesn't change frequently)
    const interval = setInterval(fetchEconomicIndicators, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Memoize indicator cards for performance
  const indicatorCards = useMemo(() => {
    if (!data) return null;

    return data.indicators.map((indicator) => {
      const hasChange = indicator.change !== undefined;
      const isPositive = hasChange && indicator.change! > 0;
      const isNegative = hasChange && indicator.change! < 0;

      // Determine if change is good or bad based on indicator type
      let changeIsGood = false;
      if (indicator.id === 'gdp') {
        changeIsGood = isPositive; // GDP growth is good
      } else if (indicator.id === 'cpi') {
        changeIsGood = isNegative; // Lower inflation is generally better (but target is ~2%)
      } else if (indicator.id === 'unemployment') {
        changeIsGood = isNegative; // Lower unemployment is good
      } else if (indicator.id === 'fed-funds') {
        changeIsGood = false; // Fed rate changes depend on context
      }

      const changeColor =
        !hasChange || indicator.id === 'fed-funds'
          ? 'text-text-secondary'
          : changeIsGood
            ? 'text-green-600'
            : 'text-red-600';

      return (
        <div
          key={indicator.id}
          className="bg-bg-soft rounded-lg border border-border-subtle p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {indicator.name}
              </h3>
              <p className="text-xs text-text-secondary">{indicator.description}</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {indicator.value.toFixed(2)}
              <span className="text-sm font-normal text-text-secondary ml-1">
                {indicator.unit}
              </span>
            </span>
            {hasChange && (
              <div className={cn('flex items-center gap-1 text-sm', changeColor)}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : isNegative ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span>
                  {indicator.change! >= 0 ? '+' : ''}
                  {indicator.change!.toFixed(2)}
                  {indicator.unit}
                </span>
                {indicator.changePercent !== undefined && (
                  <span className="text-xs">
                    ({indicator.changePercent >= 0 ? '+' : ''}
                    {indicator.changePercent.toFixed(2)}%)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-text-secondary">
            {locale === 'it' ? 'Ultimo aggiornamento' : 'Last update'}:{' '}
            {new Date(indicator.lastUpdate).toLocaleDateString(
              locale === 'it' ? 'it-IT' : 'en-US'
            )}
          </div>
        </div>
      );
    });
  }, [data, locale]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-secondary">
          {locale === 'it'
            ? 'Caricamento Economic Indicators...'
            : 'Loading Economic Indicators...'}
        </div>
      </div>
    );
  }

  if (error || !data || data.indicators.length === 0) {
    const isNotAvailable = error?.includes('not available') || error?.includes('FRED_API_KEY');

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
              {locale === 'it'
                ? 'Economic Indicators (FRED)'
                : 'Economic Indicators (FRED)'}
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. Richiede FRED_API_KEY (gratuita da https://fred.stlouisfed.org/docs/api/api_key.html).'
                : 'We are working on the integration. Requires FRED_API_KEY (free from https://fred.stlouisfed.org/docs/api/api_key.html).'}
            </p>
          </div>
        ) : (
          <div className="text-red-400">
            {locale === 'it'
              ? 'Errore nel caricamento degli Economic Indicators'
              : 'Error loading Economic Indicators'}
          </div>
        )}
      </div>
    );
  }

  const methodology = useMemo(() => getEconomicIndicatorsMethodology(locale), [locale]);

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4 overflow-y-auto">
      {/* Header with Methodology Popup */}
      <IndicatorHeader
        title={locale === 'it' ? 'Indicatori Economici' : 'Economic Indicators'}
        methodology={methodology}
      />
      
      {/* Description */}
      <p className="text-sm text-text-secondary">
        {locale === 'it'
          ? 'Dati ufficiali Federal Reserve (FRED) - GDP, Inflazione, Disoccupazione, Tasso Fed'
          : 'Official Federal Reserve Data (FRED) - GDP, Inflation, Unemployment, Fed Rate'}
      </p>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicatorCards}
      </div>

      {/* AI Reading */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading ||
            (locale === 'it'
              ? 'Analisi indicatori economici in corso...'
              : 'Analyzing economic indicators...')}
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
