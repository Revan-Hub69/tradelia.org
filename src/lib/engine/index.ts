import type { UserProfile, Provider, FeeSchedule, AssessmentResult, DomainResult, CoverageLevel } from '../types'

/**
 * Core computation engine for Tradelia
 * Pure functions, deterministic calculations
 */

export function computeAssessment(
  userProfile: UserProfile,
  providers: Provider[],
  feeSchedules: FeeSchedule[]
): AssessmentResult {
  // TODO: Implement real computation logic
  // For now, return structured placeholder

  const perDomain: DomainResult[] = userProfile.markets.map(market => {
    const coverage = getCoverageLevel(market)
    const suggestedProvider = findBestProvider(market, providers, userProfile)
    
    return {
      domain: market,
      coverage,
      suggestedProvider: suggestedProvider ? {
        id: suggestedProvider.id,
        name: suggestedProvider.name,
        reasoning: generateReasoning(market, suggestedProvider, userProfile)
      } : undefined,
      estimatedCosts: coverage !== 'INFO' ? {
        tradingCosts: estimateTradingCosts(market, userProfile, feeSchedules),
        fundingCosts: estimateFundingCosts(market, userProfile),
        withdrawalCosts: estimateWithdrawalCosts(market, userProfile),
        currency: userProfile.baseCurrency
      } : undefined,
      limitations: getLimitations(market, coverage)
    }
  })

  const totalCosts = perDomain.reduce((sum, domain) => 
    sum + (domain.estimatedCosts?.tradingCosts || 0) + 
          (domain.estimatedCosts?.fundingCosts || 0) + 
          (domain.estimatedCosts?.withdrawalCosts || 0), 0
  )

  return {
    perDomain,
    overall: {
      totalEstimatedCosts: totalCosts,
      currency: userProfile.baseCurrency,
      multiProviderRecommended: userProfile.markets.length > 2,
      reasoning: [
        'Analisi basata su documentazione ufficiale disponibile',
        'Costi stimati per operatività dichiarata',
        userProfile.markets.length > 2 ? 'Combinazione di provider consigliata per copertura ottimale' : 'Provider singolo potenzialmente sufficiente'
      ]
    },
    audit: {
      dataQuality: 'MEDIUM',
      lastUpdated: new Date().toISOString(),
      sources: [
        'Documentazione ufficiale provider',
        'Fee schedules pubbliche',
        'Condizioni contrattuali standard'
      ],
      limitations: [
        'Stime basate su condizioni standard',
        'Spread e slippage non inclusi in tempo reale',
        'Condizioni promozionali non considerate'
      ]
    }
  }
}

function getCoverageLevel(market: string): CoverageLevel {
  // TODO: Implement real coverage logic
  switch (market) {
    case 'CRYPTO':
      return 'FULL'
    case 'CFD':
      return 'FULL'
    case 'EQUITY':
    case 'ETF':
      return 'PARTIAL'
    case 'FUTURES':
    case 'BONDS':
      return 'INFO'
    default:
      return 'INFO'
  }
}

function findBestProvider(
  market: string,
  providers: Provider[],
  userProfile: UserProfile
): Provider | null {
  // TODO: Implement real provider matching logic
  const compatibleProviders = providers.filter(p => 
    p.products.includes(market) &&
    (userProfile.regulatoryPreference === 'OK_NON_EU' || p.regions.includes('EU'))
  )
  
  return compatibleProviders[0] || null
}

function generateReasoning(
  market: string,
  provider: Provider,
  userProfile: UserProfile
): string[] {
  // TODO: Implement real reasoning logic
  return [
    `Compatibile con mercato ${market}`,
    `Regolamentazione coerente con preferenze (${userProfile.regulatoryPreference})`,
    `Supporta strumenti richiesti`,
    'Struttura commissionale trasparente'
  ]
}

function estimateTradingCosts(
  market: string,
  userProfile: UserProfile,
  feeSchedules: FeeSchedule[]
): number {
  // TODO: Implement real cost calculation
  const baseCommission = market === 'CRYPTO' ? 0.1 : 5.0
  const frequencyMultiplier = userProfile.frequencyPerWeek
  const sizeMultiplier = getSizeMultiplier(userProfile.typicalNotionalBucket)
  
  return baseCommission * frequencyMultiplier * sizeMultiplier
}

function estimateFundingCosts(market: string, userProfile: UserProfile): number {
  // TODO: Implement real funding cost calculation
  if (market === 'CFD' && userProfile.horizon !== 'scalping') {
    return 50 // Placeholder funding cost
  }
  return 0
}

function estimateWithdrawalCosts(market: string, userProfile: UserProfile): number {
  // TODO: Implement real withdrawal cost calculation
  return market === 'CRYPTO' ? 10 : 0
}

function getSizeMultiplier(bucket: string): number {
  switch (bucket) {
    case 'lt200': return 0.5
    case '200to1k': return 1.0
    case '1kto5k': return 2.0
    case 'gt5k': return 4.0
    default: return 1.0
  }
}

function getLimitations(market: string, coverage: CoverageLevel): string[] {
  const baseLimitations = [
    'Stime basate su condizioni standard',
    'Spread variabili non inclusi'
  ]

  if (coverage === 'PARTIAL') {
    baseLimitations.push('Copertura parziale - alcuni strumenti non valutabili')
  }

  if (coverage === 'INFO') {
    baseLimitations.push('Solo informazioni generali disponibili')
  }

  return baseLimitations
}