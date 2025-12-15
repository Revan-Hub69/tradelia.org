/**
 * Skeleton Loader Components
 * 
 * Loading states per migliorare UX durante fetch dati
 */

export function Skeleton({ className = '', width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
      aria-label="Caricamento..."
      role="status"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Caricamento testo...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`} role="status" aria-label="Caricamento card...">
      <Skeleton height="1.5rem" width="60%" className="mb-4" />
      <SkeletonText lines={3} />
      <div className="mt-4 flex gap-2">
        <Skeleton height="2rem" width="5rem" />
        <Skeleton height="2rem" width="5rem" />
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 300, className = '' }: { height?: number; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`} role="status" aria-label="Caricamento grafico...">
      <Skeleton height="1.5rem" width="40%" className="mb-4" />
      <Skeleton height={height} width="100%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`} role="status" aria-label="Caricamento tabella...">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton height="1.5rem" width="30%" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} height="1rem" width={`${100 / cols}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
