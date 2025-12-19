import { notFound } from 'next/navigation'

import { prisma } from '@/lib/db/prisma'
import type { PerDomainResult, AssessmentResult } from '@/lib/engine/assessment'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { FooterSection } from '@/components/sections/FooterSection'

const coverageVariantMap: Record<PerDomainResult['coverageLevel'], 'full' | 'partial' | 'info'> = {
  FULL: 'full',
  PARTIAL: 'partial',
  INFO: 'info'
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { result: true }
  })

  if (!assessment || !assessment.result) {
    notFound()
  }

  const result: AssessmentResult = {
    perDomain: assessment.result.perDomain as PerDomainResult[],
    overall: assessment.result.overall as AssessmentResult['overall'],
    audit: assessment.result.audit as AssessmentResult['audit']
  }

  const providerIds = result.perDomain
    .map((item) => item.suggestedProviderId)
    .filter((value): value is string => Boolean(value))

  const providers = await prisma.provider.findMany({
    where: { id: { in: providerIds } }
  })

  const providerMap = new Map(providers.map((provider) => [provider.id, provider]))

  return (
    <main className="bg-white text-slate-900">
      <Section
        eyebrow="Report"
        title="Profilo sintetico"
        description={result.overall.summaryText}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Mercati
            </h3>
            <p className="text-sm text-slate-700">
              {(assessment.markets as string[]).join(', ')}
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Stile operativo
            </h3>
            <p className="text-sm text-slate-700">
              {assessment.horizon} · {assessment.frequencyPerWeek} operazioni/settimana
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Vincoli
            </h3>
            <p className="text-sm text-slate-700">
              {assessment.regulatoryPreference} · Base {assessment.baseCurrency}
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              API
            </h3>
            <p className="text-sm text-slate-700">
              {assessment.needsApi ? 'Richiesta API' : 'Nessuna richiesta API'}
            </p>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Compatibilità"
        title="Compatibilità per dominio"
        description="Ogni card indica coverage, fit score e note operative per il dominio selezionato."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {result.perDomain.length === 0 ? (
            <Card className="text-sm text-slate-600">
              Nessun dominio disponibile. Riprova con un assessment valido.
            </Card>
          ) : (
            result.perDomain.map((domain) => (
              <Card key={domain.domainKey} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {domain.domainKey}
                  </h3>
                  <Badge variant={coverageVariantMap[domain.coverageLevel]}>
                    {domain.coverageLevel}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Fit score stimato: <strong>{domain.fitScore}</strong>/100
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {domain.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400">{domain.caveats.join(' ')}</p>
              </Card>
            ))
          )}
        </div>
      </Section>

      <Section
        eyebrow="Stack suggerito"
        title="Provider consigliato per dominio"
        description="Una proposta per ciascun dominio, con motivazioni placeholder."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {result.perDomain.length === 0 ? (
            <Card className="text-sm text-slate-600">
              Nessun suggerimento disponibile.
            </Card>
          ) : (
            result.perDomain.map((domain) => {
              const provider = domain.suggestedProviderId
                ? providerMap.get(domain.suggestedProviderId)
                : null
              return (
                <Card key={domain.domainKey} className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {domain.domainKey}
                  </h3>
                  <p className="text-sm text-slate-700">
                    {provider ? provider.name : 'Non valutabile'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Motivazione stub: copertura coerente con il profilo e attrito operativo
                    stimato sotto la soglia critica.
                  </p>
                </Card>
              )
            })
          )}
        </div>
      </Section>

      <Section
        eyebrow="Driver di costo"
        title="Driver principali"
        description="Placeholder: qui emergeranno i driver di costo personalizzati."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {result.overall.topDrivers.map((driver) => (
            <Card key={driver} className="text-sm text-slate-600">
              {driver}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Fonti & Audit"
        title="Audit e note metodologiche"
        description="Placeholder per fonti, assunzioni e dati mancanti."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Assunzioni
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {result.audit.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Dati mancanti
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {result.audit.missingData.length > 0
                ? result.audit.missingData.map((item) => <li key={item}>{item}</li>)
                : 'Nessun dato mancante segnalato.'}
            </ul>
          </Card>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Disclaimer: Tradelia non fornisce consulenza finanziaria. Le stime sono
          informative e possono includere “non valutabile”.
        </div>
      </Section>
      <FooterSection />
    </main>
  )
}
