'use client';

import dynamic from 'next/dynamic';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

// EducationContent è già un componente client-side
const EducationContent = dynamic(
  () => import('./EducationContent').then(m => ({ default: m.default })),
  {
    ssr: false,
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-base" suppressHydrationWarning>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Caricamento formazione...</p>
    </div>
  </div>
);

export default function EducationPage() {
  return (
    <ErrorBoundary>
      <NoSSR fallback={<LoadingFallback />}>
        <div suppressHydrationWarning>
          <DashboardTabs />
          <div className="min-h-screen bg-bg-base">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-text-primary mb-4">
                  Formazione
                </h1>
                <p className="text-lg text-text-secondary mb-8">
                  Tradelia si concentra su analisi professionale di alta qualità.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <p className="text-text-secondary">
                    Per imparare il trading, consigliamo di utilizzare risorse educative esterne 
                    e poi applicare le tue conoscenze con i nostri strumenti di analisi professionale.
                  </p>
                  <div className="mt-6">
                    <a
                      href="/dashboard/analysis"
                      className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
                    >
                      Vai alle Analisi
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
