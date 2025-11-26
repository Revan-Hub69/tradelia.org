// /api/notifications.js
// API Vercel - Notifiche Push (CONSOLIDATO)
// Consolida: push.js

import admin from "firebase-admin";

let firebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT non configurato");
    }

    const serviceAccountJson =
      typeof serviceAccount === "string" ? JSON.parse(serviceAccount) : serviceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
    }

    firebaseAdminInitialized = true;
  } catch (err) {
    console.error("[Notifications] Errore inizializzazione Firebase:", err);
    throw err;
  }
}

// NOTA: Funzione disabilitata per rispettare limite Vercel Hobby (12 funzioni)
// Consolidata in api/admin.js?action=notifications-*
// export default async function handler(req, res) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case "push":
        return await handlePush(req, res);
      case "subscribe":
        return await handleSubscribe(req, res);
      case "save-subscription":
        return await handleSaveSubscription(req, res);
      case "preferences":
        return await handleSavePreferences(req, res);
      case "vapid-key":
        return await handleGetVapidKey(req, res);
      case "check-background":
        return await handleCheckBackground(req, res);
      default:
        return res.status(400).json({
          ok: false,
          error:
            "Azione non valida. Usa: push, subscribe, save-subscription, preferences, vapid-key, check-background",
        });
    }
  } catch (error) {
    console.error("[Notifications] Errore:", error);
    return res.status(500).json({ ok: false, error: error.message || "Errore server" });
  }
}

async function handlePush(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // TODO: Implementare logica push.js qui
  // Inizializza Firebase Admin se necessario
  initializeFirebaseAdmin();

  return res.status(200).json({ ok: true, message: "Push notification sent" });
}

async function handleSubscribe(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // TODO: Implementare logica subscribe qui

  return res.status(200).json({ ok: true, message: "Subscription saved" });
}

// ===== SAVE PUSH SUBSCRIPTION =====
async function handleSaveSubscription(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { getServiceSupabase } = await import("./_lib/supabase.js");
  const { getAdminContextFromToken } = await import("./_lib/adminAuth.js");

  const supabase = getServiceSupabase();
  const authHeader = req.headers.authorization;

  // Supporta sia utenti autenticati che guest
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const context = await getAdminContextFromToken(token, { enforceAdmin: false });
      userId = context.userId || null;
    } catch (error) {
      // Token non valido, procediamo come guest
      console.warn("[Notifications] Token non valido, procedo come guest:", error.message);
    }
  }

  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, error: "Subscription data richiesta" });
  }

  const endpoint =
    typeof subscription.endpoint === "string"
      ? subscription.endpoint
      : subscription.endpoint?.endpoint || subscription.endpoint;

  // Per guest users, usiamo l'endpoint come identificatore univoco
  // Per utenti autenticati, usiamo user_id + endpoint
  const query = supabase.from("push_subscriptions").select("id");

  if (userId) {
    query.eq("user_id", userId).eq("endpoint", endpoint);
  } else {
    query.eq("user_id", null).eq("endpoint", endpoint);
  }

  const { data: existing } = await query.single();

  if (existing) {
    await supabase
      .from("push_subscriptions")
      .update({
        subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return res.status(200).json({ ok: true, message: "Subscription updated", id: existing.id });
  } else {
    const { data: newSubscription, error } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: userId,
        subscription,
      })
      .select()
      .single();

    if (error) {
      console.error("[Notifications] Errore salvataggio subscription:", error);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to save subscription", details: error.message });
    }

    return res
      .status(201)
      .json({ ok: true, message: "Subscription saved", id: newSubscription.id });
  }
}

// ===== SAVE NOTIFICATION PREFERENCES =====
async function handleSavePreferences(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { getServiceSupabase } = await import("./_lib/supabase.js");
  const { getAdminContextFromToken } = await import("./_lib/adminAuth.js");

  const supabase = getServiceSupabase();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");
  const context = await getAdminContextFromToken(token, { enforceAdmin: false });

  if (!context.userId) {
    return res.status(401).json({ ok: false, error: "User ID non disponibile" });
  }

  const { notification_method, phone_number, newsletter_consent, sms_consent, whatsapp_consent } =
    req.body;

  // Validate notification_method if provided
  if (notification_method && !["email", "sms", "whatsapp"].includes(notification_method)) {
    return res
      .status(400)
      .json({ ok: false, error: "notification_method deve essere email, sms o whatsapp" });
  }

  // Validate phone_number if SMS/WhatsApp is selected
  if ((notification_method === "sms" || notification_method === "whatsapp") && !phone_number) {
    return res.status(400).json({ ok: false, error: "phone_number richiesto per SMS/WhatsApp" });
  }

  if (phone_number && !phone_number.startsWith("+")) {
    return res
      .status(400)
      .json({ ok: false, error: "phone_number deve essere in formato internazionale" });
  }

  // Build update/insert object
  const now = new Date().toISOString();
  const preferenceData = {
    updated_at: now,
  };

  if (notification_method !== undefined) {
    preferenceData.notification_method = notification_method;
  }
  if (phone_number !== undefined) {
    preferenceData.phone_number = notification_method === "email" ? null : phone_number;
  }

  // GDPR: Timestamp consenso (Art. 7)
  if (newsletter_consent !== undefined) {
    preferenceData.newsletter_consent = Boolean(newsletter_consent);
    preferenceData.newsletter_consent_timestamp = newsletter_consent ? now : null;
  }
  if (sms_consent !== undefined) {
    preferenceData.sms_consent = Boolean(sms_consent);
    preferenceData.sms_consent_timestamp = sms_consent ? now : null;
  }
  if (whatsapp_consent !== undefined) {
    preferenceData.whatsapp_consent = Boolean(whatsapp_consent);
    preferenceData.whatsapp_consent_timestamp = whatsapp_consent ? now : null;
  }

  const { data: existing } = await supabase
    .from("user_notification_preferences")
    .select("id")
    .eq("user_id", context.userId)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("user_notification_preferences")
      .update(preferenceData)
      .eq("id", existing.id);

    if (updateError) {
      return res.status(500).json({ ok: false, error: "Failed to update preferences" });
    }

    return res.status(200).json({ ok: true, message: "Preferenze aggiornate", id: existing.id });
  } else {
    const { data: newPreference, error: insertError } = await supabase
      .from("user_notification_preferences")
      .insert({
        user_id: context.userId,
        ...preferenceData,
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ ok: false, error: "Failed to save preferences" });
    }

    return res.status(201).json({ ok: true, message: "Preferenze salvate", id: newPreference.id });
  }
}

// ===== GET VAPID PUBLIC KEY =====
async function handleGetVapidKey(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  if (!VAPID_PUBLIC_KEY) {
    // Restituisce 404 invece di 500 per indicare che la risorsa non è disponibile
    // Il client userà il fallback hardcoded
    return res.status(404).json({
      ok: false,
      error: "VAPID non configurato",
      useFallback: true,
    });
  }

  return res.status(200).json({ ok: true, publicKey: VAPID_PUBLIC_KEY });
}

// ===== CHECK BACKGROUND (per Periodic Background Sync) =====
async function handleCheckBackground(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Questo endpoint è chiamato dal Service Worker in background
  // Supporta sia utenti autenticati (token) che guest (device ID)
  const authHeader = req.headers.authorization;
  const deviceId = req.headers["x-device-id"];

  const { getServiceSupabase } = await import("./_lib/supabase.js");
  const supabase = getServiceSupabase();

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("notifications")
    .select("id, title, message, body, type, created_at")
    .eq("read", false)
    .gt("created_at", twoHoursAgo)
    .order("created_at", { ascending: false })
    .limit(10);

  // Filtra per user_id (autenticato) o device_id (guest)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const { getAdminContextFromToken } = await import("./_lib/adminAuth.js");

    try {
      const context = await getAdminContextFromToken(token, { enforceAdmin: false });
      if (context.userId) {
        query = query.eq("user_id", context.userId);
      } else {
        query = query.eq("user_token", token);
      }
    } catch (error) {
      console.warn("[Notifications] Errore verifica token:", error);
      // Fallback a device ID se token non valido
      if (deviceId) {
        query = query.eq("device_id", deviceId);
      } else {
        return res.status(200).json({ ok: true, notifications: [] });
      }
    }
  } else if (deviceId) {
    // Guest user: usa device ID
    query = query.eq("device_id", deviceId);
  } else {
    // Nessun identificatore: nessuna notifica
    return res.status(200).json({ ok: true, notifications: [] });
  }

  try {
    const { data: notifications, error } = await query;

    if (error) {
      console.error("[Notifications] Errore controllo background:", error);
      return res.status(500).json({ ok: false, error: "Errore controllo notifiche" });
    }

    return res.status(200).json({
      ok: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error("[Notifications] Errore handleCheckBackground:", error);
    return res.status(500).json({ ok: false, error: "Errore server" });
  }
}
