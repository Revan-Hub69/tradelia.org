'use client';

import { useMemo } from 'react';
import { PieChart, PieChartData } from './PieChart';
import { BarChart, BarChartData } from './BarChart';
import { LineChart, LineChartData } from './LineChart';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

/**
 * Expense Charts Component
 * Grafici per spese: categorie, trends, distribuzione
 * Riferimento: Few (2006) - Information Dashboard Design
 */
export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Category Distribution
  const categoryData: PieChartData[] = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        name: category,
        value: total,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Monthly Trends
  const monthlyTrendData: LineChartData[] = useMemo(() => {
    const monthly = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        name: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        total: Math.round(total * 100) / 100,
      }));
  }, [expenses]);

  // Top Categories
  const topCategoriesData: BarChartData[] = useMemo(() => {
    return categoryData.slice(0, 5).map((cat) => ({
      name: cat.name,
      amount: cat.value,
    }));
  }, [categoryData]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgMonthly = monthlyTrendData.length > 0
    ? monthlyTrendData.reduce((sum, m) => sum + (m.total as number), 0) / monthlyTrendData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Spese Totali</p>
          <p className="text-2xl font-bold text-text-primary">
            €{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Media Mensile</p>
          <p className="text-2xl font-bold text-text-primary">
            €{avgMonthly.toFixed(2)}
          </p>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Categorie</p>
          <p className="text-2xl font-bold text-text-primary">
            {categoryData.length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Distribuzione per Categoria
            </h3>
            <PieChart data={categoryData} height={300} showLabel />
          </div>
        )}

        {/* Monthly Trends */}
        {monthlyTrendData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Trend Mensile
            </h3>
            <LineChart
              data={monthlyTrendData}
              lines={[{ key: 'total', label: 'Spese Mensili', color: '#3b82f6' }]}
              height={300}
            />
          </div>
        )}

        {/* Top Categories */}
        {topCategoriesData.length > 0 && (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Top 5 Categorie
            </h3>
            <BarChart
              data={topCategoriesData}
              bars={[{ key: 'amount', label: 'Importo', color: '#3b82f6' }]}
              height={250}
            />
          </div>
        )}
      </div>
    </div>
  );
}

