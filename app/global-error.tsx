'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

/**
 * Global Error Boundary per Next.js 13+
 * Cattura errori globali che non vengono gestiti da ErrorBoundary
 * Questo componente viene renderizzato quando c'è un errore fatale nell'app
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error caught:', error);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error);
    }
  }, [error]);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
          <div className="max-w-2xl w-full bg-bg-surface border border-border-default rounded-lg p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h1 className="text-xl font-bold text-text-primary">
                Errore dell&apos;applicazione
              </h1>
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

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-bg-soft rounded border border-border-subtle">
                <p className="text-sm font-mono text-red-400 mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-text-tertiary overflow-auto max-h-64">
                    {error.stack}
                  </pre>
                )}
                {error.digest && (
                  <p className="text-xs text-text-tertiary mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={reset}
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
                onClick={handleReload}
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

            <div className="pt-4 border-t border-border-default">
              <p className="text-xs text-text-tertiary">
                Se il problema persiste, contatta il supporto con il codice errore:{' '}
                {error.digest || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
