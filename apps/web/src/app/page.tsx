'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// No icons - homepage is text-focused according to design spec
import { TradeliaLogo } from '../components/icons/TradeliaLogo'
import { RiskLowIcon } from '../components/icons/RiskLowIcon'
import { RiskMidIcon } from '../components/icons/RiskMidIcon'
import { RiskHighIcon } from '../components/icons/RiskHighIcon'
import { RiskExtremeIcon } from '../components/icons/RiskExtremeIcon'
import { MethodIcon } from '../components/icons/MethodIcon'
import { useTrading } from '../lib/contexts/TradingContext'

// Supported languages
const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
}

// Content following HOMEPAGE-SPEC.md exactly
const CONTENT = {
  en: {
    title: "Tradelia",
    subtitle: "Understanding Risk in the Cryptocurrency World",
    context: {
      para1: "The world of cryptocurrencies interests many people, but only a portion of them actually participate in it.",
      para2: "Many do not buy because they do not understand how it works.",
      para3: "Many are afraid of making irreversible mistakes.",
      para4: "Many have had negative experiences or scams.",
      para5: "Others are already operating, but with confusion and contradictory information.",
      para6: "These difficulties do not depend on the lack of data.",
      para7: "Cryptocurrencies are, from a technical point of view, highly transparent systems.",
      para8: "The problem is interpreting the risk correctly."
    },
    contextTitle: "The Real Context",
    contextDesc: "The crypto world is not a single instrument. We go from relatively simple and regulated products, like ETFs and ETPs, up to complex and high-risk instruments, like futures, options and leveraged products. Each level involves different risks, different responsibilities and different skills.",
    tradeliaPoint: "Tradelia's Starting Point",
    tradeliaDesc: "Tradelia is an independent educational project. It does not provide signals, predictions or operational indications. It does not suggest what to buy. Tradelia helps answer a preliminary question: Which level of crypto world exposure is consistent with your risk profile?",
    chooseTitle: "Choose Based on Risk",
    riskLevels: {
      low: {
        title: "Content Risk",
        subtitle: "Indirect or delegated exposure (ETFs, regulated instruments)",
        desc: "For those who desire exposure to the crypto sector without managing technical or operational aspects."
      },
      medium: {
        title: "Medium Risk",
        subtitle: "Direct exposure with custody",
        desc: "For those who want to own crypto assets directly and are willing to manage technical and security responsibilities."
      },
      high: {
        title: "High Risk",
        subtitle: "Operational exposure",
        desc: "For those who take active time decisions and accept a greater probability of error."
      },
      extreme: {
        title: "Very High Risk",
        subtitle: "Complex speculative exposure (futures, options, leverage)",
        desc: "For very specific profiles, aware of the structural limitations for non-professional operators."
      }
    },
    note: "Going up levels is not progress. It's a different choice.",
    methodTitle: "The Tradelia Method",
    methodDesc: "Every Tradelia content follows the same scheme: what research says, how to interpret it understandably, what real risks it involves, verifiable sources.",
    conclusion: "In the world of cryptocurrencies, acting without understanding the context is often more risky than not acting. Tradelia exists to help choose consciously."
  },
  it: {
    title: "Tradelia",
    subtitle: "Comprendere il rischio nel mondo delle criptovalute",
    context: {
      para1: "Il mondo delle criptovalute interessa molte persone, ma solo una parte di esse vi partecipa realmente.",
      para2: "Molti non acquistano perché non capiscono come funziona.",
      para3: "Molti hanno paura di commettere errori irreversibili.",
      para4: "Molti hanno avuto esperienze negative o truffe.",
      para5: "Altri operano già, ma con confusione e informazioni contraddittorie.",
      para6: "Queste difficoltà non dipendono dalla mancanza di dati.",
      para7: "Le criptovalute sono, dal punto di vista tecnico, sistemi altamente trasparenti.",
      para8: "Il problema è interpretare correttamente il rischio."
    },
    contextTitle: "Il contesto reale",
    contextDesc: "Il mondo crypto non è un unico strumento. Si va da prodotti relativamente semplici e regolamentati, come ETF ed ETP, fino a strumenti complessi e ad alto rischio, come futures, opzioni e prodotti a leva. Ogni livello comporta rischi diversi, responsabilità diverse e competenze diverse.",
    tradeliaPoint: "Il punto di partenza di Tradelia",
    tradeliaDesc: "Tradelia è un progetto educativo indipendente. Non fornisce segnali, previsioni o indicazioni operative. Non suggerisce cosa acquistare. Tradelia aiuta a rispondere a una domanda preliminare: Quale livello di esposizione al mondo crypto è coerente con il mio profilo di rischio?",
    chooseTitle: "Scegli in base al rischio",
    riskLevels: {
      low: {
        title: "Rischio contenuto",
        subtitle: "Esposizione indiretta o delegata (ETF, strumenti regolamentati)",
        desc: "Per chi desidera esposizione al settore crypto senza gestire aspetti tecnici o operativi."
      },
      medium: {
        title: "Rischio intermedio",
        subtitle: "Esposizione diretta con custodia",
        desc: "Per chi vuole possedere direttamente asset crypto ed è disposto a gestire responsabilità tecniche e di sicurezza."
      },
      high: {
        title: "Rischio elevato",
        subtitle: "Esposizione operativa",
        desc: "Per chi prende decisioni attive nel tempo e accetta una maggiore probabilità di errore."
      },
      extreme: {
        title: "Rischio molto elevato",
        subtitle: "Esposizione speculativa complessa (futures, opzioni, leva)",
        desc: "Per profili molto specifici, consapevoli dei limiti strutturali per operatori non professionali."
      }
    },
    note: "Salire di livello non è un progresso. È una scelta diversa.",
    methodTitle: "Il Metodo Tradelia",
    methodDesc: "Ogni contenuto Tradelia segue lo stesso schema: cosa dice la ricerca, come interpretarla in modo comprensibile, quali rischi reali comporta, fonti verificabili.",
    conclusion: "Nel mondo delle criptovalute, agire senza comprendere il contesto è spesso più rischioso che non agire. Tradelia esiste per aiutare a scegliere consapevolmente."
  }
}

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState('en')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0]
    if (LANGUAGES[browserLang as keyof typeof LANGUAGES]) {
      setCurrentLang(browserLang)
    }
  }, [])

  const content = CONTENT[currentLang as keyof typeof CONTENT] || CONTENT.en

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header with Language Switcher */}
      <header className="bg-[var(--bg-2)] backdrop-blur border-b border-[var(--br)]">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <TradeliaLogo size={32} className="mr-3" />
              <h1 className="text-2xl font-bold text-[var(--ink)]">{content.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative">
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  className="bg-[var(--card)] border border-[var(--br)] text-[var(--ink)] px-3 py-1 rounded-md text-sm focus:ring-[var(--focus-ring)] focus:outline-none"
                >
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <option key={code} value={code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href="/dashboard"
                className="btn-primary"
              >
                Access Platform
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Title */}
      <section className="relative py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-6xl">
              {content.title}
            </h1>
            <h2 className="mt-4 text-xl text-[var(--muted)] sm:text-2xl">
              {content.subtitle}
            </h2>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para1}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para2}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para3}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para4}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para5}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para6}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para7}</p>
            <p className="text-[var(--muted)] leading-relaxed">{content.context.para8}</p>
          </div>
        </div>
      </section>

      {/* Context Title Section */}
      <section className="py-16 bg-[var(--bg-2)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">
            {content.contextTitle}
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {content.contextDesc}
          </p>
        </div>
      </section>

      {/* Tradelia Point Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">
            {content.tradeliaPoint}
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {content.tradeliaDesc}
          </p>
        </div>
      </section>

      {/* Choose Based on Risk Section */}
      <section className="py-20 bg-[var(--bg-2)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--ink)] mb-4">
              {content.chooseTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Risk Level Low */}
            <div className="card p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <RiskLowIcon className="w-5 h-5 mr-2" />
                  <span className="badge-risk-low">{content.riskLevels.low.title}</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
                  {content.riskLevels.low.subtitle}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {content.riskLevels.low.desc}
                </p>
              </div>
            </div>

            {/* Risk Level Medium */}
            <div className="card p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <RiskMidIcon className="w-5 h-5 mr-2" />
                  <span className="badge-risk-mid">{content.riskLevels.medium.title}</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
                  {content.riskLevels.medium.subtitle}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {content.riskLevels.medium.desc}
                </p>
              </div>
            </div>

            {/* Risk Level High */}
            <div className="card p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <RiskHighIcon className="w-5 h-5 mr-2" />
                  <span className="badge-risk-high">{content.riskLevels.high.title}</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
                  {content.riskLevels.high.subtitle}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {content.riskLevels.high.desc}
                </p>
              </div>
            </div>

            {/* Risk Level Extreme */}
            <div className="card p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <RiskExtremeIcon className="w-5 h-5 mr-2" />
                  <span className="badge-risk-extreme">{content.riskLevels.extreme.title}</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
                  {content.riskLevels.extreme.subtitle}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {content.riskLevels.extreme.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="text-center mt-12">
            <p className="text-sm text-[var(--muted)] italic">
              {content.note}
            </p>
          </div>
        </div>
      </section>

      {/* Tradelia Method Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">
            {content.methodTitle}
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {content.methodDesc}
          </p>
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="py-20 bg-[var(--bg-2)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {content.conclusion}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg)] border-t border-[var(--br)]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TradeliaLogo size={24} className="mr-2" />
                <span className="text-lg font-semibold text-[var(--ink)]">Tradelia</span>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Comprendere il rischio nel mondo delle criptovalute.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--ink)] mb-4">Percorsi per Rischio</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><Link href="/risk/contenuto" className="link">Rischio contenuto</Link></li>
                <li><Link href="/risk/intermedio" className="link">Rischio intermedio</Link></li>
                <li><Link href="/risk/elevato" className="link">Rischio elevato</Link></li>
                <li><Link href="/risk/molto-elevato" className="link">Rischio molto elevato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--ink)] mb-4">Metodo</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><Link href="/method" className="link">Il Metodo Tradelia</Link></li>
                <li><Link href="/glossary" className="link">Glossario</Link></li>
                <li><Link href="/sources" className="link">Fonti</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--ink)] mb-4">Informazioni</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="#" className="link">Chi Siamo</a></li>
                <li><a href="#" className="link">Privacy</a></li>
                <li><a href="#" className="link">Termini</a></li>
                <li><a href="#" className="link">Contatti</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--br)] mt-8 pt-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              © 2025 Tradelia. Comprendere il rischio nel mondo delle criptovalute.
            </p>
            <p className="text-xs text-[var(--faint)] mt-2">
              Non sono consigli finanziari. Effettua sempre le tue ricerche e consulta professionisti qualificati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
