import { getServiceSupabase } from "./_lib/supabase.js";
import { HttpError } from "./_lib/http.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";

/**
 * Salva o aggiorna preferenze notifiche per utente Pro
 * Body: { notification_method: 'email' | 'sms' | 'whatsapp', phone_number?: string }
 */
export default async function handler(req) {
  if (req.method !== "POST") {
    throw new HttpError(405, "Method not allowed", "Only POST method is allowed");
  }

  try {
    // Verifica autenticazione
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized", "Missing or invalid authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = getServiceSupabase();

    // Verifica token dashboard e ottieni user_id
    const context = await getAdminContextFromToken(token, { enforceAdmin: false });

    if (!context.userId) {
      throw new HttpError(401, "Unauthorized", "User ID non disponibile dal token");
    }

    // Verifica che l'utente sia almeno Pro
    const { data: userPlan } = await supabase
      .from("dashboard_access_tokens")
      .select("plan_role")
      .eq("user_id", context.userId)
      .eq("revoked", false)
      .single();

    if (!userPlan || (userPlan.plan_role !== "pro" && userPlan.plan_role !== "desk")) {
      throw new HttpError(403, "Forbidden", "SMS/WhatsApp disponibili solo per utenti Pro o Desk");
    }

    // Parse body
    const body = await req.json();
    const { notification_method, phone_number } = body;

    if (!notification_method || !["email", "sms", "whatsapp"].includes(notification_method)) {
      throw new HttpError(
        400,
        "Bad Request",
        "notification_method deve essere 'email', 'sms' o 'whatsapp'"
      );
    }

    // Se SMS o WhatsApp, richiedi numero telefono
    if ((notification_method === "sms" || notification_method === "whatsapp") && !phone_number) {
      throw new HttpError(400, "Bad Request", "phone_number richiesto per SMS/WhatsApp");
    }

    // Valida formato numero (deve iniziare con +)
    if (phone_number && !phone_number.startsWith("+")) {
      throw new HttpError(
        400,
        "Bad Request",
        "phone_number deve essere in formato internazionale (es: +393491234567)"
      );
    }

    // Verifica se preferenza esiste già
    const { data: existing } = await supabase
      .from("user_notification_preferences")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    if (existing) {
      // Aggiorna preferenza esistente
      const { error: updateError } = await supabase
        .from("user_notification_preferences")
        .update({
          notification_method,
          phone_number: notification_method === "email" ? null : phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new HttpError(
          500,
          "Internal Server Error",
          "Failed to update notification preferences"
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Preferenze notifiche aggiornate",
          id: existing.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Crea nuova preferenza
      const { data: newPreference, error: insertError } = await supabase
        .from("user_notification_preferences")
        .insert({
          user_id: context.userId,
          notification_method,
          phone_number: notification_method === "email" ? null : phone_number,
        })
        .select()
        .single();

      if (insertError) {
        throw new HttpError(
          500,
          "Internal Server Error",
          "Failed to save notification preferences"
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Preferenze notifiche salvate",
          id: newPreference.id,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          details: error.details,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("[save-notification-preferences] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
