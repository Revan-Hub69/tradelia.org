// /api/generate-admin-token.js
// API Vercel - Genera token admin manualmente (per setup iniziale o recupero)
// Solo per email in admin_emails

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Genera token random sicuro (32 caratteri alfanumerici)
 */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Calcola hash SHA-256 del token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Invia email con token admin via Brevo
 */
async function sendAdminTokenEmail(email, token) {
  if (!BREVO_API_KEY) {
    console.error('[Admin Token] BREVO_API_KEY non configurata');
    return false;
  }
  
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9fafb; }
    .token-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #dc2626; text-align: center; }
    .token { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #dc2626; letter-spacing: 2px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔐 Codice Admin Dashboard Tradelia</h2>
    </div>
    
    <div class="content">
      <p>Ciao,</p>
      <p>È stato generato un codice di accesso <strong>admin</strong> per la dashboard Tradelia.</p>
      
      <div class="token-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Il tuo codice admin:</p>
        <div class="token">${token}</div>
      </div>
      
      <div class="warning">
        <p style="margin: 0;"><strong>⚠️ ATTENZIONE:</strong> Questo codice ti dà accesso completo alla dashboard admin. Conservalo in un luogo sicuro e non condividerlo con altri.</p>
      </div>
      
      <p>Usa questo codice nella pagina <a href="https://tradelia.org/accesso.html">/accesso.html</a> per accedere alla dashboard admin.</p>
      <p>Dopo l'accesso, potrai gestire utenti, crediti, pagamenti e report.</p>
    </div>
    
    <div class="footer">
      <p>Questo è un messaggio automatico da Tradelia AI.</p>
      <p>Per assistenza: <a href="mailto:support@tradelia.org">support@tradelia.org</a></p>
    </div>
  </div>
</body>
</html>
  `;
  
  const emailText = `
Codice Admin Dashboard Tradelia

È stato generato un codice di accesso admin per la dashboard Tradelia.

Il tuo codice admin: ${token}

⚠️ ATTENZIONE: Questo codice ti dà accesso completo alla dashboard admin. Conservalo in un luogo sicuro e non condividerlo con altri.

Usa questo codice nella pagina /accesso.html per accedere alla dashboard admin.

Dopo l'accesso, potrai gestire utenti, crediti, pagamenti e report.

---
Questo è un messaggio automatico da Tradelia AI.
Per assistenza: support@tradelia.org
  `;
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Admin' },
        to: [{ email: email }],
        subject: '🔐 Codice Admin Dashboard Tradelia',
        htmlContent: emailHTML,
        textContent: emailText
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Admin Token] Errore Brevo:', errorText);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('[Admin Token] Errore invio email:', err);
    return false;
  }
}

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
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Email non valida' 
      });
    }
    
    const sanitizedEmail = email.trim().toLowerCase();
    
    // 1. Verifica che l'email sia in admin_emails
    const { data: adminEmail, error: adminError } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', sanitizedEmail)
      .maybeSingle();
    
    if (adminError) {
      console.error('[Admin Token] Errore verifica admin:', adminError);
      return res.status(500).json({ 
        ok: false, 
        error: 'Errore verifica admin' 
      });
    }
    
    if (!adminEmail) {
      // Email non è admin
      return res.status(403).json({ 
        ok: false, 
        error: 'Questa email non è autorizzata come admin. Aggiungi prima l\'email in admin_emails.' 
      });
    }
    
    // 2. Cerca user_id se esiste (opzionale, per retrocompatibilità)
    let userId = null;
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers?.users?.find(u => u.email?.toLowerCase() === sanitizedEmail);
      userId = user?.id || null;
    } catch (err) {
      console.warn('[Admin Token] Impossibile recuperare user_id (non critico):', err);
    }
    
    // 3. Genera nuovo token admin
    const newToken = generateToken();
    const tokenHash = hashToken(newToken);
    
    // 4. Revoca token vecchi per questa email
    await supabase
      .from('dashboard_access_tokens')
      .update({ 
        revoked: true, 
        revoked_at: new Date().toISOString() 
      })
      .or(`email.eq.${sanitizedEmail}${userId ? `,user_id.eq.${userId}` : ''}`)
      .eq('revoked', false);
    
    // 5. Crea nuovo token admin (scadenza 1 anno)
    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const tokenData = {
      user_id: userId,
      email: sanitizedEmail,
      token_hash: tokenHash,
      plan_role: 'institutional', // Admin ha sempre ruolo institutional
      valid_until: validUntil,
      source: 'admin_manual',
      metadata: { 
        is_admin: true,
        generated_at: new Date().toISOString(),
        generated_by: 'generate-admin-token API'
      }
    };
    
    const { error: insertError } = await supabase
      .from('dashboard_access_tokens')
      .insert(tokenData);
    
    if (insertError) {
      console.error('[Admin Token] Errore inserimento token:', insertError);
      return res.status(500).json({ 
        ok: false, 
        error: 'Errore generazione token' 
      });
    }
    
    // 6. Invia email con nuovo token
    const emailSent = await sendAdminTokenEmail(sanitizedEmail, newToken);
    
    if (!emailSent) {
      console.warn('[Admin Token] Email non inviata, ma token creato');
      // Restituisci comunque il token nella risposta (solo per admin, in caso di problemi email)
      return res.status(200).json({
        ok: true,
        token: newToken, // ⚠️ Solo per admin, in caso di problemi email
        message: 'Token generato. Email non inviata (controlla BREVO_API_KEY). Usa il token qui sopra.',
        warning: 'IMPORTANTE: Conserva questo token in un luogo sicuro. Non verrà mostrato di nuovo.'
      });
    }
    
    return res.status(200).json({
      ok: true,
      message: 'Token admin generato e inviato via email. Controlla la tua casella email.'
    });
    
  } catch (err) {
    console.error('[Admin Token] Errore:', err);
    return res.status(500).json({ 
      ok: false, 
      error: 'Errore server', 
      details: err.message 
    });
  }
}

