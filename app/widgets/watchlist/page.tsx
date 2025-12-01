'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface WatchlistItem {
  id: string;
  asset_symbol: string;
  asset_name: string;
  current_price?: number;
  price_change?: number;
  price_change_percent?: number;
}

/**
 * Watchlist Widget Page
 * Widget ottimizzato per mobile da aggiungere alla home screen
 */
export default function WatchlistWidgetPage() {
  const { t, locale } = useTranslations();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: watchlist, loading, mutate } = useApi<WatchlistItem[]>(
    '/api/watchlist',
    {
      cacheTime: 5 * 60 * 1000,
      revalidateOnFocus: true,
    }
  );

  // Auto-refresh ogni 5 minuti
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        mutate();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mutate]);

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
        mutate().finally(() => {
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
  }, [mutate]);

  return (
    <div className="min-h-screen bg-bg-base p-4">
      <div className="mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-text-primary">
            {t('widgets.watchlist.title') || 'Watchlist'}
          </h1>
          {refreshing && (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {loading && !watchlist ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !watchlistWithPrices || watchlistWithPrices.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('widgets.watchlist.empty') || 'Nessun asset in watchlist'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlistWithPrices.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="bg-bg-soft border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">
                    {item.asset_name || item.asset_symbol}
                  </h3>
                  <p className="text-xs text-text-tertiary font-mono">
                    {item.asset_symbol}
                  </p>
                </div>
                {item.current_price !== undefined && (
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(item.current_price)}
                    </p>
                    {item.price_change_percent !== undefined && (
                      <p className={`text-xs font-medium flex items-center justify-end gap-1 ${
                        item.price_change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.price_change_percent >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {item.price_change_percent >= 0 ? '+' : ''}
                        {item.price_change_percent.toFixed(2)}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {watchlistWithPrices.length > 10 && (
            <div className="text-center py-2 text-xs text-text-tertiary">
              {t('widgets.watchlist.more', { count: watchlistWithPrices.length - 10 }) || 
                `+${watchlistWithPrices.length - 10} altri asset`}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border-subtle text-center">
        <a
          href="/dashboard/watchlist"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          {t('widgets.openDashboard') || 'Apri Dashboard Completa →'}
        </a>
      </div>
    </div>
  );
}

