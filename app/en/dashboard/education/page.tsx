import dynamic from 'next/dynamic';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

// EducationContent è già un componente client-side
const EducationContent = dynamic(
  () => import('../../dashboard/education/EducationContent').then(m => ({ default: m.default })),
  {
    ssr: false,
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-base" suppressHydrationWarning>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading education...</p>
    </div>
  </div>
);

export default function EducationPageEN() {
  return (
    <ErrorBoundary>
      <NoSSR fallback={<LoadingFallback />}>
        <div suppressHydrationWarning>
          <DashboardTabs />
          <EducationContent />
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
