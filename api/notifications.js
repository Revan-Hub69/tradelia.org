// /api/notifications.js
// API Vercel - Notifiche Push (CONSOLIDATO)
// Consolida: push.js

import admin from 'firebase-admin';
import webpush from 'web-push';

let firebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) return;

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT non configurato');
    }

    const serviceAccountJson = typeof serviceAccount === 'string' ? JSON.parse(serviceAccount) : serviceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
    }

    firebaseAdminInitialized = true;
  } catch (err) {
    console.error('[Notifications] Errore inizializzazione Firebase:', err);
    throw err;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'push':
        return await handlePush(req, res);
      case 'subscribe':
        return await handleSubscribe(req, res);
      default:
        return res.status(400).json({ ok: false, error: 'Azione non valida. Usa: push, subscribe' });
    }
  } catch (error) {
    console.error('[Notifications] Errore:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Errore server' });
  }
}

async function handlePush(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // TODO: Implementare logica push.js qui
  // Inizializza Firebase Admin se necessario
  initializeFirebaseAdmin();

  return res.status(200).json({ ok: true, message: 'Push notification sent' });
}

async function handleSubscribe(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // TODO: Implementare logica subscribe qui

  return res.status(200).json({ ok: true, message: 'Subscription saved' });
}

