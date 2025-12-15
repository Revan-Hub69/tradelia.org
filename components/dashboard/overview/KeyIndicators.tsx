'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';
import { Skeleton } from '@/components/ui/Skeleton';
import { AssetType } from '@/lib/types/market';
import { API_CONFIG, safeFetch } from '@/lib/config/api';
import { getIndicatorTooltip } from '@/lib/data/indicator-tooltips';

interface MarketIndicator {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  status: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  isPro?: boolean;
  badge?: string;
  assetType?: AssetType;
}

/**
 * Key Indicators - 6 indicatori chiave per Overview Tab
 * VIX, SPY, BTC Dominance, Fear & Greed, EUR/USD, Gold
 */
export const KeyIndicators = memo(function KeyIndicators() {
  const { t, locale } = useTranslations();
  const [indicators, setIndicators] = useState<MarketIndicator[]>([
    { id: 'vix', name: 'VIX', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'spy', name: 'S&P 500', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'bitcoin-dominance', name: 'BTC Dominance', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    { id: 'fear-greed', name: 'Fear & Greed', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    { id: 'eurusd', name: 'EUR/USD', value: '—', status: 'neutral', loading: true, assetType: 'forex' },
    { id: 'gold', name: 'Gold', value: '—', status: 'neutral', loading: true, assetType: 'commodity' },
  ]);

  const fetchIndicators = useCallback(async () => {
    try {
      
      // Fetch VIX
      try {
        const vixResponse = await fetch('/api/market-indicators/vix');
        if (vixResponse.ok) {
          const vixData = await vixResponse.json();
          setIndicators(prev => prev.map(ind => 
            ind.id === 'vix' 
              ? { ...ind, value: vixData.value?.toFixed(2) || '—', change: vixData.change, changePercent: vixData.changePercent, status: vixData.changePercent && vixData.changePercent > 0 ? 'negative' : 'positive', loading: false }
              : ind
          ));
        }
      } catch (e) {}

      // Fetch SPY
      try {
        const spyResponse = await fetch('/api/market/data?symbol=SPY&assetType=stock');
        if (spyResponse.ok) {
          const spyData = await spyResponse.json();
          if (spyData.success && spyData.data) {
            setIndicators(prev => prev.map(ind => 
              ind.id === 'spy' 
                ? { ...ind, value: `$${spyData.data.currentPrice?.toFixed(2) || '—'}`, changePercent: spyData.data.change24hPercent, status: spyData.data.change24hPercent > 0 ? 'positive' : spyData.data.change24hPercent < 0 ? 'negative' : 'neutral', loading: false }
                : ind
            ));
          }
        }
      } catch (e) {}

      // Fetch BTC Dominance
      try {
        const btcDomResponse = await fetch('/api/market-indicators/bitcoin-dominance');
        if (btcDomResponse.ok) {
          const btcDomData = await btcDomResponse.json();
          setIndicators(prev => prev.map(ind => 
            ind.id === 'bitcoin-dominance' 
              ? { ...ind, value: `${btcDomData.dominance?.toFixed(1) || '—'}%`, status: 'neutral', loading: false }
              : ind
          ));
        }
      } catch (e) {}

      // Fetch Fear & Greed
      try {
        const fgResponse = await fetch('/api/market-indicators/fear-greed');
        if (fgResponse.ok) {
          const fgData = await fgResponse.json();
          setIndicators(prev => prev.map(ind => 
            ind.id === 'fear-greed' 
              ? { ...ind, value: fgData.value?.toString() || '—', status: fgData.value >= 50 ? 'positive' : 'negative', loading: false }
              : ind
          ));
        }
      } catch (e) {}

      // Fetch EUR/USD
      try {
        const eurusdResponse = await fetch('/api/market/data?symbol=EURUSD&assetType=forex');
        if (eurusdResponse.ok) {
          const eurusdData = await eurusdResponse.json();
          if (eurusdData.success && eurusdData.data) {
            setIndicators(prev => prev.map(ind => 
              ind.id === 'eurusd' 
                ? { ...ind, value: eurusdData.data.currentPrice?.toFixed(4) || '—', changePercent: eurusdData.data.change24hPercent, status: eurusdData.data.change24hPercent > 0 ? 'positive' : eurusdData.data.change24hPercent < 0 ? 'negative' : 'neutral', loading: false }
                : ind
            ));
          }
        }
      } catch (e) {}

      // Fetch Gold
      try {
        const goldResponse = await fetch('/api/market/data?symbol=GOLD&assetType=commodity');
        if (goldResponse.ok) {
          const goldData = await goldResponse.json();
          if (goldData.success && goldData.data) {
            setIndicators(prev => prev.map(ind => 
              ind.id === 'gold' 
                ? { ...ind, value: `$${goldData.data.currentPrice?.toFixed(2) || '—'}`, changePercent: goldData.data.change24hPercent, status: goldData.data.change24hPercent > 0 ? 'positive' : goldData.data.change24hPercent < 0 ? 'negative' : 'neutral', loading: false }
                : ind
            ));
          }
        }
      } catch (e) {}

    } catch (error) {
      // Silently handle errors - set loading to false
      setIndicators(prev => prev.map(ind => ({ ...ind, loading: false })));
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000); // Refresh ogni 5 minuti
    return () => clearInterval(interval);
  }, [fetchIndicators]);

  const allLoading = indicators.every(ind => ind.loading);

  return (
    <section className="mb-6" aria-label="Indicatori chiave di mercato">
      <div className="mb-4">
        <SectionBanner
          title="Indicatori Chiave di Mercato"
          description="I 6 indicatori più importanti per monitorare lo stato del mercato. Vedi tutti gli indicatori nella sezione Market Data."
        />
        <div className="mt-2 text-right">
                    <Link
                      href={buildLocalePath(locale, '/dashboard/market-data')}
                      className="text-sm text-white hover:text-white inline-flex items-center gap-1 relative group"
                    >
                      Vedi tutti <LinkIcon className="w-3 h-3" />
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500/25 group-hover:w-full transition-all duration-300" />
                    </Link>
        </div>
      </div>

      {allLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-bg-soft border-2 border-border-subtle rounded-xl p-6 min-h-[200px]">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((indicator) => {
            const tooltipData = getIndicatorTooltip(indicator.id);
            const isPositive = indicator.status === 'positive';
            const isNegative = indicator.status === 'negative';

            return (
              <div
                key={indicator.id}
                className={cn(
                  'bg-bg-soft border-2 border-border-subtle rounded-xl p-6 min-h-[200px]',
                  'hover:border-accent/60 hover:shadow-lg transition-all duration-200',
                  'flex flex-col'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {indicator.name}
                    </h3>
                    {indicator.isPro && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        PRO
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-extrabold text-text-primary mb-2">
                    {indicator.value}
                  </div>

                  {indicator.changePercent !== undefined && (
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium',
                      isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      isNegative ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                    )}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : null}
                      {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%
                    </div>
                  )}
                </div>

                {tooltipData && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {tooltipData.description.split('. ').slice(0, 2).join('. ')}.
                    </p>
                    <Link
                      href={buildLocalePath(locale, `/dashboard/market-data#${indicator.id}`)}
                      className="text-sm text-white hover:text-white inline-flex items-center gap-1 relative group"
                    >
                      Dettagli <LinkIcon className="w-3 h-3" />
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500/25 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});
