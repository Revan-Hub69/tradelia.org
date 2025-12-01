import dynamic from 'next/dynamic';
import { ClientOnly } from '@/components/common/ClientOnly';

// Carica DashboardShell solo sul client per evitare hydration mismatch
const DashboardShell = dynamic(
  () => import('@/components/dashboard/DashboardShell').then(m => ({ default: m.DashboardShell })),
  {
    ssr: false, // Disabilita completamente SSR per la dashboard
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento dashboard...</p>
        </div>
      </div>
    }>
      <DashboardShell />
    </ClientOnly>
  );
}
