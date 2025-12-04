'use client';

import { useState, useEffect, useMemo } from 'react';
import { Wallet, Plus, Trash2, Edit, Filter, Calendar, TrendingDown, PieChart, Download, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { ExpenseCharts } from '@/components/charts/ExpenseCharts';
import { useIsPro } from '@/lib/hooks/useUserRole';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

/**
 * Expense Tracker
 * Gestione spese personali
 * BASE: Visualizzazione limitata
 * PRO: Illimitato, export, analisi avanzate
 */
export function ExpenseTracker() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: expensesData, loading, error, retry } = useApi<Expense[]>(
    `/api/expenses?month=${selectedMonth}`,
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );

  // Assicurati che expensesData sia sempre un array
  const expenses = Array.isArray(expensesData) ? expensesData : [];

  // Filtra per categoria
  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    if (filterCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === filterCategory);
  }, [expenses, filterCategory]);

  // Calcola statistiche
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      average: expenses.length > 0 ? total / expenses.length : 0,
      count: expenses.length,
      byCategory,
      topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
    };
  }, [expenses]);

  const categories = [
    { id: 'food', label: 'Cibo', color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
    { id: 'transport', label: 'Trasporti', color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
    { id: 'shopping', label: 'Shopping', color: 'text-cyan-300', bgColor: 'bg-cyan-500/20' },
    { id: 'bills', label: 'Bollette', color: 'text-red-400', bgColor: 'bg-red-400/20' },
    { id: 'entertainment', label: 'Intrattenimento', color: 'text-green-400', bgColor: 'bg-green-400/20' },
    { id: 'health', label: 'Salute', color: 'text-pink-400', bgColor: 'bg-pink-400/20' },
    { id: 'other', label: 'Altro', color: 'text-gray-400', bgColor: 'bg-gray-400/20' },
  ];

  const handleAddExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error('Importo non valido');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error('Errore aggiunta spesa');
      }

      toast.success('Spesa aggiunta');
      setShowAddModal(false);
      setNewExpense({
        amount: '',
        category: 'food',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      retry();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Errore aggiunta spesa');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Eliminare questa spesa?')) return;

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore eliminazione spesa');
      }

      toast.success('Spesa eliminata');
      retry();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Errore eliminazione spesa');
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || categories[categories.length - 1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-bg-soft rounded-lg animate-pulse mb-2 w-48" />
          <div className="h-4 bg-bg-soft rounded animate-pulse w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-soft border border-border-subtle rounded-xl p-3 md:p-4">
              <div className="h-4 bg-bg-surface rounded mb-2 animate-pulse" />
              <div className="h-6 bg-bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-xl p-6 text-center">
        <p className="text-error mb-4">Errore caricamento spese</p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-error/20 hover:bg-error/30 border border-error/40 text-error rounded-lg text-sm font-medium transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
          <span>{t('proUtilities.expenseTracker.title') || 'Gestione Spese'}</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          {t('proUtilities.expenseTracker.description') || 'Traccia le tue spese e analizza i tuoi consumi'}
        </p>
      </div>

      {/* Statistiche - Mobile-first responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 md:p-4">
          <div className="text-xs md:text-sm text-text-tertiary mb-1">Totale Mensile</div>
          <div className="text-lg md:text-2xl font-bold text-text-primary">
            €{stats.total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 md:p-4">
          <div className="text-xs md:text-sm text-text-tertiary mb-1">Numero Spese</div>
          <div className="text-lg md:text-2xl font-bold text-text-primary">{stats.count}</div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 md:p-4">
          <div className="text-xs md:text-sm text-text-tertiary mb-1">Media per Spesa</div>
          <div className="text-lg md:text-2xl font-bold text-text-primary">
            €{stats.average.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="text-xs md:text-sm text-text-tertiary mb-1">Categoria Top</div>
          <div className="text-lg md:text-2xl font-bold text-text-primary">
            {stats.topCategory ? getCategoryInfo(stats.topCategory.category).label : '—'}
          </div>
        </div>
      </div>

      {/* Filtri - Mobile responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent text-sm"
          >
            <option value="all">Tutte le categorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('proUtilities.expenseTracker.addExpense') || 'Aggiungi Spesa'}
        </button>
      </div>

      {/* Advanced Charts (Pro only) */}
      {isPro && expenses.length > 0 && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
              <span>{t('proUtilities.expenseTracker.advancedCharts') || 'Analisi Avanzate'}</span>
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/expenses/export?month=${selectedMonth}&format=csv`);
                    if (!response.ok) throw new Error('Errore export');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `spese_${selectedMonth}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success(t('proUtilities.expenseTracker.exportSuccess') || 'Export completato');
                  } catch (error) {
                    toast.error(t('proUtilities.expenseTracker.exportError') || 'Errore durante l\'export');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm bg-bg-surface border border-border-subtle hover:border-accent/40 rounded-lg transition-colors flex-1 sm:flex-initial"
              >
                <Download className="w-4 h-4" />
                {t('proUtilities.expenseTracker.export') || 'Esporta CSV'}
              </button>
            </div>
          </div>
          {showCharts && <ExpenseCharts expenses={expenses} />}
        </div>
      )}

      {/* Simple Category Chart (Base) */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <span>Spese per Categoria</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const categoryInfo = getCategoryInfo(category);
                const percentage = (amount / stats.total) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">{categoryInfo.label}</span>
                      <span className="text-sm text-text-secondary">
                        €{amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', categoryInfo.bgColor)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Lista Spese */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Spese</h3>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessuna spesa registrata per questo periodo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', categoryInfo.bgColor, categoryInfo.color)}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm sm:text-base truncate">{expense.description || 'Spesa'}</div>
                      <div className="text-xs sm:text-sm text-text-secondary">
                        {categoryInfo.label} • {format(new Date(expense.date), 'dd MMM yyyy', { locale: locale === 'it' ? itLocale : undefined })}
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-text-primary flex-shrink-0">
                      €{expense.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="self-end sm:self-auto p-2 rounded-lg hover:bg-error/20 text-text-secondary hover:text-error transition-colors flex-shrink-0"
                    aria-label="Elimina spesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal - Mobile optimized */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-bg-surface pb-2 border-b border-border-subtle">
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Aggiungi Spesa</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewExpense({
                    amount: '',
                    category: 'food',
                    description: '',
                    date: format(new Date(), 'yyyy-MM-dd'),
                  });
                }}
                className="p-1 rounded-lg hover:bg-bg-soft text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Importo *</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="50.00"
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Categoria</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Descrizione</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Descrizione spesa"
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Data</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6 sticky bottom-0 bg-bg-surface pt-4 border-t border-border-subtle -mx-4 sm:-mx-6 px-4 sm:px-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewExpense({
                    amount: '',
                    category: 'food',
                    description: '',
                    date: format(new Date(), 'yyyy-MM-dd'),
                  });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleAddExpense}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors text-sm font-medium"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

