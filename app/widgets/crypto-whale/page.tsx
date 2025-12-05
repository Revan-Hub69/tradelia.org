'use client';

import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import MIFIDDisclaimer from '@/components/widgets/MIFIDDisclaimer';
import WidgetNotifications from '@/components/widgets/WidgetNotifications';
import { trackWidgetLoadTime, trackApiResponseTime, trackWidgetError } from '@/lib/monitoring/widget-performance';

interface WhaleTransaction {
  hash: string;
  from: { address: string; owner_type: string };
  to: { address: string; owner_type: string };
  amount: number;
  amount_usd: number;
  symbol: string;
  timestamp: number;
}

interface WhaleData {
  transactions: WhaleTransaction[];
  exchangeFlows: Array<{ exchange: string; flow: number; direction: 'in' | 'out' }>;
  whaleRatio: number;
  aiReading?: string;
}

/**
 * Crypto Whale Widget - Installabile
 * Widget ottimizzato per mobile/desktop da aggiungere alla home screen
 */
export default function CryptoWhaleWidgetPage() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [refreshing, setRefreshing] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  
  // Get widget ID if installed
  useEffect(() => {
    const fetchWidgetId = async () => {
      try {
        const response = await fetch('/api/widgets/me');
        if (!response.ok) return;
        const data = await response.json();
        const whaleWidget = data.widgets?.find((w: any) => w.widget_type === 'crypto-whale');
        if (whaleWidget) {
          setWidgetId(whaleWidget.id);
        }
      } catch (error) {
        console.error('Error fetching widget ID:', error);
      }
    };
    if (isPro) {
      fetchWidgetId();
    }
  }, [isPro]);
  
  const { data: whaleData, loading, refetch } = useApi<WhaleData>(
    '/api/crypto/whale-analysis',
    {
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: () => {
        // Track successful load
        const loadTime = performance.now();
        trackWidgetLoadTime('crypto-whale', loadTime);
      },
      onError: (error) => {
        trackWidgetError('crypto-whale', error);
      },
    }
  );

  // Track initial load time
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      trackWidgetLoadTime('crypto-whale', loadTime);
    };
  }, []);

  // Auto-refresh ogni 10 minuti
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, 10 * 60 * 1000);

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
          <p className="text-text-secondary mb-4">Upgrade to Pro to access Whale Analysis</p>
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
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2" id="widget-title">
            🐋 {t('widgets.cryptoWhale.title') || 'Crypto Whale'}
          </h1>
          <div className="flex items-center gap-2">
            {/* Widget Notifications (if widget is installed) */}
            {widgetId && (
              <WidgetNotifications widgetId={widgetId} widgetType="crypto-whale" />
            )}
            {refreshing && (
              <div 
                className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label={t('widgets.refreshing') || 'Aggiornamento in corso'}
              />
            )}
          </div>
        </div>
        {whaleData?.whaleRatio !== undefined && (
          <div className="text-sm text-text-secondary">
            Whale Ratio: <span className="font-semibold">{whaleData.whaleRatio.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {loading && !whaleData ? (
        <div className="space-y-3" role="status" aria-live="polite" aria-label={t('widgets.loading') || 'Caricamento dati'}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse" aria-hidden="true">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !whaleData?.transactions || whaleData.transactions.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary" role="status" aria-live="polite">
          <p>{t('widgets.cryptoWhale.empty') || 'Nessuna transazione whale recente'}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6" role="list" aria-label={t('widgets.cryptoWhale.transactions') || 'Transazioni whale recenti'}>
          {whaleData.transactions.slice(0, 5).map((tx, index) => (
            <div
              key={tx.hash}
              className="bg-bg-soft border border-border-subtle rounded-lg p-4"
              role="listitem"
              tabIndex={0}
              aria-label={`Transazione ${index + 1}: ${tx.symbol} verso ${tx.to.owner_type}, valore ${tx.amount_usd.toLocaleString()} USD`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-text-primary mb-1">
                    {tx.symbol} → {tx.to.owner_type}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(tx.amount_usd)}
                  </p>
                </div>
                <div className="text-right">
                  <time 
                    dateTime={new Date(tx.timestamp * 1000).toISOString()}
                    className="text-xs text-text-tertiary"
                  >
                    {new Date(tx.timestamp * 1000).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exchange Flows */}
      {whaleData?.exchangeFlows && whaleData.exchangeFlows.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            {t('widgets.cryptoWhale.exchangeFlows') || 'Exchange Flows'}
          </h2>
          <div className="space-y-2">
            {whaleData.exchangeFlows.slice(0, 3).map((flow, idx) => (
              <div
                key={idx}
                className="bg-bg-soft border border-border-subtle rounded-lg p-3 flex items-center justify-between"
              >
                <span className="text-sm text-text-primary">{flow.exchange}</span>
                <div className="flex items-center gap-2">
                  {flow.direction === 'in' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${
                    flow.direction === 'in' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {flow.direction === 'in' ? '+' : '-'}
                    {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.abs(flow.flow))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Reading */}
      {whaleData?.aiReading && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-text-secondary leading-relaxed">
            {whaleData.aiReading}
          </p>
        </div>
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
