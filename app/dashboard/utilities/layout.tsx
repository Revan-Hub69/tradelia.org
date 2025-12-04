import { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/structured-data';

// Get locale from params or default
async function getLocale(): Promise<Locale> {
  // In dashboard, locale viene gestito dal layout principale
  // Per ora default a 'it', può essere migliorato con middleware
  return 'it';
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = 'https://tradelia.org';
  const localePath = locale === 'it' ? '' : `/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: locale === 'it' 
      ? 'Strumenti Finanziari | Calcolatori e Utilities | Tradelia'
      : 'Financial Tools | Calculators and Utilities | Tradelia',
    description: locale === 'it'
      ? '13 strumenti finanziari professionali: calcolatori matematici, PAC simulator, trading journal, options calculator, portfolio optimizer e molto altro. Formule verificate e documentate per audit.'
      : '13 professional financial tools: mathematical calculators, PAC simulator, trading journal, options calculator, portfolio optimizer and more. Verified and documented formulas for audit.',
    keywords: locale === 'it'
      ? ['calcolatori finanziari', 'utilities trading', 'calcolatore opzioni', 'portfolio optimizer', 'trading journal', 'risk management', 'financial calculators', 'PAC simulator', 'Sharpe ratio', 'Kelly criterion', 'Black-Scholes', 'Markowitz']
      : ['financial calculators', 'trading utilities', 'options calculator', 'portfolio optimizer', 'trading journal', 'risk management', 'financial tools', 'PAC simulator', 'Sharpe ratio', 'Kelly criterion', 'Black-Scholes', 'Markowitz'],
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
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      url: `${baseUrl}${localePath}/dashboard/utilities`,
      siteName: 'Tradelia AI',
      title: locale === 'it'
        ? 'Strumenti Finanziari Professionali | Tradelia'
        : 'Professional Financial Tools | Tradelia',
      description: locale === 'it'
        ? '13 strumenti finanziari matematicamente perfetti: calcolatori, simulatori e analisi avanzate per trader e investitori. Formule verificate e documentate.'
        : '13 mathematically perfect financial tools: calculators, simulators and advanced analysis for traders and investors. Verified and documented formulas.',
      images: [
        {
          url: `${baseUrl}/img/tradelia_og_vC_white_clean.png`,
          width: 1200,
          height: 630,
          alt: locale === 'it' 
            ? 'Tradelia - Strumenti Finanziari Professionali'
            : 'Tradelia - Professional Financial Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'it'
        ? 'Strumenti Finanziari Professionali | Tradelia'
        : 'Professional Financial Tools | Tradelia',
      description: locale === 'it'
        ? '13 strumenti finanziari matematicamente perfetti per trader e investitori'
        : '13 mathematically perfect financial tools for traders and investors',
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
      canonical: `${baseUrl}${localePath}/dashboard/utilities`,
      languages: {
        'it-IT': `${baseUrl}/dashboard/utilities`,
        'en-US': `${baseUrl}/en/dashboard/utilities`,
      },
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
