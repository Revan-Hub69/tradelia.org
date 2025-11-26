/**
 * Render Server - Serve Static Files + API Routes
 * Compatibile con Vercel API handlers
 */

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync, statSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS per API
app.use("/api/*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Load API handlers dinamically
const apiHandlers = new Map();

async function loadAPIHandlers() {
  const apiDir = join(__dirname, "api");
  const files = readdirSync(apiDir);

  for (const file of files) {
    if (file.endsWith(".js") && !file.startsWith("_")) {
      try {
        const filePath = join(apiDir, file);
        const stat = statSync(filePath);
        if (stat.isFile()) {
          const module = await import(`file://${filePath}`);
          const handler = module.default || module.handler;

          if (handler) {
            const routeName = file.replace(".js", "");
            apiHandlers.set(routeName, handler);
            console.warn(`✅ Loaded API handler: /api/${routeName}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load ${file}:`, error.message);
      }
    }
  }
}

// API Routes - Vercel-compatible handler wrapper
app.all("/api/:route", async (req, res) => {
  const route = req.params.route;
  const handler = apiHandlers.get(route);

  if (!handler) {
    return res.status(404).json({ error: `API route /api/${route} not found` });
  }

  try {
    // Convert Express req/res to Vercel-compatible format
    const vercelReq = {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      cookies: req.cookies || {},
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
        return vercelRes;
      },
      send: (data) => {
        res.send(data);
        return vercelRes;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return vercelRes;
      },
      end: (data) => {
        if (data) {
          res.send(data);
        }
        res.end();
        return vercelRes;
      },
    };

    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error(`Error in /api/${route}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
});

// Serve static files from dist
const distPath = join(__dirname, "dist");
app.use(
  express.static(distPath, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return next();
  }

  // Serve specific HTML files if they exist
  const htmlFile = join(distPath, req.path === "/" ? "index.html" : req.path);

  try {
    if (statSync(htmlFile).isFile()) {
      return res.sendFile(htmlFile);
    }
  } catch {
    // File doesn't exist, fallback to index.html
  }

  // Default fallback to index.html for SPA
  res.sendFile(join(distPath, "index.html"));
});

// Error handler
app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
async function start() {
  await loadAPIHandlers();

  app.listen(PORT, () => {
    console.warn(`🚀 Tradelia server running on port ${PORT}`);
    console.warn(`📦 Serving static files from: ${distPath}`);
    console.warn(`🔌 API routes loaded: ${apiHandlers.size}`);
    console.warn(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
