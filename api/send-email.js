export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Legge il body raw così può essere YAML, JSON, testo... qualsiasi cosa
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => {
        data += chunk;
      });
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    // Usa variabile d'ambiente per la chiave API Brevo
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      return res.status(500).json({ error: "API key non configurata" });
    }

    // Brevo API format
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "noreply@tradelia.org", name: "Tradelia" },
        to: [{ email: "analisi@tradelia.org" }],
        subject: "📩 Nuova richiesta analisi",
        textContent: body // manda esattamente ciò che riceve
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res
        .status(500)
        .json({ error: "Errore invio email", details: error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Errore server", details: error.message });
  }
}
