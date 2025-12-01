/**
 * API Request/Response Logging Middleware
 * Logs API requests and responses for debugging
 * 
 * Riferimento: API Logging Best Practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogger, LogContext } from './logger';

/**
 * Log API request
 */
export function logApiRequest(
  request: NextRequest,
  context?: Omit<LogContext, 'path' | 'requestId'>
): void {
  const logger = getLogger();
  const requestId = crypto.randomUUID();
  const path = request.nextUrl.pathname;
  const method = request.method;

  logger.info(`API Request: ${method} ${path}`, {
    ...context,
    path,
    requestId,
    metadata: {
      ...context?.metadata,
      method,
      query: Object.fromEntries(request.nextUrl.searchParams),
    },
  });
}

/**
 * Log API response
 */
export function logApiResponse(
  request: NextRequest,
  response: NextResponse,
  duration?: number,
  context?: Omit<LogContext, 'path' | 'requestId'>
): void {
  const logger = getLogger();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const status = response.status;

  const logContext: LogContext = {
    ...context,
    path,
    metadata: {
      ...context?.metadata,
      method,
      status,
      duration: duration ? `${duration}ms` : undefined,
    },
  };

  if (status >= 500) {
    logger.error(`API Response: ${method} ${path} - ${status}`, undefined, logContext);
  } else if (status >= 400) {
    logger.warn(`API Response: ${method} ${path} - ${status}`, logContext);
  } else {
    logger.debug(`API Response: ${method} ${path} - ${status}`, logContext);
  }
}

/**
 * Wrap API route with logging
 */
export function withApiLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();

    // Log request
    logApiRequest(request);

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Log response
      logApiResponse(request, response, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );

      // Log error
      logApiResponse(request, errorResponse, duration);
      getLogger().error('API Error', error as Error, { path: request.nextUrl.pathname });

      return errorResponse;
    }
  }) as T;
}

