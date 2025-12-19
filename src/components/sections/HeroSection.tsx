import Link from 'next/link'

import { heroCopy } from '@/content/copy'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tradelia 2026-ready
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            {heroCopy.headline}
          </h1>
          <p className="text-lg text-slate-600 sm:text-xl">{heroCopy.subheadline}</p>
          <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            {heroCopy.bullets.map((item) => (
              <li key={item} className="rounded-full bg-slate-100 px-4 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#analisi">
              <Button aria-label={heroCopy.cta}>{heroCopy.cta}</Button>
            </Link>
            <Link
              href="#metodo"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              {heroCopy.secondary}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {['Framework deterministico', 'Compatibilità multi-mercato', 'Audit trasparente'].map(
            (pill) => (
              <div
                key={pill}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600"
              >
                {pill}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
