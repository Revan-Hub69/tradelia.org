export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const MAIL_FROM = process.env.MAIL_FROM || "Tradelia <onboarding@resend.dev>"; // meglio: "Tradelia <ai@tradelia.org>"
  const MAIL_TO = process.env.MAIL_TO || "analisi@tradelia.org";

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  const body = req.body || {};
  const servizio = body.servizio || "N/D";

  // Recapiti minimi
  const email = body?.recapiti?.email?.trim();
  const wa = body?.recapiti?.whatsapp?.trim();
  if (!email && !wa) {
    return res.status(400).json({ error: "Indica almeno un recapito (email o WhatsApp)." });
  }

  // Sanitize: NON inviare password
  const sanitized = JSON.parse(JSON.stringify(body));
  if (sanitized?.sharing?.password) delete sanitized.sharing.password;

  // Helpers
  const truncate = (s, n = 180) => (typeof s === "string" && s.length > n ? s.slice(0, n) + "…" : s || "N/D");
  const val = (obj, path, fallback = "N/D") => {
    try {
      return path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj) ?? fallback;
    } catch {
      return fallback;
    }
  };

  // Header comune
  const righe = [];
  righe.push("✅ Nuova richiesta AI da Tradelia");
  righe.push(`📝 Servizio: ${servizio}`);
  righe.push(`📞 Contatti: ${[email, wa].filter(Boolean).join(" | ") || "N/D"}`);

  // Sezioni per servizio
  let subject = "📩 Nuova richiesta Tradelia AI";

  if (servizio === "profilo_investitore") {
    subject = "📩 Profilo Investitore – nuova richiesta";
    righe.push(`🎯 Modalità: ${body.tipo_analisi || "N/D"}`);
    righe.push(
      `👤 Età: ${val(body, "Profilo_Investitore.dati_anagrafici.eta.valore")} | Area fiscale: ${val(
        body,
        "Profilo_Investitore.dati_anagrafici.area_fiscale.valore"
      )}`
    );
    righe.push(
      `💰 Capitale: ${val(body, "Profilo_Investitore.capitale_liquidita.capitale_totale.valore")} | Investibile ora: ${val(
        body,
        "Profilo_Investitore.capitale_liquidita.capitale_investibile.valore"
      )}`
    );
    righe.push(
      `⚖️ Rischio: tol=${val(body, "Profilo_Investitore.rischio_rendimento.tolleranza_rischio.valore")} | DD=${val(
        body,
        "Profilo_Investitore.rischio_rendimento.drawdown_tollerato.valore"
      )} | Rnd=${val(body, "Profilo_Investitore.rischio_rendimento.rendimento_obiettivo.valore")} (${val(
        body,
        "Profilo_Investitore.rischio_rendimento.rnd_tipo",
        "Nominale"
      )})`
    );
    if (body.tipo_analisi === "validazione") {
      const pos = val(body, "Profilo_Investitore.portafoglio_attuale.posizioni.valore", []);
      righe.push(`📦 Posizioni dichiarate: ${Array.isArray(pos) ? pos.length : 0}`);
    }
    if (body?.sharing?.visibility) {
      righe.push(`🔐 Visibilità report: ${body.sharing.visibility}`);
    }
  } else if (servizio === "analisi_asset") {
    subject = "📩 Analisi Asset – nuova richiesta";
    righe.push(
      `🔎 Tipo: ${val(body, "Analisi_Asset.identificazione.tipo.valore")} | ID: ${val(
        body,
        "Analisi_Asset.identificazione.identificativo.valore"
      )}`
    );
    const fin = val(body, "Analisi_Asset.richiesta.finalita.valore", []);
    righe.push(`🎯 Finalità: ${Array.isArray(fin) ? fin.join(", ") : fin}`);
    const note = val(body, "Analisi_Asset.richiesta.note.valore", "");
    if (note && note !== "N/D") righe.push(`📝 Note: ${truncate(note, 220)}`);
  } else if (servizio === "domanda_libera") {
    subject = "📩 Domanda Libera – nuova richiesta";
    righe.push(`📚 Argomento: ${val(body, "Richiesta.argomento.valore")}`);
    const domanda = val(body, "Richiesta.domanda.valore", "");
    righe.push(`❓ Domanda: ${truncate(domanda, 220)}`);
    const rif = val(body, "Richiesta.riferimento.valore", "");
    if (rif && rif !== "N/D") righe.push(`🎯 Riferimento: ${rif}`);
  }

  righe.push("");
  righe.push("📍 Inviato da: https://tradelia.org");
  righe.push("");
  righe.push("— Payload (minimizzato) —");
  righe.push(JSON.stringify(sanitized, null, 2));

  const text = righe.join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: "Errore invio email", details: error });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Errore server", details: err.message });
  }
}
