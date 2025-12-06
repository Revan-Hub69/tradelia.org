import { Metadata } from 'next';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = 'https://tradelia.org';

  return {
    metadataBase: new URL(baseUrl),
    title: 'Strumenti Finanziari | Calcolatori e Utilities | Tradelia',
    description: '13 strumenti finanziari professionali: calcolatori matematici, PAC simulator, trading journal, options calculator, portfolio optimizer e molto altro. Formule verificate e documentate per audit.',
    keywords: ['calcolatori finanziari', 'utilities trading', 'calcolatore opzioni', 'portfolio optimizer', 'trading journal', 'risk management', 'financial calculators', 'PAC simulator', 'Sharpe ratio', 'Kelly criterion', 'Black-Scholes', 'Markowitz'],
    authors: [{ name: 'Tradelia AI' }],
    creator: 'Tradelia AI',
    publisher: 'Tradelia AI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: `${baseUrl}/dashboard/utilities`,
      siteName: 'Tradelia AI',
      title: 'Strumenti Finanziari Professionali | Tradelia',
      description: '13 strumenti finanziari matematicamente perfetti: calcolatori, simulatori e analisi avanzate per trader e investitori. Formule verificate e documentate.',
      images: [
        {
          url: `${baseUrl}/img/tradelia_og_vC_white_clean.png`,
          width: 1200,
          height: 630,
          alt: 'Tradelia - Strumenti Finanziari Professionali',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Strumenti Finanziari Professionali | Tradelia',
      description: '13 strumenti finanziari matematicamente perfetti per trader e investitori',
      images: [`${baseUrl}/img/tradelia_og_vC_white_clean.png`],
      creator: '@tradelia_ai',
      site: '@tradelia_ai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}/dashboard/utilities`,
    },
    // AI Search Optimization (Perplexity, ChatGPT, etc.)
    other: {
      'ai-search-optimized': 'true',
      'structured-data': 'true',
      'academic-standards': 'MiFID II compliant, formulas verified',
      'tool-count': '13',
      'tool-categories': 'Risk Management, Performance, Advanced',
      'formula-verified': 'true',
      'audit-ready': 'true',
    },
  };
}

export default function UtilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
