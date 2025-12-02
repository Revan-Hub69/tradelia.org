#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * Applica migrazioni SQL a Supabase
 * 
 * Usage: node scripts/supabase/migrate.mjs [migration-name]
 *        node scripts/supabase/migrate.mjs --all
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '../..');

// Load env vars
dotenv.config({ path: join(root, '.env.local') });
dotenv.config({ path: join(root, '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get applied migrations
 */
async function getAppliedMigrations() {
  try {
    // Check if migrations table exists
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: true });

    if (error && error.code === '42P01') {
      // Table doesn't exist yet
      return [];
    }

    return data?.map((row) => row.version) || [];
  } catch {
    return [];
  }
}

/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  });

  if (error && error.code !== '42P01') {
    // Try direct SQL execution
    console.warn('⚠️  Could not create migrations table via RPC, trying direct SQL...');
    // Note: Direct SQL execution requires pg extension or custom function
  }
}

/**
 * Execute SQL migration
 */
async function executeMigration(sql, version) {
  try {
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';',
        });

        if (error) {
          // Try alternative: execute via PostgREST if possible
          console.warn(`⚠️  RPC exec_sql failed, trying alternative method...`);
          throw error;
        }
      }
    }

    // Mark migration as applied
    await supabase.from('schema_migrations').upsert({
      version,
      applied_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error(`❌ Error executing migration ${version}:`, error.message);
    throw error;
  }
}

/**
 * Load migration file
 */
function loadMigration(filename) {
  const migrationsDir = join(root, 'supabase', 'migrations');
  const filePath = join(migrationsDir, filename);

  if (!existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filePath}`);
  }

  return readFileSync(filePath, 'utf-8');
}

/**
 * Get all migration files
 */
function getMigrationFiles() {
  const migrationsDir = join(root, 'supabase', 'migrations');
  
  if (!existsSync(migrationsDir)) {
    return [];
  }

  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all');
  const migrationName = args.find((arg) => !arg.startsWith('--'));

  console.log('🚀 Running Supabase Migrations...\n');

  // Ensure migrations table exists
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const allMigrations = getMigrationFiles();

  if (allMigrations.length === 0) {
    console.log('⚠️  No migration files found in supabase/migrations/');
    return;
  }

  console.log(`📋 Found ${allMigrations.length} migration(s)\n`);

  const toApply = runAll
    ? allMigrations.filter((m) => !applied.includes(m))
    : migrationName
    ? [migrationName]
    : allMigrations.filter((m) => !applied.includes(m));

  if (toApply.length === 0) {
    console.log('✅ All migrations already applied!\n');
    return;
  }

  for (const migration of toApply) {
    if (applied.includes(migration)) {
      console.log(`⏭️  Skipping ${migration} (already applied)`);
      continue;
    }

    console.log(`📝 Applying ${migration}...`);

    try {
      const sql = loadMigration(migration);
      await executeMigration(sql, migration);
      console.log(`✅ Applied ${migration}\n`);
    } catch (error) {
      console.error(`❌ Failed to apply ${migration}:`, error.message);
      console.error('\n⚠️  Migration failed. Please check the error above.');
      process.exit(1);
    }
  }

  console.log('✅ All migrations completed!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


