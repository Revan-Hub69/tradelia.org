/**
 * Structured Logging System
 * Centralized logging with levels, context, and persistence
 * 
 * Riferimento: Logging Best Practices, Structured Logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private enableStorage: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Max logs in memory

  constructor() {
    // Set minimum log level based on environment
    this.minLevel = (process.env.NODE_ENV === 'production' ? 'info' : 'debug') as LogLevel;
    this.enableConsole = true;
    this.enableStorage = process.env.NEXT_PUBLIC_ENABLE_LOG_STORAGE === 'true';
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  /**
   * Format log entry
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatLog(level, message, context, error);

    // Console output
    if (this.enableConsole) {
      const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'info' ? console.info : console.debug;
      const prefix = `[${level.toUpperCase()}]`;
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      consoleMethod(`${prefix} ${message}${contextStr}`, error || '');
    }

    // In-memory storage
    if (this.enableStorage) {
      this.logs.push(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift(); // Remove oldest
      }
    }

    // Send to external service (opzionale)
    if (process.env.NEXT_PUBLIC_LOG_ENDPOINT && level === 'error') {
      this.sendToEndpoint(entry).catch((err) => {
        console.warn('Failed to send log to endpoint:', err);
      });
    }
  }

  /**
   * Send log to external endpoint
   */
  private async sendToEndpoint(entry: LogEntry): Promise<void> {
    if (!process.env.NEXT_PUBLIC_LOG_ENDPOINT) return;

    try {
      await fetch(process.env.NEXT_PUBLIC_LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      });
    } catch (error) {
      // Silently fail - don't break app if logging fails
    }
  }

  /**
   * Debug log
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Get stored logs
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = this.logs;
    if (level) {
      logs = logs.filter((log) => log.level === level);
    }
    if (limit) {
      logs = logs.slice(-limit);
    }
    return logs;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

// Convenience functions
export function logDebug(message: string, context?: LogContext): void {
  getLogger().debug(message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  getLogger().info(message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  getLogger().warn(message, context);
}

export function logError(message: string, error?: Error, context?: LogContext): void {
  getLogger().error(message, error, context);
}

