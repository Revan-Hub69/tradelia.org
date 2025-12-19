import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Capisci quanto ti costa davvero{' '}
            <span className="text-gradient">operare nei mercati finanziari</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-3xl mx-auto">
            Tradelia analizza costi, esecuzione e compatibilità operativa tra il tuo stile di trading 
            e le piattaforme che utilizzi — su CFD, cripto e altri mercati finanziari — basandosi su 
            documentazione ufficiale e modelli verificabili.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-slate-400" />
                  <span>Nessun "miglior broker"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-slate-400" />
                  <span>Nessuna promessa di profitto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-slate-400" />
                  <span>Solo analisi dei costi e dell'attrito operativo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/assessment">
              <Button size="lg" className="px-8">
                Analizza la tua operatività
              </Button>
            </Link>
            <Link href="#method">
              <Button variant="outline" size="lg">
                Scopri il metodo →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}