/* eslint-env node */
/**
 * API endpoint per version.json
 * Serve la versione dell'applicazione
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Versione hardcoded (può essere aggiornata manualmente o via CI/CD)
    const versionData = {
      version: "2.0.1",
      timestamp: new Date().toISOString(),
      description: "Tradelia AI version manifest",
    };

    return res.status(200).json(versionData);
  } catch (error) {
    console.error("[Version API] Errore:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
