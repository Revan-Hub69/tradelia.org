/**
 * Widget Performance Monitoring
 * 
 * Best Practice 2025:
 * - Track widget load times
 * - Monitor API response times
 * - Track errors
 * - User engagement metrics
 */

interface PerformanceMetric {
  widgetType: string;
  metric: 'load_time' | 'api_response_time' | 'error' | 'interaction';
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// In-memory store (in produzione, usare analytics service)
const metrics: PerformanceMetric[] = [];

/**
 * Track widget performance metric
 */
export function trackWidgetPerformance(
  widgetType: string,
  metric: PerformanceMetric['metric'],
  value: number,
  metadata?: Record<string, any>
) {
  const metricData: PerformanceMetric = {
    widgetType,
    metric,
    value,
    timestamp: Date.now(),
    metadata,
  };

  metrics.push(metricData);

  // Keep only last 1000 metrics in memory
  if (metrics.length > 1000) {
    metrics.shift();
  }

  // In produzione, inviare a analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'widget_performance', {
      widget_type: widgetType,
      metric,
      value,
      ...metadata,
    });
  }
}

/**
 * Track widget load time
 */
export function trackWidgetLoadTime(widgetType: string, loadTime: number) {
  trackWidgetPerformance(widgetType, 'load_time', loadTime);
}

/**
 * Track API response time
 */
export function trackApiResponseTime(widgetType: string, responseTime: number, endpoint: string) {
  trackWidgetPerformance(widgetType, 'api_response_time', responseTime, { endpoint });
}

/**
 * Track widget error
 */
export function trackWidgetError(widgetType: string, error: Error | string, context?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : error;
  trackWidgetPerformance(widgetType, 'error', 1, {
    error: errorMessage,
    ...context,
  });
}

/**
 * Track user interaction
 */
export function trackWidgetInteraction(widgetType: string, interactionType: string) {
  trackWidgetPerformance(widgetType, 'interaction', 1, {
    interaction_type: interactionType,
  });
}

/**
 * Get performance metrics for a widget
 */
export function getWidgetMetrics(widgetType: string, metric?: PerformanceMetric['metric']) {
  return metrics.filter(
    m => m.widgetType === widgetType && (!metric || m.metric === metric)
  );
}

/**
 * Get average load time for a widget
 */
export function getAverageLoadTime(widgetType: string): number {
  const loadTimes = getWidgetMetrics(widgetType, 'load_time');
  if (loadTimes.length === 0) return 0;
  
  const sum = loadTimes.reduce((acc, m) => acc + m.value, 0);
  return sum / loadTimes.length;
}
