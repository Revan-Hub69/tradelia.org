'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BondYieldsData {
  yield10Y: number;
  yield2Y: number;
  spread: number;
  curveStatus: 'normal' | 'flat' | 'inverted';
  timestamp: string;
  history: Array<{ date: string; yield10Y: number; yield2Y: number; spread: number }>;
  aiReading: string;
}

/**
 * Bond Yields & Yield Curve Indicator
 *
 * US Treasury Yields - 10-Year and 2-Year
 * Yield Curve Spread (10Y - 2Y) - Recession Predictor
 *
 * Academic References:
 * - Estrella & Mishkin (1996) - "The Yield Curve as a Predictor of U.S. Recessions"
 * - Harvey (1988) - "The Real Term Structure and Consumption Growth"
 *
 * Data Source: FRED API (Federal Reserve)
 * Updates: Daily
 */
export default function BondYieldsIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<BondYieldsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBondYields = async () => {
      try {
        const response = await fetch('/api/market-indicators/bond-yields', {
          // Cache for 1 hour (bond yields update daily)
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          if (response.status === 503) {
            const errorData = await response.json();
            setError(errorData.error || 'Bond Yields not available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Bond Yields');
        }

        const yieldsData = await response.json();
        setData(yieldsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Bond Yields');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBondYields();
    // Update every hour (bond yields don't change frequently)
    const interval = setInterval(fetchBondYields, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Memoize chart data for performance
  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      labels: ['2Y', '10Y'],
      datasets: [
        {
          label: locale === 'it' ? 'Rendimento' : 'Yield',
          data: [data.yield2Y, data.yield10Y],
          borderColor:
            data.curveStatus === 'inverted'
              ? 'rgb(239, 68, 68)'
              : data.curveStatus === 'flat'
                ? 'rgb(251, 191, 36)'
                : 'rgb(34, 197, 94)',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            if (data.curveStatus === 'inverted') {
              gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            } else if (data.curveStatus === 'flat') {
              gradient.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
            } else {
              gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
            }
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [data, locale]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.parsed.y.toFixed(2)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: any) => `${value}%`,
          },
        },
      },
    }),
    []
  );

  const getCurveStatusConfig = useMemo(() => {
    if (!data) return null;

    if (data.curveStatus === 'inverted') {
      return {
        label: locale === 'it' ? 'Curva Invertita' : 'Inverted Curve',
        color: 'text-red-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: AlertTriangle,
        description:
          locale === 'it'
            ? 'SEGNALE RECESSIONE. Storicamente predetto tutte le recessioni USA dal 1950.'
            : 'RECESSION SIGNAL. Historically predicted all US recessions since 1950.',
      };
    } else if (data.curveStatus === 'flat') {
      return {
        label: locale === 'it' ? 'Curva Piatta' : 'Flat Curve',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        icon: Minus,
        description:
          locale === 'it'
            ? 'Incertezza. Possibile transizione verso inversione o normalizzazione.'
            : 'Uncertainty. Possible transition to inversion or normalization.',
      };
    } else {
      return {
        label: locale === 'it' ? 'Curva Normale' : 'Normal Curve',
        color: 'text-green-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: TrendingUp,
        description:
          locale === 'it'
            ? 'Economia in crescita. Tassi a lungo termine più alti riflettono aspettative positive.'
            : 'Economy growing. Higher long-term rates reflect positive expectations.',
      };
    }
  }, [data, locale]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-tertiary">
          {locale === 'it' ? 'Caricamento Bond Yields...' : 'Loading Bond Yields...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
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
              {locale === 'it' ? 'Bond Yields (FRED)' : 'Bond Yields (FRED)'}
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
              ? 'Errore nel caricamento dei dati Bond Yields'
              : 'Error loading Bond Yields data'}
          </div>
        )}
      </div>
    );
  }

  const curveStatusConfig = getCurveStatusConfig!;
  const StatusIcon = curveStatusConfig.icon;

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {locale === 'it' ? 'Bond Yields & Yield Curve' : 'Bond Yields & Yield Curve'}
          </h2>
          <p className="text-sm text-text-secondary">
            {locale === 'it'
              ? 'Rendimenti Treasury USA - Predittore Recessioni'
              : 'US Treasury Yields - Recession Predictor'}
          </p>
        </div>
      </div>

      {/* Yield Curve Chart */}
      {chartData && (
        <div className="h-48 -mx-2">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Yields Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">2Y Yield</p>
          <p className="text-lg font-bold text-text-primary">{data.yield2Y.toFixed(2)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">
            {locale === 'it' ? 'Spread' : 'Spread'}
          </p>
          <p
            className={cn(
              'text-lg font-bold',
              data.spread >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {data.spread >= 0 ? '+' : ''}
            {data.spread.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">10Y Yield</p>
          <p className="text-lg font-bold text-text-primary">{data.yield10Y.toFixed(2)}%</p>
        </div>
      </div>

      {/* Curve Status */}
      <div
        className={cn(
          'rounded-lg border p-3 flex items-start gap-3',
          curveStatusConfig.borderColor,
          curveStatusConfig.bgColor
        )}
      >
        <StatusIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', curveStatusConfig.color)} />
        <div className="flex-1">
          <p className={cn('text-sm font-semibold mb-1', curveStatusConfig.color)}>
            {curveStatusConfig.label}
          </p>
          <p className="text-xs text-text-secondary">{curveStatusConfig.description}</p>
        </div>
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            Estrella & Mishkin (1996) - "{locale === 'it' ? 'The Yield Curve as a Predictor of U.S. Recessions' : 'The Yield Curve as a Predictor of U.S. Recessions'}"
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'La yield curve (curva dei rendimenti) mostra la differenza tra tassi a lungo termine (10Y) e breve termine (2Y). Lo spread (10Y - 2Y) è un predittore accademico riconosciuto di recessioni.'
              : 'The yield curve shows the difference between long-term (10Y) and short-term (2Y) rates. The spread (10Y - 2Y) is an academically recognized predictor of recessions.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolato come differenza tra 10-Year Treasury Yield e 2-Year Treasury Yield. Spread positivo: curva normale. Spread negativo: curva invertita (segnale recessione).'
              : 'Calculated as difference between 10-Year Treasury Yield and 2-Year Treasury Yield. Positive spread: normal curve. Negative spread: inverted curve (recession signal).'}
          </p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerlo Accademicamente */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Interpretazione Accademica' : 'Academic Interpretation'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>
              {locale === 'it' ? 'Curva Normale (Spread &gt; 0.5%):' : 'Normal Curve (Spread > 0.5%):'}
            </strong>{' '}
            {locale === 'it'
              ? 'Curva normale, economia in crescita. Tassi a lungo termine più alti riflettono aspettative di crescita e inflazione.'
              : 'Normal curve, economy growing. Higher long-term rates reflect growth and inflation expectations.'}
          </p>
          <p>
            <strong>
              {locale === 'it' ? 'Curva Piatta (Spread -0.5% to 0.5%):' : 'Flat Curve (Spread -0.5% to 0.5%):'}
            </strong>{' '}
            {locale === 'it'
              ? 'Curva piatta, incertezza. Possibile transizione verso inversione o normalizzazione.'
              : 'Flat curve, uncertainty. Possible transition to inversion or normalization.'}
          </p>
          <p>
            <strong>
              {locale === 'it' ? 'Curva Invertita (Spread &lt; -0.5%):' : 'Inverted Curve (Spread < -0.5%):'}
            </strong>{' '}
            {locale === 'it'
              ? 'Curva invertita, SEGNALE RECESSIONE. Storicamente, yield curve invertita ha predetto tutte le recessioni USA dal 1950. Indica aspettative di rallentamento economico.'
              : 'Inverted curve, RECESSION SIGNAL. Historically, inverted yield curve predicted all US recessions since 1950. Indicates expectations of economic slowdown.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Yield curve invertita è un predittore accademico riconosciuto, ma non predice timing preciso (tipicamente 6-18 mesi prima della recessione). Richiede conferma da altri indicatori economici.'
              : 'Inverted yield curve is an academically recognized predictor, but does not predict precise timing (typically 6-18 months before recession). Requires confirmation from other economic indicators.'}
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
              ? 'Analisi yield curve in corso...'
              : 'Analyzing yield curve...')}
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
