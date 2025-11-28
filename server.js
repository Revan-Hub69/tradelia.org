/**
 * Render Server Wrapper for Next.js
 * Questo file è necessario solo per Render che cerca server.js
 * Next.js ha il suo server integrato, questo è solo un wrapper
 */

import { createServer } from "http";
import next from "next";

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Use WHATWG URL API instead of deprecated url.parse()
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const parsedUrl = {
        pathname: url.pathname,
        query: Object.fromEntries(url.searchParams),
        path: url.pathname + url.search,
      };
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
