import { NextResponse } from 'next/server'

import { assessmentFormSchema } from '@/lib/schemas/assessment'
import { prisma } from '@/lib/db/prisma'
import { computeAssessment, type ProviderProfile } from '@/lib/engine/assessment'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = assessmentFormSchema.parse(body)

    const providers = (await prisma.provider.findMany({
      select: { id: true, name: true, products: true, regions: true }
    })) as ProviderProfile[]

    const result = computeAssessment(payload, providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      products: provider.products as string[],
      regions: provider.regions as string[]
    })))

    const assessment = await prisma.assessment.create({
      data: {
        markets: payload.markets,
        horizon: payload.horizon,
        frequencyPerWeek: payload.frequencyPerWeek,
        orderTypes: payload.orderTypes,
        typicalNotionalBucket: payload.typicalNotionalBucket,
        slippageTolerance: payload.slippageTolerance,
        regulatoryPreference: payload.regulatoryPreference,
        needsApi: payload.needsApi,
        baseCurrency: payload.baseCurrency,
        currentProviders: payload.currentProviders
      }
    })

    await prisma.assessmentResult.create({
      data: {
        assessmentId: assessment.id,
        perDomain: result.perDomain,
        overall: result.overall,
        audit: result.audit
      }
    })

    return NextResponse.json({ id: assessment.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore inatteso'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
