import dynamic from 'next/dynamic';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

// Carica DashboardShell solo sul client - NO SSR, NO HYDRATION
const DashboardShell = dynamic(
  () => import('@/components/dashboard/DashboardShell').then(m => ({ default: m.DashboardShell })),
  {
    ssr: false, // Disabilita completamente SSR
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-base" suppressHydrationWarning>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Caricamento dashboard...</p>
    </div>
  </div>
);

export default function DashboardPage() {
  // Usa NoSSR per prevenire COMPLETAMENTE l'hydration
  // Wrappato in ErrorBoundary per catturare eventuali errori reali
  return (
    <ErrorBoundary>
      <NoSSR fallback={<LoadingFallback />}>
        <div suppressHydrationWarning>
          <DashboardTabs />
          <DashboardShell />
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
