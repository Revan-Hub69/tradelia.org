'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { TradeliaLogo } from '../components/icons/TradeliaLogo'
import {
  complianceCopy,
  horizonOptions,
  marketOptions,
  type HorizonSlug,
  type MarketSlug,
} from '../lib/tradelia'

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState<MarketSlug | null>(null)
  const [selectedHorizon, setSelectedHorizon] = useState<HorizonSlug | null>(null)

  const selectedMarketLabel = useMemo(() => {
    const found = marketOptions.find((m) => m.id === selectedMarket)
    return found?.label || '—'
  }, [selectedMarket])

  const selectedHorizonLabel = useMemo(() => {
    const found = horizonOptions.find((h) => h.id === selectedHorizon)
    return found?.label || '—'
  }, [selectedHorizon])

  const exploreHref =
    selectedMarket && selectedHorizon
      ? `/learn/${selectedMarket}/${selectedHorizon}`
      : undefined

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <div className="absolute inset-0 grid-stroke opacity-35 animate-pulse-slow" aria-hidden />
        <div className="hero-pattern animate-float" aria-hidden />
        <div className="absolute inset-0 hero-mesh animate-drift" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/6 to-transparent blur-3xl animate-fade-in" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="glass-panel p-8 sm:p-12 shadow-lg border border-[var(--br)] card-glow animate-slide-up space-y-8">
            <div className="flex items-center gap-3">
              <TradeliaLogo size={40} className="text-[var(--ink)]" />
              <div>
                <p className="section-kicker mb-1">TRADELIA AI</p>
                <p className="text-sm text-[var(--muted)]">Versione 5.1.0 · Homepage</p>
              </div>
            </div>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="flex flex-col gap-6">
                <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
                  Lettura accademica dei mercati finanziari tramite AI
                </h1>
                <p className="text-xl text-[var(--muted)] leading-relaxed">
                  per evitare errori accademici nelle decisioni operative
                </p>
                <p className="text-lg text-[var(--muted)] leading-relaxed">
                  Indicatori di mercato interpretati per contesto e orizzonte decisionale. Nessun segnale. Nessuna previsione. Nessuna consulenza.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => {
                      const element = document.getElementById('market')
                      element?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Scegli il tuo percorso
                  </Button>
                </div>
              </div>
              <div className="glass-panel p-6 space-y-4 border border-[var(--br)]/70">
                <h3 className="text-xl font-semibold text-[var(--ink)]">Cos’è Tradelia AI</h3>
                <ul className="space-y-3 text-[var(--muted)]">
                  <li className="flex gap-3">
                    <span className="pill">1</span>
                    <span>Interpreta indicatori di mercato usando modelli e letteratura accademica.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="pill">2</span>
                    <span>Ogni lettura è specifica per mercato e orizzonte operativo.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="pill">3</span>
                    <span>Riduce errori concettuali: non suggerisce operazioni.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="market" className="py-16 bg-[var(--bg-2)]">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="section-kicker mb-2">Scelta del mercato</p>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">In quale mercato prendi decisioni?</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketOptions.map((market) => {
              const isActive = selectedMarket === market.id
              return (
                <button
                  key={market.id}
                  className={`card card-interactive text-left p-5 space-y-3 ${isActive ? 'border-[var(--accent)] shadow-md' : ''}`}
                  onClick={() => {
                    setSelectedMarket(market.id)
                    setSelectedHorizon(null)
                    const element = document.getElementById('horizon')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-[var(--ink)]">{market.label}</div>
                    <span className="pill">{market.context}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{market.description}</p>
                  <span className="btn-tertiary inline-flex w-fit">Esplora</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section id="horizon" className="py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="section-kicker">Scelta dell’orizzonte decisionale</p>
            <h2 className="text-3xl font-semibold text-[var(--ink)]">Qual è il tuo orizzonte decisionale?</h2>
            <p className="text-[var(--muted)]">
              Gli indicatori mostrati cambiano in base all’orizzonte. Indicatori non coerenti vengono esclusi per evitare errori interpretativi.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {horizonOptions.map((horizon) => {
              const isActive = selectedHorizon === horizon.id
              return (
                <button
                  key={horizon.id}
                  className={`card card-interactive text-left p-5 space-y-3 h-full ${isActive ? 'border-[var(--accent)] shadow-md' : ''}`}
                  onClick={() => setSelectedHorizon(horizon.id)}
                  aria-pressed={isActive}
                  disabled={!selectedMarket}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-[var(--ink)]">{horizon.label}</div>
                    <span className="pill">Orizzonte</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{horizon.description}</p>
                  <p className="text-xs text-[var(--muted)]">{horizon.focus}</p>
                </button>
              )
            })}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-[var(--br)] bg-[var(--surface)] p-6">
            <div className="space-y-1 text-[var(--muted)]">
              <p className="text-sm">Percorso selezionato</p>
              <p className="text-lg font-semibold text-[var(--ink)]">{selectedMarketLabel} · {selectedHorizonLabel}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={!exploreHref}
                onClick={() => {
                  if (!exploreHref) return
                  window.location.href = exploreHref
                }}
              >
                Apri percorso
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-2)]" id="metodo">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
            <div className="space-y-3">
              <p className="section-kicker">Metodo Tradelia AI</p>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">Difesa + identità</h2>
              <p className="text-[var(--muted)]">
                Metodo basato su rigore accademico e coerenza del contesto. Nessun segnale, nessuna previsione, nessuna consulenza.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Indicatori selezionati per coerenza accademica, non popolarità',
                'Interpretazione AI basata su contesto, limiti statistici e letteratura',
                'Nessuna personalizzazione, nessuna esecuzione, nessun segnale',
                'Contenuti esclusivamente educativi e informativi',
              ].map((item, index) => (
                <div key={index} className="card p-5 space-y-2">
                  <span className="pill">Metodo</span>
                  <p className="text-[var(--muted)] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--br)] bg-[var(--bg)]" id="note">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <Link href="/method" className="btn-tertiary">Metodo</Link>
            <Link href="/glossary" className="btn-tertiary">Glossario</Link>
            <Link href="/risk" className="btn-tertiary">Fonti accademiche</Link>
            <Link href="/settings" className="btn-tertiary">Disclaimer legale</Link>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Tradelia AI è una piattaforma educativa. Non fornisce consulenza finanziaria né raccomandazioni operative.
          </p>
        </div>
      </footer>
    </main>
  )
}
