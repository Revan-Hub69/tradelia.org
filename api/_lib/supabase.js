import { createClient } from '@supabase/supabase-js';
import { HttpError } from './http.js';

let cachedClient = null;

export const getServiceSupabase = () => {
  if (cachedClient) return cachedClient;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(
      500,
      'Supabase environment variables missing',
      'Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
};
