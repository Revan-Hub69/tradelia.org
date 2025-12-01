'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';

interface Alert {
  id: string;
  asset_symbol: string;
  asset_name?: string;
  alert_type: string;
  target_value: number;
  is_active: boolean;
  is_triggered: boolean;
  created_at: string;
}

/**
 * Alerts Widget Page
 * Widget ottimizzato per mobile da aggiungere alla home screen
 */
export default function AlertsWidgetPage() {
  const { t, locale } = useTranslations();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: alerts, loading, refetch } = useApi<Alert[]>(
    '/api/watchlist/alerts',
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  const dateLocale = locale === 'it' ? itLocale : enLocale;

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

  const activeAlerts = alerts?.filter(a => a.is_active) || [];
  const triggeredAlerts = alerts?.filter(a => a.is_triggered) || [];

  return (
    <div className="min-h-screen bg-bg-base p-4">
      <div className="mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-text-primary">
            {t('widgets.alerts.title') || 'Alert'}
          </h1>
          {refreshing && (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent" />
            <span className="text-text-secondary">
              {activeAlerts.length} {t('widgets.alerts.active') || 'attivi'}
            </span>
          </div>
          {triggeredAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">
                {triggeredAlerts.length} {t('widgets.alerts.triggered') || 'attivati'}
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && !alerts ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-bg-base rounded w-1/3 mb-2" />
              <div className="h-6 bg-bg-base rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('widgets.alerts.empty') || 'Nessun alert configurato'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`bg-bg-soft border rounded-lg p-4 ${
                alert.is_triggered
                  ? 'border-green-500/40 bg-green-500/5'
                  : alert.is_active
                  ? 'border-border-subtle'
                  : 'border-border-subtle opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.is_triggered ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : alert.is_active ? (
                      <Bell className="w-4 h-4 text-accent" />
                    ) : (
                      <BellOff className="w-4 h-4 text-text-tertiary" />
                    )}
                    <h3 className="font-semibold text-text-primary">
                      {alert.asset_name || alert.asset_symbol}
                    </h3>
                    <span className="text-xs text-text-tertiary font-mono">
                      {alert.asset_symbol}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {alert.alert_type}: {new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(alert.target_value)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </p>
                </div>
                {alert.is_triggered && (
                  <span className="px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400 font-medium">
                    {t('widgets.alerts.triggered') || 'Attivato'}
                  </span>
                )}
              </div>
            </div>
          ))}
          {alerts.length > 10 && (
            <div className="text-center py-2 text-xs text-text-tertiary">
              {t('widgets.alerts.more')?.replace('{count}', String(alerts.length - 10)) || 
                `+${alerts.length - 10} altri alert`}
            </div>
          )}
        </div>
      )}

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

