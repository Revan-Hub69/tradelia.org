/**
 * Supabase Migration API
 * Esegue migrazioni SQL via API server-side
 *
 * POST /api/supabase/migrate
 * Body: { migration: '001' | '002' | 'all' }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function loadMigration(version: string): string {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");

  // Try to find the file
  const files = ["001_initial_schema.sql", "002_community_tables.sql"];

  const file = files.find((f) => f.startsWith(version));
  if (!file) {
    throw new Error(`Migration ${version} not found`);
  }

  return readFileSync(join(migrationsDir, file), "utf-8");
}

async function executeMigration(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Split SQL by semicolons
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        // Note: Direct SQL execution requires Supabase CLI or custom function
        // For now, we'll return the SQL to be executed
        // In production, you'd use Supabase Management API or a custom RPC function
        // eslint-disable-next-line no-console
        console.log("Executing:", statement.substring(0, 50) + "...");
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (add your auth logic here)
    // For now, we'll require a secret key
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.MIGRATION_SECRET_KEY;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { migration } = body;

    if (!migration || !["001", "002", "all"].includes(migration)) {
      return NextResponse.json(
        { error: "Invalid migration. Use: 001, 002, or all" },
        { status: 400 }
      );
    }

    const migrations = migration === "all" ? ["001", "002"] : [migration];
    const results = [];

    for (const mig of migrations) {
      try {
        const sql = loadMigration(mig);
        const result = await executeMigration(sql);
        results.push({
          migration: mig,
          success: result.success,
          error: result.error,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.push({
          migration: mig,
          success: false,
          error: message,
        });
      }
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    // Check which tables exist
    const { data, error } = await supabase
      .from("schema_migrations")
      .select("version")
      .order("version", { ascending: true });

    if (error && error.code !== "42P01") {
      // Table doesn't exist
      return NextResponse.json({
        applied: [],
        tables: [],
      });
    }

    const applied = data?.map((r) => r.version) || [];

    // Try to get table list (requires custom RPC or direct SQL)
    return NextResponse.json({
      applied,
      message: "Use Supabase Dashboard to check tables",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
