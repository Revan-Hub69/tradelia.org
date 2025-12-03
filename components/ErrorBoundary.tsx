'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

/**
 * Error UI Component (funzionale per usare hooks)
 */
function ErrorUI({ 
  error, 
  errorInfo, 
  resetError 
}: { 
  error: Error; 
  errorInfo: React.ErrorInfo | null; 
  resetError: () => void;
}) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <div className="max-w-2xl w-full bg-bg-surface border border-border-default rounded-lg p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <h1 className="text-xl font-bold text-text-primary">Qualcosa è andato storto</h1>
        </div>
        
        <p className="text-text-secondary">
          Si è verificato un errore imprevisto. Puoi provare a:
        </p>

        <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
          <li>Riprovare l&apos;operazione</li>
          <li>Tornare alla pagina precedente</li>
          <li>Ricaricare la pagina</li>
          <li>Tornare alla home</li>
        </ul>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-4 p-4 bg-bg-soft rounded border border-border-subtle">
            <p className="text-sm font-mono text-red-400 mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-text-tertiary overflow-auto max-h-64">
                {error.stack}
              </pre>
            )}
            {errorInfo && (
              <details className="mt-2">
                <summary className="text-xs text-text-tertiary cursor-pointer">
                  Component Stack
                </summary>
                <pre className="text-xs text-text-tertiary overflow-auto max-h-64 mt-2">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            onClick={resetError}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Riprova
          </button>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 bg-bg-soft hover:bg-bg-hover text-text-primary border border-border-default rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna Indietro
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-bg-soft hover:bg-bg-hover text-text-primary border border-border-default rounded-lg transition-colors"
          >
            Ricarica Pagina
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-bg-soft hover:bg-bg-hover text-text-primary border border-border-default rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Boundary Component
 * Cattura errori JavaScript in qualsiasi componente figlio
 * e mostra un UI di fallback invece di crashare l'intera app
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }


  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      // Default error UI
      return (
        <ErrorUI 
          error={this.state.error} 
          errorInfo={this.state.errorInfo} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary wrapper
 * For use in client components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

