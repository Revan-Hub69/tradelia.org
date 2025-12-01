/**
 * Performance Monitoring
 * Web Vitals tracking and performance metrics
 * 
 * Riferimento: Web Vitals, Core Web Vitals
 */

export interface WebVitals {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track Web Vitals
 * Integra con Google Analytics o servizio custom
 */
export function trackWebVitals(metric: WebVitals): void {
  // Invia a Google Analytics 4 se configurato
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log in console per debug
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', metric.name, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Invia a custom endpoint se necessario
  if (process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      keepalive: true, // Non bloccare navigazione
    }).catch((error) => {
      console.warn('Failed to send performance metric:', error);
    });
  }
}

/**
 * Track Custom Performance Metric
 */
export function trackPerformanceMetric(metric: PerformanceMetric): void {
  // Log in console per debug
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance Metric]', metric.name, metric.value, metric.metadata);
  }

  // Invia a custom endpoint se necessario
  if (process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: window.location.href,
      }),
      keepalive: true,
    }).catch((error) => {
      console.warn('Failed to send performance metric:', error);
    });
  }
}

/**
 * Measure API Call Performance
 */
export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  method: string = 'GET'
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;

    trackPerformanceMetric({
      name: 'api_call',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        endpoint,
        method,
        success: true,
      },
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackPerformanceMetric({
      name: 'api_call',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        endpoint,
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Measure Component Render Time
 */
export function measureComponentRender(componentName: string, renderTime: number): void {
  trackPerformanceMetric({
    name: 'component_render',
    value: renderTime,
    timestamp: Date.now(),
    metadata: {
      component: componentName,
    },
  });
}

