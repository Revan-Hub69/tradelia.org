import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/settings/business-logo
 * Recupera logo aziendale personalizzato (solo Desk/Business)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Verifica ruolo Desk/Business
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || (roleData.role !== "desk" && roleData.role !== "admin")) {
      return NextResponse.json(
        { error: "Funzionalità riservata agli account Desk/Business" },
        { status: 403 }
      );
    }

    // Recupera logo da profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_logo_url")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      logo_url: profile?.business_logo_url || null,
    });
  } catch (error) {
    console.error("Error fetching business logo:", error);
    return NextResponse.json(
      {
        error: "Errore interno",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/business-logo
 * Carica logo aziendale personalizzato (solo Desk/Business)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Verifica ruolo Desk/Business
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || (roleData.role !== "desk" && roleData.role !== "admin")) {
      return NextResponse.json(
        { error: "Funzionalità riservata agli account Desk/Business" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json({ error: "File non fornito" }, { status: 400 });
    }

    // Validazione file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File non valido" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      return NextResponse.json({ error: "File troppo grande (max 2MB)" }, { status: 400 });
    }

    // Converti file a base64 per storage (o usa Supabase Storage)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const logoUrl = `data:${mimeType};base64,${base64}`;

    // Salva in profiles
    const { error: updateError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        business_logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (updateError) {
      console.error("Error saving business logo:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      logo_url: logoUrl,
      message: "Logo caricato con successo",
    });
  } catch (error) {
    console.error("Error uploading business logo:", error);
    return NextResponse.json(
      {
        error: "Errore interno",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/business-logo
 * Rimuove logo aziendale personalizzato
 */
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Verifica ruolo Desk/Business
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || (roleData.role !== "desk" && roleData.role !== "admin")) {
      return NextResponse.json(
        { error: "Funzionalità riservata agli account Desk/Business" },
        { status: 403 }
      );
    }

    // Rimuovi logo
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        business_logo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error removing business logo:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Logo rimosso con successo",
    });
  } catch (error) {
    console.error("Error removing business logo:", error);
    return NextResponse.json(
      {
        error: "Errore interno",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
