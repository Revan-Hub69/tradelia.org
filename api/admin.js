// /api/admin.js
// API Vercel - Endpoint admin unificato
// Gestisce tutte le risorse admin (users, requests, ecc.)

import crypto from 'crypto';
import { getServiceSupabase } from './_lib/supabase.js';
import { HttpError, handleRouteError } from './_lib/http.js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // Token admin da variabile ambiente (opzionale)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return await handleRequest(req, res);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

async function handleRequest(req, res) {
  // Verifica token admin
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken) {
    return res.status(401).json({ ok: false, error: 'Token admin richiesto' });
  }

  // Verifica token (se configurato in env, altrimenti usa Supabase)
  if (ADMIN_TOKEN && adminToken !== ADMIN_TOKEN) {
    return res.status(403).json({ ok: false, error: 'Token admin non valido' });
  }

  // Se non c'è ADMIN_TOKEN in env, verifica tramite Supabase
  if (!ADMIN_TOKEN) {
    const isValid = await verifyAdminToken(adminToken);
    if (!isValid) {
      return res.status(403).json({ ok: false, error: 'Token admin non valido' });
    }
  }

  // Estrai resource e action dai query params
  const { resource, action } = req.query || {};

  if (!resource) {
    return res.status(400).json({ ok: false, error: 'Parametro resource richiesto' });
  }

  // Route alle risorse
  switch (resource) {
    case 'requests':
      return await handleRequests(req, res, action);
    case 'tokens':
      return await handleTokens(req, res, action);
    case 'users':
      // Gestito da admin.js esistente, qui solo per compatibilità
      return res.status(501).json({ ok: false, error: 'Resource users gestita da altro endpoint' });
    default:
      return res.status(404).json({ ok: false, error: `Resource ${resource} non trovata` });
  }
}

/**
 * Verifica token admin tramite Supabase
 */
async function verifyAdminToken(token) {
  try {
    const supabase = getServiceSupabase();
    
    // Cerca token in dashboard_access_tokens
    const { data: tokenData, error } = await supabase
      .from('dashboard_access_tokens')
      .select('email, user_id, plan_role')
      .eq('token_hash', hashToken(token))
      .eq('revoked', false)
      .single();

    if (error || !tokenData) {
      return false;
    }

    // Verifica se l'email è in admin_emails
    const { data: adminEmail } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', tokenData.email)
      .single();

    return !!adminEmail;
  } catch (err) {
    console.error('[Admin API] Errore verifica token:', err);
    return false;
  }
}

/**
 * Hash token per confronto con database
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Gestisce le richieste on-demand
 */
async function handleRequests(req, res, action) {
  const supabase = getServiceSupabase();

  switch (req.method) {
    case 'GET':
      return await getRequests(req, res, supabase, action);
    case 'PATCH':
    case 'PUT':
      return await updateRequest(req, res, supabase);
    default:
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
}

/**
 * Recupera richieste on-demand
 */
async function getRequests(req, res, supabase, action) {
  try {
    let query = supabase
      .from('on_demand_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtri opzionali
    const { status, tipo, limit = '100', offset = '0' } = req.query || {};

    if (status) {
      query = query.eq('status', status);
    }

    if (tipo) {
      query = query.eq('tipo_richiesta', tipo);
    }

    // Limit e offset
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Admin API] Errore recupero richieste:', error);
      return res.status(500).json({ ok: false, error: 'Errore recupero richieste', details: error.message });
    }

    // Conta totale (per paginazione)
    const { count: totalCount } = await supabase
      .from('on_demand_requests')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      ok: true,
      data: data || [],
      pagination: {
        total: totalCount || 0,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (err) {
    console.error('[Admin API] Errore getRequests:', err);
    return res.status(500).json({ ok: false, error: 'Errore server', details: err.message });
  }
}

/**
 * Aggiorna una richiesta (status, note, ecc.)
 */
async function updateRequest(req, res, supabase) {
  try {
    const { id } = req.query || {};
    const body = req.body || {};

    if (!id) {
      return res.status(400).json({ ok: false, error: 'ID richiesta richiesto' });
    }

    // Prepara update data
    const updateData = {};

    if (body.status) {
      if (!['pending', 'processing', 'completed', 'cancelled'].includes(body.status)) {
        return res.status(400).json({ ok: false, error: 'Status non valido' });
      }
      updateData.status = body.status;

      // Se status = completed, setta completed_at
      if (body.status === 'completed' && !body.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    if (body.note !== undefined) {
      updateData.note = body.note;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, error: 'Nessun campo da aggiornare' });
    }

    const { data, error } = await supabase
      .from('on_demand_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Errore aggiornamento richiesta:', error);
      return res.status(500).json({ ok: false, error: 'Errore aggiornamento richiesta', details: error.message });
    }

    return res.status(200).json({
      ok: true,
      data: data
    });
  } catch (err) {
    console.error('[Admin API] Errore updateRequest:', err);
    return res.status(500).json({ ok: false, error: 'Errore server', details: err.message });
  }
}

/**
 * Gestisce i token dashboard
 */
async function handleTokens(req, res, action) {
  const supabase = getServiceSupabase();

  switch (req.method) {
    case 'GET':
      return await getTokens(req, res, supabase, action);
    case 'PATCH':
    case 'PUT':
      return await updateToken(req, res, supabase);
    case 'DELETE':
      return await deleteToken(req, res, supabase);
    default:
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
}

/**
 * Recupera token dashboard
 */
async function getTokens(req, res, supabase, action) {
  try {
    let query = supabase
      .from('dashboard_access_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtri opzionali
    const { email, plan_role, revoked, limit = '100', offset = '0' } = req.query || {};

    if (email) {
      query = query.ilike('email', `%${email}%`);
    }

    if (plan_role) {
      query = query.eq('plan_role', plan_role);
    }

    if (revoked !== undefined) {
      query = query.eq('revoked', revoked === 'true');
    }

    // Limit e offset
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data, error } = await query;

    if (error) {
      console.error('[Admin API] Errore recupero token:', error);
      return res.status(500).json({ ok: false, error: 'Errore recupero token', details: error.message });
    }

    // Conta totale (per paginazione)
    const { count: totalCount } = await supabase
      .from('dashboard_access_tokens')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      ok: true,
      data: data || [],
      pagination: {
        total: totalCount || 0,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (err) {
    console.error('[Admin API] Errore getTokens:', err);
    return res.status(500).json({ ok: false, error: 'Errore server', details: err.message });
  }
}

/**
 * Aggiorna un token (revoca, estendi validità, ecc.)
 */
async function updateToken(req, res, supabase) {
  try {
    const { id } = req.query || {};
    const body = req.body || {};

    if (!id) {
      return res.status(400).json({ ok: false, error: 'ID token richiesto' });
    }

    const updateData = {};

    if (body.revoked !== undefined) {
      updateData.revoked = body.revoked === true;
      if (body.revoked === true && !body.revoked_at) {
        updateData.revoked_at = new Date().toISOString();
      } else if (body.revoked === false) {
        updateData.revoked_at = null;
      }
    }

    if (body.valid_until) {
      updateData.valid_until = body.valid_until;
    }

    if (body.plan_role) {
      if (!['trial', 'pro', 'desk'].includes(body.plan_role)) {
        return res.status(400).json({ ok: false, error: 'Plan role non valido' });
      }
      updateData.plan_role = body.plan_role;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, error: 'Nessun campo da aggiornare' });
    }

    const { data, error } = await supabase
      .from('dashboard_access_tokens')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Errore aggiornamento token:', error);
      return res.status(500).json({ ok: false, error: 'Errore aggiornamento token', details: error.message });
    }

    return res.status(200).json({
      ok: true,
      data: data
    });
  } catch (err) {
    console.error('[Admin API] Errore updateToken:', err);
    return res.status(500).json({ ok: false, error: 'Errore server', details: err.message });
  }
}

/**
 * Elimina un token (revoca permanente)
 */
async function deleteToken(req, res, supabase) {
  try {
    const { id } = req.query || {};

    if (!id) {
      return res.status(400).json({ ok: false, error: 'ID token richiesto' });
    }

    // Revoca il token invece di eliminarlo fisicamente
    const { data, error } = await supabase
      .from('dashboard_access_tokens')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Errore revoca token:', error);
      return res.status(500).json({ ok: false, error: 'Errore revoca token', details: error.message });
    }

    return res.status(200).json({
      ok: true,
      data: data,
      message: 'Token revocato con successo'
    });
  } catch (err) {
    console.error('[Admin API] Errore deleteToken:', err);
    return res.status(500).json({ ok: false, error: 'Errore server', details: err.message });
  }
}

