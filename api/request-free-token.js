import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SUPPORT_EMAIL = 'support@tradelia.org';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.warn('[Request Free Token] BREVO_API_KEY non configurata, email non inviata');
    return false;
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
    <p>Il token è valido 30 giorni e funziona sia sulla dashboard web sia sulla PWA installata. Puoi rigenerarlo in qualsiasi momento compilando di nuovo il modulo.</p>
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
    return false;
  }

  return true;
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
    const validUntil = addDays(now, TOKEN_DURATION_DAYS).toISOString();

    await supabase
      .from('dashboard_access_tokens')
      .update({
        revoked: true,
        revoked_at: now.toISOString()
      })
      .eq('email', sanitizedEmail)
      .eq('source', 'trial')
      .eq('revoked', false);

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
      return res.status(500).json({ ok: false, error: 'Errore creazione token' });
    }

    await sendTokenEmail({
      email: sanitizedEmail,
      nome: sanitizedName,
      token: newToken,
      profilo: sanitizedProfile,
      uso: sanitizedUsage,
      organizzazione: sanitizedOrg
    });

    if (BREVO_API_KEY) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Token Form' },
            to: [{ email: SUPPORT_EMAIL }],
            subject: `Nuovo token gratuito generato - ${sanitizedEmail}`,
            textContent: `Profilo: ${sanitizedProfile}\nOrganizzazione: ${sanitizedOrg || '-'}\nUso dichiarato: ${sanitizedUsage}`
          })
        });
      } catch (notifyErr) {
        console.warn('[Request Free Token] Notifica support non inviata:', notifyErr);
      }
    }

    return res.status(200).json({
      ok: true,
      message: 'Token generato. Controlla la tua email (inclusa la cartella spam) per recuperarlo.'
    });
  } catch (error) {
    console.error('[Request Free Token] Errore inatteso:', error);
    return res.status(500).json({ ok: false, error: 'Errore server', details: error.message });
  }
}

