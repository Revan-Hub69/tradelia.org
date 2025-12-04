'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Percent, Calendar, ArrowRight, Save, History, Trash2, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencySymbols } from '@/lib/currency/config';
import { Tooltip } from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

type CalculationType = 'compound' | 'present' | 'future' | 'annuity';

interface CalculationResult {
  type: CalculationType;
  result: number;
  inputs: Record<string, number>;
}

export function FinancialCalculator() {
  const { t } = useTranslations();
  const formatCurrency = useFormatCurrency();
  const { currency } = useCurrency();
  const [calcType, setCalcType] = useState<CalculationType>('compound');
  const [inputs, setInputs] = useState({
    principal: '',
    rate: '',
    time: '',
    payment: '',
    futureValue: '',
  });
  const [result, setResult] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch saved calculations
  const { data: savedCalculations, loading: historyLoading, retry: refreshHistory } = useApi<any[]>(
    showHistory ? `/api/utilities/calculations?type=${calcType}` : null,
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  const calculateCompoundInterest = () => {
    const P = parseFloat(inputs.principal);
    const r = parseFloat(inputs.rate) / 100;
    const t = parseFloat(inputs.time);
    
    if (!P || !r || !t) return;
    
    const A = P * Math.pow(1 + r, t);
    setResult(A);
  };

  const calculatePresentValue = () => {
    const FV = parseFloat(inputs.futureValue);
    const r = parseFloat(inputs.rate) / 100;
    const t = parseFloat(inputs.time);
    
    if (!FV || !r || !t) return;
    
    const PV = FV / Math.pow(1 + r, t);
    setResult(PV);
  };

  const calculateFutureValue = () => {
    const PV = parseFloat(inputs.principal);
    const r = parseFloat(inputs.rate) / 100;
    const t = parseFloat(inputs.time);
    
    if (!PV || !r || !t) return;
    
    const FV = PV * Math.pow(1 + r, t);
    setResult(FV);
  };

  const calculateAnnuity = () => {
    const PMT = parseFloat(inputs.payment);
    const r = parseFloat(inputs.rate) / 100;
    const t = parseFloat(inputs.time);
    
    if (!PMT || !r || !t) return;
    
    const FV = PMT * ((Math.pow(1 + r, t) - 1) / r);
    setResult(FV);
  };

  const handleCalculate = () => {
    switch (calcType) {
      case 'compound':
        calculateCompoundInterest();
        break;
      case 'present':
        calculatePresentValue();
        break;
      case 'future':
        calculateFutureValue();
        break;
      case 'annuity':
        calculateAnnuity();
        break;
    }
  };

  const handleSaveCalculation = async () => {
    if (result === null) {
      toast.error(t('proUtilities.calculator.errors.noResult') || 'Calcola prima un risultato');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/utilities/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculation_type: calcType,
          inputs: {
            principal: inputs.principal ? parseFloat(inputs.principal) : null,
            rate: inputs.rate ? parseFloat(inputs.rate) : null,
            time: inputs.time ? parseFloat(inputs.time) : null,
            payment: inputs.payment ? parseFloat(inputs.payment) : null,
            futureValue: inputs.futureValue ? parseFloat(inputs.futureValue) : null,
          },
          result,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore salvataggio calcolo');
      }

      toast.success(t('proUtilities.calculator.saved') || 'Calcolo salvato con successo');
      setNotes('');
      if (showHistory) {
        refreshHistory();
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error(t('proUtilities.calculator.errors.saveFailed') || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCalculation = async (id: string) => {
    if (!confirm(t('proUtilities.calculator.confirmDelete') || 'Eliminare questo calcolo?')) return;

    try {
      const response = await fetch(`/api/utilities/calculations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore eliminazione calcolo');
      }

      toast.success(t('proUtilities.calculator.deleted') || 'Calcolo eliminato');
      refreshHistory();
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast.error(t('proUtilities.calculator.errors.deleteFailed') || 'Errore durante l\'eliminazione');
    }
  };

  const handleLoadCalculation = (calc: any) => {
    setInputs({
      principal: calc.inputs.principal?.toString() || '',
      rate: calc.inputs.rate?.toString() || '',
      time: calc.inputs.time?.toString() || '',
      payment: calc.inputs.payment?.toString() || '',
      futureValue: calc.inputs.futureValue?.toString() || '',
    });
    setResult(calc.result);
    setNotes(calc.notes || '');
    setShowHistory(false);
  };

  const calcTypes = [
    {
      id: 'compound' as CalculationType,
      label: t('proUtilities.calculator.types.compound') || 'Interesse Composto',
      icon: TrendingUp,
      description: t('proUtilities.calculator.types.compoundDesc') || 'Calcola il valore futuro con interesse composto',
    },
    {
      id: 'present' as CalculationType,
      label: t('proUtilities.calculator.types.present') || 'Valore Attuale',
      icon: DollarSign,
      description: t('proUtilities.calculator.types.presentDesc') || 'Calcola il valore attuale di un importo futuro',
    },
    {
      id: 'future' as CalculationType,
      label: t('proUtilities.calculator.types.future') || 'Valore Futuro',
      icon: Calendar,
      description: t('proUtilities.calculator.types.futureDesc') || 'Calcola il valore futuro di un investimento',
    },
    {
      id: 'annuity' as CalculationType,
      label: t('proUtilities.calculator.types.annuity') || 'Rendita',
      icon: Percent,
      description: t('proUtilities.calculator.types.annuityDesc') || 'Calcola il valore futuro di una rendita',
    },
  ];

  const getInputFields = () => {
    switch (calcType) {
      case 'compound':
        return (
          <>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.principal') || `Capitale Iniziale (${currencySymbols[currency]})`}</span>
                <Tooltip content="L'importo iniziale che investi. Questo è il capitale di partenza su cui verrà calcolato l'interesse composto.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.principal}
                onChange={(e) => setInputs({ ...inputs, principal: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}</span>
                <Tooltip content="Il tasso di interesse annuo espresso in percentuale. Esempio: 5% significa che ogni anno guadagni il 5% sul capitale investito.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.rate}
                onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="5"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.time') || 'Anni'}</span>
                <Tooltip content="Il numero di anni per cui l'investimento crescerà. Più lungo è il periodo, maggiore sarà l'effetto dell'interesse composto.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.time}
                onChange={(e) => setInputs({ ...inputs, time: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="10"
              />
            </div>
          </>
        );
      case 'present':
        return (
          <>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.futureValue') || `Valore Futuro (${currencySymbols[currency]})`}</span>
                <Tooltip content="L'importo che vuoi ottenere in futuro. Il calcolatore ti dirà quanto devi investire oggi per raggiungere questo obiettivo.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.futureValue}
                onChange={(e) => setInputs({ ...inputs, futureValue: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}</span>
                <Tooltip content="Il tasso di interesse annuo atteso. Usato per scontare il valore futuro al presente.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.rate}
                onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="5"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.time') || 'Anni'}</span>
                <Tooltip content="Il numero di anni fino a quando riceverai il valore futuro.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.time}
                onChange={(e) => setInputs({ ...inputs, time: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="10"
              />
            </div>
          </>
        );
      case 'future':
        return (
          <>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.principal') || `Valore Presente (${currencySymbols[currency]})`}</span>
                <Tooltip content="L'importo che investi oggi. Il calcolatore ti mostrerà quanto varrà questo investimento in futuro.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.principal}
                onChange={(e) => setInputs({ ...inputs, principal: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}</span>
                <Tooltip content="Il tasso di crescita annuo atteso del tuo investimento.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.rate}
                onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="5"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.time') || 'Anni'}</span>
                <Tooltip content="Il periodo di investimento in anni.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.time}
                onChange={(e) => setInputs({ ...inputs, time: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="10"
              />
            </div>
          </>
        );
      case 'annuity':
        return (
          <>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.payment') || `Pagamento Periodico (${currencySymbols[currency]})`}</span>
                <Tooltip content="L'importo che investi periodicamente (mensile, trimestrale o annuale). Questo è l'importo fisso che versi ogni periodo.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.payment}
                onChange={(e) => setInputs({ ...inputs, payment: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}</span>
                <Tooltip content="Il tasso di interesse annuo. Usato per calcolare quanto crescerà ogni pagamento periodico.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.rate}
                onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="5"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block flex items-center gap-1.5">
                <span>{t('proUtilities.calculator.time') || 'Anni'}</span>
                <Tooltip content="Il numero di anni per cui effettuerai i pagamenti periodici.">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.time}
                onChange={(e) => setInputs({ ...inputs, time: e.target.value })}
                className="w-full rounded-lg bg-bg-soft border border-border-subtle px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="10"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary">
            {t('proUtilities.calculator.title') || 'Calcolatrice Finanziaria'}
          </h3>
          <p className="text-xs text-text-tertiary">
            {t('proUtilities.calculator.subtitle') || 'Calcoli finanziari avanzati'}
          </p>
        </div>
      </div>

      {/* Tipo di calcolo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {calcTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => {
                setCalcType(type.id);
                setResult(null);
                setInputs({ principal: '', rate: '', time: '', payment: '', futureValue: '' });
              }}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                calcType === type.id
                  ? 'bg-accent/10 border-accent/40 shadow-md'
                  : 'bg-bg-soft border-border-subtle hover:border-accent/20'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 mb-2',
                calcType === type.id ? 'text-accent' : 'text-text-tertiary'
              )} />
              <h4 className={cn(
                'text-sm font-semibold mb-1',
                calcType === type.id ? 'text-text-primary' : 'text-text-secondary'
              )}>
                {type.label}
              </h4>
              <p className="text-xs text-text-tertiary">{type.description}</p>
              {calcType === type.id && (
                <div className="mt-2 pt-2 border-t border-border-subtle">
                  <p className="text-xs text-text-tertiary italic">
                    {type.id === 'compound' && 'Formula: A = P(1 + r)^t'}
                    {type.id === 'present' && 'Formula: PV = FV / (1 + r)^t'}
                    {type.id === 'future' && 'Formula: FV = PV(1 + r)^t'}
                    {type.id === 'annuity' && 'Formula: FV = PMT × (((1 + r)^t - 1) / r)'}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Input fields - Mobile optimized */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4">
        {getInputFields()}
        <button
          onClick={handleCalculate}
          className="w-full rounded-lg bg-accent hover:bg-accent-hover text-white py-2.5 sm:py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('proUtilities.calculator.calculate') || 'Calcola'}
        </button>
      </div>

      {/* Result - Mobile optimized */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30 rounded-xl p-4 sm:p-6 space-y-4"
        >
          <div>
            <p className="text-xs text-text-tertiary mb-2">
              {t('proUtilities.calculator.result') || 'Risultato'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-text-primary">
              {formatCurrency(result)}
            </p>
          </div>
          
          {/* Save Section */}
          <div className="space-y-2 pt-4 border-t border-accent/20">
            <label className="text-xs text-text-tertiary block">
              {t('proUtilities.calculator.notes') || 'Note (opzionale)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('proUtilities.calculator.notesPlaceholder') || 'Aggiungi una nota per questo calcolo...'}
              className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
              rows={2}
            />
            <button
              onClick={handleSaveCalculation}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? (t('common.saving') || 'Salvataggio...') : (t('proUtilities.calculator.save') || 'Salva Calcolo')}
            </button>
          </div>
        </motion.div>
      )}

      {/* History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bg-soft border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
      >
        <History className="w-4 h-4" />
        {showHistory ? (t('proUtilities.calculator.hideHistory') || 'Nascondi Cronologia') : (t('proUtilities.calculator.showHistory') || 'Mostra Cronologia')}
      </button>

      {/* History Modal */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{t('proUtilities.calculator.history') || 'Cronologia Calcoli'}</span>
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
          ) : !savedCalculations || savedCalculations.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('proUtilities.calculator.noHistory') || 'Nessun calcolo salvato'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="bg-bg-surface border border-border-subtle rounded-lg p-3 sm:p-4 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-text-primary mb-1 break-words">
                        {calcTypes.find(t => t.id === calc.calculation_type)?.label || calc.calculation_type}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {new Date(calc.created_at).toLocaleString('it-IT')}
                      </div>
                      {calc.notes && (
                        <div className="text-xs text-text-secondary mt-1 italic break-words">
                          {calc.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoadCalculation(calc)}
                        className="p-1.5 rounded-lg hover:bg-accent/20 text-accent transition-colors"
                        title={t('proUtilities.calculator.load') || 'Carica'}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCalculation(calc.id)}
                        className="p-1.5 rounded-lg hover:bg-error/20 text-error transition-colors"
                        title={t('common.delete') || 'Elimina'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-accent">
                    {formatCurrency(calc.result)}
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

