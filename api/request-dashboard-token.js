// /api/request-dashboard-token.js
// API Vercel - Genera nuovo token dashboard e invia email (per "Ho perso il codice")

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fetch from './_lib/fetch.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
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
 * Invia email con nuovo token via Brevo
 */
async function sendTokenEmail(email, token) {
  if (!BREVO_API_KEY) {
    console.error('[Request Token] BREVO_API_KEY non configurata');
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
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9fafb; }
    .token-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #2563eb; text-align: center; }
    .token { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
    .footer { padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔑 Il tuo codice di accesso Tradelia</h2>
    </div>
    
    <div class="content">
      <p>Ciao,</p>
      <p>Hai richiesto un nuovo codice di accesso per la dashboard Tradelia.</p>
      
      <div class="token-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Il tuo codice:</p>
        <div class="token">${token}</div>
      </div>
      
      <p>Usa questo codice nella pagina di accesso per entrare nella dashboard.</p>
      <p><strong>Importante:</strong> Conserva questo codice in un luogo sicuro. Non condividerlo con altri.</p>
      
      <p style="margin-top: 30px;">Se non hai richiesto questo codice, ignora questa email o contatta il supporto.</p>
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
Il tuo codice di accesso Tradelia

Hai richiesto un nuovo codice di accesso per la dashboard Tradelia.

Il tuo codice di accesso: ${token}

Usa questo codice nella pagina di accesso per entrare nella dashboard.

Importante: Conserva questo codice in un luogo sicuro. Non condividerlo con altri.

Se non hai richiesto questo codice, ignora questa email o contatta il supporto.

---
Questo è un messaggio automatico da Tradelia AI.
Per assistenza: support@tradelia.org
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI' },
        to: [{ email: email }],
        subject: '🔑 Il tuo codice di accesso Tradelia',
        htmlContent: emailHTML,
        textContent: emailText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Request Token] Errore Brevo:', errorText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Request Token] Errore invio email:', err);
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
        error: 'Email non valida',
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // 1. Verifica che esista un utente con piano attivo
    // Cerca prima in subscribers
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('auth_user_id, status, current_period_end')
      .eq('email', sanitizedEmail)
      .eq('status', 'active')
      .single();

    let userId = subscriber?.auth_user_id || null;
    let validUntil = subscriber?.current_period_end || null;

    // Se non ha subscriber, cerca in auth.users e user_roles
    if (!userId) {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers?.users?.find((u) => u.email?.toLowerCase() === sanitizedEmail);
      userId = user?.id || null;

      if (userId) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role, valid_until')
          .eq('user_id', userId)
          .single();

        if (userRole && userRole.valid_until) {
          const expiryDate = new Date(userRole.valid_until);
          if (expiryDate > new Date()) {
            validUntil = userRole.valid_until;
          } else {
            // Piano scaduto
            return res.status(200).json({
              ok: false,
              error:
                'Non risulta un piano attivo per questa email. Vai ai piani o contattaci per attivare un abbonamento.',
            });
          }
        } else {
          // Nessun piano attivo
          return res.status(200).json({
            ok: false,
            error:
              'Non risulta un piano attivo per questa email. Vai ai piani o contattaci per attivare un abbonamento.',
          });
        }
      } else {
        // Utente non trovato
        return res.status(200).json({
          ok: false,
          error:
            'Non risulta un piano attivo per questa email. Vai ai piani o contattaci per attivare un abbonamento.',
        });
      }
    } else {
      // Verifica che il piano non sia scaduto
      if (validUntil) {
        const expiryDate = new Date(validUntil);
        if (expiryDate <= new Date()) {
          return res.status(200).json({
            ok: false,
            error: 'Il tuo abbonamento è scaduto. Vai ai piani per rinnovare.',
          });
        }
      }
    }

    // 2. Determina plan_role da user_roles
    let planRole = 'trial';
    if (userId) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (userRole) {
        planRole = userRole.role;
      }
    }

    // 3. Genera nuovo token
    const newToken = generateToken();
    const tokenHash = hashToken(newToken);

    // 4. Revoca token vecchi per questo utente/email
    if (userId) {
      await supabase
        .from('dashboard_access_tokens')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('revoked', false);
    } else {
      await supabase
        .from('dashboard_access_tokens')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
        })
        .eq('email', sanitizedEmail)
        .eq('revoked', false);
    }

    // 5. Crea nuovo token
    const tokenData = {
      user_id: userId,
      email: userId ? null : sanitizedEmail, // Solo se non abbiamo user_id
      token_hash: tokenHash,
      plan_role: planRole,
      valid_until: validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 anno se non specificato
      source: 'manual',
      metadata: { requested_at: new Date().toISOString() },
    };

    const { error: insertError } = await supabase.from('dashboard_access_tokens').insert(tokenData);

    if (insertError) {
      console.error('[Request Token] Errore inserimento token:', insertError);
      return res.status(500).json({
        ok: false,
        error: 'Errore generazione token',
      });
    }

    // 6. Invia email con nuovo token
    const emailSent = await sendTokenEmail(sanitizedEmail, newToken);

    if (!emailSent) {
      console.warn('[Request Token] Email non inviata, ma token creato');
    }

    // 7. Notifica admin (amministrazione@tradelia.org)
    if (BREVO_API_KEY) {
      try {
        const adminEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; color: #fff; padding: 20px; border-radius: 14px; margin-bottom: 24px; }
    .section { background: #fff; border-radius: 14px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .label { font-weight: 600; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .value { color: #0f172a; font-size: 15px; margin-bottom: 16px; }
    .meta { font-size: 13px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔑 Richiesta Nuovo Token Dashboard</h2>
      <p style="margin: 8px 0 0 0;">Token rigenerato per utente esistente</p>
    </div>
    
    <div class="section">
      <div class="label">Dati Utente</div>
      <div class="value"><strong>Email:</strong> ${sanitizedEmail}</div>
      <div class="value"><strong>Piano:</strong> ${planRole}</div>
      ${validUntil ? `<div class="value"><strong>Validità Piano:</strong> ${new Date(validUntil).toLocaleString('it-IT')}</div>` : ''}
      ${userId ? `<div class="value"><strong>User ID:</strong> ${userId}</div>` : ''}
    </div>

    <div class="meta">
      <strong>Token generato:</strong> ${new Date().toLocaleString('it-IT')}<br>
      <strong>Motivo:</strong> Richiesta "Ho perso il codice"<br>
      <strong>Token precedenti:</strong> Revocati automaticamente
    </div>
  </div>
</body>
</html>
        `;

        const adminEmailText = `Richiesta Nuovo Token Dashboard - Tradelia AI

Email: ${sanitizedEmail}
Piano: ${planRole}
${validUntil ? `Validità Piano: ${new Date(validUntil).toLocaleString('it-IT')}\n` : ''}${userId ? `User ID: ${userId}\n` : ''}
Token generato: ${new Date().toLocaleString('it-IT')}
Motivo: Richiesta "Ho perso il codice"
Token precedenti: Revocati automaticamente`;

        const adminEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Sistema Token' },
            to: [{ email: 'amministrazione@tradelia.org' }],
            subject: `🔑 Richiesta nuovo token dashboard - ${sanitizedEmail}`,
            htmlContent: adminEmailHTML,
            textContent: adminEmailText,
          }),
        });

        if (!adminEmailResponse.ok) {
          const errorText = await adminEmailResponse.text();
          console.error('[Request Token] Errore invio email admin:', {
            status: adminEmailResponse.status,
            statusText: adminEmailResponse.statusText,
            error: errorText,
            to: 'amministrazione@tradelia.org',
          });
        } else {
          const adminEmailResult = await adminEmailResponse.json();
          console.log('[Request Token] Email admin inviata con successo:', {
            messageId: adminEmailResult.messageId,
            to: 'amministrazione@tradelia.org',
          });
        }
      } catch (err) {
        console.error('[Request Token] ERRORE CRITICO - Notifica admin non inviata:', {
          error: err.message,
          stack: err.stack,
          adminEmail: 'amministrazione@tradelia.org',
          hasBrevoKey: !!BREVO_API_KEY,
        });
      }
    } else {
      console.error('[Request Token] BREVO_API_KEY non configurato - email admin NON inviata!');
    }

    return res.status(200).json({
      ok: true,
      message:
        'Se esiste un piano attivo su questa email, ti abbiamo inviato un nuovo codice. Controlla la tua casella email.',
    });
  } catch (err) {
    console.error('[Request Token] Errore:', err);
    return res.status(500).json({
      ok: false,
      error: 'Errore server',
      details: err.message,
    });
  }
}
