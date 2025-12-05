'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
              <p className="text-xs text-text-tertiary">{indicator.description}</p>
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

          <div className="text-xs text-text-tertiary">
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
        <div className="text-text-tertiary">
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
                className="w-8 h-8 text-text-tertiary"
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
            <p className="text-xs text-text-tertiary max-w-sm">
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

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          {locale === 'it' ? 'Indicatori Economici' : 'Economic Indicators'}
        </h2>
        <p className="text-sm text-text-secondary">
          {locale === 'it'
            ? 'Dati ufficiali Federal Reserve (FRED) - GDP, Inflazione, Disoccupazione, Tasso Fed'
            : 'Official Federal Reserve Data (FRED) - GDP, Inflation, Unemployment, Fed Rate'}
        </p>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicatorCards}
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimenti Accademici' : 'Academic References'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>GDP:</strong> National Bureau of Economic Research (NBER) -{' '}
            {locale === 'it'
              ? 'Misura crescita economica reale (quarterly, annualized)'
              : 'Measures real economic growth (quarterly, annualized)'}
          </p>
          <p>
            <strong>CPI:</strong> Bureau of Labor Statistics (BLS) -{' '}
            {locale === 'it'
              ? 'Indice prezzi al consumo, misura inflazione'
              : 'Consumer Price Index, measures inflation'}
          </p>
          <p>
            <strong>Unemployment:</strong> Bureau of Labor Statistics (BLS) -{' '}
            {locale === 'it'
              ? 'Tasso di disoccupazione, misura salute mercato del lavoro'
              : 'Unemployment rate, measures labor market health'}
          </p>
          <p>
            <strong>Fed Funds Rate:</strong> Federal Reserve -{' '}
            {locale === 'it'
              ? 'Tasso di interesse centrale, strumento politica monetaria'
              : 'Central interest rate, monetary policy tool'}
          </p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerli Accademicamente */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Interpretazione Accademica' : 'Academic Interpretation'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>GDP positivo:</strong>{' '}
            {locale === 'it'
              ? 'Crescita economica. Negativo: Recessione. Target: crescita sostenibile 2-3% annuo.'
              : 'Economic growth. Negative: Recession. Target: sustainable 2-3% annual growth.'}
          </p>
          <p>
            <strong>CPI in aumento:</strong>{' '}
            {locale === 'it'
              ? 'Inflazione. Target Fed: ~2% annuo. Troppo alta: erode potere d\'acquisto. Troppo bassa: rischio deflazione.'
              : 'Inflation. Fed target: ~2% annual. Too high: erodes purchasing power. Too low: deflation risk.'}
          </p>
          <p>
            <strong>Unemployment basso:</strong>{' '}
            {locale === 'it'
              ? 'Mercato del lavoro forte. Alto: debolezza economica. Target: ~4-5% (full employment).'
              : 'Strong labor market. High: economic weakness. Target: ~4-5% (full employment).'}
          </p>
          <p>
            <strong>Fed Funds Rate:</strong>{' '}
            {locale === 'it'
              ? 'Tasso di interesse centrale. Influenza costi di finanziamento, inflazione, crescita. Aumenti: rallentano economia. Diminuzioni: stimolano economia.'
              : 'Central interest rate. Influences financing costs, inflation, growth. Increases: slow economy. Decreases: stimulate economy.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Gli indicatori sono retrospettivi. Richiedono tempo per riflettere cambiamenti economici. Interpretazione richiede contesto di altri indicatori e condizioni macroeconomiche.'
              : 'Indicators are retrospective. Take time to reflect economic changes. Interpretation requires context from other indicators and macroeconomic conditions.'}
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
              ? 'Analisi indicatori economici in corso...'
              : 'Analyzing economic indicators...')}
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          {locale === 'it'
            ? 'Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.'
            : 'Descriptive analysis based on current data. Does not constitute financial advice.'}
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-text-tertiary text-center">
        {locale === 'it' ? 'Aggiornato' : 'Updated'}:{' '}
        {new Date(data.timestamp).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US')}
      </div>
    </div>
  );
}
