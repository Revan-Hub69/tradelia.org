export default function FinanzaPersonalePage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="card space-y-6">
        <span className="pill">Decision support</span>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Decision support per scelte finanziarie personali
          </h2>
          <p className="max-w-3xl text-base leading-relaxed sm:text-lg">
            Molte decisioni di finanza personale non falliscono perché “sbagliate”. Falliscono perché vengono prese con
            informazioni incomplete, poco confrontabili o distorte dal modo in cui vengono presentate.
          </p>
          <p className="max-w-3xl text-base leading-relaxed sm:text-lg">
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
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="card p-4">
            <p className="kicker">Input</p>
            <p className="mt-2 leading-relaxed">Contesto operativo reale, senza preferenze astratte.</p>
          </div>
          <div className="card p-4">
            <p className="kicker">Esclusione</p>
            <p className="mt-2 leading-relaxed">Eliminazione delle opzioni incompatibili prima dei suggerimenti.</p>
          </div>
          <div className="card p-4">
            <p className="kicker">Output</p>
            <p className="mt-2 leading-relaxed">Scenari compatibili o esito “nessuna opzione” valido.</p>
          </div>
        </div>
        <p className="text-sm text-muted">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="problema" className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="kicker">Perché scegliere è difficile</p>
          <h3 className="text-2xl font-semibold">Perché scegliere strumenti finanziari è così difficile</h3>
          <p className="text-sm leading-relaxed">
            Nella finanza personale il problema non è la mancanza di informazioni. È l’eccesso di informazioni non
            progettate per aiutare una decisione reale.
          </p>
          <p className="text-sm leading-relaxed">
            Questo non rende quei contenuti inutili. Li rende insufficienti quando la scelta dipende da vincoli
            concreti, tempo limitato e carico cognitivo elevato.
          </p>
        </div>
        <div className="card space-y-3 text-sm">
          <p className="kicker">Limiti sistemici</p>
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
          <p className="kicker">Cosa fa Tradelia</p>
          <h3 className="mt-2 text-2xl font-semibold">Cosa fa Tradelia, concretamente</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card text-sm leading-relaxed">
            <p className="kicker">Input operativo</p>
            <p className="mt-2">
              Raccogliamo condizioni reali d’uso: residenza, frequenza, limiti critici, problemi già vissuti.
            </p>
            <p className="mt-3 text-xs text-muted">
              Nessun obiettivo finanziario, nessuna preferenza soggettiva.
            </p>
          </div>
          <div className="card text-sm leading-relaxed">
            <p className="kicker">Matching</p>
            <p className="mt-2">
              Contratti ufficiali, clausole operative verificabili, costi espliciti e costi nel tempo.
            </p>
            <p className="mt-3 text-xs text-muted">Dati aggregati anonimi di utilizzo reale.</p>
          </div>
          <div className="card text-sm leading-relaxed">
            <p className="kicker">Esclusione</p>
            <p className="mt-2">
              Le opzioni incompatibili vengono eliminate prima di proporre qualsiasi scenario.
            </p>
            <p className="mt-3 text-xs text-muted">Anche se popolari o sponsorizzate.</p>
          </div>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="match" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="kicker">Compatibilità</p>
          <h3 className="text-2xl font-semibold">Cosa significa “matchare” una soluzione</h3>
          <p className="text-sm">Una soluzione è considerata compatibile solo se:</p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>• Il contratto non introduce vincoli critici per il tuo utilizzo</li>
            <li>• I costi nel tempo sono coerenti con la frequenza operativa</li>
            <li>• I limiti (prelievi, bonifici, estero, blocchi) sono gestibili</li>
            <li>• I casi d’uso osservati non mostrano incompatibilità ricorrenti</li>
          </ul>
        </div>
        <div className="card space-y-4">
          <p className="kicker">Regola chiave</p>
          <p className="text-sm">
            Se una di queste condizioni fallisce, l’opzione viene esclusa. Anche se è popolare. Anche se è sponsorizzata.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            L’obiettivo non è trovare “la migliore”. È ridurre il rischio di scegliere qualcosa che non funzionerà nel
            tuo contesto.
          </p>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="analizziamo" className="mt-10 space-y-6">
        <div>
          <p className="kicker">Cosa analizziamo</p>
          <h3 className="mt-2 text-2xl font-semibold">Cosa analizziamo</h3>
          <p className="text-sm leading-relaxed">L’analisi riguarda strumenti, non comportamenti personali.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Conti correnti e conti di pagamento: canoni, costi ricorrenti, limiti, tutele effettive',
            'Carte di debito, credito e prepagate: condizioni operative, utilizzo reale, vincoli frequenti',
            'Servizi fintech di base: licenze, segregazione dei fondi, rischi operativi',
            'Costi operativi nel tempo: commissioni, imposta di bollo, costi indiretti',
            'Compatibilità profilo–strumento: residenza, reddito, frequenza d’uso, contesto operativo'
          ].map((item) => (
            <div key={item} className="card text-sm leading-relaxed">
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="limiti" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="kicker">Limiti dichiarati</p>
          <h3 className="text-2xl font-semibold">Cosa questa analisi non fa</h3>
          <p className="text-sm leading-relaxed">
            Per essere utile, un sistema deve anche dire dove si ferma. Tradelia:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>• Non fornisce consigli personalizzati</li>
            <li>• Non assegna ranking o “migliori”</li>
            <li>• Non promette risparmio o benefici economici</li>
            <li>• Non valuta investimenti, mutui o prestiti</li>
            <li>• Non fa educazione finanziaria motivazionale</li>
          </ul>
        </div>
        <div className="card space-y-3 text-sm">
          <p className="kicker">Esito valido</p>
          <p>
            In alcuni casi l’analisi può concludersi senza opzioni compatibili. Questo è un risultato valido e
            dichiarato.
          </p>
          <p className="text-muted">
            Forzare una scelta aumenterebbe la probabilità di errore.
          </p>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="metodo" className="mt-10 space-y-6">
        <div>
          <p className="kicker">Metodo</p>
          <h3 className="mt-2 text-2xl font-semibold">Il metodo applicato alla finanza personale</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Fonti ufficiali: documentazione contrattuale e autorità di vigilanza',
            'Criteri verificabili: costi, limiti, tutele, affidabilità operativa',
            'Processo di esclusione: eliminazione progressiva delle incompatibilità',
            'Output condizionato: scenari con limiti espliciti o nessuna soluzione'
          ].map((item) => (
            <div key={item} className="card text-sm leading-relaxed">
              {item}
            </div>
          ))}
        </div>
        <a className="link-ghost mt-2" href="#approfondisci">
          Approfondisci il Metodo Tradelia
        </a>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="analisi" className="mt-10 card space-y-4 sm:p-8">
        <p className="kicker">Analisi di compatibilità</p>
        <h3 className="text-2xl font-semibold">Avvia un’analisi di compatibilità</h3>
        <p className="text-sm leading-relaxed">
          L’analisi richiede alcune informazioni di contesto operativo. Non raccoglie dati superflui e non produce
          raccomandazioni automatiche.
        </p>
        <p className="text-sm leading-relaxed">
          In alcuni casi può indicare che non esiste una soluzione adatta nelle condizioni attuali.
        </p>
        <a className="btn-primary w-full sm:w-auto" href="#procedi">
          Procedi all’analisi
        </a>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section id="trasparenza" className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="kicker">Trasparenza e indipendenza</p>
          <h3 className="text-2xl font-semibold">Trasparenza e indipendenza</h3>
          <p className="text-sm leading-relaxed">
            Tradelia non vende prodotti finanziari. Eventuali affiliazioni sono dichiarate e non influenzano i criteri
            di analisi.
          </p>
          <p className="text-sm leading-relaxed">
            Le affiliazioni, quando presenti, compaiono solo a valle dell’analisi e solo se esistono opzioni compatibili.
          </p>
        </div>
        <div className="card space-y-3 text-sm">
          <p className="kicker">Disclosure</p>
          <p>L’affiliazione è una conseguenza, non un obiettivo.</p>
          <a className="link-ghost mt-2" href="#conflitti">
            Trasparenza & conflitti
          </a>
        </div>
      </section>

      <div className="section-divider mt-12" aria-hidden />
      <section className="mt-10 text-sm text-muted">
        <p className="font-semibold">Tradelia · Finanza Personale</p>
        <p>Supporto decisionale per strumenti finanziari personali.</p>
        <p className="mt-4">Metodo · Trasparenza · Domini · Privacy · Disclaimer</p>
        <p className="mt-2">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>
    </main>
  )
}
