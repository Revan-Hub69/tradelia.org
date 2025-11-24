export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const sendJSON = (res, status, payload = {}) => {
  res.status(status).json(payload);
};

export const methodNotAllowed = (res, methods = []) => {
  res.setHeader("Allow", methods.join(", ") || "GET");
  return sendJSON(res, 405, { ok: false, error: "Method Not Allowed" });
};

export const handleRouteError = (res, error, req = null) => {
  // Log 400 errors con dettagli
  if (error instanceof HttpError && error.status === 400 && req) {
    console.error("[400 Bad Request]", {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.url?.split('?')[0],
      action: req.query?.action || req.body?.action,
      error: error.message,
      details: error.details,
      query: req.query,
      body: req.method === 'POST' ? (typeof req.body === 'object' ? JSON.stringify(req.body).substring(0, 200) : req.body) : undefined,
      userAgent: req.headers?.['user-agent']?.substring(0, 100),
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown',
    });
  }

  if (error instanceof HttpError) {
    return sendJSON(res, error.status, {
      ok: false,
      error: error.message,
      details: error.details,
    });
  }
  console.error("[Route] Unhandled error:", error);
  return sendJSON(res, 500, {
    ok: false,
    error: "Internal server error",
  });
};
