'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, X, Edit2, Trash2, CheckCircle2, AlertCircle, Info, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toast';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { useApi } from '@/lib/hooks/useApi';
import { ExportButton } from './ExportButton';

export type AlertType = 'price' | 'volume' | 'custom';
export type AlertCondition = 'above' | 'below' | 'equals';

export interface Alert {
  id: string;
  name: string;
  type: AlertType;
  symbol?: string;
  condition: AlertCondition;
  value: number;
  active: boolean;
  createdAt: string;
}

export function AlertSystem() {
  const { t } = useTranslations();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'price' as AlertType,
    symbol: '',
    condition: 'above' as AlertCondition,
    value: '',
  });

  // Carica alert da API (usa watchlist_alerts se disponibili, altrimenti fallback a localStorage per migrazione)
  const { data: alertsData, loading, error, retry } = useApi<Array<{
    id: string;
    name?: string;
    alert_type: string;
    target_value: number;
    comparison_operator: string;
    is_active: boolean;
    watchlist?: { asset_symbol: string };
  }>>('/api/watchlist/alerts', {
    cacheTime: 30 * 1000,
  });

  // Converti dati API a formato Alert
  useEffect(() => {
    if (alertsData) {
      const converted: Alert[] = alertsData.map((a) => ({
        id: a.id,
        name: a.name || `${a.watchlist?.asset_symbol || 'Asset'} ${a.alert_type}`,
        type: a.alert_type.includes('price') ? 'price' : a.alert_type.includes('volume') ? 'volume' : 'custom',
        symbol: a.watchlist?.asset_symbol,
        condition: a.comparison_operator === '>=' || a.comparison_operator === '>' ? 'above' : 
                   a.comparison_operator === '<=' || a.comparison_operator === '<' ? 'below' : 'equals',
        value: a.target_value,
        active: a.is_active,
        createdAt: new Date().toISOString(),
      }));
      setAlerts(converted);
    }
  }, [alertsData]);

  const handleAdd = async () => {
    // Validazione input
    if (!newAlert.name || !newAlert.value) {
      toast.error(t('proUtilities.alerts.errors.missingFields') || 'Compila tutti i campi obbligatori.');
      return;
    }
    
    // Sanitizzazione nome: max 100 caratteri, rimuovi HTML
    const name = newAlert.name.trim().slice(0, 100).replace(/<[^>]*>/g, '');
    if (name.length < 3) {
      toast.error(t('proUtilities.alerts.errors.nameTooShort') || 'Il nome deve contenere almeno 3 caratteri.');
      return;
    }
    
    // Validazione simbolo se presente
    if (newAlert.type !== 'custom' && !newAlert.symbol) {
      toast.error(t('proUtilities.alerts.errors.symbolRequired') || 'Il simbolo è obbligatorio per questo tipo di alert.');
      return;
    }

    if (newAlert.symbol) {
      const symbol = newAlert.symbol.trim().toUpperCase().slice(0, 10);
      if (!/^[A-Z]{1,10}$/.test(symbol)) {
        toast.error(t('proUtilities.alerts.errors.invalidSymbol') || 'Simbolo non valido. Usa solo lettere maiuscole (max 10 caratteri).');
        return;
      }
    }
    
    // Validazione valore numerico
    const value = parseFloat(newAlert.value);
    if (isNaN(value) || value <= 0) {
      toast.error(t('proUtilities.alerts.errors.invalidValue') || 'Il valore deve essere un numero positivo.');
      return;
    }

    try {
      let watchlistId: string | null = null;

      // Se l'alert richiede un simbolo, verifica/crea watchlist entry
      if (newAlert.type !== 'custom' && newAlert.symbol) {
        const symbol = newAlert.symbol.trim().toUpperCase();

        // Verifica se esiste già una watchlist entry per questo simbolo
        const watchlistResponse = await authenticatedFetch('/api/watchlist');
        if (watchlistResponse.ok) {
          const watchlistData = await watchlistResponse.json();
          if (Array.isArray(watchlistData)) {
            const existingEntry = watchlistData.find((entry: any) => 
              entry.asset_symbol?.toUpperCase() === symbol
            );
            if (existingEntry) {
              watchlistId = existingEntry.id;
            }
          }
        }

        // Se non esiste, creala
        if (!watchlistId) {
          const createWatchlistResponse = await authenticatedFetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              asset_symbol: symbol,
              asset_name: symbol, // Nome di default, può essere aggiornato dopo
              asset_type: 'stock',
            }),
          });

          if (!createWatchlistResponse.ok) {
            const error = await createWatchlistResponse.json();
            throw new Error(error.error || 'Errore creazione watchlist entry');
          }

          const newWatchlist = await createWatchlistResponse.json();
          watchlistId = newWatchlist.id;
        }
      }

      // Converti condition in comparison_operator
      const comparisonOperator = newAlert.condition === 'above' ? '>=' : 
                                 newAlert.condition === 'below' ? '<=' : '==';

      // Crea alert
      const alertResponse = await authenticatedFetch('/api/watchlist/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchlist_id: watchlistId || null,
          alert_type: newAlert.type === 'price' ? 'price_above' : 
                      newAlert.type === 'volume' ? 'volume_above' : 'custom',
          target_value: value,
          comparison_operator: comparisonOperator,
          notify_via_push: true,
          notify_via_email: false,
          notify_via_sms: false,
          notes: name,
        }),
      });

      if (!alertResponse.ok) {
        const error = await alertResponse.json();
        throw new Error(error.error || 'Errore creazione alert');
      }

      toast.success(t('proUtilities.alerts.added') || 'Alert creato con successo!');
      setNewAlert({ name: '', type: 'price', symbol: '', condition: 'above', value: '' });
      setIsAdding(false);
      retry();
    } catch (error) {
      console.error('Error adding alert:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('proUtilities.alerts.errors.addError') || 'Errore durante l\'aggiunta dell\'alert.'
      );
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const alert = alerts.find(a => a.id === id);
      if (!alert) return;

      const response = await authenticatedFetch(`/api/watchlist/alerts?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !alert.active }),
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'aggiornamento');
      }

      toast.success(alert.active 
        ? (t('proUtilities.alerts.deactivated') || 'Alert disattivato')
        : (t('proUtilities.alerts.activated') || 'Alert attivato'));
      retry();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error(t('proUtilities.alerts.errors.toggleError') || 'Errore durante l\'aggiornamento dell\'alert.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('proUtilities.alerts.confirmDelete') || 'Sei sicuro di voler eliminare questo alert?'))) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/watchlist/alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      toast.success(t('proUtilities.alerts.deleted') || 'Alert eliminato con successo!');
      retry();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error(t('proUtilities.alerts.errors.deleteError') || 'Errore durante l\'eliminazione dell\'alert.');
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-4 h-4" />;
      case 'volume':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getConditionLabel = (condition: AlertCondition) => {
    switch (condition) {
      case 'above':
        return t('proUtilities.alerts.above') || 'Sopra';
      case 'below':
        return t('proUtilities.alerts.below') || 'Sotto';
      case 'equals':
        return t('proUtilities.alerts.equals') || 'Uguale a';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t('proUtilities.alerts.title') || 'Sistema di Alert'}
            </h3>
            <p className="text-xs text-text-tertiary">
              {t('proUtilities.alerts.subtitle') || 'Notifiche personalizzate per i tuoi asset'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="alerts" format="csv" />
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
            aria-label={t('proUtilities.alerts.add') || 'Aggiungi alert'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form aggiunta */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-bg-soft border border-border-subtle rounded-xl p-4 space-y-4"
        >
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">
              {t('proUtilities.alerts.name') || 'Nome Alert'}
            </label>
            <input
              type="text"
              value={newAlert.name}
              onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
              className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder={t('proUtilities.alerts.namePlaceholder') || 'Es: AAPL sopra €200'}
            />
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-1 block">
              {t('proUtilities.alerts.type') || 'Tipo'}
            </label>
            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as AlertType })}
              className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="price">{t('proUtilities.alerts.typePrice') || 'Prezzo'}</option>
              <option value="volume">{t('proUtilities.alerts.typeVolume') || 'Volume'}</option>
              <option value="custom">{t('proUtilities.alerts.typeCustom') || 'Personalizzato'}</option>
            </select>
          </div>

          {newAlert.type !== 'custom' && (
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.alerts.symbol') || 'Simbolo'}
              </label>
              <input
                type="text"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="AAPL"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.alerts.condition') || 'Condizione'}
              </label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as AlertCondition })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="above">{t('proUtilities.alerts.above') || 'Sopra'}</option>
                <option value="below">{t('proUtilities.alerts.below') || 'Sotto'}</option>
                <option value="equals">{t('proUtilities.alerts.equals') || 'Uguale a'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.alerts.value') || 'Valore'}
              </label>
              <input
                type="number"
                step="0.01"
                value={newAlert.value}
                onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-accent hover:bg-accent-hover text-white py-2 px-4 text-sm font-medium transition-colors"
            >
              {t('proUtilities.alerts.add') || 'Aggiungi'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewAlert({ name: '', type: 'price', symbol: '', condition: 'above', value: '' });
              }}
              className="px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              {t('proUtilities.alerts.cancel') || 'Annulla'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista alert */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {t('proUtilities.alerts.empty') || 'Nessun alert configurato. Aggiungi il primo alert.'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'bg-bg-soft border rounded-xl p-4 transition-all',
                alert.active
                  ? 'border-border-subtle hover:border-accent/40'
                  : 'border-border-subtle opacity-60'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getAlertIcon(alert.type)}
                    <h4 className="font-semibold text-text-primary">{alert.name}</h4>
                    {alert.active ? (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400">
                        {t('proUtilities.alerts.active') || 'Attivo'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary">
                        {t('proUtilities.alerts.inactive') || 'Inattivo'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-text-secondary">
                    {alert.symbol && (
                      <p>
                        <span className="text-text-tertiary">{t('proUtilities.alerts.symbol') || 'Simbolo'}:</span>{' '}
                        {alert.symbol}
                      </p>
                    )}
                    <p>
                      <span className="text-text-tertiary">{t('proUtilities.alerts.condition') || 'Condizione'}:</span>{' '}
                      {getConditionLabel(alert.condition)} €{alert.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(alert.id)}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      alert.active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-bg-surface text-text-tertiary hover:text-text-secondary'
                    )}
                    aria-label={alert.active ? t('proUtilities.alerts.deactivate') || 'Disattiva' : t('proUtilities.alerts.activate') || 'Attiva'}
                  >
                    {alert.active ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    aria-label={t('proUtilities.alerts.delete') || 'Elimina'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

