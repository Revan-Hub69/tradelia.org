import { Metadata } from 'next';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Market Data & Indicators | Tradelia';
  const description = 'Market data dashboard with academic indicators, VIX, Fear & Greed Index, and term structure analysis';
  const url = 'https://tradelia.org/dashboard/market-data';
  const image = 'https://tradelia.org/og-market-data.png';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tradelia',
      images: [{ url: image, width: 1200, height: 630, alt: 'Tradelia Market Data Dashboard' }],
      locale: 'it_IT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@tradelia',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function MarketDataPage() {
  const structuredData = generateWebSiteSchema('it');
  
  return (
    <>
      <StructuredData data={structuredData} id="market-data-structured-data" />
      <DashboardTabs />
      <DashboardShell />
    </>
  );
}
