'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import MIFIDDisclaimer from '@/components/widgets/MIFIDDisclaimer';
import WidgetNotifications from '@/components/widgets/WidgetNotifications';
import { trackWidgetLoadTime, trackWidgetError } from '@/lib/monitoring/widget-performance';

interface AggregatedDepth {
  totalBid: number;
  totalAsk: number;
  averageSpread: number;
  globalImbalance: number;
  exchanges: Array<{ name: string; bid: number; ask: number; spread: number }>;
  aiReading?: string;
}

/**
 * Crypto Depth Aggregated Widget - Installabile
 * Widget ottimizzato per mobile/desktop
 */
export default function CryptoDepthWidgetPage() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [refreshing, setRefreshing] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWidgetId = async () => {
      try {
        const response = await fetch('/api/widgets/me');
        if (!response.ok) return;
        const data = await response.json();
        const depthWidget = data.widgets?.find((w: any) => w.widget_type === 'crypto-depth');
        if (depthWidget) {
          setWidgetId(depthWidget.id);
        }
      } catch (error) {
        console.error('Error fetching widget ID:', error);
      }
    };
    if (isPro) {
      fetchWidgetId();
    }
  }, [isPro]);
  
  const { data: depthData, loading, refetch } = useApi<AggregatedDepth>(
    '/api/crypto/aggregated-depth',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: () => {
        const loadTime = performance.now();
        trackWidgetLoadTime('crypto-depth', loadTime);
      },
      onError: (error) => {
        trackWidgetError('crypto-depth', error);
      },
    }
  );

  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      trackWidgetLoadTime('crypto-depth', loadTime);
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
          <p className="text-text-secondary mb-4">Upgrade to Pro to access Depth Analysis</p>
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

  return (
    <div className="min-h-screen bg-bg-base p-4">
      {/* MIFID Disclaimer */}
      <MIFIDDisclaimer />
      
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            📊 {t('widgets.cryptoDepth.title') || 'Depth Aggregated'}
          </h1>
          <div className="flex items-center gap-2">
            {widgetId && (
              <WidgetNotifications widgetId={widgetId} widgetType="crypto-depth" />
            )}
            {refreshing && (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
        {depthData && (
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-text-tertiary">Spread: </span>
              <span className="font-semibold text-text-primary">
                {depthData.averageSpread.toFixed(4)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              {depthData.globalImbalance >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-semibold ${
                depthData.globalImbalance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {depthData.globalImbalance >= 0 ? '+' : ''}
                {depthData.globalImbalance.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Depth Metrics */}
      {loading && !depthData ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !depthData ? (
        <div className="text-center py-8 text-text-tertiary">
          <p>{t('widgets.cryptoDepth.empty') || 'Nessun dato disponibile'}</p>
        </div>
      ) : (
        <>
          {/* Total Bid/Ask */}
          <div className="mb-6 grid grid-cols-2 gap-4" role="region" aria-label={t('widgets.cryptoDepth.metricsLabel') || 'Metriche profondità mercato'}>
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4" role="group" aria-label="Total Bid">
              <p className="text-xs text-text-tertiary mb-1">Total Bid</p>
              <p className="text-lg font-semibold text-green-400" aria-label={`Total Bid: ${depthData.totalBid.toLocaleString()}`}>
                {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(depthData.totalBid)}
              </p>
            </div>
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4" role="group" aria-label="Total Ask">
              <p className="text-xs text-text-tertiary mb-1">Total Ask</p>
              <p className="text-lg font-semibold text-red-400" aria-label={`Total Ask: ${depthData.totalAsk.toLocaleString()}`}>
                {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(depthData.totalAsk)}
              </p>
            </div>
          </div>

          {/* Exchanges */}
          {depthData.exchanges && depthData.exchanges.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-text-primary mb-3">
                {t('widgets.cryptoDepth.exchanges') || 'Exchanges'}
              </h2>
              <div className="space-y-2">
                {depthData.exchanges.slice(0, 5).map((exchange, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-soft border border-border-subtle rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-primary">{exchange.name}</span>
                      <span className="text-xs text-text-tertiary">
                        Spread: {exchange.spread.toFixed(4)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-tertiary">Bid: </span>
                        <span className="text-green-400 font-medium">
                          {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(exchange.bid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-tertiary">Ask: </span>
                        <span className="text-red-400 font-medium">
                          {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(exchange.ask)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reading */}
          {depthData.aiReading && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-text-secondary leading-relaxed">
                {depthData.aiReading}
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
