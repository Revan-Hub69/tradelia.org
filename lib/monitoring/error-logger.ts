/**
 * Enhanced Error Logger
 * Logs all errors with full context and prevents redirect loops
 */

interface ErrorLog {
  timestamp: string;
  message: string;
  error?: Error;
  stack?: string;
  context?: {
    path?: string;
    component?: string;
    userId?: string;
    userEmail?: string;
    session?: boolean;
    metadata?: Record<string, unknown>;
  };
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;
  private redirectAttempts: Map<string, number> = new Map();
  private readonly MAX_REDIRECT_ATTEMPTS = 3;

  logError(
    message: string,
    error?: Error,
    context?: {
      path?: string;
      component?: string;
      userId?: string;
      userEmail?: string;
      session?: boolean;
      metadata?: Record<string, unknown>;
    }
  ): void {
    const logEntry: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      error,
      stack: error?.stack,
      context: {
        ...context,
        session: context?.session ?? (typeof window !== 'undefined' ? undefined : false),
      },
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console with full details
    console.error('[Error Logger]', {
      ...logEntry,
      logsCount: this.logs.length,
    });

    // Log to server if available
    if (typeof window !== 'undefined') {
      // Client-side: try to send to API
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(() => {
        // Ignore errors in logging
      });
    }
  }

  logRedirect(
    from: string,
    to: string,
    reason?: string
  ): boolean {
    const key = `${from}->${to}`;
    const attempts = (this.redirectAttempts.get(key) || 0) + 1;
    this.redirectAttempts.set(key, attempts);

    this.logError(`Redirect detected: ${from} -> ${to}`, undefined, {
      path: from,
      metadata: {
        redirectTo: to,
        reason,
        attempts,
        isLoop: attempts >= this.MAX_REDIRECT_ATTEMPTS,
      },
    });

    if (attempts >= this.MAX_REDIRECT_ATTEMPTS) {
      console.error(
        `[Error Logger] REDIRECT LOOP DETECTED: ${from} -> ${to} (${attempts} attempts)`
      );
      // Prevent redirect loop
      return false;
    }

    return true;
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.redirectAttempts.clear();
  }

  getRedirectAttempts(): Map<string, number> {
    return new Map(this.redirectAttempts);
  }
}

// Singleton instance
let errorLoggerInstance: ErrorLogger | null = null;

export function getErrorLogger(): ErrorLogger {
  if (!errorLoggerInstance) {
    errorLoggerInstance = new ErrorLogger();
  }
  return errorLoggerInstance;
}

// Convenience functions
export function logError(
  message: string,
  error?: Error,
  context?: {
    path?: string;
    component?: string;
    userId?: string;
    userEmail?: string;
    session?: boolean;
    metadata?: Record<string, unknown>;
  }
): void {
  getErrorLogger().logError(message, error, context);
}

export function logRedirect(
  from: string,
  to: string,
  reason?: string
): boolean {
  return getErrorLogger().logRedirect(from, to, reason);
}

export function getErrorLogs(): ErrorLog[] {
  return getErrorLogger().getLogs();
}

export function clearErrorLogs(): void {
  getErrorLogger().clearLogs();
}

