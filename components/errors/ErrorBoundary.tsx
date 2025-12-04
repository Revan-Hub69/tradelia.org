'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Error } from '@/components/ui/error';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 * Based on React Error Boundary pattern
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignora COMPLETAMENTE errori di hydration mismatch (#310)
    // Non loggare, non aggiornare stato, semplicemente ignorare
    if (error.message && (
      error.message.includes('310') ||
      error.message.includes('Hydration failed') ||
      error.message.includes('hydration') ||
      error.message.includes('Minified React error #310')
    )) {
      // NON fare nulla - ignora completamente
      return {
        hasError: false,
        error: null,
        errorInfo: null,
      };
    }
    
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Ignora COMPLETAMENTE errori di hydration mismatch (#310)
    // Non loggare, non aggiornare stato, semplicemente ignorare
    if (error.message && (
      error.message.includes('310') ||
      error.message.includes('Hydration failed') ||
      error.message.includes('hydration') ||
      error.message.includes('Minified React error #310')
    )) {
      // NON fare NULLA - ignora completamente, non loggare nemmeno
      return;
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service (solo per errori reali, non hydration mismatch)
    if (typeof window !== 'undefined') {
      import('@/lib/monitoring/error-tracker').then(({ captureException }) => {
        captureException(error, {
          component: errorInfo.componentStack?.split('\n')[1]?.trim(),
          path: window.location.pathname,
          metadata: {
            componentStack: errorInfo.componentStack,
          },
        });
      }).catch((err) => {
        console.warn('Failed to load error tracker:', err);
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          {/* Popup Modal per Reload */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="max-w-md w-full bg-bg-surface border-2 border-error/40 rounded-xl shadow-2xl p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-error/20 border-2 border-error/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  Errore Imprevisto
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Si è verificato un errore. Vuoi ricaricare la pagina per risolvere il problema?
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-bg-soft border border-border-subtle rounded-lg p-3 mb-4">
                  <p className="text-xs font-mono text-error break-all">
                    {this.state.error.message || 'Errore sconosciuto'}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Ricarica Pagina
                </button>
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary font-semibold transition-all duration-200"
                >
                  Riprova
                </button>
              </div>
              <Link
                href="/dashboard"
                className="block w-full text-center text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Torna alla Dashboard
              </Link>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

