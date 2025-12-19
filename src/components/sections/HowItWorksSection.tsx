import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Profilo operativo',
      description: 'Descrivi la tua operatività abituale (o quella che stai pianificando, se non sei ancora attivo)',
      details: [
        'mercati e strumenti',
        'frequenza',
        'tipo di ordini',
        'dimensione tipica',
        'vincoli regolatori'
      ]
    },
    {
      number: '02',
      title: 'Analisi strutturale',
      description: 'Tradelia analizza documenti ufficiali e modelli dichiarati',
      details: [
        'documenti ufficiali delle piattaforme',
        'modelli di esecuzione dichiarati',
        'strutture di costo note',
        'livello di regolamentazione'
      ],
      note: 'I calcoli sono deterministici. Le spiegazioni sono tracciabili alle fonti.'
    },
    {
      number: '03',
      title: 'Report di compatibilità',
      description: 'Ricevi un report che mostra l\'attrito operativo per ogni mercato',
      details: [
        'attrito operativo stimato per ogni mercato',
        'differenze tra CFD, cripto e altri strumenti',
        'quando un solo intermediario non è adatto a tutto',
        'quando una combinazione di piattaforme è più coerente'
      ]
    }
  ]

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            Come funziona
          </h2>
          <p className="text-lg text-slate-600">
            Tre passaggi per comprendere l'attrito operativo della tua strategia
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-lg font-bold text-xl">
                    {step.number}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-6">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {step.note && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700 font-medium">
                        {step.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-16 bg-slate-200 hidden lg:block" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/assessment">
            <Button size="lg" className="px-8">
              Inizia l'analisi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}