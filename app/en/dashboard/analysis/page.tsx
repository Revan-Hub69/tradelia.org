import dynamic from 'next/dynamic';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

const AnalysisContent = dynamic(
  () => import('@/components/dashboard/AnalysisContent').then(m => ({ default: m.AnalysisContent })),
  {
    ssr: false,
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-base" suppressHydrationWarning>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading analysis...</p>
    </div>
  </div>
);

export async function generateMetadata() {
  return {
    title: 'Analysis · Dashboard · Tradelia',
    description: 'Reports, analysis requests and financial analysis tools',
  };
}

export default function AnalysisPageEN() {
  return (
    <ErrorBoundary>
      <NoSSR fallback={<LoadingFallback />}>
        <div suppressHydrationWarning>
          <DashboardTabs />
          <AnalysisContent />
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
