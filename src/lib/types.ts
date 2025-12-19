import { z } from 'zod'

// User Profile Schema
export const UserProfileSchema = z.object({
  markets: z.array(z.enum(['CRYPTO', 'CFD', 'EQUITY', 'ETF', 'FUTURES', 'BONDS'])),
  instruments: z.array(z.string()),
  horizon: z.enum(['scalping', 'intraday', 'swing', 'long']),
  frequencyPerWeek: z.number().min(1).max(100),
  orderTypes: z.array(z.enum(['market', 'limit', 'stop'])),
  typicalNotionalBucket: z.enum(['lt200', '200to1k', '1kto5k', 'gt5k']),
  slippageTolerance: z.enum(['low', 'med', 'high']),
  timezone: z.string().default('Europe/Rome'),
  regulatoryPreference: z.enum(['EU_ONLY', 'OK_NON_EU']),
  needsApi: z.boolean().default(false),
  baseCurrency: z.enum(['EUR', 'USD']).default('EUR'),
  currentProviders: z.array(z.string()).optional()
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// Coverage Levels
export type CoverageLevel = 'FULL' | 'PARTIAL' | 'INFO'

// Domain Analysis Result
export interface DomainResult {
  domain: string
  coverage: CoverageLevel
  suggestedProvider?: {
    id: string
    name: string
    reasoning: string[]
  }
  estimatedCosts?: {
    tradingCosts: number
    fundingCosts: number
    withdrawalCosts: number
    currency: string
  }
  limitations: string[]
}

// Overall Assessment Result
export interface AssessmentResult {
  perDomain: DomainResult[]
  overall: {
    totalEstimatedCosts: number
    currency: string
    multiProviderRecommended: boolean
    reasoning: string[]
  }
  audit: {
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW'
    lastUpdated: string
    sources: string[]
    limitations: string[]
  }
}

// Provider Types
export type ProviderType = 'EXCHANGE' | 'BROKER' | 'CFD_PROVIDER'

export interface Provider {
  id: string
  name: string
  type: ProviderType
  regions: string[]
  regulatedIn: string[]
  products: string[]
  website?: string
  description?: string
}

export interface FeeSchedule {
  id: string
  providerId: string
  product: string
  instrument?: string
  makerFeePct?: number
  takerFeePct?: number
  commissionPerTrade?: number
  minCommission?: number
  maxCommission?: number
  fxFeePct?: number
  financingRatePolicy?: string
  spreadPolicy: 'fixed' | 'variable' | 'unknown'
  withdrawalFees?: Record<string, number>
  sourceUrl?: string
  lastVerifiedAt?: string
  notes?: string
}