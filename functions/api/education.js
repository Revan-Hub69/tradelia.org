/**
 * Cloudflare Function - Education API
 * Wraps the Vercel handler for Cloudflare compatibility
 */

import { createCloudflareHandler } from "../../api/_lib/adapter.js";
import vercelHandler from "../../api/education.js";

export const onRequest = createCloudflareHandler(vercelHandler);
