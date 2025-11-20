// /api/request-analysis.js
// API Vercel - Salva richiesta analisi in Supabase
// Usa Supabase invece di invio email diretto (più affidabile)
// Invia notifica email all'admin dopo il salvataggio

import fetch from './_lib/fetch.js';
import { getServiceSupabase } from './_lib/supabase.js';
import { getAdminContextFromToken } from './_lib/adminAuth.js';
import { handleRouteError, HttpError } from './_lib/http.js';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = 'amministrazione@tradelia.org';
const SUPPORT_EMAIL = 'support@tradelia.org';

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
  // Inizializza Supabase
  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (error) {
    console.error('[Request Analysis] Errore inizializzazione Supabase:', error);
    return res.status(500).json({ ok: false, error: 'Errore configurazione server' });
  }

  const body = req.body || {};
  const dashboardToken = body.dashboardToken;

  if (!dashboardToken || typeof dashboardToken !== 'string') {
    throw new HttpError(401, 'Richiesta consentita solo dalla dashboard autenticata');
  }

  const tokenContext = await getAdminContextFromToken(dashboardToken, { enforceAdmin: false });

  const tipo = body.tipo;
  const nomeInput = typeof body.nome === 'string' ? body.nome.trim() : '';
  const emailFromToken = tokenContext.email || '';
  const fallbackEmail = typeof body.email === 'string' ? body.email.trim() : '';
  const email = (emailFromToken || fallbackEmail || '').toLowerCase();
  const tipologiaInput = typeof body.tipologia === 'string' ? body.tipologia : '';
  const tipologia = tipologiaInput || (tokenContext.planRole === 'desk' ? 'azienda' : 'privato');
  const codiceFiscale = body.codiceFiscale;
  const ragioneSociale = body.ragioneSociale;
  const piva = body.piva;
  const indirizzo = body.indirizzo;
  const tipoAnalisi = body.tipoAnalisi;
  const dettagli = body.dettagli;
  const telefono = body.telefono;
  const note = body.note;
  const consensoGDPR = true;
  const timestamp = body.timestamp;
  const nome = nomeInput || (email ? email.split('@')[0] : 'Utente Dashboard');

  // Validazione base
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ ok: false, error: 'Nome non valido' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Email non valida' });
  }

  if (!consensoGDPR) {
    return res.status(400).json({ ok: false, error: 'Consenso GDPR richiesto' });
  }

  // Validazione specifica per tipo richiesta
  if (tipo === 'analisi-su-richiesta') {
    if (!tipologia || !['privato', 'azienda'].includes(tipologia)) {
      return res.status(400).json({ ok: false, error: 'Tipologia cliente non valida' });
    }
    if (!tipoAnalisi || typeof tipoAnalisi !== 'string') {
      return res.status(400).json({ ok: false, error: 'Tipo analisi richiesto' });
    }
    if (!dettagli || typeof dettagli !== 'string' || dettagli.trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'Dettagli richiesta insufficienti (minimo 10 caratteri)' });
    }
  } else if (tipo === 'piano-desk') {
    if (!ragioneSociale || typeof ragioneSociale !== 'string' || ragioneSociale.trim().length < 2) {
      return res.status(400).json({ ok: false, error: 'Ragione sociale richiesta' });
    }
    if (!piva || !piva.match(/^IT[0-9]{11}$/)) {
      return res.status(400).json({ ok: false, error: 'Partita IVA non valida (formato: IT seguito da 11 cifre)' });
    }
    if (!indirizzo || typeof indirizzo !== 'string' || indirizzo.trim().length < 5) {
      return res.status(400).json({ ok: false, error: 'Indirizzo richiesto' });
    }
  } else {
    return res.status(400).json({ ok: false, error: 'Tipo richiesta non valido (analisi-su-richiesta o piano-desk)' });
  }

  // Sanitizzazione
  const sanitizedName = nome.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedTipologia = tipologia;
  const sanitizedCodiceFiscale = codiceFiscale ? codiceFiscale.trim().toUpperCase() : null;
  const sanitizedRagioneSociale = ragioneSociale ? ragioneSociale.trim() : null;
  const sanitizedPiva = piva ? piva.trim().toUpperCase() : null;
  const sanitizedIndirizzo = indirizzo ? indirizzo.trim() : null;
  const sanitizedTipoAnalisi = tipoAnalisi.trim();
  const sanitizedDettagli = dettagli.trim();

  // Prepara dati per Supabase
  const requestData = {
    tipo_richiesta: tipo, // 'analisi-su-richiesta' o 'piano-desk'
    nome: sanitizedName,
    email: sanitizedEmail,
    tipologia: sanitizedTipologia || null,
    codice_fiscale: sanitizedCodiceFiscale,
    ragione_sociale: sanitizedRagioneSociale,
    piva: sanitizedPiva,
    indirizzo: sanitizedIndirizzo,
    telefono: telefono ? telefono.trim() : null,
    note: note ? note.trim() : null,
    tipo_analisi: sanitizedTipoAnalisi || null,
    dettagli: sanitizedDettagli || null,
    consenso_gdpr: true,
    status: 'pending', // pending, in_progress, completed, cancelled
    created_at: timestamp || new Date().toISOString()
  };

  // Salva in Supabase - usa una tabella dedicata per richieste pubbliche
  // La tabella on_demand_requests è per richieste non autenticate (analisi e desk)
  let insertResult = await supabase
    .from('on_demand_requests')
    .insert(requestData)
    .select()
    .single();

  // Se la tabella non esiste, restituisci errore con istruzioni
  if (insertResult.error && insertResult.error.code === '42P01') {
    console.error('[Request Analysis] Tabella on_demand_requests non trovata');
    return res.status(500).json({ 
      ok: false, 
      error: 'Configurazione database incompleta',
      details: 'La tabella on_demand_requests non esiste. Esegui lo script SQL in supabase/create-on-demand-analysis-table.sql'
    });
  }

  if (insertResult.error) {
    console.error('[Request Analysis] Errore inserimento:', insertResult.error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Errore salvataggio richiesta', 
      details: insertResult.error.message 
    });
  }

  // Notifica admin via email (non blocca se fallisce)
  if (!BREVO_API_KEY) {
    console.error('[Request Analysis] BREVO_API_KEY non configurato - email admin NON inviata!');
  } else {
    try {
      const emailSubject = tipo === 'analisi-su-richiesta' 
        ? `📊 Nuova richiesta analisi - ${sanitizedName}`
        : `💼 Nuova richiesta Piano Desk - ${sanitizedRagioneSociale || sanitizedName}`;

      const emailHTML = `
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
      <h2 style="margin: 0;">${tipo === 'analisi-su-richiesta' ? '📊 Richiesta Analisi' : '💼 Richiesta Piano Desk'}</h2>
      <p style="margin: 8px 0 0 0;">Nuova richiesta ricevuta</p>
    </div>
    
    <div class="section">
      <div class="label">Dati Anagrafici</div>
      <div class="value"><strong>Nome:</strong> ${sanitizedName}</div>
      <div class="value"><strong>Email:</strong> ${sanitizedEmail}</div>
      ${telefono ? `<div class="value"><strong>Telefono:</strong> ${telefono}</div>` : ''}
      ${tipologia ? `<div class="value"><strong>Tipologia:</strong> ${tipologia === 'privato' ? 'Privato / Persona fisica' : 'Azienda / Professionista'}</div>` : ''}
      ${sanitizedCodiceFiscale ? `<div class="value"><strong>Codice Fiscale:</strong> ${sanitizedCodiceFiscale}</div>` : ''}
      ${sanitizedRagioneSociale ? `<div class="value"><strong>Ragione Sociale:</strong> ${sanitizedRagioneSociale}</div>` : ''}
      ${sanitizedPiva ? `<div class="value"><strong>Partita IVA:</strong> ${sanitizedPiva}</div>` : ''}
      ${sanitizedIndirizzo ? `<div class="value"><strong>Indirizzo:</strong> ${sanitizedIndirizzo}</div>` : ''}
    </div>

    ${tipo === 'analisi-su-richiesta' ? `
    <div class="section">
      <div class="label">Dettagli Analisi</div>
      <div class="value"><strong>Tipo Analisi:</strong> ${sanitizedTipoAnalisi}</div>
      <div class="highlight">
        <div class="label">Dettagli Richiesta</div>
        <div class="value" style="white-space: pre-wrap;">${sanitizedDettagli}</div>
      </div>
    </div>
    ` : ''}

    ${note ? `
    <div class="section">
      <div class="label">Note Aggiuntive</div>
      <div class="value" style="white-space: pre-wrap;">${note}</div>
    </div>
    ` : ''}

    <div class="meta">
      <strong>ID Richiesta:</strong> ${insertResult.data.id}<br>
      <strong>Data/Ora:</strong> ${new Date(insertResult.data.created_at).toLocaleString('it-IT')}<br>
      <strong>Status:</strong> ${insertResult.data.status}<br>
      <strong>Consenso GDPR:</strong> ${consensoGDPR ? 'Sì' : 'No'}
    </div>
  </div>
</body>
</html>
      `;

      const emailText = `${tipo === 'analisi-su-richiesta' ? 'Richiesta Analisi' : 'Richiesta Piano Desk'} - Tradelia AI

Dati Anagrafici:
Nome: ${sanitizedName}
Email: ${sanitizedEmail}
${telefono ? `Telefono: ${telefono}\n` : ''}${tipologia ? `Tipologia: ${tipologia}\n` : ''}${sanitizedCodiceFiscale ? `Codice Fiscale: ${sanitizedCodiceFiscale}\n` : ''}${sanitizedRagioneSociale ? `Ragione Sociale: ${sanitizedRagioneSociale}\n` : ''}${sanitizedPiva ? `Partita IVA: ${sanitizedPiva}\n` : ''}${sanitizedIndirizzo ? `Indirizzo: ${sanitizedIndirizzo}\n` : ''}
${tipo === 'analisi-su-richiesta' ? `Tipo Analisi: ${sanitizedTipoAnalisi}\nDettagli: ${sanitizedDettagli}\n` : ''}${note ? `Note: ${note}\n` : ''}
ID Richiesta: ${insertResult.data.id}
Data/Ora: ${new Date(insertResult.data.created_at).toLocaleString('it-IT')}
Status: ${insertResult.data.status}
Consenso GDPR: ${consensoGDPR ? 'Sì' : 'No'}`;

      const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI - Richieste' },
          to: [{ email: ADMIN_EMAIL }],
          subject: emailSubject,
          htmlContent: emailHTML,
          textContent: emailText
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('[Request Analysis] Errore invio email admin:', {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          error: errorText
        });
        throw new Error(`Brevo API error: ${emailResponse.status} - ${errorText}`);
      }

      const emailResult = await emailResponse.json();
      console.log('[Request Analysis] Email admin inviata con successo:', {
        messageId: emailResult.messageId,
        to: ADMIN_EMAIL
      });
    } catch (emailError) {
      console.error('[Request Analysis] ERRORE CRITICO - Notifica admin non inviata:', {
        error: emailError.message,
        stack: emailError.stack,
        adminEmail: ADMIN_EMAIL,
        hasBrevoKey: !!BREVO_API_KEY
      });
      // Non bloccare se l'email fallisce - la richiesta è già salvata
    }
  }

  // Email di conferma all'utente (opzionale, non blocca)
  if (BREVO_API_KEY) {
    try {
      const userEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; color: #fff; padding: 20px; border-radius: 14px; margin-bottom: 24px; }
    .content { background: #fff; border-radius: 14px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .meta { font-size: 13px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Richiesta ricevuta</h2>
      <p style="margin: 8px 0 0 0;">Ciao ${sanitizedName},</p>
    </div>
    
    <div class="content">
      <p>Abbiamo ricevuto la tua richiesta${tipo === 'analisi-su-richiesta' ? ' di analisi' : ' per il Piano Desk'}.</p>
      <p>Il nostro team la esaminerà e ti contatterà via email entro <strong>24 ore</strong>.</p>
      ${tipo === 'analisi-su-richiesta' ? `
      <p><strong>Dettagli richiesta:</strong></p>
      <p style="background: #eff6ff; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
        ${sanitizedTipoAnalisi}<br>
        ${sanitizedDettagli}
      </p>
      ` : ''}
      <p>Se hai domande urgenti, puoi contattarci direttamente a <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>

    <div class="meta">
      <strong>ID Richiesta:</strong> ${insertResult.data.id}<br>
      <strong>Data/Ora:</strong> ${new Date(insertResult.data.created_at).toLocaleString('it-IT')}
    </div>
  </div>
</body>
</html>
      `;

      const userEmailText = `Richiesta ricevuta - Tradelia AI

Ciao ${sanitizedName},

Abbiamo ricevuto la tua richiesta${tipo === 'analisi-su-richiesta' ? ' di analisi' : ' per il Piano Desk'}.

Il nostro team la esaminerà e ti contatterà via email entro 24 ore.

${tipo === 'analisi-su-richiesta' ? `Dettagli richiesta:\n${sanitizedTipoAnalisi}\n${sanitizedDettagli}\n\n` : ''}Se hai domande urgenti, contattaci a ${SUPPORT_EMAIL}.

ID Richiesta: ${insertResult.data.id}
Data/Ora: ${new Date(insertResult.data.created_at).toLocaleString('it-IT')}`;

      const userEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: 'noreply@tradelia.org', name: 'Tradelia AI' },
          to: [{ email: sanitizedEmail }],
          subject: tipo === 'analisi-su-richiesta' 
            ? 'Richiesta analisi ricevuta - Tradelia AI'
            : 'Richiesta Piano Desk ricevuta - Tradelia AI',
          htmlContent: userEmailHTML,
          textContent: userEmailText
        })
      });

      if (!userEmailResponse.ok) {
        const errorText = await userEmailResponse.text();
        console.error('[Request Analysis] Errore invio email conferma utente:', {
          status: userEmailResponse.status,
          statusText: userEmailResponse.statusText,
          error: errorText,
          to: sanitizedEmail
        });
      } else {
        const userEmailResult = await userEmailResponse.json();
        console.log('[Request Analysis] Email conferma utente inviata:', {
          messageId: userEmailResult.messageId,
          to: sanitizedEmail
        });
      }
    } catch (userEmailError) {
      console.error('[Request Analysis] ERRORE invio email conferma utente:', {
        error: userEmailError.message,
        stack: userEmailError.stack,
        to: sanitizedEmail
      });
    }
  } else {
    console.error('[Request Analysis] BREVO_API_KEY non configurato - email conferma utente NON inviata!');
  }

  // Successo
  return res.status(200).json({
    ok: true,
    message: 'Richiesta salvata con successo. Ti contatteremo via email entro 24 ore.',
    request_id: insertResult.data.id
  });
}

