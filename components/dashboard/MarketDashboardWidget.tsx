'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';
import { Skeleton } from '@/components/ui/Skeleton';

interface MarketIndicator {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  status: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}

/**
 * Market Dashboard Widget
 * Cruscotto operativo con indicatori di mercato principali
 * Versione compatta per la panoramica dashboard
 */
export function MarketDashboardWidget() {
  const { t, locale } = useTranslations();
  const [indicators, setIndicators] = useState<MarketIndicator[]>([
    { id: 'vix', name: 'VIX', value: '—', status: 'neutral', loading: true },
    { id: 'fear-greed', name: 'Fear & Greed', value: '—', status: 'neutral', loading: true },
    { id: 'bitcoin-dominance', name: 'BTC Dominance', value: '—', status: 'neutral', loading: true },
    { id: 'crypto-market-cap', name: 'Crypto Market Cap', value: '—', status: 'neutral', loading: true },
  ]);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        // Fetch VIX
        try {
          const vixResponse = await fetch('/api/market-indicators/vix');
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
          const fgResponse = await fetch('/api/market-indicators/fear-greed');
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
          const btcResponse = await fetch('/api/market-indicators/bitcoin-dominance');
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

        // Fetch Crypto Market Cap
        try {
          const marketCapResponse = await fetch('/api/market-indicators/crypto-market-cap');
          if (marketCapResponse.ok) {
            const marketCapData = await marketCapResponse.json();
            const value = marketCapData.totalMarketCap 
              ? `$${(marketCapData.totalMarketCap / 1e12).toFixed(2)}T`
              : '—';
            setIndicators(prev => prev.map(ind => 
              ind.id === 'crypto-market-cap' 
                ? {
                    ...ind,
                    value,
                    status: 'neutral',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'crypto-market-cap' ? { ...ind, loading: false } : ind));
        }
      } catch (error) {
        console.error('Error fetching market indicators:', error);
      }
    };

    fetchIndicators();
    
    // Refresh ogni 5 minuti
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Cruscotto operativo mercati"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            {t('dashboard.marketDashboard.title') || 'Cruscotto Operativo'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.marketDashboard.description') || 'Indicatori di mercato in tempo reale'}
          </p>
        </div>
        <Link
          href={buildLocalePath(locale, '/dashboard/market-data')}
          className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          <span>{t('dashboard.marketDashboard.viewAll') || 'Vedi tutti'}</span>
          <LinkIcon className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className={cn(
              'bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40',
              indicator.status === 'positive' && 'border-green-500/30',
              indicator.status === 'negative' && 'border-red-500/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary font-medium uppercase">
                {indicator.name}
              </span>
              {indicator.changePercent !== undefined && (
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  indicator.changePercent > 0 ? 'text-red-400' : 'text-green-400'
                )}>
                  {indicator.changePercent > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(indicator.changePercent).toFixed(1)}%</span>
                </div>
              )}
            </div>
            {indicator.loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold text-text-primary">
                {indicator.value}
              </div>
            )}
            {indicator.status === 'negative' && indicator.id === 'vix' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>{t('dashboard.marketDashboard.highVolatility') || 'Alta volatilità'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
