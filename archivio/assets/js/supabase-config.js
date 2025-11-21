// /archivio/assets/js/supabase-config.js
// Configurazione Supabase - Tradelia Archivio

// NOTA: process.env non funziona nel browser, usa valori hardcoded o variabili globali
// Per produzione, considera di usare variabili ambiente build-time o configurazione runtime

export const SUPABASE_CONFIG = {
  url: 'https://higkhlfjfhlecbtfnznx.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw',
};

// TODO: Installare Supabase client quando configurato
// npm install @supabase/supabase-js
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
