'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, X, Edit2, Trash2, CheckCircle2, AlertCircle, Info, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { supabase } from '@/lib/supabase/client';

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

  // Carica alert dal localStorage (per ora, poi possiamo usare Supabase)
  useEffect(() => {
    const saved = localStorage.getItem('pro-alerts');
    if (saved) {
      try {
        setAlerts(JSON.parse(saved));
      } catch {
        setAlerts([]);
      }
    }
  }, []);

  // Salva alert nel localStorage
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('pro-alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  const handleAdd = () => {
    if (!newAlert.name || !newAlert.value) return;
    if (newAlert.type !== 'custom' && !newAlert.symbol) return;

    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name,
      type: newAlert.type,
      symbol: newAlert.symbol || undefined,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
      active: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ name: '', type: 'price', symbol: '', condition: 'above', value: '' });
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
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
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
          aria-label={t('proUtilities.alerts.add') || 'Aggiungi alert'}
        >
          <Plus className="w-5 h-5" />
        </button>
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

          <div className="grid grid-cols-2 gap-3">
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

