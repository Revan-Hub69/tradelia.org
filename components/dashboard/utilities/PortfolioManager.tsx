'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, X, Edit2, Trash2, PieChart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toast';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { useApi } from '@/lib/hooks/useApi';
import { usePriceUpdates } from '@/lib/hooks/usePriceUpdates';
import { ExportButton } from './ExportButton';
import { TooltipGlossary } from '@/components/glossary/TooltipGlossary';
import { getGlossaryTerm } from '@/lib/glossary/terms';

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  change: number;
  changePercent: number;
}

export function PortfolioManager() {
  const { t } = useTranslations();
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState({ symbol: '', quantity: '', price: '', notes: '' });
  const [portfolioTerm, setPortfolioTerm] = useState<any>(null);

  // Carica termine Portfolio per tooltip
  useEffect(() => {
    getGlossaryTerm('Portfolio').then(term => {
      if (term) setPortfolioTerm(term);
    });
  }, []);
  
  // Carica posizioni da API
  const { data: positionsData, loading, error, retry } = useApi<Array<{
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    total_value: number;
    current_price?: number;
    current_value?: number;
    change_amount?: number;
    change_percent?: number;
  }>>('/api/portfolio', {
    cacheTime: 30 * 1000, // 30 secondi
  });

  // Real-time price updates
  const symbols = (positionsData || []).map((p) => p.symbol);
  const { pricesMap } = usePriceUpdates({
    symbols,
    interval: 30000, // 30 secondi
    enabled: symbols.length > 0,
  });

  // Converti dati API a formato Position con aggiornamenti real-time
  const positions: Position[] = (positionsData || []).map((p) => {
    const realTimePrice = pricesMap.get(p.symbol);
    const currentPrice = realTimePrice?.price || p.current_price || p.price;
    const currentValue = currentPrice * p.quantity;
    const change = currentValue - p.total_value;
    const changePercent = p.total_value > 0 ? (change / p.total_value) * 100 : 0;

    return {
      id: p.id,
      symbol: p.symbol,
      quantity: p.quantity,
      price: p.price,
      total: p.total_value,
      change: realTimePrice?.change ?? change,
      changePercent: realTimePrice?.changePercent ?? changePercent,
    };
  });

  const totalValue = positions.reduce((sum, pos) => sum + pos.total, 0);
  const totalChange = positions.reduce((sum, pos) => sum + (pos.change * pos.quantity), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleAdd = async () => {
    // Validazione input
    if (!newPosition.symbol || !newPosition.quantity || !newPosition.price) {
      toast.error(t('proUtilities.portfolio.errors.missingFields') || 'Compila tutti i campi obbligatori.');
      return;
    }
    
    // Sanitizzazione: simbolo solo lettere maiuscole, max 10 caratteri
    const symbol = newPosition.symbol.trim().toUpperCase().slice(0, 10);
    if (!/^[A-Z]{1,10}$/.test(symbol)) {
      toast.error(t('proUtilities.portfolio.errors.invalidSymbol') || 'Simbolo non valido. Usa solo lettere maiuscole (max 10 caratteri).');
      return;
    }
    
    // Validazione numeri
    const quantity = parseFloat(newPosition.quantity);
    const price = parseFloat(newPosition.price);
    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      toast.error(t('proUtilities.portfolio.errors.invalidNumbers') || 'Quantità e prezzo devono essere numeri positivi.');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          quantity,
          price,
          notes: newPosition.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante la creazione');
      }

      toast.success(t('proUtilities.portfolio.added') || 'Posizione aggiunta con successo!');
      setNewPosition({ symbol: '', quantity: '', price: '', notes: '' });
      setIsAdding(false);
      retry(); // Ricarica posizioni
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error(t('proUtilities.portfolio.errors.addError') || 'Errore durante l\'aggiunta della posizione.');
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm(t('proUtilities.portfolio.confirmDelete') || 'Sei sicuro di voler eliminare questa posizione?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      toast.success(t('proUtilities.portfolio.deleted') || 'Posizione eliminata con successo!');
      retry(); // Ricarica posizioni
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(t('proUtilities.portfolio.errors.deleteError') || 'Errore durante l\'eliminazione della posizione.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-text-tertiary">
          {t('proUtilities.portfolio.loading') || 'Caricamento portfolio...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{t('proUtilities.portfolio.error') || 'Errore nel caricamento del portfolio'}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm"
          >
            {t('proUtilities.portfolio.retry') || 'Riprova'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con totali */}
      <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {t('proUtilities.portfolio.title') || 'Portafoglio'}
              </h3>
              <p className="text-xs text-text-tertiary">
                {t('proUtilities.portfolio.subtitle') || 'Gestisci le tue posizioni'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton type="portfolio" format="csv" />
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
              aria-label={t('proUtilities.portfolio.add') || 'Aggiungi posizione'}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-tertiary mb-1">
              {t('proUtilities.portfolio.totalValue') || 'Valore Totale'}
            </p>
            <p className="text-2xl font-bold text-text-primary">
              €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">
              {t('proUtilities.portfolio.totalChange') || 'Variazione'}
            </p>
            <div className="flex items-center gap-2">
              {totalChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <p className={cn(
                'text-2xl font-bold',
                totalChange >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {totalChange >= 0 ? '+' : ''}€{totalChange.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className={cn(
              'text-sm',
              totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Form aggiunta posizione */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-bg-soft border border-border-subtle rounded-xl p-4 space-y-3"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder={t('proUtilities.portfolio.symbol') || 'Simbolo'}
              value={newPosition.symbol}
              onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value })}
              className="rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder={t('proUtilities.portfolio.quantity') || 'Quantità'}
              value={newPosition.quantity}
              onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
              className="rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.01"
              placeholder={t('proUtilities.portfolio.price') || 'Prezzo'}
              value={newPosition.price}
              onChange={(e) => setNewPosition({ ...newPosition, price: e.target.value })}
              className="rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <textarea
              placeholder={t('proUtilities.portfolio.notes') || 'Note (opzionale)'}
              value={newPosition.notes}
              onChange={(e) => setNewPosition({ ...newPosition, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-accent hover:bg-accent-hover text-white py-2 px-4 text-sm font-medium transition-colors"
            >
              {t('proUtilities.portfolio.add') || 'Aggiungi'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewPosition({ symbol: '', quantity: '', price: '', notes: '' });
              }}
              className="px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              {t('proUtilities.portfolio.cancel') || 'Annulla'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista posizioni */}
      <div className="space-y-2">
        {positions.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {t('proUtilities.portfolio.empty') || 'Nessuna posizione. Aggiungi la prima posizione.'}
            </p>
          </div>
        ) : (
          positions.map((position) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-soft border border-border-subtle rounded-xl p-4 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-text-primary">{position.symbol}</h4>
                    <span className="text-xs text-text-tertiary">
                      {position.quantity} × €{position.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-text-tertiary">
                        {t('proUtilities.portfolio.total') || 'Totale'}
                      </p>
                      <p className="text-sm font-semibold text-text-primary">
                        €{position.total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    {position.change !== 0 && (
                      <div>
                        <p className="text-xs text-text-tertiary">
                          {t('proUtilities.portfolio.change') || 'Variazione'}
                        </p>
                        <div className="flex items-center gap-1">
                          {position.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <p className={cn(
                            'text-sm font-semibold',
                            position.change >= 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {position.change >= 0 ? '+' : ''}€{position.change.toFixed(2)} ({position.changePercent >= 0 ? '+' : ''}{position.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(position.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  aria-label={t('proUtilities.portfolio.delete') || 'Elimina'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

