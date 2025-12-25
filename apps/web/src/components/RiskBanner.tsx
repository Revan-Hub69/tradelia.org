'use client'

import React, { useState } from 'react'
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { AccessibleDrawer } from './AccessibleDrawer'

interface RiskData {
  number: string
  description: string
  source: string
  sourceUrl: string
  explanation: string[]
  protectionTips: string[]
  linkText: string
}

const riskData: Record<string, RiskData> = {
  phishing: {
    number: '298.878 segnalazioni',
    description: 'Phishing/spoofing',
    source: 'IC3/FBI',
    sourceUrl: 'https://www.ic3.gov/',
    explanation: [
      'Il phishing è una tecnica di ingegneria sociale che mira a rubare informazioni sensibili come credenziali di accesso, numeri di carte di credito o dati personali.',
      'I criminali utilizzano email, SMS, chiamate o siti web falsi che sembrano provenire da fonti attendibili per ingannare le vittime.',
      'Nel 2023, sono state segnalate oltre 298.000 casi di phishing negli Stati Uniti, con perdite economiche significative.'
    ],
    protectionTips: [
      'Verifica sempre l\'URL del sito web prima di inserire dati personali',
      'Non cliccare su link sospetti ricevuti via email o SMS',
      'Utilizza l\'autenticazione a due fattori (2FA) su tutti gli account importanti',
      'Installa e aggiorna regolarmente un software antivirus/antimalware'
    ],
    linkText: 'Report IC3/FBI'
  },
  cryptoScam2024: {
    number: '9,9 miliardi $',
    description: 'Scam crypto 2024',
    source: 'Chainalysis via Reuters',
    sourceUrl: 'https://www.reuters.com/',
    explanation: [
      'Gli scam crypto rappresentano una minaccia crescente nel settore delle criptovalute, con perdite stimate in 9,9 miliardi di dollari nel 2024.',
      'Questi includono rug pull, scam di investimento, phishing crypto-specifici e altre forme di frode.',
      'La natura decentralizzata delle criptovalute rende difficile recuperare i fondi persi in questi incidenti.'
    ],
    protectionTips: [
      'Ricerca sempre i progetti crypto prima di investire',
      'Utilizza exchange regolamentati e wallet sicuri',
      'Non condividere mai le chiavi private o seed phrase',
      'Verifica la legittimità dei contratti smart attraverso audit indipendenti'
    ],
    linkText: 'Report Chainalysis'
  },
  cryptoScam2023: {
    number: '4,6 miliardi $',
    description: 'Scam crypto 2023',
    source: 'Chainalysis via Reuters',
    sourceUrl: 'https://www.reuters.com/',
    explanation: [
      'Nel 2023, gli scam crypto hanno causato perdite per 4,6 miliardi di dollari a livello globale.',
      'Questo dato evidenzia la crescita esponenziale delle frodi nel settore crypto rispetto agli anni precedenti.',
      'La maggior parte delle perdite è attribuibile a individui piuttosto che a istituzioni.'
    ],
    protectionTips: [
      'Educa te stesso sui rischi specifici delle criptovalute',
      'Utilizza cold storage per grandi quantità di crypto',
      'Diversifica gli investimenti e non mettere tutti i fondi in un singolo asset',
      'Rimani aggiornato sulle ultime tecniche di scam attraverso fonti affidabili'
    ],
    linkText: 'Report Chainalysis'
  }
}

const RiskBannerItem: React.FC<{
  data: RiskData
  variant: 'phishing' | 'cryptoScam2024' | 'cryptoScam2023'
}> = ({ data, variant }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const getIcon = () => {
    switch (variant) {
      case 'phishing':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
      case 'cryptoScam2024':
      case 'cryptoScam2023':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (variant) {
      case 'phishing':
        return 'border-orange-500/30'
      case 'cryptoScam2024':
      case 'cryptoScam2023':
        return 'border-red-500/30'
      default:
        return 'border-blue-500/30'
    }
  }

  return (
    <>
      <div
        className={`
          relative p-4 rounded-lg border bg-gray-900/50 backdrop-blur-sm
          transition-all duration-200 hover:bg-gray-800/50 cursor-pointer
          ${getBorderColor()}
        `}
        onClick={() => setDrawerOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setDrawerOpen(true)}
        aria-label={`Scopri di più su ${data.description}: ${data.number}`}
      >
        {/* Header with number and description */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="text-2xl font-bold text-white mb-1">
              {data.number}
            </div>
            <div className="text-sm text-gray-300 font-medium">
              {data.description}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {getIcon()}
            <InformationCircleIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Source */}
        <div className="text-xs text-gray-500 italic">
          Fonte: {data.source}
        </div>

        {/* Subtle hint for interaction */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 opacity-60">
          Clicca per dettagli
        </div>
      </div>

      {/* Accessible Drawer */}
      <AccessibleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`${data.description} - Dettagli Educativi`}
      >
        <div className="space-y-6">
          {/* Main stats */}
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-white mb-2">{data.number}</div>
            <div className="text-lg text-gray-300 mb-1">{data.description}</div>
            <div className="text-sm text-gray-500 italic">Fonte: {data.source}</div>
          </div>

          {/* Explanation */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Cosa significa</h3>
            <ul className="space-y-2">
              {data.explanation.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-gray-500 mt-1.5 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Protection tips */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Come proteggersi</h3>
            <ul className="space-y-2">
              {data.protectionTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-green-400 mt-1.5 flex-shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Educational badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Contenuto Educativo</span>
          </div>

          {/* Source link */}
          <div className="pt-4 border-t border-gray-700">
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>{data.linkText}</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </AccessibleDrawer>
    </>
  )
}

export const RiskBanner: React.FC = () => {
  return (
    <section className="space-y-3">
      {/* Micro header */}
      <div className="flex items-center gap-2 py-1 px-3">
        <ExclamationTriangleIcon className="h-3 w-3 text-orange-400" />
        <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">
          Rischi e Sicurezza
        </span>
      </div>

      {/* Banner grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RiskBannerItem data={riskData.phishing} variant="phishing" />
        <RiskBannerItem data={riskData.cryptoScam2024} variant="cryptoScam2024" />
        <RiskBannerItem data={riskData.cryptoScam2023} variant="cryptoScam2023" />
      </div>

      {/* Educational disclaimer */}
      <div className="text-xs text-gray-500 text-center px-3 py-2 bg-gray-900/30 rounded border border-gray-800">
        <strong>Nota educativa:</strong> Questi dati sono presentati esclusivamente per fini educativi e di sensibilizzazione sui rischi.
        Non costituiscono consiglio finanziario né raccomandazione di investimento.
      </div>
    </section>
  )
}
