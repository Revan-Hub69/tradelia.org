'use client'

import { useState } from 'react'
import { TradeliaHeader } from '../components/TradeliaHeader'
import { EditorialHero } from '../components/EditorialHero'
import { RiskScale, type RiskLevel } from '../components/RiskScale'
import { MethodNote } from '../components/MethodNote'
import { GlossaryTrigger } from '../components/GlossaryTrigger'
import { InstitutionFooter } from '../components/InstitutionFooter'

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState('it')

  // Handle theme toggle (placeholder for now)
  const handleThemeToggle = () => {
    // TODO: Implement theme switching
    console.log('Theme toggle clicked')
  }

  // Risk levels data
  const riskLevels: RiskLevel[] = [
    {
      level: 'low',
      title: 'Rischio contenuto',
      description: 'Esposizione indiretta o delegata (ETF, strumenti regolamentati). Per chi desidera esposizione al settore crypto senza gestire aspetti tecnici o operativi.',
      href: '/risk/contenuto'
    },
    {
      level: 'mid',
      title: 'Rischio intermedio',
      description: 'Esposizione diretta con custodia. Per chi vuole possedere direttamente asset crypto ed è disposto a gestire responsabilità tecniche e di sicurezza.',
      href: '/risk/intermedio'
    },
    {
      level: 'high',
      title: 'Rischio elevato',
      description: 'Esposizione operativa. Per chi prende decisioni attive nel tempo e accetta una maggiore probabilità di errore.',
      href: '/risk/elevato'
    },
    {
      level: 'extreme',
      title: 'Rischio molto elevato',
      description: 'Esposizione speculativa complessa (futures, opzioni, leva). Per profili molto specifici, consapevoli dei limiti strutturali per operatori non professionali.',
      href: '/risk/molto-elevato'
    }
  ]

  // Footer links
  const footerLinks = [
    { label: 'Metodo', href: '/method' },
    { label: 'Glossario', href: '/glossary' },
    { label: 'Fonti', href: '/sources' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Cookie', href: '/cookie' },
    { label: 'Termini', href: '/terms' },
    { label: 'Contatti', href: '/contact' }
  ]

  const disclaimer = 'Le informazioni fornite da Tradelia sono esclusivamente a scopo educativo e informativo. Non costituiscono consigli finanziari, raccomandazioni di investimento o sollecitazioni all\'acquisto di criptovalute. Effettua sempre le tue ricerche indipendenti e consulta professionisti qualificati prima di prendere decisioni finanziarie. Le criptovalute sono altamente volatili e comportano rischi significativi, inclusa la possibile perdita totale del capitale investito.'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <TradeliaHeader
        lang={currentLang}
        onToggleTheme={handleThemeToggle}
        onChangeLang={setCurrentLang}
      />

      {/* Main Content */}
      <main>
        {/* 1. Editorial Hero */}
        <EditorialHero
          title="Tradelia"
          lede={[
            "Comprendere il rischio nel mondo delle criptovalute",
            "Un progetto educativo indipendente senza pressioni commerciali"
          ]}
        />

        {/* 2. Context Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="space-y-6 text-lg text-[var(--muted)] leading-relaxed">
              <p>
                Il mondo delle criptovalute interessa molte persone, ma solo una parte di esse vi partecipa realmente.
              </p>
              <p>
                Molti non acquistano perché non capiscono come funziona. Molti hanno paura di commettere errori irreversibili.
                Altri operano già, ma con confusione e informazioni contraddittorie.
              </p>
              <p>
                Queste difficoltà non dipendono dalla mancanza di dati. Le criptovalute sono, dal punto di vista tecnico,
                sistemi altamente trasparenti. Il problema è <GlossaryTrigger termId="transparency">interpretare correttamente il rischio</GlossaryTrigger>.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Central Thesis */}
        <section className="py-16 bg-[var(--bg-2)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">
              Trasparenza ≠ Sicurezza
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
              Il mondo crypto non è un unico strumento. Si va da prodotti relativamente semplici e regolamentati,
              come ETF ed ETP, fino a strumenti complessi e ad alto rischio, come futures, opzioni e prodotti a leva.
              Ogni livello comporta rischi diversi, responsabilità diverse e competenze diverse.
            </p>
          </div>
        </section>

        {/* 4. Editorial Risk Scale */}
        <RiskScale items={riskLevels} />

        {/* 5. Tradelia Positioning */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">
              Il punto di partenza di Tradelia
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
              Tradelia è un progetto educativo indipendente. Non fornisce segnali, previsioni o indicazioni operative.
              Non suggerisce cosa acquistare. Tradelia aiuta a rispondere a una domanda preliminare: Quale livello di
              esposizione al mondo crypto è coerente con il mio profilo di rischio?
            </p>
            <p className="text-sm text-[var(--muted)] italic">
              Salire di livello non è un progresso. È una scelta diversa.
            </p>
          </div>
        </section>

        {/* 6. Method Declaration */}
        <MethodNote
          summary="Ogni contenuto Tradelia segue lo stesso schema: cosa dice la ricerca, come interpretarla in modo comprensibile, quali rischi reali comporta, fonti verificabili."
          href="/method"
        />

        {/* 7. Quiet Closing Paragraph */}
        <section className="py-20 bg-[var(--bg-2)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              Nel mondo delle criptovalute, agire senza comprendere il contesto è spesso più rischioso che non agire.
              Tradelia esiste per aiutare a scegliere consapevolmente.
            </p>
          </div>
        </section>
      </main>

      {/* 8. Institutional Footer */}
      <InstitutionFooter links={footerLinks} disclaimer={disclaimer} />
    </div>
  )
}
