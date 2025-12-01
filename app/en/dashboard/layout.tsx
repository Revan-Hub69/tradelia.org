'use client';

import type { ReactNode } from 'react';
import { NoSSR } from '@/components/common/NoSSR';

/**
 * EN Dashboard Layout - COMPLETELY CLIENT-SIDE
 * Stesso approccio del layout dashboard principale
 */
export default function DashboardEnLayout({ children }: { children: ReactNode }) {
  return (
    <NoSSR fallback={
      <div className="min-h-screen bg-bg-base" suppressHydrationWarning>
        <div className="h-16 bg-bg-surface border-b border-border-default"></div>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Caricamento dashboard...</p>
          </div>
        </div>
      </div>
    }>
      {children}
    </NoSSR>
  );
}
