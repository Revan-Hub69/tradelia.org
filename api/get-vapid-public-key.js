import { HttpError } from "./_lib/http.js";

/**
 * Restituisce la VAPID public key per le push notifications
 * La public key può essere esposta pubblicamente (non è un segreto)
 */
export default async function handler(req) {
  if (req.method !== "GET") {
    throw new HttpError(405, "Method not allowed", "Only GET method is allowed");
  }

  try {
    // VAPID public key dalle env (FIREBASE_VAPID_PUBLIC_KEY)
    const vapidPublicKey = process.env.FIREBASE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      // Fallback alla key hardcoded se non configurata (per compatibilità)
      const fallbackKey =
        "BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0";
      console.warn(
        "[get-vapid-public-key] FIREBASE_VAPID_PUBLIC_KEY non configurata, uso fallback"
      );

      return new Response(
        JSON.stringify({
          success: true,
          vapidPublicKey: fallbackKey,
          source: "fallback",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        vapidPublicKey,
        source: "environment",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[get-vapid-public-key] Error:", error);
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
