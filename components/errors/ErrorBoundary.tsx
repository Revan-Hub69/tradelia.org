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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 border-2 border-error/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Qualcosa è andato storto
              </h1>
              <p className="text-text-secondary mb-6">
                Si è verificato un errore imprevisto. Puoi provare a ricaricare la pagina o tornare alla home.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Error
                title="Dettagli Errore (Solo in sviluppo)"
                message={this.state.error.message || 'Errore sconosciuto'}
                variant="destructive"
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Riprova
              </button>
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary font-semibold transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Torna alla Dashboard
              </Link>
            </div>
          </div>
        </div>
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

