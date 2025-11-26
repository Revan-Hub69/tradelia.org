/**
 * Platform Adapter - Vercel & Cloudflare Compatibility
 * Wraps API handlers to work on both platforms
 */

/**
 * Detects the current platform
 */
export function detectPlatform() {
  // Vercel sets VERCEL environment variable
  if (process.env.VERCEL) {
    return "vercel";
  }
  // Cloudflare Workers have CF context
  if (typeof globalThis !== "undefined" && globalThis.caches) {
    return "cloudflare";
  }
  // Default to vercel for local dev
  return "vercel";
}

/**
 * Normalizes request object from different platforms
 */
export function normalizeRequest(platform, rawRequest) {
  if (platform === "vercel") {
    return rawRequest; // Already in correct format
  }

  // Cloudflare Workers format
  if (platform === "cloudflare") {
    const url = new URL(rawRequest.url);
    return {
      method: rawRequest.method,
      url: rawRequest.url,
      headers: Object.fromEntries(rawRequest.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      body: rawRequest.body ? JSON.parse(rawRequest.body) : {},
      // Cloudflare-specific
      cf: rawRequest.cf,
      env: rawRequest.env,
    };
  }

  return rawRequest;
}

/**
 * Wraps a Vercel handler to work on Cloudflare
 */
export function createCloudflareHandler(vercelHandler) {
  return async (context) => {
    const { request, env } = context;

    // Inject Cloudflare env vars into process.env for compatibility
    // (Vercel handlers expect process.env)
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    // Parse request body if present
    let bodyData = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          bodyData = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          const formData = await request.formData();
          bodyData = Object.fromEntries(formData.entries());
        } else {
          bodyData = await request.text();
        }
      } catch {
        // Body might be empty or invalid, ignore
        bodyData = {};
      }
    }

    // Create normalized request (Vercel format)
    const url = new URL(request.url);
    const normalizedReq = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      body: bodyData || {},
      // Cloudflare-specific (for advanced use cases)
      cf: request.cf,
    };

    // Create response-like object (Vercel format)
    const headers = new Headers();
    let statusCode = 200;
    let responseBody = null;

    const normalizedRes = {
      statusCode,
      headers,
      status: (code) => {
        statusCode = code;
        return normalizedRes;
      },
      json: (data) => {
        responseBody = JSON.stringify(data);
        headers.set("Content-Type", "application/json");
        return normalizedRes;
      },
      setHeader: (key, value) => {
        headers.set(key, String(value));
        return normalizedRes;
      },
      end: (data) => {
        if (data) {
          responseBody = typeof data === "string" ? data : JSON.stringify(data);
        }
        return normalizedRes;
      },
    };

    // Call the Vercel handler
    try {
      await vercelHandler(normalizedReq, normalizedRes);
    } catch (error) {
      console.error("[Cloudflare Adapter] Handler error:", error);
      return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return Cloudflare Response
    return new Response(responseBody || "", {
      status: statusCode,
      headers: Object.fromEntries(headers.entries()),
    });
  };
}

/**
 * Universal handler wrapper - works on both platforms
 */
export function universalHandler(vercelHandler) {
  const platform = detectPlatform();

  if (platform === "cloudflare") {
    return createCloudflareHandler(vercelHandler);
  }

  // Vercel - return as-is
  return vercelHandler;
}
