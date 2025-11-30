import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import webpush from "web-push";
import { sendSMS, sendWhatsApp } from "@/lib/sms/twilio";

/**
 * Endpoint per inviare notifiche push
 * POST /api/notifications/send
 *
 * Body: {
 *   userId?: string, // Se specificato, invia solo a questo utente
 *   type: 'info' | 'success' | 'warning' | 'error' | 'analysis_completed' | 'plan_expiring' | 'credits_low' | 'system',
 *   title: string,
 *   message: string,
 *   link?: string
 * }
 */

// Inizializza web-push con VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@tradelia.org";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface SendNotificationPayload {
  userId?: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "analysis_completed"
    | "plan_expiring"
    | "credits_low"
    | "system";
  title: string;
  message: string;
  link?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Solo admin o utente stesso può inviare notifiche
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = (await request.json()) as SendNotificationPayload;
    const { userId, type, title, message, link } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // Se userId è specificato, verifica che sia l'utente stesso o admin
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id) {
      // Verifica se è admin
      const { data: adminData } = await supabaseAdmin
        .from("admin_emails")
        .select("email")
        .eq("email", user.email?.toLowerCase())
        .single();

      if (!adminData) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
      }
    }

    // 1. Salva notifica nel database
    const { data: notification, error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        link: link || null,
        is_read: false,
      })
      .select()
      .single();

    if (notifError) {
      console.error("Errore salvataggio notifica:", notifError);
      return NextResponse.json({ error: "Errore salvataggio notifica" }, { status: 500 });
    }

    // 2. Recupera preferenze notifiche dell'utente
    const { data: preferences } = await supabaseAdmin
      .from("user_notification_preferences")
      .select("notification_method, phone_number, enabled")
      .eq("user_id", targetUserId)
      .single();

    // Se le notifiche sono disabilitate, salta l'invio
    if (preferences && preferences.enabled === false) {
      return NextResponse.json({
        notification,
        message: "Notifiche disabilitate dall'utente",
      });
    }

    // 3. Invia SMS o WhatsApp se configurato E se Twilio è abilitato
    const smsResults = [];
    const whatsappResults = [];

    // SMS/WhatsApp sono opzionali e richiedono Twilio configurato
    const twilioEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    if (
      twilioEnabled &&
      preferences &&
      preferences.phone_number &&
      preferences.notification_method
    ) {
      const notificationMessage = `${title}\n\n${message}${link ? `\n${link}` : ""}`;

      if (preferences.notification_method === "sms") {
        const smsResult = await sendSMS({
          to: preferences.phone_number,
          message: notificationMessage,
        });
        smsResults.push({ phone: preferences.phone_number, ...smsResult });
      } else if (preferences.notification_method === "whatsapp") {
        const whatsappResult = await sendWhatsApp({
          to: preferences.phone_number,
          message: notificationMessage,
        });
        whatsappResults.push({ phone: preferences.phone_number, ...whatsappResult });
      }
    }

    // 4. Recupera tutte le push subscriptions dell'utente
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", targetUserId);

    if (subError) {
      console.error("Errore lettura subscriptions:", subError);
      // Non fallire se non ci sono subscriptions
    }

    // 5. Invia push notification a tutte le subscriptions
    const pushResults = [];
    if (subscriptions && subscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
      // Mappa type a tag per raggruppare notifiche simili
      const tagMap: Record<string, string> = {
        analysis_completed: `analysis-${notification.id}`,
        plan_expiring: `plan-expiring-${targetUserId}`,
        credits_low: `credits-low-${targetUserId}`,
        system: `system-${notification.id}`,
      };
      const tag = tagMap[type] || `notification-${notification.id}`;

      // Azioni basate sul tipo
      const actionsMap: Record<string, Array<{ action: string; title: string }>> = {
        analysis_completed: [
          { action: "open", title: "Vedi Analisi" },
          { action: "dismiss", title: "Ignora" },
        ],
        plan_expiring: [
          { action: "open", title: "Rinnova" },
          { action: "dismiss", title: "Più Tardi" },
        ],
        credits_low: [
          { action: "open", title: "Ricarica" },
          { action: "dismiss", title: "Ignora" },
        ],
      };
      const actions = actionsMap[type] || [{ action: "open", title: "Apri" }];

      // Pattern vibrazione per mobile (opzionale, solo per notifiche importanti)
      const vibrate = type === "analysis_completed" || type === "plan_expiring" 
        ? [200, 100, 200] 
        : undefined;

      const payload = JSON.stringify({
        title,
        body: message,
        url: link || "/dashboard",
        icon: "/favicon.png",
        badge: "/favicon-32x32.png",
        tag,
        id: notification.id,
        type,
        actions,
        vibrate,
        timestamp: Date.now(),
        requireInteraction: type === "plan_expiring" || type === "credits_low",
        renotify: type === "plan_expiring",
        silent: type === "info",
        dir: "ltr",
        lang: "it",
      });

      for (const sub of subscriptions) {
        try {
          const subscription = sub.subscription as {
            endpoint: string;
            keys: {
              p256dh: string;
              auth: string;
            };
          };

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            },
            payload
          );

          pushResults.push({ endpoint: subscription.endpoint, status: "sent" });
        } catch (error) {
          console.error("Errore invio push:", error);

          // Estrai la subscription per usarla nel catch
          const subscription = sub.subscription as {
            endpoint: string;
            keys: {
              p256dh: string;
              auth: string;
            };
          } | null;

          pushResults.push({
            endpoint: subscription?.endpoint || "unknown",
            status: "error",
            error: error instanceof Error ? error.message : "Errore sconosciuto",
          });

          // Se la subscription è invalida, rimuovila
          if (error instanceof Error && error.message.includes("410") && subscription?.endpoint) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("user_id", targetUserId)
              .eq("endpoint", subscription.endpoint);
          }
        }
      }
    }

    return NextResponse.json({
      notification,
      pushSent: pushResults.filter((r) => r.status === "sent").length,
      pushErrors: pushResults.filter((r) => r.status === "error").length,
      pushResults,
      smsSent: smsResults.filter((r) => r.success).length,
      smsErrors: smsResults.filter((r) => !r.success).length,
      smsResults,
      whatsappSent: whatsappResults.filter((r) => r.success).length,
      whatsappErrors: whatsappResults.filter((r) => !r.success).length,
      whatsappResults,
    });
  } catch (error) {
    console.error("Errore invio notifica:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
