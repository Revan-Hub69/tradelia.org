'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import {
  assessmentFormSchema,
  type AssessmentFormValues,
  type AssessmentInput,
  marketDomains,
  orderTypes,
  horizonOptions,
  sizeBuckets,
  slippageToleranceOptions,
  regulatoryPreferences,
  baseCurrencies
} from '@/lib/schemas/assessment'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Stepper } from '@/components/ui/Stepper'
import { Card } from '@/components/ui/Card'

const steps = [
  'Mercati',
  'Stile operativo',
  'Vincoli',
  'Piattaforme',
  'Review'
]

const marketLabels: Record<(typeof marketDomains)[number], string> = {
  CRYPTO: 'Crypto',
  CFD: 'CFD',
  EQUITY_ETF: 'Equity & ETF',
  FUTURES: 'Futures',
  BONDS: 'Bonds'
}

const horizonLabels: Record<(typeof horizonOptions)[number], string> = {
  SCALPING: 'Scalping',
  INTRADAY: 'Intraday',
  SWING: 'Swing',
  LONG_TERM: 'Long term'
}

const orderTypeLabels: Record<(typeof orderTypes)[number], string> = {
  MARKET: 'Market',
  LIMIT: 'Limit',
  STOP: 'Stop'
}

const sizeLabels: Record<(typeof sizeBuckets)[number], string> = {
  LT_200: 'Sotto €200',
  '200_TO_1K': '€200 - €1.000',
  '1K_TO_5K': '€1.000 - €5.000',
  GT_5K: 'Oltre €5.000'
}

const slippageLabels: Record<(typeof slippageToleranceOptions)[number], string> = {
  LOW: 'Bassa',
  MEDIUM: 'Media',
  HIGH: 'Alta'
}

const regulatoryLabels: Record<(typeof regulatoryPreferences)[number], string> = {
  EU_ONLY: 'Solo EU',
  GLOBAL_OK: 'Aperto anche extra-EU'
}

const baseCurrencyLabels: Record<(typeof baseCurrencies)[number], string> = {
  EUR: 'EUR',
  USD: 'USD'
}

export function AssessmentWizard() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      markets: [],
      orderTypes: [],
      needsApi: false,
      frequencyPerWeek: 5,
      currentProviders: ''
    }
  })

  const currentValues = watch()

  const reviewItems = useMemo(() => {
    return [
      {
        label: 'Mercati selezionati',
        value:
          currentValues.markets?.map((value) => marketLabels[value]).join(', ') ||
          'Nessun mercato'
      },
      {
        label: 'Orizzonte',
        value: currentValues.horizon ? horizonLabels[currentValues.horizon] : '-'
      },
      {
        label: 'Frequenza settimanale',
        value: currentValues.frequencyPerWeek
          ? `${currentValues.frequencyPerWeek} operazioni`
          : '-'
      },
      {
        label: 'Tipi ordine',
        value:
          currentValues.orderTypes?.map((value) => orderTypeLabels[value]).join(', ') ||
          '-'
      },
      {
        label: 'Bucket size',
        value: currentValues.typicalNotionalBucket
          ? sizeLabels[currentValues.typicalNotionalBucket]
          : '-'
      },
      {
        label: 'Tolleranza slippage',
        value: currentValues.slippageTolerance
          ? slippageLabels[currentValues.slippageTolerance]
          : '-'
      },
      {
        label: 'Vincolo normativo',
        value: currentValues.regulatoryPreference
          ? regulatoryLabels[currentValues.regulatoryPreference]
          : '-'
      },
      {
        label: 'Base currency',
        value: currentValues.baseCurrency
          ? baseCurrencyLabels[currentValues.baseCurrency]
          : '-'
      },
      {
        label: 'Richiesta API',
        value: currentValues.needsApi ? 'Sì' : 'No'
      },
      {
        label: 'Piattaforme attuali',
        value: currentValues.currentProviders
          ? currentValues.currentProviders
          : 'Nessuna indicata'
      }
    ]
  }, [currentValues])

  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [step])

  const goNext = async () => {
    const fieldsByStep: Array<(keyof AssessmentFormValues)[]> = [
      ['markets'],
      [
        'horizon',
        'frequencyPerWeek',
        'orderTypes',
        'typicalNotionalBucket',
        'slippageTolerance'
      ],
      ['regulatoryPreference', 'baseCurrency', 'needsApi'],
      ['currentProviders'],
      []
    ]

    const isValid = await trigger(fieldsByStep[step])
    if (!isValid) return
    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const goBack = () => setStep((prev) => Math.max(prev - 1, 0))

  const onSubmit = async (data: AssessmentFormValues) => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const payload = assessmentFormSchema.parse(data) as AssessmentInput
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Impossibile completare la richiesta.')
      }

      const result = (await response.json()) as { id: string }
      router.push(`/result/${result.id}`)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Errore inatteso durante la richiesta.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="space-y-8" id="wizard">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Wizard multi-step
        </p>
        <Stepper steps={steps} currentStep={step} />
      </div>
      <div className="space-y-6">
        <h3
          ref={stepHeadingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-slate-900 focus:outline-none"
        >
          Step {step + 1}: {steps[step]}
        </h3>
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {marketDomains.map((domain) => (
              <label
                key={domain}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
              >
                <input
                  type="checkbox"
                  value={domain}
                  {...register('markets')}
                  className="h-4 w-4"
                  aria-label={marketLabels[domain]}
                />
                <span>{marketLabels[domain]}</span>
              </label>
            ))}
            {errors.markets && (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {errors.markets.message}
              </p>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-6">
            <Field label="Orizzonte operativo" error={errors.horizon?.message}>
              <select
                {...register('horizon')}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Seleziona orizzonte operativo"
              >
                <option value="">Seleziona</option>
                {horizonOptions.map((option) => (
                  <option key={option} value={option}>
                    {horizonLabels[option]}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Frequenza operazioni settimanali"
              error={errors.frequencyPerWeek?.message}
            >
              <input
                type="number"
                min={1}
                {...register('frequencyPerWeek', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Frequenza settimanale"
              />
            </Field>
            <Field label="Tipi ordine" error={errors.orderTypes?.message as string}>
              <div className="flex flex-wrap gap-3">
                {orderTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      value={type}
                      {...register('orderTypes')}
                      className="h-4 w-4"
                    />
                    {orderTypeLabels[type]}
                  </label>
                ))}
              </div>
            </Field>
            <Field
              label="Bucket dimensione ordine"
              error={errors.typicalNotionalBucket?.message}
            >
              <select
                {...register('typicalNotionalBucket')}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Bucket dimensione ordine"
              >
                <option value="">Seleziona</option>
                {sizeBuckets.map((option) => (
                  <option key={option} value={option}>
                    {sizeLabels[option]}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Tolleranza slippage"
              error={errors.slippageTolerance?.message}
            >
              <select
                {...register('slippageTolerance')}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Tolleranza slippage"
              >
                <option value="">Seleziona</option>
                {slippageToleranceOptions.map((option) => (
                  <option key={option} value={option}>
                    {slippageLabels[option]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-6">
            <Field
              label="Vincolo normativo"
              error={errors.regulatoryPreference?.message}
            >
              <select
                {...register('regulatoryPreference')}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Vincolo normativo"
              >
                <option value="">Seleziona</option>
                {regulatoryPreferences.map((option) => (
                  <option key={option} value={option}>
                    {regulatoryLabels[option]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Base currency" error={errors.baseCurrency?.message}>
              <select
                {...register('baseCurrency')}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                aria-label="Base currency"
              >
                <option value="">Seleziona</option>
                {baseCurrencies.map((option) => (
                  <option key={option} value={option}>
                    {baseCurrencyLabels[option]}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <input type="checkbox" {...register('needsApi')} className="h-4 w-4" />
              Richiedo accesso API
            </label>
          </div>
        )}
        {step === 3 && (
          <Field
            label="Piattaforme attuali (opzionale)"
            description="Inserisci provider separati da virgola, se vuoi."
            error={errors.currentProviders?.message as string}
          >
            <input
              type="text"
              {...register('currentProviders')}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
              placeholder="Esempio: Orion Desk, BlueCove"
              aria-label="Piattaforme attuali"
            />
          </Field>
        )}
        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviewItems.map((item) => (
              <Card key={item.label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <p className="text-sm text-slate-700">{item.value}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
      {submitError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          type="button"
          onClick={goBack}
          disabled={step === 0}
          aria-label="Vai indietro"
        >
          Indietro
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={goNext} aria-label="Prosegui">
            Continua
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Invio in corso…' : 'Invia assessment'}
          </Button>
        )}
      </div>
    </Card>
  )
}
