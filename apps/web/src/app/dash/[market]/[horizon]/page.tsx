'use client'

import { useMemo } from 'react'
import { notFound } from 'next/navigation'
import {
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

const widgets = Array.from({ length: 6 }, (_, idx) => `Widget ${idx + 1} (in arrivo)`)

export default function DashboardPathPage({ params }: PageParams) {
  const market = useMemo(() => getMarketById(params.market), [params.market])
  const horizon = useMemo(() => getHorizonById(params.horizon), [params.horizon])

  if (!market || !horizon) {
    notFound()
  }

  return (
    <main className="min-h-screen py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-10">
        <div className="space-y-2">
          <p className="section-kicker">Dashboard</p>
          <h1 className="text-4xl font-bold text-[var(--ink)]">Dashboard · {market!.label} · {horizon!.label}</h1>
          <p className="text-[var(--muted)]">
            Dati e indicatori coerenti con questo orizzonte (stream in fase 2).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget} className="card p-5 space-y-2">
              <span className="pill">Placeholder</span>
              <p className="text-[var(--muted)]">{widget}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--muted)]">Nessun segnale. Solo lettura contestuale.</p>
        <p className="text-sm text-[var(--muted)]">{complianceCopy}</p>
      </div>
    </main>
  )
}
