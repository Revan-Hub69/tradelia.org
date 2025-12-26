import Link from 'next/link'
import { TradeliaHeader } from '../components/TradeliaHeader'
import { InstitutionFooter } from '../components/InstitutionFooter'

const footerLinks = [
  { label: 'Homepage', href: '/' },
  { label: 'Lezioni', href: '/lezioni' },
  { label: 'Contatti', href: 'mailto:info@tradelia.org' },
]

const disclaimer = 'Contenuto educativo. Nessuna consulenza finanziaria o raccomandazione di investimento.'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <TradeliaHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 space-y-10 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] uppercase tracking-wide">Tradelia · Microlearning</p>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--ink)]">
            Evita gli errori finanziari che costano anni di lavoro
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            Stiamo riprogettando Tradelia come raccolta di micro-lezioni statiche. Nessun login, nessun tracciamento, nessuna funzionalità dinamica: solo decisioni guidate per evitare errori ricorrenti.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lezioni"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition-colors"
            >
              Inizia da qui
            </Link>
            <Link
              href="/lezioni"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--br)] px-5 py-3 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--ink)] transition-colors"
            >
              Errore più comune
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--br)] bg-[var(--surface)]/70 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Cosa resta, cosa abbiamo tolto</h2>
          <ul className="list-disc list-inside space-y-2 text-[var(--muted)] leading-relaxed">
            <li>Static-first: contenuti generati al build, senza API o database.</li>
            <li>Nessuna autenticazione, nessun pagamento, nessuna raccolta dati.</li>
            <li>UI minimale e istituzionale, pensata per lettura rapida.</li>
            <li>Struttura obbligatoria pronta: homepage e sezione /lezioni in arrivo.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--br)] bg-[var(--surface)]/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Prossimi passi</h2>
          <p className="text-[var(--muted)] leading-relaxed">
            Inseriremo le prime micro-lezioni statiche sugli errori finanziari più frequenti: comprare sui massimi, stop loss mentale, dividendi e rischi nascosti, ETF non tutti uguali, quando non investire.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Ogni pagina seguirà lo stesso schema: situazione reale, errore comune, perché è rischioso, regola pratica, cosa fare ora (CTA affiliata), disclaimer finale.
          </p>
        </section>
      </main>

      <InstitutionFooter links={footerLinks} disclaimer={disclaimer} />
    </div>
  )
}
