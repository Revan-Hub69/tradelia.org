import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validateEmail, validateName, sanitizeString } from "@/lib/security/validation";

interface BootstrapPayload {
  userId?: string;
  email?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 richieste per minuto per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`bootstrap:${clientIP}`, 5, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Troppe richieste. Riprova più tardi.",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetAt),
          },
        }
      );
    }

    // Verifica che l'utente sia autenticato
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = (await request.json()) as BootstrapPayload;

    // Sanitizza e valida input
    const userId = sanitizeString(body.userId || "", 100);
    const emailRaw = body.email || "";
    const nameRaw = body.name || "";

    // Verifica che userId corrisponda all'utente autenticato
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "ID utente non valido" }, { status: 403 });
    }

    // Validazione email
    const emailValidation = validateEmail(emailRaw);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }
    const email = emailValidation.valid ? emailRaw.toLowerCase().trim() : "";

    // Validazione nome
    const nameValidation = validateName(nameRaw);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }
    const name = sanitizeString(nameRaw, 100);

    // Verifica finale che tutti i dati siano validi
    if (!userId || !email || !name) {
      return NextResponse.json({ error: "Dati mancanti o non validi" }, { status: 400 });
    }

    const profilePromise = supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: userId,
        display_name: name,
      },
      { onConflict: "user_id" }
    );

    const rolePromise = supabaseAdmin.from("user_roles").upsert(
      {
        user_id: userId,
        role: "trial",
      },
      { onConflict: "user_id" }
    );

    const [profileResult, roleResult] = await Promise.all([profilePromise, rolePromise]);

    if (profileResult.error) {
      console.error("Errore upsert profilo", profileResult.error);
      return NextResponse.json({ error: "Impossibile creare il profilo" }, { status: 500 });
    }

    if (roleResult.error) {
      console.error("Errore upsert ruolo", roleResult.error);
      return NextResponse.json({ error: "Impossibile assegnare il ruolo" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore bootstrap utente", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
