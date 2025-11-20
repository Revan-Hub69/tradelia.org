import crypto from 'crypto';
import fetch from './_lib/fetch.js';
import { getServiceSupabase } from './_lib/supabase.js';
import { HttpError, handleRouteError } from './_lib/http.js';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SUPPORT_EMAIL = 'support@tradelia.org';
const ADMIN_EMAIL = 'amministrazione@tradelia.org';

const TOKEN_DURATION_DAYS = 30;
const ALLOWED_PROFILES = ['privato', 'desk', 'media'];

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function sendTokenEmail({ email, nome, token, profilo, uso, organizzazione }) {
  if (!BREVO_API_KEY) {
    throw new HttpError(500, 'Servizio email non configurato (BREVO_API_KEY mancante)');
  }

  const emphasizedUso = uso.replace(/\n/g, '<br/>');
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; color: #fff; padding: 20px; border-radius: 14px; }
    .token-box { background: #fff; border-radius: 14px; border: 1px solid #bfdbfe; padding: 20px; text-align: center; margin: 24px 0; }
    .token { font-family: 'SF Mono', 'Courier New', monospace; font-size: 20px; letter-spacing: 2px; color: #1d4ed8; word-break: break-all; }
    .meta { font-size: 13px; color: #475569; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Token gratuito Tradelia</h2>
      <p style="margin: 8px 0 0 0;">Ciao ${nome || 'utente'}, ecco il token personale richiesto.</p>
    </div>
    <p>Il token è valido 30 giorni e funziona sulla dashboard PWA installata. Puoi rigenerarlo in qualsiasi momento compilando di nuovo il modulo.</p>
    <div class="token-box">
      <div style="margin-bottom: 10px; color: #94a3b8;">Token personale</div>
      <div class="token">${token}</div>
    </div>
    <p style="margin-bottom: 4px;"><strong>Profilo dichiarato:</strong> ${profilo === 'desk' ? 'Desk / uffici studi' : profilo === 'media' ? 'Media / formazione / ricerca' : 'Privato / persona fisica'}</p>
    ${organizzazione ? `<p style="margin: 4px 0;"><strong>Organizzazione:</strong> ${organizzazione}</p>` : ''}
    <p style="margin: 4px 0;"><strong>Uso previsto:</strong></p>
    <p style="background: #e2e8f0; padding: 12px 16px; border-radius: 12px; font-size: 14px;">${emphasizedUso}</p>
    <p>Per motivi di sicurezza non condividere il token e conserva questa email come riferimento.</p>
    <div class="meta">
      Token generato automaticamente il ${new Date().toLocaleDateString('it-IT')} · Validità 30 giorni · Supporto: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </div>
  </div>
</body>
</html>
  `;

  const emailText = `Token gratuito Tradelia

Token: ${token}
Profilo: ${profilo}
Organizzazione: ${organizzazione || '-'}
Uso previsto: ${uso}

Valido 30 giorni su dashboard e PWA. Per supporto scrivi a ${SUPPORT_EMAIL}.`;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI' },
      to: [{ email }],
      subject: 'Il tuo token gratuito per la dashboard Tradelia',
      htmlContent: emailHTML,
      textContent: emailText
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Request Free Token] Errore Brevo:', errorText);
    throw new HttpError(502, 'Errore invio email token');
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    return await handleRequest(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequest(req, res) {
  // Inizializza Supabase dentro la funzione per gestire meglio gli errori
  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (error) {
    console.error('[Request Free Token] Errore inizializzazione Supabase:', error);
    return res.status(500).json({ ok: false, error: 'Errore configurazione server' });
  }

  const { nome, email, profilo, organizzazione, uso } = req.body || {};

  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ ok: false, error: 'Nome non valido' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Email non valida' });
  }

  if (!profilo || typeof profilo !== 'string' || !ALLOWED_PROFILES.includes(profilo)) {
    return res.status(400).json({ ok: false, error: 'Profilo non valido' });
  }

  if (!uso || typeof uso !== 'string' || uso.trim().length < 10) {
    return res.status(400).json({ ok: false, error: 'Descrivi come userai il token (minimo 10 caratteri)' });
  }

  const sanitizedName = nome.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedProfile = profilo;
  const sanitizedOrg = (organizzazione || '').trim();
  const sanitizedUsage = uso.trim().slice(0, 500);

  const newToken = generateToken();
  const tokenHash = hashToken(newToken);
  const now = new Date();
  const valid_until = addDays(now, TOKEN_DURATION_DAYS).toISOString();

  // Revoca token trial precedenti per questa email
  const { error: revokeError } = await supabase
    .from('dashboard_access_tokens')
    .update({
      revoked: true,
      revoked_at: now.toISOString()
    })
    .eq('email', sanitizedEmail)
    .eq('source', 'trial')
    .eq('revoked', false);

  if (revokeError) {
    console.warn('[Request Free Token] Avviso revoca token precedenti:', revokeError);
    // Non bloccare se la revoca fallisce
  }

  // Inserisci nuovo token
  const { error: insertError } = await supabase
    .from('dashboard_access_tokens')
    .insert({
      email: sanitizedEmail,
      token_hash: tokenHash,
      plan_role: 'trial',
      valid_until,
      source: 'trial',
      metadata: {
        requester_name: sanitizedName,
        profile: sanitizedProfile,
        organization: sanitizedOrg || null,
        usage: sanitizedUsage
      }
    });

  if (insertError) {
    console.error('[Request Free Token] Errore inserimento token:', insertError);
    return res.status(500).json({ ok: false, error: 'Errore creazione token', details: insertError.message });
  }

  // Invia email con token
  try {
    await sendTokenEmail({
      email: sanitizedEmail,
      nome: sanitizedName,
      token: newToken,
      profilo: sanitizedProfile,
      uso: sanitizedUsage,
      organizzazione: sanitizedOrg
    });
  } catch (emailError) {
    console.error('[Request Free Token] Errore invio email token:', emailError);
    // Il token è già stato creato, quindi non fallire completamente
    // Ma segnala l'errore
    return res.status(500).json({ 
      ok: false, 
      error: 'Token creato ma errore invio email. Contatta support@tradelia.org',
      details: emailError.message 
    });
  }

  // Notifica admin (opzionale, non blocca)
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
    .highlight { background: #eff6ff; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #2563eb; }
    .meta { font-size: 13px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔑 Nuovo Token Gratuito Generato</h2>
      <p style="margin: 8px 0 0 0;">Richiesta token trial ricevuta</p>
    </div>
    
    <div class="section">
      <div class="label">Dati Richiedente</div>
      <div class="value"><strong>Nome:</strong> ${sanitizedName}</div>
      <div class="value"><strong>Email:</strong> ${sanitizedEmail}</div>
      <div class="value"><strong>Profilo:</strong> ${sanitizedProfile === 'desk' ? 'Desk / uffici studi' : sanitizedProfile === 'media' ? 'Media / formazione / ricerca' : 'Privato / persona fisica'}</div>
      ${sanitizedOrg ? `<div class="value"><strong>Organizzazione:</strong> ${sanitizedOrg}</div>` : ''}
    </div>

    <div class="section">
      <div class="label">Uso Dichiarato</div>
      <div class="highlight">
        <div class="value" style="white-space: pre-wrap;">${sanitizedUsage}</div>
      </div>
    </div>

    <div class="meta">
      <strong>Token generato:</strong> ${new Date().toLocaleString('it-IT')}<br>
      <strong>Validità:</strong> 30 giorni<br>
      <strong>Piano:</strong> Trial
    </div>
  </div>
</body>
</html>
      `;

      const adminEmailText = `Nuovo Token Gratuito Generato - Tradelia AI

Dati Richiedente:
Nome: ${sanitizedName}
Email: ${sanitizedEmail}
Profilo: ${sanitizedProfile}
${sanitizedOrg ? `Organizzazione: ${sanitizedOrg}\n` : ''}
Uso Dichiarato:
${sanitizedUsage}

Token generato: ${new Date().toLocaleString('it-IT')}
Validità: 30 giorni
Piano: Trial`;

      const adminEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Token Form' },
          to: [{ email: ADMIN_EMAIL }],
          subject: `🔑 Nuovo token gratuito generato - ${sanitizedEmail}`,
          htmlContent: adminEmailHTML,
          textContent: adminEmailText
        })
      });

      if (!adminEmailResponse.ok) {
        const errorText = await adminEmailResponse.text();
        console.error('[Request Free Token] Errore invio email admin:', {
          status: adminEmailResponse.status,
          statusText: adminEmailResponse.statusText,
          error: errorText,
          to: ADMIN_EMAIL
        });
      } else {
        const adminEmailResult = await adminEmailResponse.json();
        console.log('[Request Free Token] Email admin inviata con successo:', {
          messageId: adminEmailResult.messageId,
          to: ADMIN_EMAIL
        });
      }
    } catch (notifyErr) {
      console.error('[Request Free Token] ERRORE CRITICO - Notifica admin non inviata:', {
        error: notifyErr.message,
        stack: notifyErr.stack,
        adminEmail: ADMIN_EMAIL,
        hasBrevoKey: !!BREVO_API_KEY
      });
      // Non bloccare se la notifica fallisce
    }
  } else {
    console.error('[Request Free Token] BREVO_API_KEY non configurato - email admin NON inviata!');
  }
  }

  return res.status(200).json({
    ok: true,
    message: 'Token generato. Controlla la tua email (inclusa la cartella spam) per recuperarlo.'
  });
}

