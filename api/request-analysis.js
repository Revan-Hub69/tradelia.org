// /api/request-analysis.js
// API Vercel - Salva richiesta analisi in Supabase
// Usa Supabase invece di invio email diretto (più affidabile)

import { getServiceSupabase } from './_lib/supabase.js';
import { handleRouteError } from './_lib/http.js';

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

  const {
    tipo, // 'analisi-su-richiesta' o 'piano-desk'
    nome,
    email,
    tipologia,
    codiceFiscale,
    ragioneSociale,
    piva,
    indirizzo,
    tipoAnalisi,
    dettagli,
    telefono,
    note,
    consensoGDPR,
    timestamp
  } = req.body || {};

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

  // Successo
  return res.status(200).json({
    ok: true,
    message: 'Richiesta salvata con successo. Ti contatteremo via email entro 24 ore.',
    request_id: insertResult.data.id
  });
}

