#!/usr/bin/env node

/**
 * Check Supabase Project
 * Verifica quale progetto Supabase stai usando e mostra info
 * 
 * Usage: node scripts/supabase/check-project.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  console.error('\n💡 Check your .env.local file for:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔍 Checking Supabase Project...\n');
console.log('📋 Project URL:', SUPABASE_URL);
console.log('🔑 Service Role Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkProject() {
  try {
    // Try to get project info
    const { data: health, error: healthError } = await supabase
      .from('_realtime')
      .select('*')
      .limit(1);

    // Extract project ID from URL
    const projectMatch = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/);
    const projectId = projectMatch ? projectMatch[1] : 'unknown';

    console.log('📊 Project ID:', projectId);
    console.log('🌐 Dashboard URL:', `https://app.supabase.com/project/${projectId}\n`);

    // Check tables
    console.log('📋 Checking tables...\n');
    
    const importantTables = [
      'user_profiles',
      'user_roles',
      'subscriptions',
      'payments',
      'reports',
      'orders',
      'invoices',
    ];

    for (const table of importantTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error || error.code === 'PGRST116') {
          console.log(`✅ ${table} - EXISTS`);
        } else if (error.code === '42P01') {
          console.log(`❌ ${table} - NOT FOUND`);
        } else {
          console.log(`⚠️  ${table} - ${error.message}`);
        }
      } catch {
        console.log(`❌ ${table} - NOT FOUND`);
      }
    }

    console.log('\n💡 IMPORTANT:');
    console.log('   1. Go to Supabase Dashboard → Database → Backups');
    console.log('   2. Check if there are automatic backups available');
    console.log('   3. If yes, you can restore from backup');
    console.log('   4. If no, check if you have manual backups');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProject();

