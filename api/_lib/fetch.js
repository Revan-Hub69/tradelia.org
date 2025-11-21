import nodeFetch from "node-fetch";

const runtimeFetch =
  typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : nodeFetch;

// Export named invece di default per evitare che Vercel lo conti come serverless function
// Vercel conta TUTTI i file in api/ che esportano "export default" come serverless functions
export { runtimeFetch as default };
export { runtimeFetch };
