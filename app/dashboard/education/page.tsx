'use client';

import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import Link from 'next/link';

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
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
              <Link
                href="/dashboard/market-data"
                className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                Vai ai Market Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
