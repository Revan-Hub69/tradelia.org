export default function FinanzaPersonalePage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Decision support</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          Decision support per scelte finanziarie personali
        </h2>
        <p className="text-lg text-slate-300">
          Molte decisioni di finanza personale non falliscono perché “sbagliate”. Falliscono perché vengono prese con
          informazioni incomplete, poco confrontabili o distorte dal modo in cui vengono presentate.
        </p>
        <p className="text-lg text-slate-300">
          Tradelia aiuta a ridurre errori evitabili nella scelta di conti, carte e servizi finanziari personali,
          partendo dai casi d’uso reali, non da ranking o promesse.
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="btn-primary" href="#analisi">
            Avvia un’analisi di compatibilità
          </a>
          <a className="btn-secondary" href="#metodo">
            Come funziona il metodo
          </a>
        </div>
        <p className="text-sm text-slate-400">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>

      <section id="problema" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Perché scegliere è difficile
        </p>
        <h3 className="text-2xl font-semibold text-white">Perché scegliere strumenti finanziari è così difficile</h3>
        <p className="text-sm text-slate-300">
          Nella finanza personale il problema non è la mancanza di informazioni. È l’eccesso di informazioni non
          progettate per aiutare una decisione reale.
        </p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Confrontano prodotti in astratto, non contesti di utilizzo</li>
          <li>• Semplificano in classifiche “migliori”</li>
          <li>• Sono incentivati a massimizzare ricavi da chi paga di più</li>
          <li>• Non dichiarano incompatibilità operative</li>
          <li>• Non accettano l’esito “nessuna soluzione adatta”</li>
        </ul>
        <p className="text-sm text-slate-300">
          Questo non rende quei contenuti inutili. Li rende insufficienti quando la scelta dipende da vincoli concreti.
        </p>
        <p className="text-sm text-slate-300">
          La ricerca sul comportamento finanziario mostra che, in questi contesti, le persone rimandano il confronto,
          restano con l’opzione già in uso e prendono decisioni basate su segnali parziali. Non è disattenzione. È il
          modo normale in cui decidiamo sotto complessità.
        </p>
      </section>

      <section id="cosa-fa" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa fa Tradelia</p>
        <h3 className="text-2xl font-semibold text-white">Cosa fa Tradelia, concretamente</h3>
        <p className="text-sm text-slate-300">
          Tradelia non chiede “cosa preferisci”. Chiede come usi davvero gli strumenti finanziari.
        </p>
        <p className="text-sm text-slate-300">
          Attraverso un modulo guidato raccogliamo condizioni operative generali, come dove vivi e operi, come utilizzi
          conti e carte, quali limiti sono critici e quali problemi hai incontrato in passato.
        </p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Non raccogliamo obiettivi finanziari</li>
          <li>• Non raccogliamo preferenze soggettive</li>
          <li>• Non raccogliamo dati superflui</li>
        </ul>
        <p className="text-sm text-slate-300">
          Le informazioni vengono poi confrontate con un sistema interno che integra contratti ufficiali, clausole
          operative verificabili, costi espliciti e costi che emergono nel tempo, limiti ricorrenti per specifici casi
          d’uso e dati aggregati anonimi di utilizzo reale.
        </p>
        <p className="text-sm text-slate-300">
          Il sistema esclude le opzioni incompatibili prima di proporre qualsiasi scenario.
        </p>
      </section>

      <section id="match" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Compatibilità</p>
        <h3 className="text-2xl font-semibold text-white">Cosa significa “matchare” una soluzione</h3>
        <p className="text-sm text-slate-300">Una soluzione è considerata compatibile solo se:</p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Il contratto non introduce vincoli critici per il tuo utilizzo</li>
          <li>• I costi nel tempo sono coerenti con la frequenza operativa</li>
          <li>• I limiti (prelievi, bonifici, estero, blocchi) sono gestibili</li>
          <li>• I casi d’uso osservati non mostrano incompatibilità ricorrenti</li>
        </ul>
        <p className="text-sm text-slate-300">
          Se una di queste condizioni fallisce, l’opzione viene esclusa. Anche se è popolare. Anche se è sponsorizzata.
        </p>
        <p className="text-sm text-slate-300">
          L’obiettivo non è trovare “la migliore”. È ridurre il rischio di scegliere qualcosa che non funzionerà nel
          tuo contesto.
        </p>
      </section>

      <section id="analizziamo" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa analizziamo</p>
        <h3 className="text-2xl font-semibold text-white">Cosa analizziamo</h3>
        <p className="text-sm text-slate-300">L’analisi riguarda strumenti, non comportamenti personali.</p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Conti correnti e conti di pagamento: canoni, costi ricorrenti, limiti, tutele effettive</li>
          <li>• Carte di debito, credito e prepagate: condizioni operative, utilizzo reale, vincoli frequenti</li>
          <li>• Servizi fintech di base: licenze, segregazione dei fondi, rischi operativi</li>
          <li>• Costi operativi nel tempo: commissioni, imposta di bollo, costi indiretti</li>
          <li>• Compatibilità profilo–strumento: residenza, reddito, frequenza d’uso, contesto operativo</li>
        </ul>
      </section>

      <section id="limiti" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Limiti dichiarati</p>
        <h3 className="text-2xl font-semibold text-white">Cosa questa analisi non fa</h3>
        <p className="text-sm text-slate-300">
          Per essere utile, un sistema deve anche dire dove si ferma. Tradelia:
        </p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Non fornisce consigli personalizzati</li>
          <li>• Non assegna ranking o “migliori”</li>
          <li>• Non promette risparmio o benefici economici</li>
          <li>• Non valuta investimenti, mutui o prestiti</li>
          <li>• Non fa educazione finanziaria motivazionale</li>
        </ul>
        <p className="text-sm text-slate-300">
          In alcuni casi l’analisi può concludersi senza opzioni compatibili. Questo è un risultato valido.
        </p>
      </section>

      <section id="metodo" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo</p>
        <h3 className="text-2xl font-semibold text-white">Il metodo applicato alla finanza personale</h3>
        <p className="text-sm text-slate-300">
          Il metodo Tradelia è progettato per funzionare anche quando le informazioni sono incomplete, le alternative
          sono molte e il tempo per confrontare è limitato.
        </p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Fonti ufficiali: documentazione contrattuale e autorità di vigilanza</li>
          <li>• Criteri verificabili: costi, limiti, tutele, affidabilità operativa</li>
          <li>• Processo di esclusione: eliminazione progressiva delle incompatibilità</li>
          <li>• Output condizionato: scenari con limiti espliciti o nessuna soluzione</li>
        </ul>
        <p className="text-sm text-slate-300">
          Non sempre emerge una risposta positiva. Forzare una scelta aumenterebbe la probabilità di errore.
        </p>
        <a className="link-ghost mt-4" href="#approfondisci">
          Approfondisci il Metodo Tradelia
        </a>
      </section>

      <section id="analisi" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Analisi di compatibilità</p>
        <h3 className="text-2xl font-semibold text-white">Avvia un’analisi di compatibilità</h3>
        <p className="text-sm text-slate-300">
          L’analisi richiede alcune informazioni di contesto operativo. Non raccoglie dati superflui e non produce
          raccomandazioni automatiche.
        </p>
        <p className="text-sm text-slate-300">
          In alcuni casi può indicare che non esiste una soluzione adatta nelle condizioni attuali.
        </p>
        <a className="btn-primary" href="#procedi">
          Procedi all’analisi
        </a>
      </section>

      <section id="trasparenza" className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trasparenza e indipendenza</p>
        <h3 className="text-2xl font-semibold text-white">Trasparenza e indipendenza</h3>
        <p className="text-sm text-slate-300">
          Tradelia non vende prodotti finanziari. Eventuali affiliazioni sono dichiarate e non influenzano i criteri di
          analisi.
        </p>
        <p className="text-sm text-slate-300">
          Le affiliazioni, quando presenti, compaiono solo a valle dell’analisi e solo se esistono opzioni compatibili.
        </p>
        <a className="link-ghost mt-4" href="#conflitti">
          Trasparenza & conflitti
        </a>
      </section>

      <section className="mt-14 border-t border-slate-800/60 pt-10 text-sm text-slate-400">
        <p className="font-semibold text-slate-200">Tradelia · Finanza Personale</p>
        <p>Supporto decisionale per strumenti finanziari personali.</p>
        <p className="mt-4">
          Metodo · Trasparenza · Domini · Privacy · Disclaimer
        </p>
        <p className="mt-2">Informativo / educativo. Non è consulenza finanziaria.</p>
      </section>
    </main>
  )
}
