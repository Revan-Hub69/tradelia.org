// /api/send-business-data.js
// API Vercel - Invio dati business a amministrazione@tradelia.org (Brevo)

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
      userType,
      planType,
      businessData 
    } = req.body;
    
    // Best practice: server-side validation and sanitization
    if (!userEmail || !userName || !userType) {
      return res.status(400).json({ error: 'Dati utente mancanti' });
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
    
    if (userType === 'business' && !businessData) {
      return res.status(400).json({ error: 'Dati business mancanti' });
    }
    
    // Sanitize business data if present
    let sanitizedBusinessData = null;
    if (userType === 'business' && businessData) {
      sanitizedBusinessData = {};
      Object.keys(businessData).forEach(key => {
        const value = businessData[key];
        if (typeof value === 'string') {
          sanitizedBusinessData[key] = sanitizeString(value);
        } else if (typeof value === 'number') {
          sanitizedBusinessData[key] = value;
        } else {
          sanitizedBusinessData[key] = value;
        }
      });
    }
    
    // Usa Brevo API
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      console.error('[Send Business Data] BREVO_API_KEY non configurata');
      return res.status(500).json({ error: 'Configurazione email non disponibile' });
    }
    
    // Formatta i dati per l'email (best practice: use sanitized data)
    const emailSubject = `📋 Nuovo ${userType === 'business' ? 'Account Business' : 'Account Individuale'} - ${sanitizedUserName}`;
    
    let emailBody = `
Nuovo account Tradelia creato

═══════════════════════════════════════
DATI UTENTE
═══════════════════════════════════════

Email: ${sanitizedEmail}
Nome: ${sanitizedUserName}
Tipo: ${userType === 'business' ? 'Azienda/Business' : 'Individuale'}
Piano: ${planType === 'pro' ? 'Pro' : 'Trial'}
Data: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}
`;

    if (userType === 'business' && sanitizedBusinessData) {
      emailBody += `

═══════════════════════════════════════
DATI AZIENDALI (XOLO)
═══════════════════════════════════════

Dati Cliente:
  • Nome/Ragione Sociale: ${sanitizedBusinessData.businessName || 'N/A'}
  • Paese: ${sanitizedBusinessData.businessCountry || 'N/A'}
  • Lingua fatturazione: ${sanitizedBusinessData.businessLanguage || 'it'}

Indirizzo e Fatturazione:
  • Via: ${sanitizedBusinessData.businessAddress || 'N/A'}
  • Città: ${sanitizedBusinessData.businessCity || 'N/A'}
  • CAP: ${sanitizedBusinessData.businessZip || 'N/A'}
  • Partita IVA: ${sanitizedBusinessData.businessVat || 'Non fornita'}
  • Codice Fiscale: ${sanitizedBusinessData.businessTaxId || 'Non fornito'}
  • Giorni scadenza fattura: ${sanitizedBusinessData.businessInvoiceDays || 0} giorni

Recapiti:
  • Referente: ${sanitizedBusinessData.businessContactFirstname || ''} ${sanitizedBusinessData.businessContactLastname || ''}
  • Email referente: ${sanitizedBusinessData.businessContactEmail || 'N/A'}
  • Commenti: ${sanitizedBusinessData.businessComments || 'Nessun commento'}

═══════════════════════════════════════
AZIONI RICHIESTE
═══════════════════════════════════════

1. Verifica i dati aziendali sopra
2. Crea cliente in Xolo Go con i dati forniti
3. Collega l'account Tradelia al cliente Xolo
4. Attiva la fatturazione automatica

═══════════════════════════════════════
`;
    } else {
      emailBody += `

═══════════════════════════════════════
AZIONI RICHIESTE
═══════════════════════════════════════

1. Verifica l'account creato
2. Il trial è già attivo per 14 giorni
3. Nessuna azione aggiuntiva richiesta

═══════════════════════════════════════
`;
    }
    
    emailBody += `
Questo è un messaggio automatico generato dal sistema di onboarding Tradelia.
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
    .label { font-weight: 600; color: #1e40af; }
    .value { margin-left: 10px; }
    .divider { border-top: 2px solid #e5e7eb; margin: 20px 0; }
    .actions { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .footer { padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">📋 Nuovo ${userType === 'business' ? 'Account Business' : 'Account Individuale'}</h2>
  </div>
  
  <div class="content">
    <div class="section">
      <h3 style="margin-top: 0; color: #1e40af;">Dati Utente</h3>
      <p><span class="label">Email:</span><span class="value">${sanitizedEmail}</span></p>
      <p><span class="label">Nome:</span><span class="value">${sanitizedUserName}</span></p>
      <p><span class="label">Tipo:</span><span class="value">${userType === 'business' ? 'Azienda/Business' : 'Individuale'}</span></p>
      <p><span class="label">Piano:</span><span class="value">${planType === 'pro' ? 'Pro' : 'Trial'}</span></p>
      <p><span class="label">Data:</span><span class="value">${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</span></p>
    </div>
    
    ${userType === 'business' && sanitizedBusinessData ? `
    <div class="section">
      <h3 style="margin-top: 0; color: #1e40af;">Dati Aziendali (Xolo)</h3>
      
      <h4 style="color: #3b82f6;">Dati Cliente</h4>
      <p><span class="label">Nome/Ragione Sociale:</span><span class="value">${sanitizedBusinessData.businessName || 'N/A'}</span></p>
      <p><span class="label">Paese:</span><span class="value">${sanitizedBusinessData.businessCountry || 'N/A'}</span></p>
      <p><span class="label">Lingua fatturazione:</span><span class="value">${sanitizedBusinessData.businessLanguage || 'it'}</span></p>
      
      <div class="divider"></div>
      
      <h4 style="color: #3b82f6;">Indirizzo e Fatturazione</h4>
      <p><span class="label">Via:</span><span class="value">${sanitizedBusinessData.businessAddress || 'N/A'}</span></p>
      <p><span class="label">Città:</span><span class="value">${sanitizedBusinessData.businessCity || 'N/A'}</span></p>
      <p><span class="label">CAP:</span><span class="value">${sanitizedBusinessData.businessZip || 'N/A'}</span></p>
      <p><span class="label">Partita IVA:</span><span class="value">${sanitizedBusinessData.businessVat || 'Non fornita'}</span></p>
      <p><span class="label">Codice Fiscale:</span><span class="value">${sanitizedBusinessData.businessTaxId || 'Non fornito'}</span></p>
      <p><span class="label">Giorni scadenza fattura:</span><span class="value">${sanitizedBusinessData.businessInvoiceDays || 0} giorni</span></p>
      
      <div class="divider"></div>
      
      <h4 style="color: #3b82f6;">Recapiti</h4>
      <p><span class="label">Referente:</span><span class="value">${sanitizedBusinessData.businessContactFirstname || ''} ${sanitizedBusinessData.businessContactLastname || ''}</span></p>
      <p><span class="label">Email referente:</span><span class="value">${sanitizedBusinessData.businessContactEmail || 'N/A'}</span></p>
      ${sanitizedBusinessData.businessComments ? `<p><span class="label">Commenti:</span><span class="value">${sanitizedBusinessData.businessComments}</span></p>` : ''}
    </div>
    
    <div class="actions">
      <h4 style="margin-top: 0; color: #92400e;">📋 Azioni Richieste</h4>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Verifica i dati aziendali sopra</li>
        <li>Crea cliente in Xolo Go con i dati forniti</li>
        <li>Collega l'account Tradelia al cliente Xolo</li>
        <li>Attiva la fatturazione automatica</li>
      </ol>
    </div>
    ` : `
    <div class="actions">
      <h4 style="margin-top: 0; color: #92400e;">📋 Azioni Richieste</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Verifica l'account creato</li>
        <li>Il trial è già attivo per 14 giorni</li>
        <li>Nessuna azione aggiuntiva richiesta</li>
      </ul>
    </div>
    `}
  </div>
  
  <div class="footer">
    <p>Questo è un messaggio automatico generato dal sistema di onboarding Tradelia.</p>
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
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Sistema Onboarding' },
        to: [{ email: 'amministrazione@tradelia.org' }],
        subject: emailSubject,
        htmlContent: emailHTML,
        textContent: emailBody
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Send Business Data] Errore Brevo:', errorText);
      return res.status(500).json({ 
        error: 'Errore invio email', 
        details: errorText 
      });
    }
    
    const result = await response.json();
    console.log('[Send Business Data] Email inviata con successo:', result);
    
    return res.status(200).json({ 
      success: true, 
      messageId: result.messageId 
    });
    
  } catch (err) {
    console.error('[Send Business Data] Errore:', err);
    return res.status(500).json({ 
      error: 'Errore server', 
      details: err.message 
    });
  }
}

