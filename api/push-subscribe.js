// /api/push-subscribe.js
// API Vercel - Registrazione subscription push (FCM)

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
    const { subscription, userId } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription richiesta' });
    }
    
    // TODO: Salva subscription in database (Supabase o Vercel KV)
    // Per ora placeholder
    console.log('[Push Subscribe] Subscription ricevuta:', {
      userId,
      endpoint: subscription.endpoint
    });
    
    // Salva subscription (da implementare con Supabase o Vercel KV)
    // await saveSubscription(userId, subscription);
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Push Subscribe] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

