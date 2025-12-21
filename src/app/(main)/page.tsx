import Link from 'next/link'
import { FadeIn } from '@/components/site/FadeIn'

export default function HomePage() {
  return (
    <main id="contenuto-principale" className="relative overflow-hidden">
      {/* HERO */}
      <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
        <FadeIn className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6 lg:max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-400/30 bg-slate-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
              Tradelia · strumenti di gestione finanziaria
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight text-white sm:text-5xl">
                Quando qualcosa va storto, scopri se conto e carta erano <em className="text-sky-400 not-italic">davvero</em> adatti a te.
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Problemi con l'assistenza, costi che spuntano dal nulla e blocchi quando meno te li aspetti. 
                Ti aiutiamo a vederli prima che succedano.
              </p>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1 text-sm text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Assistenza & problemi
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1 text-sm text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Costi a sorpresa
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1 text-sm text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Quando ti bloccano
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/compatibility" className="btn-primary w-full sm:w-auto">
                Check compatibilità (3 minuti)
              </Link>
              <Link
                href="#evidenze"
                className="btn-secondary w-full sm:w-auto"
              >
                Vedi esempi reali (con fonti)
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              Dati ufficiali: Banca d'Italia, ABF. Niente investimenti, solo conti e carte.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* EVIDENZE */}
      <section id="evidenze" className="relative border-t border-slate-800/60 bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              I numeri che contano <span className="text-slate-400 text-lg">(senza marketing)</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Pochi indicatori ad alto segnale. Dettagli e fonti sempre accessibili.
            </p>
          </FadeIn>

          <FadeIn className="grid gap-6 lg:grid-cols-2">
            {/* Reclami */}
            <div className="card-premium space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                  PRIORITÀ 1
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Reclami & disservizi</h3>
                <div className="text-3xl font-bold text-white mb-2">15.816</div>
                <p className="text-slate-400 text-sm mb-3">ricorsi (2023)</p>
                <p className="text-slate-300 text-sm mb-4">
                  Quando hai un problema, conta chi ti aiuta davvero.
                </p>
                <p className="text-xs text-slate-400">
                  Fonte: ABF – Relazione annuale 2023
                </p>
              </div>
            </div>

            {/* Costi */}
            <div className="card-premium space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
                  PRIORITÀ 2
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Costi reali del conto (baseline)</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Conto tradizionale</span>
                    <span className="font-semibold text-white">€101/anno</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Conto online</span>
                    <span className="font-semibold text-white">€30,6/anno</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Imposta di bollo</span>
                    <span className="font-semibold text-white">+€16,5</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Quello che paghi davvero, non quello che ti dicono.
                </p>
                <p className="text-xs text-slate-400">
                  Fonte: Banca d'Italia – Indagine costo conti 2023
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SCENARI */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Cosa succede quando qualcosa <em className="text-red-400 not-italic">va storto</em>
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Non ti serve "la carta migliore". Ti serve sapere cosa succede <strong>quando hai un problema</strong>.
            </p>
          </FadeIn>

          <FadeIn className="grid gap-6 lg:grid-cols-3">
            <div className="card-premium space-y-4">
              <h3 className="text-lg font-semibold text-white">Carta rifiutata o conto bloccato</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Pagamento rifiutato proprio quando ti serve</li>
                <li>• App che non funziona nel momento sbagliato</li>
                <li>• Bonifici che restano in sospeso</li>
              </ul>
              <p className="text-sm text-sky-300 font-medium">
                Serve sempre un piano B per non restare a piedi.
              </p>
            </div>

            <div className="card-premium space-y-4">
              <h3 className="text-lg font-semibold text-white">Addebito sbagliato o truffa</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Documenti da mandare e tempi lunghi</li>
                <li>• Rimborsi che non sempre arrivano</li>
                <li>• Regole diverse per ogni banca</li>
              </ul>
              <p className="text-sm text-sky-300 font-medium">
                Conta come ti trattano, non solo quanto paghi al mese.
              </p>
            </div>

            <div className="card-premium space-y-4">
              <h3 className="text-lg font-semibold text-white">Assistenza che non aiuta</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Ti rimbalzano da un ufficio all'altro</li>
                <li>• Nessuno che risolve davvero</li>
                <li>• Problemi che si trascinano per settimane</li>
              </ul>
              <p className="text-sm text-sky-300 font-medium">
                La differenza la fa chi risponde quando chiami aiuto.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* COSTI NASCOSTI */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Costi che emergono solo in certi casi
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Molte commissioni non sono nel canone: appaiono quando cambi contesto (estero, instant, ATM, condizioni "se…").
            </p>
          </FadeIn>

          <FadeIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Prelievi ATM fuori rete / extra UE</h4>
              <p className="text-sm text-slate-300">Fee e regole variano; spesso diventano visibili solo dopo l'uso.</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Bonifico istantaneo</h4>
              <p className="text-sm text-slate-300">Può avere costi e regole diverse dal bonifico ordinario.</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Cambio valuta e maggiorazioni</h4>
              <p className="text-sm text-slate-300">Il costo effettivo dipende da come viene applicato il cambio.</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Inattività / condizioni 'se…'</h4>
              <p className="text-sm text-slate-300">Alcune condizioni scattano solo oltre soglie o dopo un periodo.</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Servizi opzionali e limiti</h4>
              <p className="text-sm text-slate-300">Limiti, upgrade e funzioni extra possono cambiare il costo reale.</p>
            </div>
          </FadeIn>

          <FadeIn className="text-center">
            <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-6">
              Tradelia non stima il tuo costo: evidenzia dove il tuo uso può attivare commissioni condizionali.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Come funziona il check
            </h2>
            <p className="text-slate-400">
              3 minuti. Risultato chiaro. Zero gergo.
            </p>
          </FadeIn>

          <FadeIn className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="card-premium text-center space-y-4">
              <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sky-400 font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Il tuo uso reale</h3>
              <p className="text-sm text-slate-300">
                Dici come usi conti/carte: estero, online, bonifici, contanti, backup.
              </p>
            </div>

            <div className="card-premium text-center space-y-4">
              <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sky-400 font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Rischi & costi attivabili</h3>
              <p className="text-sm text-slate-300">
                Evidenziamo scenari di disservizio, assistenza e fee condizionali.
              </p>
            </div>

            <div className="card-premium text-center space-y-4">
              <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sky-400 font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Struttura consigliata</h3>
              <p className="text-sm text-slate-300">
                Ti proponiamo una struttura core + online + backup (educational).
              </p>
            </div>
          </FadeIn>

          <FadeIn className="text-center">
            <Link href="/compatibility" className="btn-primary">
              Inizia il check
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* FONTI & TRASPARENZA */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Fonti & metodo (trasparenza)
            </h2>
            <p className="text-slate-400">
              Numeri solo da fonti ufficiali. Niente KPI inventati.
            </p>
          </FadeIn>

          <FadeIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Banca d'Italia — frodi pagamenti</h4>
              <p className="text-xs text-slate-400">Relazione annuale 2023</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Banca d'Italia — esposti clienti</h4>
              <p className="text-xs text-slate-400">Bollettino vigilanza 2024</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">Banca d'Italia — costo conti correnti</h4>
              <p className="text-xs text-slate-400">Indagine costi 2023</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">ABF — Relazione annuale</h4>
              <p className="text-xs text-slate-400">Arbitro Bancario Finanziario 2023</p>
            </div>
            <div className="card-premium p-4">
              <h4 className="font-semibold text-white mb-2">EBA — Consumer trends</h4>
              <p className="text-xs text-slate-400">European Banking Authority</p>
            </div>
          </FadeIn>

          <FadeIn className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/trasparenza" className="btn-secondary">
              Trasparenza & affiliazioni
            </Link>
            <Link href="/metodo" className="btn-secondary">
              Metodo
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="card-premium text-center space-y-6">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Vedi dove rischi tempo, stress o costi inattesi <span className="text-sky-400">— prima</span>.
            </h2>
            <p className="text-slate-300">
              Check gratuito, educational. Se proponiamo un provider, l'affiliazione è sempre dichiarata.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/compatibility" className="btn-primary">
                Check compatibilità
              </Link>
              <Link href="/trasparenza" className="btn-secondary">
                Trasparenza
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-slate-400 space-y-2">
            <p>Informazioni educative: non è consulenza.</p>
            <p>Fonti ufficiali e date disponibili in 'Fonti & metodo'.</p>
            <p>Nessun investimento o rendimento trattato.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
