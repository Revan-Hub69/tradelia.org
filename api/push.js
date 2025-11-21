// /api/push.js
// API Vercel - Gestione push notifications unificata (subscribe + send)

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Inizializza Firebase Admin SDK
let firebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) return;

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT non configurato');
    }

    const serviceAccountJson =
      typeof serviceAccount === 'string' ? JSON.parse(serviceAccount) : serviceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
    }

    firebaseAdminInitialized = true;
  } catch (err) {
    console.error('[Push] Errore inizializzazione Firebase Admin:', err);
    throw err;
  }
}

// Inizializza Supabase (facoltativo: se non configurato degradare con messaggi informativi)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUSH_API_KEY = process.env.PUSH_API_KEY || null;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

async function upsertSubscriptionRecord(subscription, userId) {
  if (!supabase) {
    return { stored: false, reason: 'storage_disabled' };
  }

  const endpoint = subscription?.endpoint;
  if (!endpoint) {
    throw new Error('Endpoint subscription mancante');
  }

  const basePayload = {
    subscription,
    user_id: userId || null,
  };

  const { data: existing, error: lookupError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('subscription->>endpoint', endpoint)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Lookup subscription fallita: ${lookupError.message}`);
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update(basePayload)
      .eq('id', existing.id);

    if (updateError) {
      throw new Error(`Aggiornamento subscription fallito: ${updateError.message}`);
    }

    return { stored: true, mode: 'updated' };
  }

  const { error: insertError } = await supabase
    .from('push_subscriptions')
    .insert([{ ...basePayload }]);

  if (insertError) {
    throw new Error(`Inserimento subscription fallito: ${insertError.message}`);
  }

  return { stored: true, mode: 'inserted' };
}

async function deleteSubscriptionRecord(endpoint, userId) {
  if (!supabase) {
    return { removed: false, reason: 'storage_disabled' };
  }

  if (!endpoint) {
    throw new Error('Endpoint subscription mancante');
  }

  let query = supabase.from('push_subscriptions').delete().eq('subscription->>endpoint', endpoint);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;
  if (error) {
    throw new Error(`Cancellazione subscription fallita: ${error.message}`);
  }

  return { removed: true };
}

async function fetchStoredSubscriptions(userIds) {
  if (!supabase) {
    throw new Error('Archivio push non configurato');
  }

  let query = supabase.from('push_subscriptions').select('subscription');

  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    query = query.in('user_id', userIds);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Recupero subscription fallito: ${error.message}`);
  }

  return (data || []).map((row) => row?.subscription).filter(Boolean);
}

function normalizeEndpoint(subscription, endpointOverride) {
  return endpointOverride || subscription?.endpoint || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, ...data } = req.body || {};

    // Se action non specificato, usa 'subscribe' (compatibilità legacy)
    const actionType = (action || 'subscribe').toLowerCase();

    if (actionType === 'subscribe') {
      // SUBSCRIBE: Registra subscription push
      const { subscription, endpoint: endpointOverride, userId, subscriberId } = data;

      if (!subscription) {
        return res.status(400).json({ error: 'Subscription richiesta' });
      }

      const endpoint = normalizeEndpoint(subscription, endpointOverride);
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint subscription mancante' });
      }

      let storage = { stored: false, reason: 'storage_disabled' };
      if (supabase) {
        try {
          storage = await upsertSubscriptionRecord(subscription, userId || subscriberId || null);
        } catch (storageErr) {
          console.warn('[Push] Salvataggio subscription fallito:', storageErr);
          storage = { stored: false, reason: 'storage_failed', message: storageErr.message };
        }
      }

      return res.status(200).json({
        success: true,
        endpoint,
        storage,
      });
    } else if (actionType === 'unsubscribe') {
      const { subscription, endpoint: endpointOverride, userId, subscriberId } = data;
      const endpoint = normalizeEndpoint(subscription, endpointOverride);

      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint richiesto per disiscrizione' });
      }

      let removal = { removed: false, reason: 'storage_disabled' };
      if (supabase) {
        try {
          removal = await deleteSubscriptionRecord(endpoint, userId || subscriberId || null);
        } catch (removalErr) {
          console.warn('[Push] Rimozione subscription fallita:', removalErr);
          removal = { removed: false, reason: 'storage_failed', message: removalErr.message };
        }
      }

      return res.status(200).json({
        success: true,
        endpoint,
        removal,
      });
    } else if (actionType === 'send') {
      // SEND: Invia notifiche push
      if (!PUSH_API_KEY) {
        return res.status(503).json({ error: 'PUSH_API_KEY non configurato' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      if (token !== PUSH_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!supabase) {
        return res.status(503).json({ error: 'Archivio push non disponibile sul server' });
      }

      const { title, body, data: pushData, userIds } = data;

      if (!title || !body) {
        return res.status(400).json({ error: 'Title e body richiesti' });
      }

      // Inizializza Firebase Admin
      initializeFirebaseAdmin();

      // Recupera subscriptions da Supabase
      const subscriptions = await fetchStoredSubscriptions(userIds);

      if (subscriptions.length === 0) {
        return res
          .status(200)
          .json({ success: true, sent: 0, message: 'Nessuna subscription trovata' });
      }

      // Configura web-push
      const VAPID_PUBLIC_KEY = process.env.FIREBASE_VAPID_PUBLIC_KEY;
      const VAPID_PRIVATE_KEY = process.env.FIREBASE_VAPID_PRIVATE_KEY;

      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails('mailto:tradelia@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      } else {
        console.warn('[Push] Chiavi VAPID mancanti: il canale WebPush potrebbe non funzionare.');
      }

      // Prepara payload
      const payload = JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: {
          url: pushData?.url || '/archivio/dashboard.html',
          ...pushData,
        },
      });

      // Invia push
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          if (!subscription) {
            return { success: false, error: 'Subscription mancante' };
          }

          if (subscription.keys) {
            if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
              return {
                success: false,
                endpoint: subscription.endpoint,
                error: 'Chiavi VAPID non configurate',
              };
            }

            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
              },
              payload
            );

            return { success: true, endpoint: subscription.endpoint };
          }

          if (subscription.token) {
            await admin.messaging().send({
              notification: { title, body },
              data: pushData || {},
              token: subscription.token,
            });
            return { success: true, token: subscription.token };
          }

          return {
            success: false,
            endpoint: subscription.endpoint,
            error: 'Formato subscription non supportato',
          };
        } catch (err) {
          console.error('[Push] Errore invio singola push:', err);
          return { success: false, endpoint: subscription?.endpoint, error: err.message };
        }
      });

      const results = await Promise.allSettled(sendPromises);
      const normalized = results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return { success: false, error: result.reason?.message || 'Errore sconosciuto' };
      });
      const successful = normalized.filter((entry) => entry.success).length;

      return res.status(200).json({
        success: true,
        sent: successful,
        total: subscriptions.length,
        results: normalized,
      });
    } else {
      return res
        .status(400)
        .json({
          error: `Action non supportato: ${actionType}. Usa 'subscribe', 'unsubscribe' o 'send'`,
        });
    }
  } catch (err) {
    console.error('[Push] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}
