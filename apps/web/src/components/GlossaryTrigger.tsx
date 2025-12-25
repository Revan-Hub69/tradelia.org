'use client'

import { useState } from 'react'
import { GlossaryDrawer } from './GlossaryDrawer'

interface DrawerSection {
  heading: string
  body: string
}

interface DrawerSource {
  label: string
  url: string
}

interface GlossaryTriggerProps {
  termId: string
  label?: string
  children?: React.ReactNode
}

interface GlossaryData {
  [key: string]: {
    title: string
    sections: DrawerSection[]
    sources: DrawerSource[]
  }
}

// Mock data - in a real app this would come from an API or CMS
const GLOSSARY_DATA: GlossaryData = {
  'transparency': {
    title: 'Trasparenza nei sistemi crypto',
    sections: [
      {
        heading: 'Cosa significa trasparenza',
        body: 'Nei sistemi blockchain, la trasparenza indica che tutte le transazioni sono pubblicamente visibili e verificabili da chiunque. A differenza dei sistemi bancari tradizionali, non esiste un "libro mastro" privato.'
      },
      {
        heading: 'Limiti della trasparenza tecnica',
        body: 'Sebbene le transazioni siano trasparenti, l\'identità degli utenti spesso rimane pseudonima. Questo crea una distinzione importante tra "trasparenza tecnica" e "trasparenza operativa".'
      }
    ],
    sources: [
      { label: 'Bitcoin Whitepaper', url: 'https://bitcoin.org/bitcoin.pdf' },
      { label: 'Ethereum Documentation', url: 'https://ethereum.org/en/developers/docs/' }
    ]
  },
  'risk-assessment': {
    title: 'Valutazione del rischio',
    sections: [
      {
        heading: 'Framework di valutazione',
        body: 'La valutazione del rischio negli investimenti crypto considera molteplici dimensioni: volatilità del mercato, rischi tecnici, rischi regolamentori e rischi comportamentali.'
      },
      {
        heading: 'Approccio Tradelia',
        body: 'Utilizziamo un approccio graduale che permette agli utenti di scegliere il livello di esposizione più adatto al proprio profilo di rischio, senza presupporre conoscenze tecniche avanzate.'
      }
    ],
    sources: [
      { label: 'SEC Investor Bulletin', url: 'https://www.sec.gov/investor/pubs' },
      { label: 'IOSCO Crypto Guidelines', url: 'https://www.iosco.org/library/pubdocs/pdf/IOSCOPD673.pdf' }
    ]
  }
}

export function GlossaryTrigger({ termId, label, children }: GlossaryTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const data = GLOSSARY_DATA[termId]

  if (!data) {
    console.warn(`Glossary term "${termId}" not found`)
    return <span className="text-[var(--muted)]">{children || label}</span>
  }

  const handleClick = () => {
    setIsOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="text-[var(--accent)] hover:text-[var(--accent-2)] underline underline-offset-2 cursor-pointer transition-colors focus:ring-[var(--focus-ring)] focus:outline-none rounded-sm"
        aria-label={`Apri definizione: ${data.title}`}
      >
        {children || label}
      </button>

      <GlossaryDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={data.title}
        sections={data.sections}
        sources={data.sources}
      />
    </>
  )
}
