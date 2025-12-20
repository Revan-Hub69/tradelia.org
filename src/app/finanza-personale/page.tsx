export default function FinanzaPersonalePage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="card-premium space-y-6 rounded-3xl border-slate-700/70 bg-slate-900/50 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Decision support
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Decision support per scelte finanziarie personali
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Molte decisioni di finanza personale non falliscono perché “sbagliate”. Falliscono perché vengono prese con
            informazioni incomplete, poco confrontabili o distorte dal modo in cui vengono presentate.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Tradelia aiuta a ridurre errori evitabili nella scelta di conti, carte e servizi finanziari personali,
            partendo dai casi d’uso reali, non da ranking o promesse.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a className="btn-primary w-full sm:w-auto" href="#analisi">
            Avvia un’analisi di compatibilità
          </a>
          <a className="btn-secondary w-full sm:w-auto" href="#metodo">
            Come funziona il metodo
          </a>
        </div>
        <div className="grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Input</p>
            <p className="mt-2 leading-relaxed">Contesto operativo reale, senza preferenze astratte.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Esclusione</p>
            <p className="mt-2 leading-relaxed">Eliminazione delle opzioni incompatibili prima dei suggerimenti.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Output</p>
            <p className="mt-2 leading-relaxed">Scenari compatibili o esito “nessuna opzione” valido.</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="problema" className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Perché scegliere è difficile</p>
          <h3 className="text-2xl font-semibold text-white">Perché scegliere strumenti finanziari è così difficile</h3>
          <p className="text-sm leading-relaxed text-slate-200">
            Nella finanza personale il problema non è la mancanza di informazioni. È l’eccesso di informazioni non
            progettate per aiutare una decisione reale.
          </p>
          <p className="text-sm leading-relaxed text-slate-200">
            Questo non rende quei contenuti inutili. Li rende insufficienti quando la scelta dipende da vincoli
            concreti, tempo limitato e carico cognitivo elevato.
          </p>
        </div>
        <div className="card-premium space-y-3 rounded-3xl border-slate-800/70 bg-slate-900/60 p-6 text-sm text-slate-200 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.9)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Limiti sistemici</p>
          <ul className="space-y-2 leading-relaxed">
            <li>• Confronti astratti invece di contesti d’uso</li>
            <li>• Classifiche “migliori” poco verificabili</li>
            <li>• Incentivi legati alle affiliazioni</li>
            <li>• Incompatibilità non dichiarate</li>
            <li>• Rifiuto dell’esito “nessuna soluzione adatta”</li>
          </ul>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="cosa-fa" className="mt-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa fa Tradelia</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Cosa fa Tradelia, concretamente</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-200 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Input operativo</p>
            <p className="mt-2">
              Raccogliamo condizioni reali d’uso: residenza, frequenza, limiti critici, problemi già vissuti.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Nessun obiettivo finanziario, nessuna preferenza soggettiva.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-200 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Matching</p>
            <p className="mt-2">
              Contratti ufficiali, clausole operative verificabili, costi espliciti e costi nel tempo.
            </p>
            <p className="mt-3 text-xs text-slate-400">Dati aggregati anonimi di utilizzo reale.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-200 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.85)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Esclusione</p>
            <p className="mt-2">
              Le opzioni incompatibili vengono eliminate prima di proporre qualsiasi scenario.
            </p>
            <p className="mt-3 text-xs text-slate-400">Anche se popolari o sponsorizzate.</p>
          </div>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="match" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Compatibilità</p>
          <h3 className="text-2xl font-semibold text-white">Cosa significa “matchare” una soluzione</h3>
          <p className="text-sm text-slate-200">Una soluzione è considerata compatibile solo se:</p>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-200">
            <li>• Il contratto non introduce vincoli critici per il tuo utilizzo</li>
            <li>• I costi nel tempo sono coerenti con la frequenza operativa</li>
            <li>• I limiti (prelievi, bonifici, estero, blocchi) sono gestibili</li>
            <li>• I casi d’uso osservati non mostrano incompatibilità ricorrenti</li>
          </ul>
        </div>
        <div className="card-premium space-y-4 rounded-3xl border-slate-800/70 bg-slate-900/60 p-6 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.9)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Regola chiave</p>
          <p className="text-sm text-slate-200">
            Se una di queste condizioni fallisce, l’opzione viene esclusa. Anche se è popolare. Anche se è sponsorizzata.
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            L’obiettivo non è trovare “la migliore”. È ridurre il rischio di scegliere qualcosa che non funzionerà nel
            tuo contesto.
          </p>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="analizziamo" className="mt-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa analizziamo</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Cosa analizziamo</h3>
          <p className="text-sm leading-relaxed text-slate-200">L’analisi riguarda strumenti, non comportamenti personali.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Conti correnti e conti di pagamento: canoni, costi ricorrenti, limiti, tutele effettive',
            'Carte di debito, credito e prepagate: condizioni operative, utilizzo reale, vincoli frequenti',
            'Servizi fintech di base: licenze, segregazione dei fondi, rischi operativi',
            'Costi operativi nel tempo: commissioni, imposta di bollo, costi indiretti',
            'Compatibilità profilo–strumento: residenza, reddito, frequenza d’uso, contesto operativo'
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-200 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.85)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="limiti" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Limiti dichiarati</p>
          <h3 className="text-2xl font-semibold text-white">Cosa questa analisi non fa</h3>
          <p className="text-sm leading-relaxed text-slate-200">
            Per essere utile, un sistema deve anche dire dove si ferma. Tradelia:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-200">
            <li>• Non fornisce consigli personalizzati</li>
            <li>• Non assegna ranking o “migliori”</li>
            <li>• Non promette risparmio o benefici economici</li>
            <li>• Non valuta investimenti, mutui o prestiti</li>
            <li>• Non fa educazione finanziaria motivazionale</li>
          </ul>
        </div>
        <div className="card-premium space-y-3 rounded-3xl border-slate-800/70 bg-slate-900/60 p-6 text-sm text-slate-200 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.9)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Esito valido</p>
          <p>
            In alcuni casi l’analisi può concludersi senza opzioni compatibili. Questo è un risultato valido e
            dichiarato.
          </p>
          <p className="text-slate-400">
            Forzare una scelta aumenterebbe la probabilità di errore.
          </p>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="metodo" className="mt-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Il metodo applicato alla finanza personale</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Fonti ufficiali: documentazione contrattuale e autorità di vigilanza',
            'Criteri verificabili: costi, limiti, tutele, affidabilità operativa',
            'Processo di esclusione: eliminazione progressiva delle incompatibilità',
            'Output condizionato: scenari con limiti espliciti o nessuna soluzione'
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-200 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.85)]"
            >
              {item}
            </div>
          ))}
        </div>
        <a className="link-ghost mt-2" href="#approfondisci">
          Approfondisci il Metodo Tradelia
        </a>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section
        id="analisi"
        className="mt-10 card-premium space-y-4 rounded-3xl border-slate-800/70 bg-slate-900/60 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.9)] sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Analisi di compatibilità</p>
        <h3 className="text-2xl font-semibold text-white">Avvia un’analisi di compatibilità</h3>
        <p className="text-sm leading-relaxed text-slate-200">
          L’analisi richiede alcune informazioni di contesto operativo. Non raccoglie dati superflui e non produce
          raccomandazioni automatiche.
        </p>
        <p className="text-sm leading-relaxed text-slate-200">
          In alcuni casi può indicare che non esiste una soluzione adatta nelle condizioni attuali.
        </p>
        <a className="btn-primary w-full sm:w-auto" href="#procedi">
          Procedi all’analisi
        </a>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="trasparenza" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trasparenza e indipendenza</p>
          <h3 className="text-2xl font-semibold text-white">Trasparenza e indipendenza</h3>
          <p className="text-sm leading-relaxed text-slate-200">
            Tradelia non vende prodotti finanziari. Eventuali affiliazioni sono dichiarate e non influenzano i criteri
            di analisi.
          </p>
          <p className="text-sm leading-relaxed text-slate-200">
            Le affiliazioni, quando presenti, compaiono solo a valle dell’analisi e solo se esistono opzioni compatibili.
          </p>
        </div>
        <div className="card-premium space-y-3 rounded-3xl border-slate-800/70 bg-slate-900/60 p-6 text-sm text-slate-200 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.9)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Disclosure</p>
          <p>L’affiliazione è una conseguenza, non un obiettivo.</p>
          <a className="link-ghost mt-2" href="#conflitti">
            Trasparenza & conflitti
          </a>
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800/60 pt-10 text-sm text-slate-400">
        <p className="font-semibold text-slate-200">Tradelia · Finanza Personale</p>
        <p>Supporto decisionale per strumenti finanziari personali.</p>
        <p className="mt-4">Metodo · Trasparenza · Domini · Privacy · Disclaimer</p>
        <p className="mt-2">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>
    </main>
  )
}
