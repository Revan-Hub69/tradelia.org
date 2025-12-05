import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AnalysisDashboard from '@/components/dashboard/analysis/AnalysisDashboard';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  
  const title = `${t('analysis')} | Tradelia`;
  const description = t('analysisDescription') || 'Market analysis dashboard with academic indicators, VIX, Fear & Greed Index, and term structure analysis';
  const url = 'https://tradelia.org/en/dashboard/analysis';
  const image = 'https://tradelia.org/og-analysis.png'; // TODO: Create OG image
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tradelia',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'Tradelia Analysis Dashboard',
        },
      ],
      locale: 'en_US',
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
  const structuredData = generateWebSiteSchema('en');
  
  return (
    <>
      <StructuredData data={structuredData} id="analysis-structured-data" />
      <AnalysisDashboard />
    </>
  );
}
