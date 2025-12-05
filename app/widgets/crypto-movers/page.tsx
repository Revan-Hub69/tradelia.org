'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import MIFIDDisclaimer from '@/components/widgets/MIFIDDisclaimer';
import { trackWidgetLoadTime, trackWidgetError } from '@/lib/monitoring/widget-performance';

interface TopMover {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
}

interface TopMoversData {
  gainers: TopMover[];
  losers: TopMover[];
  highVolume: TopMover[];
  aiReading?: string;
}

/**
 * Crypto Top Movers Widget - Installabile
 * Widget ottimizzato per mobile/desktop
 */
export default function CryptoMoversWidgetPage() {
  const { t, locale } = useTranslations();
  const { isPro } = useUserRole();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  
  const { data: moversData, loading, refetch } = useApi<TopMoversData>(
    '/api/crypto/top-movers',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: () => {
        const loadTime = performance.now();
        trackWidgetLoadTime('crypto-movers', loadTime);
      },
      onError: (error) => {
        trackWidgetError('crypto-movers', error);
      },
    }
  );

  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      trackWidgetLoadTime('crypto-movers', loadTime);
    };
  }, []);

  // Auto-refresh ogni 5 minuti
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Pull-to-refresh
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      if (swipeDistance < -100 && window.scrollY === 0) {
        setRefreshing(true);
        refetch().finally(() => {
          setTimeout(() => setRefreshing(false), 500);
        });
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refetch]);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-bg-base p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Upgrade to Pro to access Top Movers</p>
          <Link
            href="/dashboard/upgrade"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors inline-block"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  const currentData = activeTab === 'gainers' 
    ? moversData?.gainers 
    : activeTab === 'losers'
    ? moversData?.losers
    : moversData?.highVolume;

  return (
    <div className="min-h-screen bg-bg-base p-4">
      {/* MIFID Disclaimer */}
      <MIFIDDisclaimer />
      
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            📈 {t('widgets.cryptoMovers.title') || 'Top Movers'}
          </h1>
          {refreshing && (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'gainers'
                ? 'bg-accent text-white'
                : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
            }`}
          >
            {t('widgets.cryptoMovers.gainers') || 'Gainers'}
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'losers'
                ? 'bg-accent text-white'
                : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
            }`}
          >
            {t('widgets.cryptoMovers.losers') || 'Losers'}
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'volume'
                ? 'bg-accent text-white'
                : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
            }`}
          >
            {t('widgets.cryptoMovers.volume') || 'Volume'}
          </button>
        </div>
      </div>

      {/* Movers List */}
      {loading && !moversData ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !currentData || currentData.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary">
          <p>{t('widgets.cryptoMovers.empty') || 'Nessun dato disponibile'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {currentData.slice(0, 10).map((mover) => (
              <div
                key={mover.id}
                className="bg-bg-soft border border-border-subtle rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">
                      {mover.name || mover.symbol}
                    </h3>
                    <p className="text-xs text-text-tertiary font-mono mb-2">
                      {mover.symbol}
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      }).format(mover.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    {activeTab !== 'volume' && (
                      <div className={`flex items-center gap-1 mb-2 ${
                        mover.change24hPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {mover.change24hPercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">
                          {mover.change24hPercent >= 0 ? '+' : ''}
                          {mover.change24hPercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {activeTab === 'volume' && (
                      <div className="text-xs text-text-tertiary">
                        Vol: {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(mover.volume24h)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Reading */}
          {moversData?.aiReading && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-text-secondary leading-relaxed">
                {moversData.aiReading}
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-subtle text-center">
        <Link
          href="/dashboard/analysis"
          className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          {t('widgets.openDashboard') || 'Apri Dashboard Completa →'}
        </Link>
      </div>
    </div>
  );
}
