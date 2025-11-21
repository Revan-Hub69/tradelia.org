// /api/_lib/notifications.js
// Helper per inviare notifiche agli utenti usando il metodo preferito (email/SMS/WhatsApp)

import { getServiceSupabase } from "./supabase.js";

const supabase = getServiceSupabase();

/**
 * Invia notifica all'utente usando il metodo preferito
 * @param {string} userId - ID utente
 * @param {string} email - Email utente (OBBLIGATORIA - sempre usata come fallback)
 * @param {string} title - Titolo notifica
 * @param {string} message - Messaggio notifica
 * @param {string} url - URL opzionale (per email)
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendUserNotification(userId, email, title, message, url = null) {
  // Email è sempre obbligatoria (fallback garantito)
  if (!email) {
    throw new Error("Email obbligatoria per invio notifiche");
  }

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
  const sendEmailModule = await import("../send-email.js");
  const sendEmail = sendEmailModule.default;

  // sendEmail è un handler Vercel, dobbiamo chiamarlo come funzione
  // Creiamo un mock request/response per chiamare la funzione
  const mockReq = {
    method: "POST",
    body: {
      type: "richiesta-servizio",
      to: email,
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${message.replace(/\n/g, "<br/>")}</p>
        ${url ? `<p><a href="${url}">Apri Dashboard</a></p>` : ""}
        <p>Grazie,<br>Tradelia AI</p>
      `,
    },
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code !== 200) {
          throw new Error(data.error || "Errore invio email");
        }
        return { ok: true };
      },
    }),
    setHeader: () => {},
  };

  await sendEmail(mockReq, mockRes);
  return { success: true, method: "email" };
}

/**
 * Invia notifica SMS
 */
async function sendSMSNotification(phoneNumber, message) {
  const sendSMSModule = await import("../send-sms.js");
  const sendSMS = sendSMSModule.default;

  const mockReq = {
    method: "POST",
    body: {
      to: phoneNumber,
      message,
    },
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code !== 200 || !data.ok) {
          throw new Error(data.error || "Errore invio SMS");
        }
        return data;
      },
    }),
    setHeader: () => {},
    end: () => {},
  };

  await sendSMS(mockReq, mockRes);
}

/**
 * Invia notifica WhatsApp
 */
async function sendWhatsAppNotification(phoneNumber, message) {
  const sendWhatsAppModule = await import("../send-whatsapp.js");
  const sendWhatsApp = sendWhatsAppModule.default;

  const mockReq = {
    method: "POST",
    body: {
      to: phoneNumber,
      message,
    },
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code !== 200 || !data.ok) {
          throw new Error(data.error || "Errore invio WhatsApp");
        }
        return data;
      },
    }),
    setHeader: () => {},
    end: () => {},
  };

  await sendWhatsApp(mockReq, mockRes);
}
