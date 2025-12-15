import { Metadata } from 'next';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';
import { PerformanceOptimizer } from '@/components/dashboard/market-data/PerformanceOptimizer';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Market Data & Indicators | Tradelia - 88+ Indicatori Accademici';
  const description = 'Dashboard con 88+ indicatori di mercato accademici: VIX, Fear & Greed, Yield Curve, Crypto, Forex, Commodity. Analisi AI-powered con metodologia verificabile. Conforme MiFID II.';
  const url = 'https://tradelia.org/dashboard/market-data';
  const image = 'https://tradelia.org/og-market-data.png';
  
  return {
    title,
    description,
    keywords: [
      'indicatori di mercato',
      'analisi finanziaria',
      'VIX',
      'Fear & Greed Index',
      'Yield Curve',
      'crypto indicators',
      'forex indicators',
      'commodity indicators',
      'Tradelia',
      'MiFID II',
      'financial education',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tradelia',
      images: [{ url: image, width: 1200, height: 630, alt: 'Tradelia Market Data Dashboard - 88+ Indicatori Accademici' }],
      locale: 'it_IT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@tradelia',
      creator: '@tradelia',
    },
    alternates: {
      canonical: url,
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
  };
}

export default function MarketDataPage() {
  const structuredData = generateWebSiteSchema('it');
  
  return (
    <>
      <PerformanceOptimizer />
      <StructuredData data={structuredData} id="market-data-structured-data" />
      <DashboardTabs />
      <DashboardShell />
    </>
  );
}
