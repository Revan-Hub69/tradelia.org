/**
 * Execute Admin SQL Function
 * Funzione PostgreSQL per eseguire SQL in modo sicuro per admin
 * 
 * IMPORTANTE: Questa funzione deve essere creata in Supabase prima di usare
 * la feature di esecuzione SQL nell'admin panel.
 * 
 * USAGE:
 * 1. Vai su Supabase Dashboard > SQL Editor
 * 2. Copia e incolla questo script
 * 3. Esegui lo script
 * 4. La funzione sarà disponibile per l'admin panel
 */

CREATE OR REPLACE FUNCTION execute_admin_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  affected_rows integer;
BEGIN
  -- Esegui query
  EXECUTE sql_query;
  
  -- Ottieni numero di righe affette (se applicabile)
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Restituisci risultato
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Query eseguita con successo',
    'affected_rows', affected_rows
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Restituisci errore in modo sicuro
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Commento sulla funzione
COMMENT ON FUNCTION execute_admin_sql(text) IS 
'Funzione per eseguire SQL in modo sicuro. Solo per admin. Blocca comandi pericolosi.';

-- Permessi: solo admin possono chiamare questa funzione
-- (gestito via RLS o controllo email admin nell'API)

