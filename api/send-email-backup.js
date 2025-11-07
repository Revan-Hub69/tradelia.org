// /api/send-email-backup.js
// API Vercel - Invio email backup (Resend)

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
    
    // Usa Resend API
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY non configurata' });
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tradelia AI <noreply@tradelia.org>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html || text,
        text: text || html
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Send Email] Errore Resend:', error);
      return res.status(500).json({ error: 'Errore invio email', details: error });
    }
    
    const data = await response.json();
    console.log('[Send Email] Email inviata:', data);
    
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('[Send Email] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

