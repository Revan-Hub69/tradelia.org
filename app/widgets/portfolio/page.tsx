'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';
import { useTranslations } from '@/lib/i18n/use-translations';

interface PortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  total_value: number;
  change_percent: number;
  change_amount: number;
}

/**
 * Portfolio Widget Page
 * Widget ottimizzato per mobile da aggiungere alla home screen
 * Supporta Android Web Widgets (Android 12+) e iOS Shortcuts
 */
export default function PortfolioWidgetPage() {
  const { t, locale } = useTranslations();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: positions, loading, refetch } = useApi<PortfolioPosition[]>(
    '/api/portfolio',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const dateLocale = locale === 'it' ? itLocale : enLocale;

  // Auto-refresh ogni 5 minuti quando visibile
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Pull-to-refresh support
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      // Swipe down per refresh (minimo 100px)
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

  const totalValue = positions?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0;
  const totalChange = positions?.reduce((sum, p) => sum + (p.change_amount || 0), 0) || 0;
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  return (
    <div className="min-h-screen bg-bg-base p-4">
      {/* Widget Header - Ottimizzato per mobile */}
      <div className="mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-text-primary">
            {t('widgets.portfolio.title') || 'Portfolio'}
          </h1>
          {refreshing && (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalValue)}
          </span>
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            totalChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {totalChangePercent >= 0 ? '+' : ''}
            {totalChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Positions List - Scrollabile */}
      {loading && !positions ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('widgets.portfolio.empty') || 'Nessuna posizione nel portafoglio'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.slice(0, 10).map((position) => (
            <div
              key={position.id}
              className="bg-bg-soft border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">
                    {position.symbol}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {position.quantity} @ {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(position.current_price || position.entry_price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">
                    {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(position.total_value || 0)}
                  </p>
                  <p className={`text-xs font-medium flex items-center justify-end gap-1 ${
                    (position.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(position.change_percent || 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {(position.change_percent || 0) >= 0 ? '+' : ''}
                    {(position.change_percent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
          {positions.length > 10 && (
            <div className="text-center py-2 text-xs text-text-tertiary">
              {t('widgets.portfolio.more', { count: positions.length - 10 }) || 
                `+${positions.length - 10} altre posizioni`}
            </div>
          )}
        </div>
      )}

      {/* Footer - Link alla dashboard */}
      <div className="mt-6 pt-4 border-t border-border-subtle text-center">
        <a
          href="/dashboard"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          {t('widgets.openDashboard') || 'Apri Dashboard Completa →'}
        </a>
      </div>
    </div>
  );
}

