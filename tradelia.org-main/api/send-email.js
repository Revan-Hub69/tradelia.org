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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer re_hkkZC1CZ_4jT9XipxNg4mN1ffmPTQp61d", // Chiave in chiaro
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tradelia <noreply@resend.dev>",
        to: "analisi@tradelia.org",
        subject: "📩 Nuova richiesta analisi",
        text: body, // manda esattamente ciò che riceve
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
