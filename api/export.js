// /api/export.js
// API Vercel - Export Dati Utente
// Nuovo endpoint per export dati utente

import { getServiceSupabase } from "./_lib/supabase.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";
import { handleRouteError, HttpError, sendJSON } from "./_lib/http.js";

const supabase = getServiceSupabase();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { type } = req.query;

    switch (type) {
      case 'data':
        return await handleExportData(req, res);
      case 'reports':
        return await handleExportReports(req, res);
      default:
        return res.status(400).json({ ok: false, error: 'Tipo export non valido. Usa: data, reports' });
    }
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleExportData(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    throw new HttpError(401, 'Token mancante');
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, 'Utente non autenticato');
  }

  // Esporta dati utente
  const exportData = {
    timestamp: new Date().toISOString(),
    userId: userId,
    email: context.email || null,
    plan: context.planRole || 'guest',
    // TODO: Aggiungere altri dati da esportare
  };

  return sendJSON(res, 200, {
    ok: true,
    data: exportData,
  });
}

async function handleExportReports(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    throw new HttpError(401, 'Token mancante');
  }

  const context = await getAdminContextFromToken(token, { enforceAdmin: false });
  const userId = context.userId;

  if (!userId) {
    throw new HttpError(401, 'Utente non autenticato');
  }

  // Esporta report preferiti
  // TODO: Implementare logica export report

  return sendJSON(res, 200, {
    ok: true,
    reports: [],
  });
}

