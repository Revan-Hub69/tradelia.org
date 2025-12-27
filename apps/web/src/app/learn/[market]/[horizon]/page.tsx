'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { notFound } from 'next/navigation'
import { Button } from '../../../components/ui/Button'
import {
  buildObjectiveCopy,
  buildPathTitle,
  complianceCopy,
  getHorizonById,
  getMarketById,
} from '../../../lib/tradelia'

type PageParams = {
  params: {
    market: string
    horizon: string
  }
}

export default function LearnPathPage({ params }: PageParams) {
  const market = useMemo(() => getMarketById(params.market), [params.market])
  const horizon = useMemo(() => getHorizonById(params.horizon), [params.horizon])

  if (!market || !horizon) {
    notFound()
  }

  const title = buildPathTitle(market!, horizon!)
  const objective = buildObjectiveCopy(market!, horizon!)

  return (
    <main className="min-h-screen py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-10">
        <div className="space-y-3">
          <p className="section-kicker">Percorso</p>
          <h1 className="text-4xl font-bold text-[var(--ink)]">{title}</h1>
          <p className="text-[var(--muted)]">Lettura accademica per ridurre errori concettuali.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Obiettivo del percorso</h2>
            <ul className="list-disc pl-5 space-y-2 text-[var(--muted)]">
              {objective.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Dataset usato</h2>
            <p className="text-[var(--muted)]">(in arrivo)</p>
          </div>
          <div className="card p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Lettura accademica (AI)</h2>
            <ul className="list-disc pl-5 space-y-2 text-[var(--muted)]">
              <li>Placeholder 1</li>
              <li>Placeholder 2</li>
              <li>Placeholder 3</li>
            </ul>
          </div>
          <div className="card p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Errori comuni</h2>
            <p className="text-[var(--muted)]">Placeholder</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Metodo e limiti</h2>
          <p className="text-[var(--muted)]">
            Interpretazione basata su letteratura accademica e contesto operativo. Nessuna previsione, nessuna consulenza, nessuna esecuzione.
          </p>
          <Link href={`/dash/${market!.id}/${horizon!.id}`} className="inline-block">
            <Button>Apri dashboard</Button>
          </Link>
        </div>

        <p className="text-sm text-[var(--muted)]">{complianceCopy}</p>
      </div>
    </main>
  )
}
