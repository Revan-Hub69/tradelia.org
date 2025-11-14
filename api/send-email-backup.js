// /api/send-email-backup.js
// API Vercel - Invio email backup (Brevo)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Verifica autorizzazione (API key o token)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'To, subject e html/text richiesti' });
    }
    
    // Usa Brevo API
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return res.status(500).json({ error: 'BREVO_API_KEY non configurata' });
    }
    
    // Converti 'to' in array se necessario
    const toArray = Array.isArray(to) ? to : [to];
    const toEmails = toArray.map(email => ({ email }));
    
    // Brevo API format
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI' },
        to: toEmails,
        subject: subject,
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {})
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Send Email] Errore Brevo:', error);
      return res.status(500).json({ error: 'Errore invio email', details: error });
    }
    
    const data = await response.json();
    console.log('[Send Email] Email inviata:', data);
    
    return res.status(200).json({ success: true, id: data.messageId || 'sent' });
  } catch (err) {
    console.error('[Send Email] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

