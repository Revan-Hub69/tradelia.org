'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, TrendingUp, TrendingDown, X, Edit, Trash2, Check, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';

interface WatchlistItem {
  id: string;
  asset_symbol: string;
  asset_name: string | null;
  asset_type: string;
  exchange: string | null;
  notes: string | null;
  tags: string[] | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  watchlist_alerts?: Alert[];
}

interface Alert {
  id: string;
  alert_type: string;
  target_value: number;
  comparison_operator: string;
  notify_via_push: boolean;
  notify_via_email: boolean;
  notify_via_sms: boolean;
  is_active: boolean;
  is_triggered: boolean;
  notes: string | null;
}

/**
 * Watchlist Content Component
 * Gestione completa watchlist con alert a target precisi
 * BASE: Visualizzazione limitata (5 asset)
 * PRO: Illimitato, alert avanzati
 */
export function WatchlistContent() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({ symbol: '', name: '', type: 'stock', exchange: '' });
  const [newAlert, setNewAlert] = useState({
    alert_type: 'price_above',
    target_value: '',
    comparison_operator: '>=',
    notify_via_push: true,
    notify_via_email: false,
    notify_via_sms: false,
  });

  const { data: watchlistData, loading, error, retry } = useApi<WatchlistItem[]>(
    '/api/watchlist?includeAlerts=true&activeOnly=true',
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );

  const watchlist = watchlistData || [];
  const maxItems = isPro ? Infinity : 5;
  const canAddMore = watchlist.length < maxItems;

  const handleAddAsset = async () => {
    if (!newAsset.symbol.trim()) {
      toast.error('Simbolo asset richiesto');
      return;
    }

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_symbol: newAsset.symbol.toUpperCase(),
          asset_name: newAsset.name || null,
          asset_type: newAsset.type,
          exchange: newAsset.exchange || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore aggiunta asset');
      }

      toast.success('Asset aggiunto alla watchlist');
      setShowAddModal(false);
      setNewAsset({ symbol: '', name: '', type: 'stock', exchange: '' });
      retry();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error(error instanceof Error ? error.message : 'Errore aggiunta asset');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Rimuovere questo asset dalla watchlist?')) return;

    try {
      const response = await fetch(`/api/watchlist?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore rimozione asset');
      }

      toast.success('Asset rimosso dalla watchlist');
      retry();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Errore rimozione asset');
    }
  };

  const handleAddAlert = async () => {
    if (!selectedWatchlist || !newAlert.target_value) {
      toast.error('Dati mancanti');
      return;
    }

    try {
      const response = await fetch('/api/watchlist/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchlist_id: selectedWatchlist,
          ...newAlert,
          target_value: parseFloat(newAlert.target_value),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore creazione alert');
      }

      toast.success('Alert creato con successo');
      setShowAlertModal(false);
      setSelectedWatchlist(null);
      setNewAlert({
        alert_type: 'price_above',
        target_value: '',
        comparison_operator: '>=',
        notify_via_push: true,
        notify_via_email: false,
        notify_via_sms: false,
      });
      retry();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error(error instanceof Error ? error.message : 'Errore creazione alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Eliminare questo alert?')) return;

    try {
      const response = await fetch(`/api/watchlist/alerts?id=${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore eliminazione alert');
      }

      toast.success('Alert eliminato');
      retry();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Errore eliminazione alert');
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above':
        return 'Prezzo sopra';
      case 'price_below':
        return 'Prezzo sotto';
      case 'price_change_pct':
        return 'Variazione %';
      case 'volume_above':
        return 'Volume sopra';
      default:
        return type;
    }
  };

  if (loading) {
    return <LoadingState message="Caricamento watchlist..." />;
  }

  if (error) {
    return <ErrorState title="Errore" message="Impossibile caricare la watchlist" onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            {t('watchlist.title') || 'Watchlist'}
          </h1>
          <p className="text-text-secondary">
            {t('watchlist.description') || 'Monitora i tuoi asset preferiti con alert personalizzati'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!canAddMore}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            canAddMore
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-bg-soft text-text-tertiary cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          {t('watchlist.addAsset') || 'Aggiungi Asset'}
        </button>
      </div>

      {/* Limit Warning */}
      {!isPro && watchlist.length >= maxItems && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text-primary mb-1">
              {t('watchlist.limitReached') || 'Limite raggiunto'}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('watchlist.limitMessage') || 'Hai raggiunto il limite di 5 asset. Aggiorna a Pro per watchlist illimitata.'}
            </p>
          </div>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title={t('watchlist.empty') || 'Nessun asset in watchlist'}
          description={t('watchlist.emptyDesc') || 'Aggiungi asset per iniziare a monitorarli'}
        />
      ) : (
        <div className="space-y-4">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary text-lg">
                      {item.asset_name || item.asset_symbol}
                    </h3>
                    <span className="px-2 py-1 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary font-mono">
                      {item.asset_symbol}
                    </span>
                    {item.priority > 0 && (
                      <span className="px-2 py-1 bg-accent/20 border border-accent/40 rounded text-xs text-accent font-medium">
                        {item.priority === 1 ? 'Alta' : 'Massima'}
                      </span>
                    )}
                  </div>
                  {item.exchange && (
                    <p className="text-sm text-text-secondary mb-2">Exchange: {item.exchange}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-text-secondary">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedWatchlist(item.id);
                      setShowAlertModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-bg-surface text-text-secondary hover:text-accent transition-colors"
                    aria-label="Aggiungi alert"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(item.id)}
                    className="p-2 rounded-lg hover:bg-error/20 text-text-secondary hover:text-error transition-colors"
                    aria-label="Rimuovi asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              {item.watchlist_alerts && item.watchlist_alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Alert Attivi</h4>
                  {item.watchlist_alerts
                    .filter((a) => a.is_active && !a.is_triggered)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 bg-bg-surface rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {alert.alert_type === 'price_above' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {getAlertTypeLabel(alert.alert_type)} {alert.comparison_operator} ${alert.target_value.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {alert.notify_via_push && (
                                <span className="text-xs text-text-tertiary">Push</span>
                              )}
                              {alert.notify_via_email && (
                                <span className="text-xs text-text-tertiary">Email</span>
                              )}
                              {alert.notify_via_sms && (
                                <span className="text-xs text-text-tertiary">SMS</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-1.5 rounded hover:bg-error/20 text-text-secondary hover:text-error transition-colors"
                          aria-label="Elimina alert"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('watchlist.addAsset') || 'Aggiungi Asset'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Simbolo *
                </label>
                <input
                  type="text"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL, BTC, EURUSD"
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nome (opzionale)
                </label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Apple Inc."
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tipo
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                  <option value="commodity">Commodity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Exchange (opzionale)
                </label>
                <input
                  type="text"
                  value={newAsset.exchange}
                  onChange={(e) => setNewAsset({ ...newAsset, exchange: e.target.value })}
                  placeholder="NASDAQ, Binance, etc."
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAsset({ symbol: '', name: '', type: 'stock', exchange: '' });
                }}
                className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddAsset}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAlertModal && selectedWatchlist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('watchlist.addAlert') || 'Crea Alert'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tipo Alert
                </label>
                <select
                  value={newAlert.alert_type}
                  onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="price_above">Prezzo sopra target</option>
                  <option value="price_below">Prezzo sotto target</option>
                  <option value="price_change_pct">Variazione percentuale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Valore Target *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlert.target_value}
                  onChange={(e) => setNewAlert({ ...newAlert, target_value: e.target.value })}
                  placeholder="100.00"
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Operatore
                </label>
                <select
                  value={newAlert.comparison_operator}
                  onChange={(e) => setNewAlert({ ...newAlert, comparison_operator: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value=">=">≥ (Maggiore o uguale)</option>
                  <option value=">">&gt; (Maggiore)</option>
                  <option value="<=">≤ (Minore o uguale)</option>
                  <option value="<">&lt; (Minore)</option>
                  <option value="=">= (Uguale)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Notifiche
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAlert.notify_via_push}
                      onChange={(e) => setNewAlert({ ...newAlert, notify_via_push: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-text-secondary">Push Notification</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAlert.notify_via_email}
                      onChange={(e) => setNewAlert({ ...newAlert, notify_via_email: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-text-secondary">Email</span>
                  </label>
                  {isPro && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAlert.notify_via_sms}
                        onChange={(e) => setNewAlert({ ...newAlert, notify_via_sms: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-text-secondary">SMS (Pro)</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setSelectedWatchlist(null);
                }}
                className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddAlert}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
              >
                Crea Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

