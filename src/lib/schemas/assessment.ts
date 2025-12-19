import { z } from 'zod'

export const marketDomains = [
  'CRYPTO',
  'CFD',
  'EQUITY_ETF',
  'FUTURES',
  'BONDS'
] as const

export const orderTypes = ['MARKET', 'LIMIT', 'STOP'] as const
export const horizonOptions = ['SCALPING', 'INTRADAY', 'SWING', 'LONG_TERM'] as const
export const sizeBuckets = ['LT_200', '200_TO_1K', '1K_TO_5K', 'GT_5K'] as const
export const slippageToleranceOptions = ['LOW', 'MEDIUM', 'HIGH'] as const
export const regulatoryPreferences = ['EU_ONLY', 'GLOBAL_OK'] as const
export const baseCurrencies = ['EUR', 'USD'] as const

export const assessmentFormSchema = z.object({
  markets: z.array(z.enum(marketDomains)).min(1, 'Seleziona almeno un mercato.'),
  horizon: z.enum(horizonOptions),
  frequencyPerWeek: z
    .number({ invalid_type_error: 'Inserisci una frequenza valida.' })
    .min(1, 'Inserisci almeno 1 operazione settimanale.')
    .max(500, 'Inserisci un valore realistico.'),
  orderTypes: z.array(z.enum(orderTypes)).min(1, 'Seleziona almeno un tipo ordine.'),
  typicalNotionalBucket: z.enum(sizeBuckets),
  slippageTolerance: z.enum(slippageToleranceOptions),
  regulatoryPreference: z.enum(regulatoryPreferences),
  baseCurrency: z.enum(baseCurrencies),
  needsApi: z.boolean(),
  currentProviders: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : []
    )
})

export type AssessmentFormValues = z.input<typeof assessmentFormSchema>
export type AssessmentInput = z.output<typeof assessmentFormSchema>
