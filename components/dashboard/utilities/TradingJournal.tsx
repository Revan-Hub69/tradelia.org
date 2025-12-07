'use client';

import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { TradingJournalCharts } from '@/components/charts/TradingJournalCharts';
import { format } from 'date-fns';
import { MethodologyNotes } from './MethodologyNotes';

interface Trade {
  id: string;
  symbol: string;
  entry_date: string;
  exit_date?: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  trade_type: 'buy' | 'sell' | 'long' | 'short';
  strategy?: string;
  notes?: string;
  is_closed: boolean;
}

/**
 * Trading Journal
 * Registra e analizza tutte le tue operazioni di trading
 * PRO ONLY - Strumento essenziale per trader professionisti
 */
export function TradingJournal() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    entry_price: '',
    quantity: '',
    trade_type: 'long' as 'long' | 'short',
    strategy: '',
    notes: '',
  });

  const { data: tradesData, loading, error, retry } = useApi<Trade[]>(
    '/api/trading-journal',
    {
      cacheTime: 2 * 60 * 1000,
    }
  );

  const trades = Array.isArray(tradesData) ? tradesData : [];

  // Statistiche
  const stats = {
    totalTrades: trades.length,
    closedTrades: trades.filter(t => t.is_closed).length,
    openTrades: trades.filter(t => !t.is_closed).length,
    totalPnL: trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    winRate: (() => {
      const closed = trades.filter(t => t.is_closed && t.profit_loss !== null);
      if (closed.length === 0) return 0;
      const wins = closed.filter(t => (t.profit_loss || 0) > 0).length;
      return (wins / closed.length) * 100;
    })(),
    avgWin: (() => {
      const wins = trades.filter(t => t.is_closed && (t.profit_loss || 0) > 0);
      if (wins.length === 0) return 0;
      return wins.reduce((sum, t) => sum + (t.profit_loss || 0), 0) / wins.length;
    })(),
    avgLoss: (() => {
      const losses = trades.filter(t => t.is_closed && (t.profit_loss || 0) < 0);
      if (losses.length === 0) return 0;
      return losses.reduce((sum, t) => sum + (t.profit_loss || 0), 0) / losses.length;
    })(),
  };

  const handleSaveTrade = async () => {
    // Validazione input
    if (!newTrade.symbol || !newTrade.symbol.trim()) {
      toast.error('Inserisci un simbolo valido');
      return;
    }
    
    const entryPrice = parseFloat(newTrade.entry_price);
    const quantity = parseFloat(newTrade.quantity);
    
    if (isNaN(entryPrice) || entryPrice <= 0) {
      toast.error('Inserisci un prezzo di entry valido');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Inserisci una quantità valida');
      return;
    }

    try {
      const url = editingTrade ? `/api/trading-journal/${editingTrade.id}` : '/api/trading-journal';
      const method = editingTrade ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newTrade.symbol.trim().toUpperCase(),
          entry_date: newTrade.entry_date,
          entry_price: entryPrice,
          quantity: quantity,
          trade_type: newTrade.trade_type,
          strategy: newTrade.strategy?.trim() || null,
          notes: newTrade.notes?.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Errore salvataggio trade');

      toast.success(editingTrade ? 'Trade aggiornato' : 'Trade aggiunto');
      setShowAddModal(false);
      setEditingTrade(null);
      setNewTrade({
        symbol: '',
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        entry_price: '',
        quantity: '',
        trade_type: 'long',
        strategy: '',
        notes: '',
      });
      retry();
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error('Errore salvataggio trade');
    }
  };

  const handleCloseTrade = async (trade: Trade) => {
    const exitPrice = prompt(`Prezzo di uscita per ${trade.symbol}:`);
    if (!exitPrice || isNaN(parseFloat(exitPrice))) return;

    const exitPriceNum = parseFloat(exitPrice);
    const profitLoss = trade.trade_type === 'long'
      ? (exitPriceNum - trade.entry_price) * trade.quantity
      : (trade.entry_price - exitPriceNum) * trade.quantity;
    const profitLossPercent = (profitLoss / (trade.entry_price * trade.quantity)) * 100;

    try {
      const response = await fetch(`/api/trading-journal/${trade.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_date: format(new Date(), 'yyyy-MM-dd'),
          exit_price: exitPriceNum,
          profit_loss: profitLoss,
          profit_loss_percent: profitLossPercent,
          is_closed: true,
        }),
      });

      if (!response.ok) throw new Error('Errore chiusura trade');

      toast.success('Trade chiuso');
      retry();
    } catch (error) {
      console.error('Error closing trade:', error);
      toast.error('Errore chiusura trade');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm('Eliminare questo trade?')) return;

    try {
      const response = await fetch(`/api/trading-journal/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Errore eliminazione trade');

      toast.success('Trade eliminato');
      retry();
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error('Errore eliminazione trade');
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Caricamento journal...</div>;
  }

  if (error) {
    return <div className="text-error">Errore caricamento journal</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>Trading Journal</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Registra e analizza tutte le tue operazioni per migliorare le performance
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">Trading Journal:</strong> Strumento fondamentale per trader professionisti. 
          Traccia ogni trade per identificare pattern, migliorare strategie e calcolare metriche di performance.
        </p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-text-secondary mb-1">Totale Trades</div>
          <div className="text-lg sm:text-2xl font-bold text-text-primary">{stats.totalTrades}</div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-text-secondary mb-1">Win Rate</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-text-secondary mb-1">P&L Totale</div>
          <div className={`text-lg sm:text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalPnL)}
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-text-secondary mb-1">Trades Aperti</div>
          <div className="text-lg sm:text-2xl font-bold text-text-primary">{stats.openTrades}</div>
        </div>
      </div>

      {/* Charts */}
      {trades.length > 0 && <TradingJournalCharts trades={trades} />}

      {/* Add Trade Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Aggiungi Trade
      </button>

      {/* Trades List */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Trades</h3>
        {trades.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessun trade registrato</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-accent/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary">{trade.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${trade.trade_type === 'long' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                      {trade.trade_type === 'long' ? 'LONG' : 'SHORT'}
                    </span>
                    {!trade.is_closed && (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400">
                        APERTO
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-text-secondary">
                    Entry: {formatCurrency(trade.entry_price)} × {trade.quantity} • {format(new Date(trade.entry_date), 'dd/MM/yyyy')}
                    {trade.is_closed && trade.exit_price && (
                      <> • Exit: {formatCurrency(trade.exit_price)} • {format(new Date(trade.exit_date || trade.entry_date), 'dd/MM/yyyy')}</>
                    )}
                  </div>
                  {trade.strategy && (
                    <div className="text-xs text-text-secondary mt-1">Strategia: {trade.strategy}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {trade.is_closed && trade.profit_loss !== null && trade.profit_loss !== undefined && (
                    <div className={`text-base sm:text-lg font-bold ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(trade.profit_loss)}
                      {trade.profit_loss_percent && (
                        <span className="text-xs ml-1">({trade.profit_loss_percent > 0 ? '+' : ''}{trade.profit_loss_percent.toFixed(2)}%)</span>
                      )}
                    </div>
                  )}
                  {!trade.is_closed && (
                    <button
                      onClick={() => handleCloseTrade(trade)}
                      className="px-3 py-1.5 text-xs bg-accent/20 hover:bg-accent/30 text-blue-400 rounded-lg transition-colors"
                    >
                      Chiudi Trade
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTrade(trade.id)}
                    className="p-2 rounded-lg hover:bg-error/20 text-text-secondary hover:text-error transition-colors"
                    aria-label="Elimina trade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-bg-surface pb-2 border-b border-border-subtle">
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
                {editingTrade ? 'Modifica Trade' : 'Nuovo Trade'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTrade(null);
                }}
                className="p-1 rounded-lg hover:bg-bg-soft text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
                  <span>Simbolo *</span>
                  <Tooltip content="Il simbolo dell'asset che stai tradando (es. AAPL, EURUSD, BTC).">
                    <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL"
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Entry Price *</label>
                  <input
                    type="number"
                    value={newTrade.entry_price}
                    onChange={(e) => setNewTrade({ ...newTrade, entry_price: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Quantità *</label>
                  <input
                    type="number"
                    value={newTrade.quantity}
                    onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    step="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Tipo Trade *</label>
                <select
                  value={newTrade.trade_type}
                  onChange={(e) => setNewTrade({ ...newTrade, trade_type: e.target.value as 'long' | 'short' })}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="long">Long (Compra)</option>
                  <option value="short">Short (Vendi)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Data Entry *</label>
                <input
                  type="date"
                  value={newTrade.entry_date}
                  onChange={(e) => setNewTrade({ ...newTrade, entry_date: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Strategia</label>
                <input
                  type="text"
                  value={newTrade.strategy}
                  onChange={(e) => setNewTrade({ ...newTrade, strategy: e.target.value })}
                  placeholder="Breakout, Reversal, etc."
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Note</label>
                <textarea
                  value={newTrade.notes}
                  onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                  placeholder="Note sul trade..."
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6 sticky bottom-0 bg-bg-surface pt-4 border-t border-border-subtle -mx-4 sm:-mx-6 px-4 sm:px-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTrade(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveTrade}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors text-sm font-medium"
              >
                {editingTrade ? 'Aggiorna' : 'Aggiungi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Trading Journal"
        formulas={[
          {
            name: 'Profit/Loss (Long)',
            formula: 'P&L = (Exit Price - Entry Price) × Quantity',
            description: 'Per posizioni long, profitto quando exit > entry'
          },
          {
            name: 'Profit/Loss (Short)',
            formula: 'P&L = (Entry Price - Exit Price) × Quantity',
            description: 'Per posizioni short, profitto quando exit < entry'
          },
          {
            name: 'Win Rate',
            formula: 'Win Rate = (Winning Trades / Total Closed Trades) × 100%',
            description: 'Percentuale di trade chiusi in profitto'
          },
          {
            name: 'Average Win',
            formula: 'Avg Win = Σ(Winning P&L) / Count(Winning Trades)',
            description: 'Profitto medio per trade vincente'
          },
          {
            name: 'Average Loss',
            formula: 'Avg Loss = Σ(Losing P&L) / Count(Losing Trades)',
            description: 'Perdita media per trade perdente'
          },
        ]}
        assumptions={[
          'Tutti i trade sono registrati accuratamente',
          'Prezzi di entry/exit sono quelli effettivi di esecuzione',
          'Commissioni e spread possono essere inclusi nel P&L',
          'Metriche calcolate solo su trade chiusi',
        ]}
        references={[
          'Covel, M. W. (2009). Trend Following: How Great Traders Make Millions in Up or Down Markets. FT Press.',
          'Tharp, V. K. (2007). Trade Your Way to Financial Freedom. McGraw-Hill.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />
    </div>
  );
}
