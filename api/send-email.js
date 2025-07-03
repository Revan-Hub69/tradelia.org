// /api/send-email.ts (Vercel, Next.js API Route)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { servizio, asset, analisi, metodo, contatto, nome } = req.body;

  const contenuto = `
✅ Nuova richiesta da Tradelia

🧾 Servizio: ${servizio}
👤 Nome: ${nome}
📞 Metodo di contatto: ${metodo}
📬 Contatto: ${contatto}
${asset ? `📊 Asset richiesto: ${asset}` : ""}
${analisi ? `🧠 Tipo di analisi: ${analisi}` : ""}

📍 Inviato da https://tradelia.org
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer re_P2UTQkLc_HxqSWp8w3qxZ2ghHJhaSZrN3",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tradelia <noreply@resend.dev>",
        to: "analisi@tradelia.org",
        subject: "📩 Nuova richiesta da Tradelia",
        text: contenuto,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: "Errore invio email", details: error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Errore server", details: error.message });
  }
}
