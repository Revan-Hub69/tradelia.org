import { Metadata } from 'next';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Analisi Avanzate | Tradelia';
  const description = 'Analisi avanzate di mercato: correlazioni multi-asset, heatmap, L400 support/resistance, sentiment analysis';
  const url = 'https://tradelia.org/dashboard/analysis';
  const image = 'https://tradelia.org/og-analysis.png';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tradelia',
      images: [{ url: image, width: 1200, height: 630, alt: 'Tradelia Analysis Dashboard' }],
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

export default function AnalysisPage() {
  const structuredData = generateWebSiteSchema('it');
  
  return (
    <>
      <StructuredData data={structuredData} id="analysis-structured-data" />
      <DashboardTabs />
      <DashboardShell />
    </>
  );
}
