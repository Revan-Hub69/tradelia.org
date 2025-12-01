import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminEmail } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/supabase/execute-sql
 * Esegue uno script SQL su Supabase
 * 
 * SECURITY: Solo admin possono eseguire SQL
 * VALIDATION: Validazione base per prevenire SQL injection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await request.json();
    const { sql } = body;

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'Script SQL richiesto' }, { status: 400 });
    }

    // Validazione base: blocca comandi pericolosi
    const dangerousKeywords = [
      'DROP DATABASE',
      'DROP SCHEMA',
      'TRUNCATE',
      'DELETE FROM',
      'ALTER SYSTEM',
      'COPY FROM',
      'CREATE EXTENSION',
      'CREATE FUNCTION',
      'CREATE TRIGGER',
      'CREATE POLICY',
    ];

    const sqlUpper = sql.toUpperCase().trim();
    const isDangerous = dangerousKeywords.some((keyword) => sqlUpper.startsWith(keyword));

    if (isDangerous) {
      return NextResponse.json(
        { 
          error: 'Comando SQL non permesso per sicurezza',
          blocked: true,
        },
        { status: 400 }
      );
    }

    // Esegui SQL usando RPC o query diretta
    // Nota: Supabase non supporta direttamente l'esecuzione di SQL arbitrario
    // Usiamo una funzione PostgreSQL custom o eseguiamo query specifiche
    
    // Per query SELECT, usiamo il client Supabase
    if (sqlUpper.startsWith('SELECT')) {
      // Per SELECT, proviamo a parsare e eseguire
      // Questo è limitato - per query complesse serve un approccio diverso
      return NextResponse.json(
        { 
          error: 'Per query SELECT, usa la gestione tabelle standard',
          suggestion: 'Usa GET /api/admin/supabase/data per query SELECT',
        },
        { status: 400 }
      );
    }

    // Per altri comandi (INSERT, UPDATE, CREATE TABLE, etc.)
    // Usiamo una funzione PostgreSQL custom che accetta SQL come parametro
    // Questa funzione deve essere creata in Supabase con SECURITY DEFINER
    
    try {
      // Chiamata a funzione RPC custom (da creare in Supabase)
      const { data, error } = await supabaseAdmin.rpc('execute_admin_sql', {
        sql_query: sql,
      });

      if (error) {
        // Se la funzione non esiste, proviamo un approccio alternativo
        if (error.code === '42883') {
          // Funzione non trovata - creiamo una soluzione alternativa
          return NextResponse.json(
            {
              error: 'Funzione execute_admin_sql non trovata',
              details: 'Crea la funzione in Supabase prima di usare questa feature',
              sql: `
                CREATE OR REPLACE FUNCTION execute_admin_sql(sql_query text)
                RETURNS jsonb
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                DECLARE
                  result jsonb;
                BEGIN
                  -- Esegui query e restituisci risultato
                  EXECUTE sql_query;
                  RETURN jsonb_build_object('success', true, 'message', 'Query eseguita');
                EXCEPTION
                  WHEN OTHERS THEN
                    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
                END;
                $$;
              `,
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { error: error.message, details: error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Query eseguita con successo',
      });
    } catch (execError) {
      return NextResponse.json(
        {
          error: 'Errore durante l\'esecuzione',
          details: execError instanceof Error ? execError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/supabase/execute-sql:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/supabase/sql-files
 * Lista tutti i file SQL disponibili nella cartella supabase/
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Lista hardcoded dei file SQL disponibili
    // In produzione, potresti leggere dalla cartella supabase/ usando fs
    const sqlFiles = [
      'schema.sql',
      'schema_v2.sql',
      'dashboard-complete-schema.sql',
      'add-education-system-schema.sql',
      'portfolio-schema.sql',
      'trading-journal-schema.sql',
      'watchlist-schema.sql',
      'expenses-schema.sql',
      'utilities-schema.sql',
      'push-subscriptions-schema.sql',
      'user-notification-preferences-schema.sql',
      'one-time-services-schema.sql',
      'oslo-alliance-schema.sql',
      'add-payments-invoices-tables.sql',
      'add-credits-log-table.sql',
      'add-admin-emails-table.sql',
      'add-business-fields.sql',
      'add-trial-refund-schema.sql',
      'add-dashboard-access-tokens-table.sql',
      'add-dashboard-refresh-tokens.sql',
      'migration-analysis-requests.sql',
      'migration-analysis-requests-enhanced.sql',
      'migration-new-tables.sql',
      'migration-add-expiration.sql',
      'migration-add-guest-role.sql',
      'seed_admin.sql',
      'seed-education-content.sql',
      'seed-education-content-tradelia.sql',
      'seed-education-all-lessons-tradelia.sql',
      'seed-education-module-2-risk-management.sql',
      'seed-education-module-3-psychology.sql',
      'seed-education-module-3-saving.sql',
      'seed-education-module-4-instruments.sql',
      'seed-education-module-4-wealth-management.sql',
      'seed-education-module-5-speculation.sql',
      'seed-education-pathway-pac-tradelia.sql',
      'seed-education-pathway-pac-complete.sql',
      'seed-education-spaced-repetition.sql',
      'enhance-education-system-advanced.sql',
      'enhance-gamification-system.sql',
      'fix-education-security-linter.sql',
      'fix-security-linter-issues.sql',
      'fix-security-linter-issues-safe.sql',
      'fix-rls-analysis-requests-all-users.sql',
      'fix-performance-indexes.sql',
      'fix-moddatetime-schema.sql',
      'fix-education-data-minimization.sql',
      'fix-duplicate-rls-policies.sql',
      'fix-search-path-functions.sql',
      'fix-security-definer-view.sql',
      'update-asset-proposals-pro-only.sql',
      'function-notify-analysis-completed.sql',
      'generate-admin-token.sql',
      'insert-admin-token.sql',
      'cleanup-old-modules.sql',
      'complete-module-4-instruments.sql',
      'expand-module-1-foundations.sql',
      'expand-module-2-risk.sql',
      'module-2-risk-management-complete.sql',
      'module-2-risk-management-advanced.sql',
      'setup-education-system-simple.sql',
      'example-populate-advanced-features.sql',
      'verify-schema.sql',
      'verify-configuration.sql',
      'verify-current-modules.sql',
      'verify-complete.sql',
      'verify-admin-dashboard-data.sql',
      'reset_schema_v2.sql',
      'rpc-get-user-emails.sql',
    ];

    return NextResponse.json({ files: sqlFiles });
  } catch (error) {
    console.error('Error in GET /api/admin/supabase/sql-files:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

