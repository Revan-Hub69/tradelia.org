export function WhatSection() {
  return (
    <section className="py-24 sm:py-32 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Non confrontiamo mercati. Confrontiamo l'attrito che subisci operando.
            </h2>
            <p className="text-lg text-slate-600 leading-8">
              Nei mercati finanziari, gran parte dei costi non è immediatamente visibile: 
              spread variabili, slippage, modelli di esecuzione, funding, vincoli regolatori.
            </p>
            <p className="text-lg text-slate-600 leading-8 mt-4">
              Tradelia non prova a ricostruire la "vera realtà del mercato". 
              Misura invece quanto la tua operatività è compatibile con l'infrastruttura che stai usando.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Con Tradelia puoi:
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <AnalysisIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Analizzare CFD, cripto, azioni, obbligazioni nello stesso framework
                  </h4>
                  <p className="text-sm text-slate-600">
                    Visione unificata dei costi operativi su tutti i mercati che utilizzi
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CostIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Capire dove e perché stai pagando di più
                  </h4>
                  <p className="text-sm text-slate-600">
                    Identificazione dei driver di costo nascosti nella tua operatività
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CompatibilityIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Ricevere una mappa di compatibilità tra il tuo stile operativo e le piattaforme
                  </h4>
                  <p className="text-sm text-slate-600">
                    Analisi dell'attrito operativo basata sul tuo profilo specifico
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <DecisionIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Sapere quando non conviene cambiare nulla
                  </h4>
                  <p className="text-sm text-slate-600">
                    "Non valutabile" è un risultato valido quando i dati sono insufficienti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AnalysisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function CostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CompatibilityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DecisionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  )
}