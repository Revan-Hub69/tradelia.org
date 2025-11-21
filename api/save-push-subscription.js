import { getServiceSupabase } from "./_lib/supabase.js";
import { HttpError } from "./_lib/http.js";
import { getAdminContextFromToken } from "./_lib/adminAuth.js";

/**
 * Salva o aggiorna una push subscription per l'utente autenticato
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

    // Parse body
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      throw new HttpError(400, "Bad Request", "Invalid subscription data");
    }

    // Verifica se subscription esiste già
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", context.userId)
      .eq("endpoint", subscription.endpoint)
      .single();

    if (existing) {
      // Aggiorna subscription esistente
      const { error: updateError } = await supabase
        .from("push_subscriptions")
        .update({
          subscription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new HttpError(500, "Internal Server Error", "Failed to update subscription");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription updated",
          id: existing.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Crea nuova subscription
      const { data: newSubscription, error: insertError } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: context.userId,
          subscription,
        })
        .select()
        .single();

      if (insertError) {
        throw new HttpError(500, "Internal Server Error", "Failed to save subscription");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription saved",
          id: newSubscription.id,
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

    console.error("[save-push-subscription] Error:", error);
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
