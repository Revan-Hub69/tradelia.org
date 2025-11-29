import { supabaseAdmin } from './admin';

const VERIFICATION_TABLES = [
  'reports',
  'report_modules',
  'report_template_versions',
  'credits_log',
  'payments',
  'invoices',
  'user_profiles',
  'user_roles',
  'admin_users',
  'push_subscriptions',
  'user_notification_preferences',
];

interface VerificationResult {
  table: string;
  rowCount: number;
  ok: boolean;
  error?: string;
}

export async function runVerification(target: string = 'all'): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const tables = target === 'all' ? VERIFICATION_TABLES : VERIFICATION_TABLES.filter((t) => t === target);

  for (const table of tables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({ table, rowCount: 0, ok: false, error: error.message });
      } else {
        results.push({ table, rowCount: count ?? 0, ok: true });
      }
    } catch (error: any) {
      results.push({ table, rowCount: 0, ok: false, error: error.message });
    }
  }

  return results;
}
