import type { AssessmentInput } from '@/lib/schemas/assessment'

export type CoverageLevel = 'FULL' | 'PARTIAL' | 'INFO'

export type PerDomainResult = {
  domainKey: string
  coverageLevel: CoverageLevel
  fitScore: number
  notes: string[]
  suggestedProviderId: string | null
  caveats: string[]
}

export type AssessmentResult = {
  perDomain: PerDomainResult[]
  overall: {
    summaryText: string
    topDrivers: string[]
    warnings: string[]
  }
  audit: {
    assumptions: string[]
    missingData: string[]
  }
}

export type ProviderProfile = {
  id: string
  name: string
  products: string[]
  regions: string[]
}

const horizonScoreMap: Record<AssessmentInput['horizon'], number> = {
  SCALPING: 72,
  INTRADAY: 66,
  SWING: 58,
  LONG_TERM: 52
}

export function computeAssessment(
  userProfile: AssessmentInput,
  providers: ProviderProfile[]
): AssessmentResult {
  const baseScore = horizonScoreMap[userProfile.horizon]

  const perDomain = userProfile.markets.map((domainKey, index) => {
    const candidates = providers.filter((provider) =>
      provider.products.includes(domainKey)
    )
    const suggested = candidates[0] ?? null
    const coverageLevel: CoverageLevel =
      candidates.length >= 2 ? 'FULL' : candidates.length === 1 ? 'PARTIAL' : 'INFO'

    const frequencyFactor = Math.min(userProfile.frequencyPerWeek / 10, 1)
    const sizeFactor = userProfile.typicalNotionalBucket === 'GT_5K' ? 0.08 : 0.04
    const fitScore = Math.round(
      baseScore +
        frequencyFactor * 10 +
        sizeFactor * 100 -
        index * 2 -
        (coverageLevel === 'INFO' ? 12 : 0)
    )

    const notes = [
      `Compatibilità calcolata sul profilo ${userProfile.horizon.toLowerCase()}.`,
      userProfile.needsApi
        ? 'Richiesta integrazione API considerata nel punteggio.'
        : 'Nessuna integrazione API richiesta.'
    ]

    const caveats =
      coverageLevel === 'INFO'
        ? ['Dati insufficienti: dominio non valutabile in modo completo.']
        : ['Stima basata su dati dichiarati e modelli deterministici.']

    return {
      domainKey,
      coverageLevel,
      fitScore: Math.max(20, Math.min(92, fitScore)),
      notes,
      suggestedProviderId: suggested?.id ?? null,
      caveats
    }
  })

  const domainNames = userProfile.markets.join(', ')
  const summaryText = `Profilo multi-dominio: ${domainNames}. Confronto dell’attrito operativo costruito sui tuoi vincoli e sulla base dati disponibile.`

  return {
    perDomain,
    overall: {
      summaryText,
      topDrivers: [
        'Volume operativo e frequenza ordini',
        'Struttura commissionale dichiarata',
        'Compatibilità normativa e tecnica'
      ],
      warnings: userProfile.markets.length > 2
        ? ['Confronto multi-mercato: alcuni domini potrebbero essere “non valutabile”.']
        : ['Stime basate su dati dichiarati, non su esecuzioni realtime.']
    },
    audit: {
      assumptions: [
        'Assenza di sconti personalizzati o programmi VIP.',
        'Utilizzo di dati dichiarati e aggiornamenti periodici.'
      ],
      missingData: perDomain.some((domain) => domain.coverageLevel === 'INFO')
        ? ['Mancano dati completi per almeno un dominio selezionato.']
        : []
    }
  }
}
