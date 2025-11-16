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
    
    const serviceAccountJson = typeof serviceAccount === 'string' 
      ? JSON.parse(serviceAccount) 
      : serviceAccount;
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson)
      });
    }
    
    firebaseAdminInitialized = true;
  } catch (err) {
    console.error('[Push] Errore inizializzazione Firebase Admin:', err);
    throw err;
  }
}

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const actionType = action || 'subscribe';
    
    if (actionType === 'subscribe') {
      // SUBSCRIBE: Registra subscription push
      const { subscription, userId } = data;
      
      if (!subscription) {
        return res.status(400).json({ error: 'Subscription richiesta' });
      }
      
      console.log('[Push] Subscription ricevuta:', {
        userId,
        endpoint: subscription.endpoint
      });
      
      // TODO: Salva subscription in database (Supabase o Vercel KV)
      // await saveSubscription(userId, subscription);
      
      return res.status(200).json({ success: true });
      
    } else if (actionType === 'send') {
      // SEND: Invia notifiche push
      // Verifica autorizzazione
      const authHeader = req.headers.authorization;
      const apiKey = process.env.PUSH_API_KEY || 'your-secret-api-key';
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      if (token !== apiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, body, data: pushData, userIds } = data;

      if (!title || !body) {
        return res.status(400).json({ error: 'Title e body richiesti' });
      }

      // Inizializza Firebase Admin
      initializeFirebaseAdmin();

      // Recupera subscriptions da Supabase
      let subscriptions = [];
      
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        const { data: subscribers } = await supabase
          .from('subscribers')
          .select('id')
          .in('auth_user_id', userIds);
        
        if (subscribers && subscribers.length > 0) {
          const subscriberIds = subscribers.map(s => s.id);
          const { data: pushSubs } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .in('user_id', subscriberIds);
          
          if (pushSubs) {
            subscriptions = pushSubs.map(sub => sub.subscription);
          }
        }
      } else {
        const { data: pushSubs } = await supabase
          .from('push_subscriptions')
          .select('subscription');
        
        if (pushSubs) {
          subscriptions = pushSubs.map(sub => sub.subscription);
        }
      }

      if (subscriptions.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'Nessuna subscription trovata' });
      }

      // Configura web-push
      const VAPID_PUBLIC_KEY = process.env.FIREBASE_VAPID_PUBLIC_KEY;
      const VAPID_PRIVATE_KEY = process.env.FIREBASE_VAPID_PRIVATE_KEY;
      
      if (VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:tradelia@example.com',
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );
      }

      // Prepara payload
      const payload = JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: {
          url: pushData?.url || '/archivio/dashboard.html',
          ...pushData
        }
      });

      // Invia push
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          if (!subscription || !subscription.endpoint) {
            return { success: false, error: 'Subscription format invalid' };
          }

          if (subscription.keys && subscription.keys.p256dh && subscription.keys.auth) {
            try {
              await webpush.sendNotification(
                {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                  }
                },
                payload
              );
              return { success: true, endpoint: subscription.endpoint };
            } catch (webPushErr) {
              console.warn('[Push] web-push fallito:', webPushErr.message);
              return { success: false, error: webPushErr.message };
            }
          } else if (subscription.token) {
            try {
              initializeFirebaseAdmin();
              await admin.messaging().send({
                notification: { title, body },
                data: pushData || {},
                token: subscription.token
              });
              return { success: true, token: subscription.token };
            } catch (fcmErr) {
              return { success: false, error: fcmErr.message };
            }
          } else {
            return { success: false, error: 'Subscription format not supported' };
          }
        } catch (err) {
          console.error('[Push] Errore invio singola push:', err);
          return { success: false, error: err.message };
        }
      });

      const results = await Promise.allSettled(sendPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;

      return res.status(200).json({
        success: true,
        sent: successful,
        total: subscriptions.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Failed' })
      });
    } else {
      return res.status(400).json({ error: `Action non supportato: ${actionType}. Usa 'subscribe' o 'send'` });
    }
  } catch (err) {
    console.error('[Push] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

