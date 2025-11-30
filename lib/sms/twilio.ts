/**
 * Twilio SMS/WhatsApp integration
 *
 * Per usare:
 * 1. Crea account su https://www.twilio.com
 * 2. Ottieni Account SID, Auth Token, e numero Twilio
 * 3. Per WhatsApp, configura WhatsApp Sandbox o Business Account
 * 4. Aggiungi variabili d'ambiente:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_PHONE_NUMBER (per SMS)
 *    - TWILIO_WHATSAPP_NUMBER (per WhatsApp, formato: whatsapp:+14155238886)
 */

interface SendSMSOptions {
  to: string; // Formato internazionale: +393491234567
  message: string;
}

interface SendWhatsAppOptions {
  to: string; // Formato internazionale: +393491234567
  message: string;
}

/**
 * Valida formato numero telefono internazionale
 */
export function validatePhoneNumber(phone: string): boolean {
  // Formato: +[country code][number] (es. +393491234567)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Normalizza numero telefono (rimuove spazi, trattini, etc.)
 */
export function normalizePhoneNumber(phone: string): string {
  // Rimuovi spazi, trattini, parentesi
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Se inizia con 00, sostituisci con +
  if (cleaned.startsWith("00")) {
    return "+" + cleaned.substring(2);
  }

  // Se non inizia con +, aggiungilo (assumendo numero italiano)
  if (!cleaned.startsWith("+")) {
    // Se inizia con 0, rimuovilo e aggiungi +39
    if (cleaned.startsWith("0")) {
      return "+39" + cleaned.substring(1);
    }
    // Altrimenti aggiungi +39
    return "+39" + cleaned;
  }

  return cleaned;
}

/**
 * Invia SMS tramite Twilio
 */
export async function sendSMS({
  to,
  message,
}: SendSMSOptions): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials mancanti");
    return { success: false, error: "Twilio non configurato" };
  }

  const normalizedTo = normalizePhoneNumber(to);
  if (!validatePhoneNumber(normalizedTo)) {
    return { success: false, error: "Numero telefono non valido" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: normalizedTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore Twilio SMS:", data);
      return { success: false, error: data.message || "Errore invio SMS" };
    }

    return { success: true };
  } catch (error) {
    console.error("Errore invio SMS:", error);
    return { success: false, error: error instanceof Error ? error.message : "Errore sconosciuto" };
  }
}

/**
 * Invia WhatsApp tramite Twilio WhatsApp API
 */
export async function sendWhatsApp({
  to,
  message,
}: SendWhatsAppOptions): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Sandbox default

  if (!accountSid || !authToken) {
    console.error("Twilio credentials mancanti");
    return { success: false, error: "Twilio non configurato" };
  }

  const normalizedTo = normalizePhoneNumber(to);
  if (!validatePhoneNumber(normalizedTo)) {
    return { success: false, error: "Numero telefono non valido" };
  }

  // Formato WhatsApp: whatsapp:+393491234567
  const whatsappTo = normalizedTo.startsWith("whatsapp:")
    ? normalizedTo
    : `whatsapp:${normalizedTo}`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: whatsappTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore Twilio WhatsApp:", data);
      return { success: false, error: data.message || "Errore invio WhatsApp" };
    }

    return { success: true };
  } catch (error) {
    console.error("Errore invio WhatsApp:", error);
    return { success: false, error: error instanceof Error ? error.message : "Errore sconosciuto" };
  }
}
