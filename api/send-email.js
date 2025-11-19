// /api/send-email.js
// API Vercel - Invio email unificato (Brevo)
// Gestisce: analisi, business-data, profile-update, backup

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'API key non configurata' });
  }

  try {
    const { type, ...data } = req.body || {};
    
    // Se type non specificato, usa il formato legacy (analisi)
    if (!type) {
      // Legacy: body raw (YAML, JSON, testo)
      const body = await new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", chunk => { raw += chunk; });
        req.on("end", () => resolve(raw));
        req.on("error", reject);
      });

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
          textContent: body
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(500).json({ error: "Errore invio email", details: error });
      }
      return res.status(200).json({ success: true });
    }

    // Nuovo formato con type
    let emailConfig = null;

    if (type === 'analisi-su-richiesta') {
      const { nome, email, tipologia, codiceFiscale, ragioneSociale, piva, indirizzo, tipoAnalisi, dettagli, consensoGDPR, timestamp } = data;
      
      if (!nome || !email || !tipologia || !tipoAnalisi || !dettagli) {
        return res.status(400).json({ error: 'Dati richiesti mancanti' });
      }
      
      const billingBlock = tipologia === 'privato'
        ? `Tipologia cliente: Privato / persona fisica\nCodice fiscale: ${codiceFiscale || 'N/A'}`
        : `Tipologia cliente: Azienda / professionista\nRagione sociale: ${ragioneSociale || 'N/A'}\nPartita IVA: ${piva || 'N/A'}`;
      
      const emailSubject = `📩 Nuova richiesta analisi - ${nome}`;
      const emailBody = `Richiesta Analisi su Richiesta - Tradelia AI

Dati anagrafici:
Nome: ${nome}
Email: ${email}
${billingBlock}
Indirizzo: ${indirizzo || 'N/A'}

Dettagli richiesta:
Tipo analisi: ${tipoAnalisi}
Dettagli: ${dettagli}

Consenso GDPR: ${consensoGDPR || 'Sì'}
Timestamp: ${timestamp || new Date().toISOString()}`;
      
      emailConfig = {
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia' },
        to: [{ email: 'analisi@tradelia.org' }],
        subject: emailSubject,
        textContent: emailBody
      };
    } else if (type === 'business-data') {
      const { userEmail, userName, userType, planType, businessData } = data;
      if (!userEmail || !userName || !userType) {
        return res.status(400).json({ error: 'Dati utente mancanti' });
      }
      
      const sanitizedEmail = userEmail.trim().toLowerCase();
      const sanitizedUserName = String(userName).trim();
      
      const emailSubject = `📋 Nuovo ${userType === 'business' ? 'Account Business' : 'Account Individuale'} - ${sanitizedUserName}`;
      const emailHTML = generateBusinessDataHTML(sanitizedEmail, sanitizedUserName, userType, planType, businessData);
      const emailBody = generateBusinessDataText(sanitizedEmail, sanitizedUserName, userType, planType, businessData);
      
      emailConfig = {
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Sistema Onboarding' },
        to: [{ email: 'amministrazione@tradelia.org' }],
        subject: emailSubject,
        htmlContent: emailHTML,
        textContent: emailBody
      };
    } else if (type === 'profile-update') {
      const { userEmail, userName, changes, newData } = data;
      if (!userEmail) {
        return res.status(400).json({ error: 'userEmail is required' });
      }
      
      const sanitizedEmail = userEmail.trim().toLowerCase();
      const sanitizedUserName = userName ? String(userName).trim() : '';
      
      const emailSubject = `📝 Modifica Profilo - ${sanitizedUserName || sanitizedEmail}`;
      const emailHTML = generateProfileUpdateHTML(sanitizedEmail, sanitizedUserName, changes, newData);
      const emailBody = generateProfileUpdateText(sanitizedEmail, sanitizedUserName, changes, newData);
      
      emailConfig = {
        sender: { email: 'amministrazione@tradelia.org', name: 'Tradelia' },
        to: [{ email: 'amministrazione@tradelia.org' }],
        replyTo: { email: sanitizedEmail, name: sanitizedUserName || sanitizedEmail },
        subject: emailSubject,
        htmlContent: emailHTML,
        textContent: emailBody
      };
    } else if (type === 'backup') {
      // Richiede Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { to, subject, html, text } = data;
      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: 'To, subject e html/text richiesti' });
      }
      
      emailConfig = {
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia' },
        to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      };
    } else {
      return res.status(400).json({ error: `Tipo email non supportato: ${type}` });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: 'Errore invio email', details: errorText });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, messageId: result.messageId });
  } catch (error) {
    return res.status(500).json({ error: 'Errore server', details: error.message });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateBusinessDataHTML(email, name, userType, planType, businessData) {
  // Implementazione semplificata - usa la logica da send-business-data.js
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
    <h2>📋 Nuovo ${userType === 'business' ? 'Account Business' : 'Account Individuale'}</h2>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
    <p><strong>Tipo:</strong> ${userType === 'business' ? 'Azienda/Business' : 'Individuale'}</p>
    <p><strong>Piano:</strong> ${planType === 'pro' ? 'Pro' : 'Trial'}</p>
    ${businessData ? `<pre>${escapeHtml(JSON.stringify(businessData, null, 2))}</pre>` : ''}
  </body></html>`;
}

function generateBusinessDataText(email, name, userType, planType, businessData) {
  return `Nuovo account Tradelia\n\nEmail: ${email}\nNome: ${name}\nTipo: ${userType}\nPiano: ${planType}\n\n${businessData ? JSON.stringify(businessData, null, 2) : ''}`;
}

function generateProfileUpdateHTML(email, name, changes, newData) {
  const changesRows = Array.isArray(changes) ? changes.map(c => `
    <tr><td>${escapeHtml(c.field)}</td><td>${escapeHtml(String(c.oldValue || ''))}</td><td>${escapeHtml(String(c.newValue || ''))}</td></tr>
  `).join('') : '';
  
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
    <h2>📝 Modifica Profilo</h2>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Nome:</strong> ${escapeHtml(name || email)}</p>
    <table border="1"><thead><tr><th>Campo</th><th>Vecchio</th><th>Nuovo</th></tr></thead><tbody>${changesRows}</tbody></table>
    ${newData ? `<pre>${escapeHtml(JSON.stringify(newData, null, 2))}</pre>` : ''}
  </body></html>`;
}

function generateProfileUpdateText(email, name, changes, newData) {
  const changesList = Array.isArray(changes) ? changes.map(c => `  • ${c.field}: "${c.oldValue || ''}" → "${c.newValue || ''}"`).join('\n') : '';
  return `Modifica profilo\n\nEmail: ${email}\nNome: ${name || email}\n\nModifiche:\n${changesList}\n\n${newData ? JSON.stringify(newData, null, 2) : ''}`;
}
