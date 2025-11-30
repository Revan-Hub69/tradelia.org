'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Percent, Calendar, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

type CalculationType = 'compound' | 'present' | 'future' | 'annuity';

interface CalculationResult {
  type: CalculationType;
  result: number;
  inputs: Record<string, number>;
}

export function FinancialCalculator() {
  const { t } = useTranslations();
  const [calcType, setCalcType] = useState<CalculationType>('compound');
  const [inputs, setInputs] = useState({
    principal: '',
    rate: '',
    time: '',
    payment: '',
    futureValue: '',
  });
  const [result, setResult] = useState<number | null>(null);

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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.principal') || 'Capitale Iniziale (€)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.time') || 'Anni'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.futureValue') || 'Valore Futuro (€)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.time') || 'Anni'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.principal') || 'Valore Presente (€)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.time') || 'Anni'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.payment') || 'Pagamento Periodico (€)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.rate') || 'Tasso Annuo (%)'}
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
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('proUtilities.calculator.time') || 'Anni'}
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {t('proUtilities.calculator.title') || 'Calcolatrice Finanziaria'}
          </h3>
          <p className="text-xs text-text-tertiary">
            {t('proUtilities.calculator.subtitle') || 'Calcoli finanziari avanzati'}
          </p>
        </div>
      </div>

      {/* Tipo di calcolo */}
      <div className="grid grid-cols-2 gap-3">
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
            </button>
          );
        })}
      </div>

      {/* Input fields */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4">
        {getInputFields()}
        <button
          onClick={handleCalculate}
          className="w-full rounded-lg bg-accent hover:bg-accent-hover text-white py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          {t('proUtilities.calculator.calculate') || 'Calcola'}
        </button>
      </div>

      {/* Result */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30 rounded-xl p-6"
        >
          <p className="text-xs text-text-tertiary mb-2">
            {t('proUtilities.calculator.result') || 'Risultato'}
          </p>
          <p className="text-3xl font-bold text-text-primary">
            €{result.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      )}
    </div>
  );
}

