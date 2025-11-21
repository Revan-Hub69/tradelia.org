// /api/_lib/notifications.js
// Helper per inviare notifiche agli utenti usando il metodo preferito (email/SMS/WhatsApp)

import { getServiceSupabase } from "./supabase.js";
import { runtimeFetch as fetch } from "./fetch.js";

const supabase = getServiceSupabase();

/**
 * Invia notifica all'utente usando il metodo preferito
 * @param {string} userId - ID utente
 * @param {string} email - Email utente (fallback se preferenza non trovata)
 * @param {string} title - Titolo notifica
 * @param {string} message - Messaggio notifica
 * @param {string} url - URL opzionale (per email)
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendUserNotification(userId, email, title, message, url = null) {
  if (!userId) {
    // Se non c'è userId, usa solo email
    return await sendEmailNotification(email, title, message, url);
  }

  // Recupera preferenze notifiche utente
  const { data: preferences } = await supabase
    .from("user_notification_preferences")
    .select("notification_method, phone_number")
    .eq("user_id", userId)
    .single();

  const method = preferences?.notification_method || "email";
  const phoneNumber = preferences?.phone_number;

  switch (method) {
    case "sms":
      if (!phoneNumber) {
        console.warn(
          `[Notifications] Numero telefono mancante per SMS, fallback a email per user ${userId}`
        );
        return await sendEmailNotification(email, title, message, url);
      }
      try {
        await sendSMSNotification(phoneNumber, message);
        return { success: true, method: "sms" };
      } catch (error) {
        console.error(`[Notifications] Errore invio SMS, fallback a email:`, error);
        return await sendEmailNotification(email, title, message, url);
      }

    case "whatsapp":
      if (!phoneNumber) {
        console.warn(
          `[Notifications] Numero telefono mancante per WhatsApp, fallback a email per user ${userId}`
        );
        return await sendEmailNotification(email, title, message, url);
      }
      try {
        await sendWhatsAppNotification(phoneNumber, message);
        return { success: true, method: "whatsapp" };
      } catch (error) {
        console.error(`[Notifications] Errore invio WhatsApp, fallback a email:`, error);
        return await sendEmailNotification(email, title, message, url);
      }

    case "email":
    default:
      return await sendEmailNotification(email, title, message, url);
  }
}

/**
 * Invia notifica email
 */
async function sendEmailNotification(email, title, message, url = null) {
  const { sendEmail } = await import("../send-email.js");
  await sendEmail({
    to: email,
    subject: title,
    html: `
      <h2>${title}</h2>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      ${url ? `<p><a href="${url}">Apri Dashboard</a></p>` : ""}
      <p>Grazie,<br>Tradelia AI</p>
    `,
  });
  return { success: true, method: "email" };
}

/**
 * Invia notifica SMS
 */
async function sendSMSNotification(phoneNumber, message) {
  const response = await fetch(
    `${process.env.VERCEL_URL || "https://tradelia.org"}/api/send-sms.js`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SMS API error: ${error}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || "Errore invio SMS");
  }
}

/**
 * Invia notifica WhatsApp
 */
async function sendWhatsAppNotification(phoneNumber, message) {
  const response = await fetch(
    `${process.env.VERCEL_URL || "https://tradelia.org"}/api/send-whatsapp.js`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || "Errore invio WhatsApp");
  }
}
