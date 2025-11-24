/**
 * Error Logger per tracciare 400 e altri errori
 * Logga dettagli utili per debugging in produzione
 */

export function log400Error(req, error, details = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.url?.split('?')[0],
    query: req.query,
    action: req.query?.action || req.body?.action,
    error: error.message || error,
    details,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
  };

  // Log solo in produzione (Vercel logga automaticamente console.error)
  if (process.env.NODE_ENV === 'production') {
    console.error('[400 Bad Request]', JSON.stringify(logData, null, 2));
  } else {
    console.warn('[400 Bad Request]', logData);
  }

  return logData;
}

export function logError(req, status, error, details = {}) {
  if (status >= 400 && status < 500) {
    return log400Error(req, error, details);
  }

  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status,
    error: error.message || error,
    details,
  };

  console.error(`[${status} Error]`, JSON.stringify(logData, null, 2));
  return logData;
}
