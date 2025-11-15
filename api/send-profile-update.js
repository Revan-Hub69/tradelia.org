// /api/send-profile-update.js
// API Vercel - Invio notifica modifiche profilo a amministrazione@tradelia.org (Brevo)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { 
      userEmail,
      userName,
      changes,
      oldData,
      newData
    } = req.body;
    
    // Best practice: server-side validation and sanitization
    if (!userEmail || !userName || !changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({ error: 'Dati mancanti o invalidi' });
    }
    
    // Sanitize inputs (best practice: prevent XSS, trim whitespace)
    const sanitizeString = (str) => {
      if (!str || typeof str !== 'string') return null;
      return str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
    };
    
    const sanitizedEmail = userEmail.trim().toLowerCase();
    const sanitizedUserName = sanitizeString(userName);
    
    // Validate email format (best practice: server-side validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Email non valida' });
    }
    
    // Usa Brevo API
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      console.error('[Send Profile Update] BREVO_API_KEY non configurata');
      return res.status(500).json({ error: 'Configurazione email non disponibile' });
    }
    
    // Formatta i cambiamenti per l'email
    let changesList = '';
    changes.forEach(change => {
      const fieldName = change.field;
      const oldValue = change.oldValue !== null && change.oldValue !== undefined ? String(change.oldValue) : '(vuoto)';
      const newValue = change.newValue !== null && change.newValue !== undefined ? String(change.newValue) : '(vuoto)';
      changesList += `  • ${fieldName}: "${oldValue}" → "${newValue}"\n`;
    });
    
    const emailSubject = `📝 Modifica Profilo - ${sanitizedUserName}`;
    
    const emailBody = `
Modifica profilo utente Tradelia

═══════════════════════════════════════
UTENTE
═══════════════════════════════════════

Email: ${sanitizedEmail}
Nome: ${sanitizedUserName}
Data modifica: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}

═══════════════════════════════════════
MODIFICHE EFFETTUATE
═══════════════════════════════════════

${changesList}

═══════════════════════════════════════
DATI COMPLETI (NUOVI)
═══════════════════════════════════════

${JSON.stringify(newData, null, 2)}

═══════════════════════════════════════
AZIONI RICHIESTE
═══════════════════════════════════════

1. Verifica le modifiche sopra
2. Se ci sono modifiche ai dati business, aggiorna Xolo Go
3. Se necessario, contatta l'utente per conferma

═══════════════════════════════════════

Questo è un messaggio automatico generato dal sistema Tradelia.
`;
    
    // HTML version per migliore leggibilità
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9fafb; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
    .changes { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .change-item { margin: 8px 0; padding: 8px; background: white; border-radius: 4px; }
    .field-name { font-weight: 600; color: #1e40af; }
    .old-value { color: #dc2626; text-decoration: line-through; }
    .new-value { color: #16a34a; font-weight: 600; }
    .label { font-weight: 600; color: #1e40af; }
    .value { margin-left: 10px; }
    .divider { border-top: 2px solid #e5e7eb; margin: 20px 0; }
    .actions { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .footer { padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
    pre { background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">📝 Modifica Profilo Utente</h2>
  </div>
  
  <div class="content">
    <div class="section">
      <h3 style="margin-top: 0; color: #1e40af;">Utente</h3>
      <p><span class="label">Email:</span><span class="value">${sanitizedEmail}</span></p>
      <p><span class="label">Nome:</span><span class="value">${sanitizedUserName}</span></p>
      <p><span class="label">Data modifica:</span><span class="value">${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</span></p>
    </div>
    
    <div class="changes">
      <h3 style="margin-top: 0; color: #92400e;">Modifiche Effettuate</h3>
      ${changes.map(change => {
        const oldValue = change.oldValue !== null && change.oldValue !== undefined ? String(change.oldValue) : '(vuoto)';
        const newValue = change.newValue !== null && change.newValue !== undefined ? String(change.newValue) : '(vuoto)';
        return `
        <div class="change-item">
          <span class="field-name">${change.field}:</span>
          <span class="old-value">${oldValue}</span>
          <span style="margin: 0 8px;">→</span>
          <span class="new-value">${newValue}</span>
        </div>
        `;
      }).join('')}
    </div>
    
    <div class="section">
      <h3 style="margin-top: 0; color: #1e40af;">Dati Completi (Nuovi)</h3>
      <pre>${JSON.stringify(newData, null, 2)}</pre>
    </div>
    
    <div class="actions">
      <h4 style="margin-top: 0; color: #92400e;">📋 Azioni Richieste</h4>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Verifica le modifiche sopra</li>
        <li>Se ci sono modifiche ai dati business, aggiorna Xolo Go</li>
        <li>Se necessario, contatta l'utente per conferma</li>
      </ol>
    </div>
  </div>
  
  <div class="footer">
    <p>Questo è un messaggio automatico generato dal sistema Tradelia.</p>
  </div>
</body>
</html>
`;
    
    // Brevo API format
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Sistema Profilo' },
        to: [{ email: 'amministrazione@tradelia.org' }],
        subject: emailSubject,
        htmlContent: emailHTML,
        textContent: emailBody
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Send Profile Update] Errore Brevo:', errorText);
      return res.status(500).json({ 
        error: 'Errore invio email', 
        details: errorText 
      });
    }
    
    const result = await response.json();
    console.log('[Send Profile Update] Email inviata con successo:', result);
    
    return res.status(200).json({ 
      success: true, 
      messageId: result.messageId 
    });
    
  } catch (err) {
    console.error('[Send Profile Update] Errore:', err);
    return res.status(500).json({ 
      error: 'Errore server', 
      details: err.message 
    });
  }
}

