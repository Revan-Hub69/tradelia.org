'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StockIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface StockIndexesData {
  indexes: StockIndex[];
  timestamp: string;
  aiReading: string;
}

/**
 * Stock Market Indexes Indicator
 *
 * Major US Stock Market Indexes
 * - S&P 500 (^GSPC)
 * - Dow Jones Industrial Average (^DJI)
 * - NASDAQ Composite (^IXIC)
 *
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API
 * Updates: Every 5 minutes
 */
export default function StockIndexesIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<StockIndexesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockIndexes = async () => {
      try {
        const response = await fetch('/api/market-indicators/stock-indexes', {
          // Cache for 5 minutes
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json();
            setError(errorData.error || 'Stock indexes not available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Stock Indexes');
        }

        const indexesData = await response.json();
        setData(indexesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Stock Indexes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockIndexes();
    // Update every 5 minutes
    const interval = setInterval(fetchStockIndexes, 300000);
    return () => clearInterval(interval);
  }, []);

  // Memoize index cards for performance
  const indexCards = useMemo(() => {
    if (!data) return null;

    return data.indexes.map((index) => {
      const isPositive = index.change >= 0;
      const isNegative = index.change < 0;
      const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-text-secondary';

      return (
        <div
          key={index.symbol}
          className="bg-bg-soft rounded-lg border border-border-subtle p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {index.name}
              </h3>
              <p className="text-xs text-text-secondary">
                {index.symbol === 'SP500'
                  ? locale === 'it'
                    ? '500 aziende large-cap - Benchmark principale'
                    : '500 large-cap companies - Main benchmark'
                  : index.symbol === 'DOW'
                    ? locale === 'it'
                      ? '30 blue-chip companies - Indice storico'
                      : '30 blue-chip companies - Historical index'
                    : locale === 'it'
                      ? 'Indice tech-heavy - Settore tecnologico'
                      : 'Tech-heavy index - Technology sector'}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {index.price.toFixed(2)}
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
                {index.change >= 0 ? '+' : ''}
                {index.changePercent.toFixed(2)}%
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
          {locale === 'it' ? 'Caricamento Stock Indexes...' : 'Loading Stock Indexes...'}
        </div>
      </div>
    );
  }

  if (error || !data || data.indexes.length === 0) {
    const isNotAvailable = error?.includes('not available') || error?.includes('FINNHUB_API_KEY');

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
              {locale === 'it' ? 'Stock Market Indexes (Finnhub)' : 'Stock Market Indexes (Finnhub)'}
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. Richiede FINNHUB_API_KEY (gratuita da https://finnhub.io/register).'
                : 'We are working on the integration. Requires FINNHUB_API_KEY (free from https://finnhub.io/register).'}
            </p>
          </div>
        ) : (
          <div className="text-red-400">
            {locale === 'it'
              ? 'Errore nel caricamento degli Stock Indexes'
              : 'Error loading Stock Indexes'}
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
          {locale === 'it' ? 'Indici Azionari Principali' : 'Major Stock Indexes'}
        </h2>
        <p className="text-sm text-text-secondary">
          {locale === 'it'
            ? 'S&P 500, Dow Jones, NASDAQ - Performance mercato azionario USA'
            : 'S&P 500, Dow Jones, NASDAQ - US Stock Market Performance'}
        </p>
      </div>

      {/* Indexes Grid */}
      <div className="grid grid-cols-1 gap-4">
        {indexCards}
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
              ? 'Modern Portfolio Theory - Market Index Analysis'
              : 'Modern Portfolio Theory - Market Index Analysis'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Gli indici azionari misurano la performance complessiva di un paniere di azioni. S&P 500 (500 aziende), Dow Jones (30 blue-chip), NASDAQ (tech-heavy).'
              : 'Stock indexes measure overall performance of a basket of stocks. S&P 500 (500 companies), Dow Jones (30 blue-chip), NASDAQ (tech-heavy).'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolati come media ponderata (S&P 500, NASDAQ) o media semplice (Dow Jones) dei prezzi delle azioni componenti. Riflettono sentiment e performance del mercato azionario.'
              : 'Calculated as weighted average (S&P 500, NASDAQ) or simple average (Dow Jones) of component stock prices. Reflect market sentiment and performance.'}
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
            <strong>S&P 500:</strong>{' '}
            {locale === 'it'
              ? 'Indice più rappresentativo del mercato USA (500 aziende large-cap). Benchmark principale per performance azionaria. Variazioni positive: sentiment positivo, crescita economica.'
              : 'Most representative US market index (500 large-cap companies). Main benchmark for stock performance. Positive changes: positive sentiment, economic growth.'}
          </p>
          <p>
            <strong>Dow Jones:</strong>{' '}
            {locale === 'it'
              ? 'Indice storico (30 blue-chip). Più concentrato, meno rappresentativo ma molto seguito. Riflette performance aziende mature e consolidate.'
              : 'Historical index (30 blue-chip). More concentrated, less representative but widely followed. Reflects performance of mature, established companies.'}
          </p>
          <p>
            <strong>NASDAQ:</strong>{' '}
            {locale === 'it'
              ? 'Indice tech-heavy. Riflette performance settore tecnologico e crescita. Più volatile, sensibile a sentiment tech e innovazione.'
              : 'Tech-heavy index. Reflects technology sector performance and growth. More volatile, sensitive to tech sentiment and innovation.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Gli indici sono retrospettivi e possono essere influenzati da pochi titoli con peso elevato. Non riflettono necessariamente l\'economia reale nel breve termine.'
              : 'Indexes are retrospective and can be influenced by few high-weight stocks. Do not necessarily reflect real economy in short term.'}
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
              ? 'Analisi indici azionari in corso...'
              : 'Analyzing stock indexes...')}
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
