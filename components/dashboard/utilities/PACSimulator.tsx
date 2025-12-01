'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Target, Calendar, DollarSign, BarChart3, Save, History, Trash2, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

/**
 * PAC Simulator (Piano di Accumulo Capitale)
 * Simula investimenti periodici con interesse composto
 * 100% GRATIS - Solo calcoli matematici
 */
export function PACSimulator() {
  const { t } = useTranslations();
  const [monthlyAmount, setMonthlyAmount] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('7');
  const [years, setYears] = useState('20');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Calcola valore futuro
  const results = useMemo(() => {
    const amount = parseFloat(monthlyAmount) || 0;
    const returnRate = parseFloat(annualReturn) / 100 || 0;
    const periods = parseInt(years) || 0;

    if (amount <= 0 || periods <= 0) {
      return null;
    }

    // Frequenza investimenti
    const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
    const totalPeriods = periods * periodsPerYear;
    const periodReturn = returnRate / periodsPerYear;

    // Calcolo interesse composto
    // FV = PMT * (((1 + r)^n - 1) / r)
    const futureValue = amount * (((Math.pow(1 + periodReturn, totalPeriods) - 1) / periodReturn));
    const totalInvested = amount * totalPeriods;
    const totalReturn = futureValue - totalInvested;
    const returnPercentage = (totalReturn / totalInvested) * 100;

    // Calcola per ogni anno
    const yearlyData = [];
    for (let year = 1; year <= periods; year++) {
      const yearPeriods = year * periodsPerYear;
      const yearFV = amount * (((Math.pow(1 + periodReturn, yearPeriods) - 1) / periodReturn));
      const yearInvested = amount * yearPeriods;
      yearlyData.push({
        year,
        invested: yearInvested,
        value: yearFV,
        return: yearFV - yearInvested,
      });
    }

    return {
      futureValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      yearlyData,
    };
  }, [monthlyAmount, annualReturn, years, frequency]);

  // Calcola obiettivo inverso (quanto investire per raggiungere X)
  const [targetAmount, setTargetAmount] = useState('');
  const [targetYears, setTargetYears] = useState('20');
  const [targetReturn, setTargetReturn] = useState('7');
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch saved simulations
  const { data: savedSimulations, loading: historyLoading, retry: refreshHistory } = useApi<any[]>(
    showHistory ? '/api/utilities/pac-simulations' : null,
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  const requiredInvestment = useMemo(() => {
    const target = parseFloat(targetAmount) || 0;
    const years = parseFloat(targetYears) || 0;
    const returnRate = parseFloat(targetReturn) / 100 || 0;

    if (target <= 0 || years <= 0) {
      return null;
    }

    const periodsPerYear = 12; // Mensile
    const totalPeriods = years * periodsPerYear;
    const periodReturn = returnRate / periodsPerYear;

    // Formula inversa: PMT = FV * (r / ((1 + r)^n - 1))
    const monthlyPayment = target * (periodReturn / (Math.pow(1 + periodReturn, totalPeriods) - 1));

    return {
      monthly: monthlyPayment,
      yearly: monthlyPayment * 12,
      totalInvested: monthlyPayment * totalPeriods,
    };
  }, [targetAmount, targetYears, targetReturn]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          {t('proUtilities.pacSimulator.title') || 'Simulatore PAC'}
        </h2>
        <p className="text-text-secondary text-sm">
          {t('proUtilities.pacSimulator.description') || 'Simula il tuo Piano di Accumulo Capitale e calcola il valore futuro'}
        </p>
      </div>

      {/* Simulazione PAC */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          {t('proUtilities.pacSimulator.simulation') || 'Simulazione PAC'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.monthlyAmount') || 'Importo Periodico'} *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="500"
                className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                min="0"
                step="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.frequency') || 'Frequenza'}
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="monthly">{t('proUtilities.pacSimulator.monthly') || 'Mensile'}</option>
              <option value="quarterly">{t('proUtilities.pacSimulator.quarterly') || 'Trimestrale'}</option>
              <option value="yearly">{t('proUtilities.pacSimulator.yearly') || 'Annuale'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.annualReturn') || 'Rendimento Annuo (%)'} *
            </label>
            <input
              type="number"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
              placeholder="7"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.years') || 'Anni'} *
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="20"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="1"
              max="100"
            />
          </div>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.totalInvested') || 'Totale Investito'}
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  €{results.totalInvested.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.futureValue') || 'Valore Futuro'}
                </div>
                <div className="text-2xl font-bold text-accent">
                  €{results.futureValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.totalReturn') || 'Guadagno Totale'}
                </div>
                <div className="text-2xl font-bold text-green-400">
                  €{results.totalReturn.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  ({results.returnPercentage.toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Grafico semplificato */}
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                {t('proUtilities.pacSimulator.evolution') || 'Evoluzione nel Tempo'}
              </h4>
              <div className="space-y-2">
                {results.yearlyData
                  .filter((_, i) => i % Math.max(1, Math.floor(results.yearlyData.length / 10)) === 0 || i === results.yearlyData.length - 1)
                  .map((data) => (
                    <div key={data.year} className="flex items-center gap-3">
                      <div className="w-16 text-xs text-text-tertiary">Anno {data.year}</div>
                      <div className="flex-1 bg-bg-soft rounded-full h-6 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.value / results.futureValue) * 100}%` }}
                          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
                        />
                      </div>
                      <div className="w-32 text-xs text-text-secondary text-right">
                        €{data.value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calcolatore Obiettivo Inverso */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          {t('proUtilities.pacSimulator.goalCalculator') || 'Calcolatore Obiettivo'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {t('proUtilities.pacSimulator.goalDescription') || 'Calcola quanto investire mensilmente per raggiungere un obiettivo'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.targetAmount') || 'Obiettivo (€)'} *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="100000"
                className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.targetYears') || 'Anni'} *
            </label>
            <input
              type="number"
              value={targetYears}
              onChange={(e) => setTargetYears(e.target.value)}
              placeholder="20"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('proUtilities.pacSimulator.targetReturn') || 'Rendimento Annuo (%)'} *
            </label>
            <input
              type="number"
              value={targetReturn}
              onChange={(e) => setTargetReturn(e.target.value)}
              placeholder="7"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {requiredInvestment && (
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.monthlyRequired') || 'Investimento Mensile'}
                </div>
                <div className="text-xl font-bold text-accent">
                  €{requiredInvestment.monthly.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.yearlyRequired') || 'Investimento Annuo'}
                </div>
                <div className="text-xl font-bold text-text-primary">
                  €{requiredInvestment.yearly.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">
                  {t('proUtilities.pacSimulator.totalRequired') || 'Totale Investito'}
                </div>
                <div className="text-xl font-bold text-text-primary">
                  €{requiredInvestment.totalInvested.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Simulation Button */}
      {results && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary block">
              {t('proUtilities.pacSimulator.notes') || 'Note (opzionale)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('proUtilities.pacSimulator.notesPlaceholder') || 'Aggiungi una nota per questa simulazione...'}
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                const response = await fetch('/api/utilities/pac-simulations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    monthly_amount: parseFloat(monthlyAmount),
                    annual_return: parseFloat(annualReturn),
                    years: parseInt(years),
                    frequency,
                    future_value: results.futureValue,
                    total_invested: results.totalInvested,
                    total_return: results.totalReturn,
                    return_percentage: results.returnPercentage,
                    yearly_data: results.yearlyData,
                    notes: notes.trim() || null,
                  }),
                });

                if (!response.ok) {
                  throw new Error('Errore salvataggio simulazione');
                }

                toast.success(t('proUtilities.pacSimulator.saved') || 'Simulazione salvata con successo');
                setNotes('');
                if (showHistory) {
                  refreshHistory();
                }
              } catch (error) {
                console.error('Error saving simulation:', error);
                toast.error(t('proUtilities.pacSimulator.errors.saveFailed') || 'Errore durante il salvataggio');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? (t('common.saving') || 'Salvataggio...') : (t('proUtilities.pacSimulator.save') || 'Salva Simulazione')}
          </button>
        </div>
      )}

      {/* History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bg-soft border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
      >
        <History className="w-4 h-4" />
        {showHistory ? (t('proUtilities.pacSimulator.hideHistory') || 'Nascondi Cronologia') : (t('proUtilities.pacSimulator.showHistory') || 'Mostra Cronologia')}
      </button>

      {/* History Modal */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <History className="w-5 h-5" />
              {t('proUtilities.pacSimulator.history') || 'Cronologia Simulazioni'}
            </h4>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-lg hover:bg-bg-surface transition-colors"
            >
              <X className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>

          {historyLoading ? (
            <div className="text-center py-8 text-text-tertiary">
              {t('common.loading') || 'Caricamento...'}
            </div>
          ) : !savedSimulations || savedSimulations.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('proUtilities.pacSimulator.noHistory') || 'Nessuna simulazione salvata'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-bg-surface border border-border-subtle rounded-lg p-4 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary mb-1">
                        €{sim.monthly_amount.toLocaleString('it-IT')}/{t('proUtilities.pacSimulator.monthly') || 'mese'} × {sim.years} {t('proUtilities.pacSimulator.years') || 'anni'} @ {sim.annual_return}%
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {new Date(sim.created_at).toLocaleString('it-IT')}
                      </div>
                      {sim.notes && (
                        <div className="text-xs text-text-secondary mt-1 italic">
                          {sim.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(t('proUtilities.pacSimulator.confirmDelete') || 'Eliminare questa simulazione?')) return;
                        try {
                          const response = await fetch(`/api/utilities/pac-simulations/${sim.id}`, {
                            method: 'DELETE',
                          });
                          if (!response.ok) throw new Error('Errore eliminazione');
                          toast.success(t('proUtilities.pacSimulator.deleted') || 'Simulazione eliminata');
                          refreshHistory();
                        } catch (error) {
                          toast.error(t('proUtilities.pacSimulator.errors.deleteFailed') || 'Errore durante l\'eliminazione');
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-error/20 text-error transition-colors"
                      title={t('common.delete') || 'Elimina'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-text-tertiary">Valore Futuro</div>
                      <div className="font-bold text-accent">
                        €{sim.future_value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary">Investito</div>
                      <div className="font-bold text-text-primary">
                        €{sim.total_invested.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary">Guadagno</div>
                      <div className="font-bold text-green-400">
                        €{sim.total_return.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

