/**
 * Chart Optimization Utilities
 * 
 * Lazy loading e ottimizzazioni per chart components
 */

import dynamic from 'next/dynamic';

/**
 * Lazy load chart components per ridurre bundle size iniziale
 */
export const LazyLineChart = dynamic(
  () => import('@/components/charts/LineChart').then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-[300px] flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Caricamento grafico...</span>
      </div>
    ),
  }
);

export const LazyBarChart = dynamic(
  () => import('@/components/charts/BarChart').then((mod) => ({ default: mod.BarChart })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-[300px] flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Caricamento grafico...</span>
      </div>
    ),
  }
);

export const LazyPieChart = dynamic(
  () => import('@/components/charts/PieChart').then((mod) => ({ default: mod.PieChart })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-[300px] flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Caricamento grafico...</span>
      </div>
    ),
  }
);

/**
 * Debounce function per limitare aggiornamenti chart
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function per limitare chiamate API
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

