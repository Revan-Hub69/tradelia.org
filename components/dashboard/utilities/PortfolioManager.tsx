'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, X, Edit2, Trash2, PieChart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

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
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'AAPL',
      quantity: 10,
      price: 175.50,
      total: 1755.00,
      change: 2.30,
      changePercent: 1.33,
    },
    {
      id: '2',
      symbol: 'MSFT',
      quantity: 5,
      price: 380.25,
      total: 1901.25,
      change: -1.50,
      changePercent: -0.39,
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState({ symbol: '', quantity: '', price: '' });

  const totalValue = positions.reduce((sum, pos) => sum + pos.total, 0);
  const totalChange = positions.reduce((sum, pos) => sum + (pos.change * pos.quantity), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleAdd = () => {
    if (!newPosition.symbol || !newPosition.quantity || !newPosition.price) return;

    const quantity = parseFloat(newPosition.quantity);
    const price = parseFloat(newPosition.price);
    const total = quantity * price;

    const position: Position = {
      id: Date.now().toString(),
      symbol: newPosition.symbol.toUpperCase(),
      quantity,
      price,
      total,
      change: 0,
      changePercent: 0,
    };

    setPositions([...positions, position]);
    setNewPosition({ symbol: '', quantity: '', price: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

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
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
            aria-label={t('proUtilities.portfolio.add') || 'Aggiungi posizione'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-3 gap-3">
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
                setNewPosition({ symbol: '', quantity: '', price: '' });
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

