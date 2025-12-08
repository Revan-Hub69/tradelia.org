'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Link as LinkIcon } from 'lucide-react';
import { SectionBanner } from './SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';
import { Skeleton } from '@/components/ui/Skeleton';
import { AssetType, MarketIndicator as MarketIndicatorType } from '@/lib/types/market';
import { API_CONFIG, safeFetch } from '@/lib/config/api';
import { MOCK_INDICATORS } from '@/lib/config/mock-data';
import { mockFetch } from '@/lib/utils/fetch-wrapper';
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
 * Market Dashboard Widget
 * Cruscotto operativo con indicatori chiave (4-6 indicatori più importanti)
 * Design migliorato con cards più grandi e leggibili
 * Per tutti gli indicatori, vedere /dashboard/market-data
 */
export const MarketDashboardWidget = memo(function MarketDashboardWidget() {
  const { t, locale } = useTranslations();
  // Solo indicatori chiave per il cruscotto principale (4-6 indicatori più importanti)
  const [indicators, setIndicators] = useState<MarketIndicator[]>([
    // Indicatori chiave - solo i più importanti per overview
    { id: 'vix', name: 'VIX', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'spy', name: 'S&P 500', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'bitcoin-dominance', name: 'BTC Dominance', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    { id: 'fear-greed', name: 'Fear & Greed', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    { id: 'eurusd', name: 'EUR/USD', value: '—', status: 'neutral', loading: true, assetType: 'forex' },
    { id: 'gold', name: 'Gold', value: '—', status: 'neutral', loading: true, assetType: 'commodity' },
  ]);

  // Memoize fetch function per evitare re-creazione
  const fetchIndicators = useCallback(async () => {
      // Se API disattivate, usa dati mock
      if (API_CONFIG.DISABLE_API_CALLS) {
        // Simula un breve delay per mostrare loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Imposta dati mock
        setIndicators(prev => prev.map(ind => {
          const mock = (MOCK_INDICATORS as any)[ind.id];
          if (mock) {
            if (ind.id === 'vix') {
              return { ...ind, value: mock.value.toFixed(2), change: mock.change, changePercent: mock.changePercent, status: mock.changePercent > 0 ? 'negative' : 'positive', loading: false };
            }
            if (ind.id === 'fear-greed') {
              return { ...ind, value: mock.value.toString(), status: mock.value >= 50 ? 'positive' : 'negative', loading: false };
            }
            if (ind.id === 'bitcoin-dominance') {
              return { ...ind, value: `${mock.dominance.toFixed(1)}%`, status: 'neutral', loading: false };
            }
            if (ind.id === 'spy') {
              return { ...ind, value: `$${mock.currentPrice.toFixed(2)}`, changePercent: mock.change24hPercent, status: mock.change24hPercent > 0 ? 'positive' : mock.change24hPercent < 0 ? 'negative' : 'neutral', loading: false };
            }
            if (ind.id === 'eurusd') {
              return { ...ind, value: mock.currentPrice.toFixed(4), changePercent: mock.change24hPercent, status: mock.change24hPercent > 0 ? 'positive' : mock.change24hPercent < 0 ? 'negative' : 'neutral', loading: false };
            }
            if (ind.id === 'gold') {
              return { ...ind, value: `$${mock.currentPrice.toFixed(2)}`, changePercent: mock.change24hPercent, status: mock.change24hPercent > 0 ? 'positive' : mock.change24hPercent < 0 ? 'negative' : 'neutral', loading: false };
            }
          }
          return { ...ind, loading: false };
        }));
        return;
      }

      try {
        const fetchFn = API_CONFIG.DISABLE_API_CALLS ? mockFetch : fetch;
        
        // Fetch VIX
        try {
          const vixResponse = await fetchFn('/api/market-indicators/vix');
          if (vixResponse.ok) {
            const vixData = await vixResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'vix' 
                ? {
                    ...ind,
                    value: vixData.value?.toFixed(2) || '—',
                    change: vixData.change,
                    changePercent: vixData.changePercent,
                    status: vixData.changePercent && vixData.changePercent > 0 ? 'negative' : 'positive',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'vix' ? { ...ind, loading: false } : ind));
        }

        // Fetch Fear & Greed
        try {
          const fgResponse = await fetchFn('/api/market-indicators/fear-greed');
          if (fgResponse.ok) {
            const fgData = await fgResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'fear-greed' 
                ? {
                    ...ind,
                    value: fgData.value || '—',
                    status: fgData.value >= 50 ? 'positive' : 'negative',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'fear-greed' ? { ...ind, loading: false } : ind));
        }

        // Fetch Bitcoin Dominance
        try {
          const btcResponse = await fetchFn('/api/market-indicators/bitcoin-dominance');
          if (btcResponse.ok) {
            const btcData = await btcResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'bitcoin-dominance' 
                ? {
                    ...ind,
                    value: btcData.dominance ? `${btcData.dominance.toFixed(1)}%` : '—',
                    status: 'neutral',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'bitcoin-dominance' ? { ...ind, loading: false } : ind));
        }

        // Fetch S&P 500 (SPY)
        try {
          const spyResponse = await fetchFn('/api/market/data?symbol=SPY&assetType=stock');
          if (spyResponse.ok) {
            const spyData = await spyResponse.json();
            if (spyData.success && spyData.data) {
              const value = `$${spyData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'spy' 
                  ? {
                      ...ind,
                      value,
                      changePercent: spyData.data.change24hPercent,
                      status: spyData.data.change24hPercent > 0 ? 'positive' : spyData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'spy' ? { ...ind, loading: false } : ind));
        }

        // Fetch EUR/USD
        try {
          const eurusdResponse = await fetchFn('/api/market/data?symbol=EURUSD&assetType=forex');
          if (eurusdResponse.ok) {
            const eurusdData = await eurusdResponse.json();
            if (eurusdData.success && eurusdData.data) {
              const value = eurusdData.data.currentPrice.toFixed(4);
              setIndicators(prev => prev.map(ind => 
                ind.id === 'eurusd' 
                  ? {
                      ...ind,
                      value,
                      changePercent: eurusdData.data.change24hPercent,
                      status: eurusdData.data.change24hPercent > 0 ? 'positive' : eurusdData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'eurusd' ? { ...ind, loading: false } : ind));
        }

        // Fetch Gold
        try {
          const goldResponse = await fetchFn('/api/market/data?symbol=GOLD&assetType=commodity');
          if (goldResponse.ok) {
            const goldData = await goldResponse.json();
            if (goldData.success && goldData.data) {
              const value = `$${goldData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'gold' 
                  ? {
                      ...ind,
                      value,
                      changePercent: goldData.data.change24hPercent,
                      status: goldData.data.change24hPercent > 0 ? 'positive' : goldData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'gold' ? { ...ind, loading: false } : ind));
        }

      } catch (error) {
        console.error('Error fetching market indicators:', error);
      }
  }, []);

  useEffect(() => {
    fetchIndicators();
    
    // Refresh ogni 5 minuti
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchIndicators]);

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Cruscotto operativo mercati"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          {t('dashboard.marketDashboard.title') || 'Cruscotto Operativo'}
        </h2>
        <Link
          href={buildLocalePath(locale, '/dashboard/market-data')}
          className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          <span>{t('dashboard.marketDashboard.viewAll') || 'Vedi tutti'}</span>
          <LinkIcon className="w-4 h-4" />
        </Link>
      </div>

      <SectionBanner
        title="Indicatori Chiave di Mercato"
        description="I principali indicatori finanziari per monitorare lo stato dei mercati. Clicca su 'Vedi tutti' per accedere all'analisi completa con tutti gli indicatori disponibili."
        icon={<BarChart3 className="w-4 h-4" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map((indicator) => {
          const tooltipData = getIndicatorTooltip(indicator.id);
          return (
            <div
              key={indicator.id}
              className={cn(
                'bg-bg-base border-2 border-border-subtle rounded-xl p-6 transition-all hover:border-accent/60 hover:shadow-lg flex flex-col min-h-[200px]'
              )}
            >
              {/* Header con badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-text-primary">
                      {indicator.name}
                    </h3>
                    {indicator.assetType && (
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide',
                        'bg-bg-soft text-text-secondary border border-border-subtle'
                      )}>
                        {indicator.assetType}
                      </span>
                    )}
                  </div>
                </div>
                {indicator.changePercent !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold',
                    indicator.changePercent > 0 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  )}>
                    {indicator.changePercent > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{Math.abs(indicator.changePercent).toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {/* Value - più prominente */}
              {indicator.loading ? (
                <Skeleton className="h-14 w-full mb-4" />
              ) : (
                <div className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
                  {indicator.value}
                </div>
              )}

              {/* Spiegazione - più leggibile */}
              {tooltipData && (
                <div className="mt-auto pt-4 border-t-2 border-border-subtle">
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {tooltipData.description.split('.')[0]}{tooltipData.description.split('.')[1] ? '.' + tooltipData.description.split('.')[1] : ''}
                  </p>
                  <Link
                    href={buildLocalePath(locale, `/dashboard/market-data#${indicator.id}`)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>Dettagli</span>
                    <LinkIcon className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Alert se necessario */}
              {indicator.status === 'negative' && indicator.id === 'vix' && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">{t('dashboard.marketDashboard.highVolatility') || 'Alta volatilità'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
