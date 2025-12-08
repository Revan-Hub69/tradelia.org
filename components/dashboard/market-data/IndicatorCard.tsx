'use client';

import { useState, useEffect, memo } from 'react';
import { TrendingUp, TrendingDown, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { getIndicatorTooltip, INDICATOR_TOOLTIPS } from '@/lib/data/indicator-tooltips';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { API_CONFIG, safeFetch } from '@/lib/config/api';
import { MOCK_INDICATORS } from '@/lib/config/mock-data';
import { mockFetch } from '@/lib/utils/fetch-wrapper';
import type { ViewMode } from '../tabs/MarketDataTab';

interface IndicatorCardProps {
  indicatorId: string;
  viewMode: ViewMode;
}

interface IndicatorData {
  value: string | number;
  change?: number;
  changePercent?: number;
  status: 'positive' | 'negative' | 'neutral';
  loading: boolean;
}

const PRO_INDICATORS = ['whale-ratio', 'exchange-flow', 'l400-imbalance', 'top-mover', 'vix-term-structure', 'put-call-ratio', 'credit-spreads'];

/**
 * Indicator Card - Card singolo indicatore per Market Data Tab
 */
export const IndicatorCard = memo(function IndicatorCard({
  indicatorId,
  viewMode,
}: IndicatorCardProps) {
  const { t, locale } = useTranslations();
  const tooltipData = INDICATOR_TOOLTIPS[indicatorId];
  const [data, setData] = useState<IndicatorData>({
    value: '—',
    status: 'neutral',
    loading: true,
  });
  const isPro = PRO_INDICATORS.includes(indicatorId);

  useEffect(() => {
    const fetchData = async () => {
      if (API_CONFIG.DISABLE_API_CALLS) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const mock = (MOCK_INDICATORS as any)[indicatorId];
        if (mock) {
          setData({
            value: typeof mock.value === 'number' ? mock.value.toFixed(2) : mock.value || '—',
            change: mock.change,
            changePercent: mock.changePercent,
            status: mock.changePercent > 0 ? 'positive' : mock.changePercent < 0 ? 'negative' : 'neutral',
            loading: false,
          });
        } else {
          setData({ value: '—', status: 'neutral', loading: false });
        }
        return;
      }

      try {
        // Fetch logic per ogni indicatore (simplificato)
        const fetchFn = API_CONFIG.DISABLE_API_CALLS ? mockFetch : fetch;
        // TODO: Implementare fetch specifico per ogni indicatore
        setData({ value: '—', status: 'neutral', loading: false });
      } catch (error) {
        console.error(`Error fetching ${indicatorId}:`, error);
        setData({ value: '—', status: 'neutral', loading: false });
      }
    };

    fetchData();
  }, [indicatorId]);

  if (!tooltipData) return null;

  const isPositive = data.status === 'positive';
  const isNegative = data.status === 'negative';

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'bg-bg-soft border-2 border-border-subtle rounded-xl p-6',
          'hover:border-accent/60 hover:shadow-lg transition-all duration-200',
          'flex items-center justify-between gap-4'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {tooltipData.name}
            </h3>
            {isPro && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRO
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {tooltipData.description.split('. ').slice(0, 2).join('. ')}.
          </p>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold text-text-primary">
              {data.loading ? <Skeleton className="h-8 w-24" /> : data.value}
            </div>
            {data.changePercent !== undefined && !data.loading && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium',
                isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                isNegative ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/30'
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : null}
                {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
        <Link
          href={buildLocalePath(locale, `/dashboard/market-data#${indicatorId}`)}
          className="text-accent hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          Dettagli <LinkIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-bg-soft border-2 border-border-subtle rounded-xl p-6 min-h-[200px]',
        'hover:border-accent/60 hover:shadow-lg transition-all duration-200',
        'flex flex-col'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {tooltipData.name}
          </h3>
          {isPro && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PRO
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-4xl font-extrabold text-text-primary mb-2">
          {data.loading ? <Skeleton className="h-10 w-32" /> : data.value}
        </div>

        {data.changePercent !== undefined && !data.loading && (
          <div className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium w-fit',
            isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
            isNegative ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
            'bg-gray-500/10 text-gray-400 border border-gray-500/30'
          )}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : null}
            {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {tooltipData.description.split('. ').slice(0, 2).join('. ')}.
        </p>
        <Link
          href={buildLocalePath(locale, `/dashboard/market-data#${indicatorId}`)}
          className="text-sm text-accent hover:underline inline-flex items-center gap-1"
        >
          Dettagli <LinkIcon className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
});
