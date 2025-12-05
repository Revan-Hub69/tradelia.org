'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ForexPair {
  symbol: string;
  name: string;
  rate: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface ForexData {
  pairs: ForexPair[];
  timestamp: string;
  aiReading: string;
}

/**
 * Forex Major Pairs Indicator
 *
 * Major Currency Pairs
 * - EUR/USD
 * - GBP/USD
 * - USD/JPY
 * - USD/CHF
 *
 * Academic Reference: Foreign Exchange Theory, Interest Rate Parity
 * Data Source: Finnhub API
 * Updates: Every 5 minutes
 */
export default function ForexIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<ForexData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForex = async () => {
      try {
        const response = await fetch('/api/market-indicators/forex', {
          // Cache for 5 minutes
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json();
            setError(errorData.error || 'Forex pairs not available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Forex');
        }

        const forexData = await response.json();
        setData(forexData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Forex');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForex();
    // Update every 5 minutes
    const interval = setInterval(fetchForex, 300000);
    return () => clearInterval(interval);
  }, []);

  // Memoize pair cards for performance
  const pairCards = useMemo(() => {
    if (!data) return null;

    return data.pairs.map((pair) => {
      const isPositive = pair.change >= 0;
      const isNegative = pair.change < 0;
      const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-text-secondary';

      // Determine if change is good or bad based on pair type
      // For USD pairs, increase can mean USD strength or base currency weakness
      const pairDescription =
        pair.symbol === 'EURUSD'
          ? locale === 'it'
            ? 'Coppia più scambiata - Sentiment globale'
            : 'Most traded pair - Global sentiment'
          : pair.symbol === 'GBPUSD'
            ? locale === 'it'
              ? 'Sensibile a politica UK - Brexit'
              : 'Sensitive to UK policy - Brexit'
            : pair.symbol === 'USDJPY'
              ? locale === 'it'
                ? 'Risk-on/risk-off indicator'
                : 'Risk-on/risk-off indicator'
              : locale === 'it'
                ? 'Safe haven - Fuga verso qualità'
                : 'Safe haven - Flight to quality';

      return (
        <div
          key={pair.symbol}
          className="bg-bg-soft rounded-lg border border-border-subtle p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {pair.name}
              </h3>
              <p className="text-xs text-text-tertiary">{pairDescription}</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {pair.rate.toFixed(4)}
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
                {pair.change >= 0 ? '+' : ''}
                {pair.changePercent.toFixed(2)}%
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
        <div className="text-text-tertiary">
          {locale === 'it' ? 'Caricamento Forex...' : 'Loading Forex...'}
        </div>
      </div>
    );
  }

  if (error || !data || data.pairs.length === 0) {
    const isNotAvailable = error?.includes('not available') || error?.includes('FINNHUB_API_KEY');

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
              {locale === 'it' ? 'Forex Major Pairs (Finnhub)' : 'Forex Major Pairs (Finnhub)'}
            </p>
            <p className="text-xs text-text-tertiary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. Richiede FINNHUB_API_KEY (gratuita da https://finnhub.io/register).'
                : 'We are working on the integration. Requires FINNHUB_API_KEY (free from https://finnhub.io/register).'}
            </p>
          </div>
        ) : (
          <div className="text-red-400">
            {locale === 'it' ? 'Errore nel caricamento del Forex' : 'Error loading Forex'}
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
          {locale === 'it' ? 'Forex Major Pairs' : 'Forex Major Pairs'}
        </h2>
        <p className="text-sm text-text-secondary">
          {locale === 'it'
            ? 'EUR/USD, GBP/USD, USD/JPY, USD/CHF - Tassi di cambio principali'
            : 'EUR/USD, GBP/USD, USD/JPY, USD/CHF - Major Exchange Rates'}
        </p>
      </div>

      {/* Pairs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {pairCards}
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            {locale === 'it'
              ? 'Foreign Exchange Theory - Interest Rate Parity'
              : 'Foreign Exchange Theory - Interest Rate Parity'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'I tassi di cambio riflettono il valore relativo di due valute. Le coppie major (EUR/USD, GBP/USD, etc.) sono le più scambiate e riflettono sentiment globale.'
              : 'Exchange rates reflect relative value of two currencies. Major pairs (EUR/USD, GBP/USD, etc.) are most traded and reflect global sentiment.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Tassi di cambio real-time da Finnhub. Riflettono differenze di tassi di interesse, inflazione, e sentiment economico tra paesi.'
              : 'Real-time exchange rates from Finnhub. Reflect interest rate differences, inflation, and economic sentiment between countries.'}
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
            <strong>EUR/USD:</strong>{' '}
            {locale === 'it'
              ? 'Coppia più scambiata. Aumenti: debolezza USD o forza EUR. Diminuzioni: forza USD o debolezza EUR. Riflette sentiment globale.'
              : 'Most traded pair. Increases: USD weakness or EUR strength. Decreases: USD strength or EUR weakness. Reflects global sentiment.'}
          </p>
          <p>
            <strong>GBP/USD:</strong>{' '}
            {locale === 'it'
              ? 'Sensibile a politica UK, Brexit. Aumenti: debolezza USD o forza GBP. Diminuzioni: forza USD o debolezza GBP.'
              : 'Sensitive to UK policy, Brexit. Increases: USD weakness or GBP strength. Decreases: USD strength or GBP weakness.'}
          </p>
          <p>
            <strong>USD/JPY:</strong>{' '}
            {locale === 'it'
              ? 'Riflette sentiment risk-on/risk-off. Aumenti: risk-on, debolezza JPY. Diminuzioni: risk-off, forza JPY (safe haven).'
              : 'Reflects risk-on/risk-off sentiment. Increases: risk-on, JPY weakness. Decreases: risk-off, JPY strength (safe haven).'}
          </p>
          <p>
            <strong>USD/CHF:</strong>{' '}
            {locale === 'it'
              ? 'Considerato safe haven. Aumenti: debolezza CHF. Diminuzioni: fuga verso qualità (CHF).'
              : 'Considered safe haven. Increases: CHF weakness. Decreases: flight to quality (CHF).'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'I tassi di cambio possono essere influenzati da interventi delle banche centrali, eventi geopolitici, e fattori tecnici oltre a fondamentali economici.'
              : 'Exchange rates can be influenced by central bank interventions, geopolitical events, and technical factors beyond economic fundamentals.'}
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
            (locale === 'it' ? 'Analisi forex in corso...' : 'Analyzing forex...')}
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
