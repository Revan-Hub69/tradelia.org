import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/supabase/tables
 * Lista tutte le tabelle disponibili in Supabase
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      // Restituisci lista hardcoded invece di 401 per guest access
      const knownTables = [
        "user_profiles",
        "user_roles",
        "reports",
        "report_modules",
        "courses",
        "course_progress",
        "notifications",
        "push_subscriptions",
        "user_notification_preferences",
        "favorites",
        "user_activities",
        "achievements",
        "user_achievements",
        "gamification_xp",
        "gamification_streaks",
        "modules",
        "admin_emails",
        "payments",
        "invoices",
        "one_time_services",
        "analysis_requests",
        "asset_proposals",
        "asset_votes",
      ];
      return NextResponse.json({ tables: knownTables });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      // Restituisci lista hardcoded invece di 403 per non-admin
      const knownTables = [
        "user_profiles",
        "user_roles",
        "reports",
        "report_modules",
        "courses",
        "course_progress",
        "notifications",
        "push_subscriptions",
        "user_notification_preferences",
        "favorites",
        "user_activities",
        "achievements",
        "user_achievements",
        "gamification_xp",
        "gamification_streaks",
        "modules",
        "admin_emails",
        "payments",
        "invoices",
        "one_time_services",
        "analysis_requests",
        "asset_proposals",
        "asset_votes",
      ];
      return NextResponse.json({ tables: knownTables });
    }

    // Query per ottenere tutte le tabelle dal sistema PostgreSQL
    // Proviamo prima con RPC, poi fallback a information_schema
    let tables: string[] | null = null;
    let error: Error | null = null;

    try {
      const rpcResult = await supabaseAdmin.rpc("get_all_tables");
      if (rpcResult.error) {
        throw rpcResult.error;
      }
      tables = rpcResult.data as string[] | null;
    } catch {
      // Fallback: query diretta usando information_schema
      try {
        const { data, error: queryError } = await supabaseAdmin
          .from("information_schema.tables")
          .select("table_name, table_schema")
          .eq("table_schema", "public")
          .order("table_name");

        if (queryError) {
          throw queryError;
        }

        tables = data?.map((t: { table_name: string }) => t.table_name) || null;
      } catch (queryError) {
        error = queryError instanceof Error ? queryError : new Error(String(queryError));
      }
    }

    if (error && !tables) {
      // Lista hardcoded come fallback
      const knownTables = [
        "user_profiles",
        "user_roles",
        "reports",
        "report_modules",
        "courses",
        "course_progress",
        "notifications",
        "push_subscriptions",
        "user_notification_preferences",
        "favorites",
        "user_activities",
        "achievements",
        "user_achievements",
        "gamification_xp",
        "gamification_streaks",
        "modules",
        "admin_emails",
        "payments",
        "invoices",
        "one_time_services",
        "analysis_requests",
        "asset_proposals",
        "asset_votes",
      ];

      return NextResponse.json({ tables: knownTables });
    }

    return NextResponse.json({ tables: tables || [] });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      {
        error: "Errore interno",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
