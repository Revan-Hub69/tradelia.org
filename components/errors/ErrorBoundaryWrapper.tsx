'use client';

import { type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wrapper funzionale per ErrorBoundary (class component)
 * Necessario per compatibilità con Next.js build system
 */
export function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
