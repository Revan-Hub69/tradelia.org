import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AnalysisDashboard from '@/components/dashboard/analysis/AnalysisDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  
  return {
    title: `${t('analysis')} | Tradelia`,
    description: t('analysisDescription') || 'Market analysis dashboard with academic indicators, VIX, Fear & Greed Index, and term structure analysis',
  };
}

export default function AnalysisPage() {
  return <AnalysisDashboard />;
}
