'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Target, Calendar, DollarSign, BarChart3, Save, History, Trash2, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencySymbols } from '@/lib/currency/config';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { MethodologyNotes } from './MethodologyNotes';
import { PACReturnSuggestions } from './PACReturnSuggestions';

/**
 * PAC Simulator (Piano di Accumulo Capitale)
 * Simula investimenti periodici con interesse composto
 * 100% GRATIS - Solo calcoli matematici
 */
export function PACSimulator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const { currency } = useCurrency();
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

    // Calcolo interesse composto (rendita)
    // FV = PMT * (((1 + r)^n - 1) / r)
    // Con protezione da divisione per zero
    const futureValue = periodReturn > 0
      ? amount * (((Math.pow(1 + periodReturn, totalPeriods) - 1) / periodReturn))
      : amount * totalPeriods; // Se r = 0, FV = PMT * n
    const totalInvested = amount * totalPeriods;
    const totalReturn = futureValue - totalInvested;
    const returnPercentage = (totalReturn / totalInvested) * 100;

    // Calcola per ogni anno
    const yearlyData = [];
    for (let year = 1; year <= periods; year++) {
      const yearPeriods = year * periodsPerYear;
      const yearFV = periodReturn > 0
        ? amount * (((Math.pow(1 + periodReturn, yearPeriods) - 1) / periodReturn))
        : amount * yearPeriods; // Se r = 0, FV = PMT * n
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
    // Con protezione da divisione per zero
    const monthlyPayment = periodReturn > 0 && Math.pow(1 + periodReturn, totalPeriods) > 1
      ? target * (periodReturn / (Math.pow(1 + periodReturn, totalPeriods) - 1))
      : target / totalPeriods; // Se r = 0 o n = 0, PMT = FV / n

    return {
      monthly: monthlyPayment,
      yearly: monthlyPayment * 12,
      totalInvested: monthlyPayment * totalPeriods,
    };
  }, [targetAmount, targetYears, targetReturn]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
          <span>{t('proUtilities.pacSimulator.title') || 'Simulatore PAC'}</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          {t('proUtilities.pacSimulator.description') || 'Simula il tuo Piano di Accumulo Capitale e calcola il valore futuro'}
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">PAC (Piano di Accumulo Capitale):</strong> Strategia di investimento che prevede versamenti periodici costanti.
          L'interesse composto fa crescere il capitale nel tempo. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Simulatore PAC"
        formulas={[
          {
            name: 'Valore Futuro Rendita',
            formula: 'FV = PMT × (((1 + r)^n - 1) / r)',
            description: 'FV = Valore futuro, PMT = Pagamento periodico, r = Tasso periodico, n = Numero periodi. Se r = 0: FV = PMT × n'
          },
          {
            name: 'Pagamento Richiesto (Inversa)',
            formula: 'PMT = FV × (r / ((1 + r)^n - 1))',
            description: 'Calcola quanto investire periodicamente per raggiungere un obiettivo. Se r = 0: PMT = FV / n'
          },
          {
            name: 'Tasso Periodico',
            formula: 'r_periodico = r_annuo / periodi_per_anno',
            description: 'Converte tasso annuo in tasso per periodo (mensile, trimestrale, annuale)'
          },
        ]}
        assumptions={[
          'Tasso di rendimento costante nel tempo',
          'Pagamenti periodici costanti e puntuali',
          'Capitalizzazione continua',
          'Nessun costo di gestione o commissioni',
          'Nessuna tassazione considerata',
        ]}
        references={[
          'Bodie, Z., Kane, A., & Marcus, A. J. (2021). Investments. McGraw-Hill.',
          'Brigham, E. F., & Houston, J. F. (2019). Fundamentals of Financial Management. Cengage.',
        ]}
        version="1.0.0"
        lastUpdated="2025-01-27"
      />

      {/* Info Box */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-secondary">
          <strong className="text-text-primary">PAC (Piano di Accumulo Capitale):</strong> Strategia di investimento che prevede versamenti periodici costanti. 
          L'interesse composto fa crescere il capitale nel tempo. Passa il mouse sui campi per maggiori informazioni.
        </p>
      </div>

      {/* Simulazione PAC */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
          <span>{t('proUtilities.pacSimulator.simulation') || 'Simulazione PAC'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.monthlyAmount') || 'Importo Periodico'} *</span>
              <Tooltip content="L'importo che investi ad ogni versamento. Può essere mensile, trimestrale o annuale a seconda della frequenza scelta.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.frequency') || 'Frequenza'}</span>
              <Tooltip content="Quanto spesso effettui i versamenti: mensile (12 volte l'anno), trimestrale (4 volte) o annuale (1 volta).">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
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
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.annualReturn') || 'Rendimento Annuo (%)'} *</span>
              <Tooltip content="Il rendimento annuo atteso del tuo investimento. Storicamente, un portafoglio diversificato azionario ha reso circa 7-10% annuo nel lungo termine (con variazioni). Vedi i suggerimenti MIFID compliant qui sotto per valori di riferimento basati su dati accademici.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <div className="relative mb-4">
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">%</span>
            </div>
            {/* Suggerimenti MIFID Compliant */}
            <PACReturnSuggestions
              onSelect={(value) => setAnnualReturn(String(value))}
              currentValue={parseFloat(annualReturn) || 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.years') || 'Anni'} *</span>
              <Tooltip content="Il periodo di investimento in anni. Più lungo è il periodo, maggiore sarà l'effetto dell'interesse composto e del tempo sul tuo capitale.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.totalInvested') || 'Totale Investito'}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-text-primary">
                  {formatCurrency(results.totalInvested)}
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.futureValue') || 'Valore Futuro'}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-400">
                  {formatCurrency(results.futureValue)}
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.totalReturn') || 'Guadagno Totale'}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-400">
                  {formatCurrency(results.totalReturn)}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  ({results.returnPercentage.toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Grafico semplificato - Mobile optimized */}
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-text-primary mb-3">
                {t('proUtilities.pacSimulator.evolution') || 'Evoluzione nel Tempo'}
              </h4>
              <div className="space-y-2">
                {results.yearlyData
                  .filter((_, i) => i % Math.max(1, Math.floor(results.yearlyData.length / 10)) === 0 || i === results.yearlyData.length - 1)
                  .map((data) => (
                    <div key={data.year} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="w-16 text-xs text-text-secondary flex-shrink-0">Anno {data.year}</div>
                      <div className="flex-1 w-full sm:w-auto bg-bg-soft rounded-full h-4 sm:h-6 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.value / results.futureValue) * 100}%` }}
                          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
                        />
                      </div>
                      <div className="w-full sm:w-32 text-xs text-text-secondary text-left sm:text-right">
                        {formatCurrency(data.value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calcolatore Obiettivo Inverso */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
          <span>{t('proUtilities.pacSimulator.goalCalculator') || 'Calcolatore Obiettivo'}</span>
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary mb-4">
          {t('proUtilities.pacSimulator.goalDescription') || 'Calcola quanto investire mensilmente per raggiungere un obiettivo'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.targetAmount') || `Obiettivo (${currencySymbols[currency]})`} *</span>
              <Tooltip content="L'importo totale che vuoi raggiungere. Il calcolatore ti dirà quanto devi investire periodicamente per raggiungere questo obiettivo.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.targetYears') || 'Anni'} *</span>
              <Tooltip content="In quanti anni vuoi raggiungere l'obiettivo. Più tempo hai, minore sarà l'importo periodico necessario.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
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
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <span>{t('proUtilities.pacSimulator.targetReturn') || 'Rendimento Annuo (%)'} *</span>
              <Tooltip content="Il rendimento annuo atteso. Usato per calcolare quanto devi investire per raggiungere l'obiettivo.">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary hover:text-text-secondary cursor-help" />
              </Tooltip>
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
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.monthlyRequired') || 'Investimento Mensile'}
                </div>
                <div className="text-lg sm:text-xl font-bold text-blue-400">
                  {formatCurrency(requiredInvestment.monthly)}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.yearlyRequired') || 'Investimento Annuo'}
                </div>
                <div className="text-lg sm:text-xl font-bold text-text-primary">
                  {formatCurrency(requiredInvestment.yearly)}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-text-secondary mb-1">
                  {t('proUtilities.pacSimulator.totalRequired') || 'Totale Investito'}
                </div>
                <div className="text-lg sm:text-xl font-bold text-text-primary">
                  {formatCurrency(requiredInvestment.totalInvested)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Simulation Button */}
      {results && (
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
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

      {/* History Modal - Mobile optimized */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{t('proUtilities.pacSimulator.history') || 'Cronologia Simulazioni'}</span>
            </h4>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-lg hover:bg-bg-surface transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {historyLoading ? (
            <div className="text-center py-8 text-text-secondary">
              {t('common.loading') || 'Caricamento...'}
            </div>
          ) : !savedSimulations || savedSimulations.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
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
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-text-primary mb-1 break-words">
                        {formatCurrency(sim.monthly_amount)}/{t('proUtilities.pacSimulator.monthly') || 'mese'} × {sim.years} {t('proUtilities.pacSimulator.years') || 'anni'} @ {sim.annual_return}%
                      </div>
                      <div className="text-xs text-text-secondary">
                        {new Date(sim.created_at).toLocaleString('it-IT')}
                      </div>
                      {sim.notes && (
                        <div className="text-xs text-text-secondary mt-1 italic break-words">
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
                      className="p-1.5 rounded-lg hover:bg-error/20 text-error transition-colors flex-shrink-0"
                      title={t('common.delete') || 'Elimina'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2 text-xs sm:text-sm">
                    <div>
                      <div className="text-xs text-text-secondary">Valore Futuro</div>
                      <div className="font-bold text-blue-400 text-sm sm:text-base">
                        {formatCurrency(sim.future_value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary">Investito</div>
                      <div className="font-bold text-text-primary text-sm sm:text-base">
                        {formatCurrency(sim.total_invested)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary">Guadagno</div>
                      <div className="font-bold text-green-400 text-sm sm:text-base">
                        {formatCurrency(sim.total_return)}
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

