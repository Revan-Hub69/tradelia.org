/**
 * Error Tracking
 * 
 * Best Practice: Centralized error tracking
 * Ready for Sentry integration
 */

import { logger } from './logger';

interface ErrorContext {
  userId?: string;
  userRole?: string;
  path?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class ErrorTracker {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Track error with context
   */
  trackError(error: Error, context?: ErrorContext) {
    // Log error
    logger.error('Error occurred', error, context);

    // In production, send to error tracking service (Sentry, etc.)
    if (!this.isDevelopment) {
      // TODO: Integrate Sentry
      // Sentry.captureException(error, { extra: context });
    }
  }

  /**
   * Track API error
   */
  trackAPIError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number,
    context?: ErrorContext
  ) {
    const apiContext = {
      ...context,
      endpoint,
      method,
      statusCode,
    };

    this.trackError(error, apiContext);
  }

  /**
   * Track component error
   */
  trackComponentError(
    error: Error,
    component: string,
    props?: Record<string, unknown>
  ) {
    this.trackError(error, {
      component,
      props: props ? JSON.stringify(props) : undefined,
    });
  }
}

export const errorTracker = new ErrorTracker();
