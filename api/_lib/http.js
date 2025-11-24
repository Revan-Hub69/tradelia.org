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

export const handleRouteError = (res, error) => {
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
