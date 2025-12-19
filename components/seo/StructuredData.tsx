import Script from 'next/script'

interface StructuredDataProps {
  type: 'WebApplication' | 'FAQPage' | 'Organization'
  data: Record<string, unknown>
  nonce?: string
}

export function StructuredData({ type, data, nonce }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      nonce={nonce}
    />
  )
}

// Pre-built structured data for common use cases
export const TradeliaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tradelia',
  description: 'Sistema indipendente di verifica servizi finanziari',
  url: 'https://tradelia.org',
  logo: 'https://tradelia.org/logo.png',
  foundingDate: '2025',
  knowsAbout: [
    'Financial Services Analysis',
    'Risk Assessment',
    'Consumer Protection',
    'Financial Transparency'
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Italy'
  },
  serviceType: 'Financial Service Verification'
}

export const TradeliaFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Cos\'è Tradelia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tradelia è un sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi. Non fornisce consulenza finanziaria ma analizza documentazione ufficiale per evidenziare costi, limiti e vincoli.'
      }
    },
    {
      '@type': 'Question',
      name: 'Quando dovrei usare Tradelia?',
      acceptedAnswer: {
        '@type': 'Answer', 
        text: 'Prima di aprire un conto corrente, collegare una carta, usare un wallet crypto, scegliere un exchange o affidare soldi a un broker. Il momento giusto è sempre PRIMA di depositare o iniziare a usare il servizio.'
      }
    },
    {
      '@type': 'Question',
      name: 'Tradelia fornisce consigli di investimento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tradelia non fornisce consulenza finanziaria, consigli di investimento o raccomandazioni. Mostra solo informazioni oggettive sui servizi per aiutarti a prendere decisioni informate.'
      }
    },
    {
      '@type': 'Question',
      name: 'Come funziona l\'analisi di Tradelia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Raccogliamo documentazione ufficiale, analizziamo automaticamente costi e limiti, verifichiamo le informazioni con controlli incrociati e produciamo report chiari con vantaggi, svantaggi e limitazioni.'
      }
    }
  ]
}
