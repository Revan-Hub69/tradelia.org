/**
 * Error Tracking System
 * Centralized error tracking with support for multiple providers
 * 
 * Providers:
 * - Sentry (production)
 * - Console (development)
 * - Custom logging service (optional)
 * 
 * Integration with structured logging
 */

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  path?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorTracker {
  captureException(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext): void;
  setUser(userId: string, email?: string): void;
  clearUser(): void;
}

class ConsoleErrorTracker implements ErrorTracker {
  private userId?: string;
  private userEmail?: string;

  captureException(error: Error, context?: ErrorContext): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: context?.userId || this.userId,
      userEmail: context?.userEmail || this.userEmail,
      path: context?.path,
      component: context?.component,
      action: context?.action,
      metadata: context?.metadata,
      timestamp: new Date().toISOString(),
    };

    console.error('[Error Tracker] Exception:', errorInfo);

    // Also log to structured logger
    if (typeof window === 'undefined') {
      // Server-side
      const { logError } = require('@/lib/logging/logger');
      logError('Error Tracker Exception', error, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    const logInfo = {
      message,
      level,
      userId: context?.userId || this.userId,
      userEmail: context?.userEmail || this.userEmail,
      path: context?.path,
      component: context?.component,
      action: context?.action,
      metadata: context?.metadata,
      timestamp: new Date().toISOString(),
    };

    const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logMethod(`[Error Tracker] ${level.toUpperCase()}:`, logInfo);
  }

  setUser(userId: string, email?: string): void {
    this.userId = userId;
    this.userEmail = email;
  }

  clearUser(): void {
    this.userId = undefined;
    this.userEmail = undefined;
  }
}

class SentryErrorTracker implements ErrorTracker {
  private Sentry: any;
  private initialized = false;

  constructor() {
    // Lazy load Sentry only if DSN is configured
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      this.initSentry();
    }
  }

  private async initSentry() {
    if (this.initialized) return;

    // Se Sentry DSN non è configurato, non tentare di inizializzare
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      this.initialized = false;
      return;
    }

    // Nota: Sentry è opzionale. Se il pacchetto @sentry/nextjs non è installato,
    // questo tracker funzionerà come ConsoleErrorTracker
    // Per usare Sentry, installare: npm install @sentry/nextjs
    this.initialized = false;
    console.info('Sentry not configured - using console logger. Install @sentry/nextjs to enable Sentry tracking.');
  }

  captureException(error: Error, context?: ErrorContext): void {
    // Sentry non disponibile - usa console logger
    console.error('[Error Tracker] Exception (Sentry not available):', error, context);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    // Sentry non disponibile - usa console logger
    const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logMethod(`[Error Tracker] ${level.toUpperCase()}:`, message, context);
  }

  setUser(userId: string, email?: string): void {
    // Sentry non disponibile - nessuna azione necessaria
  }

  clearUser(): void {
    // Sentry non disponibile - nessuna azione necessaria
  }
}

// Factory function per creare il tracker appropriato
export function createErrorTracker(): ErrorTracker {
  // In produzione, usa Sentry se configurato, altrimenti console
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return new SentryErrorTracker();
  }
  return new ConsoleErrorTracker();
}

// Singleton instance
let errorTrackerInstance: ErrorTracker | null = null;

export function getErrorTracker(): ErrorTracker {
  if (!errorTrackerInstance) {
    errorTrackerInstance = createErrorTracker();
  }
  return errorTrackerInstance;
}

// Convenience functions
export function captureException(error: Error, context?: ErrorContext): void {
  getErrorTracker().captureException(error, context);
}

export function captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext): void {
  getErrorTracker().captureMessage(message, level, context);
}

export function setErrorTrackingUser(userId: string, email?: string): void {
  getErrorTracker().setUser(userId, email);
}

export function clearErrorTrackingUser(): void {
  getErrorTracker().clearUser();
}

