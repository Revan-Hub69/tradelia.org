-- Funzione PostgreSQL per eseguire SQL queries in modo sicuro dall'admin panel
-- Questa funzione deve essere eseguita in Supabase come admin
-- Riferimento: app/api/admin/supabase/execute-sql/route.ts

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
  -- Esegui la query SQL
  -- Per comandi DML (INSERT, UPDATE, DELETE), usiamo EXECUTE
  -- Per comandi DDL (CREATE, ALTER, DROP), usiamo EXECUTE
  
  -- Verifica se è una query SELECT (non supportata direttamente)
  IF upper(trim(sql_query)) LIKE 'SELECT%' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Query SELECT non supportate. Usa la gestione tabelle standard.'
    );
  END IF;

  -- Esegui la query
  EXECUTE sql_query;
  
  -- Ottieni il numero di righe affette (se disponibile)
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Restituisci successo
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Query eseguita con successo',
    'affected_rows', affected_rows
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Restituisci errore in formato JSON
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Commento sulla funzione
COMMENT ON FUNCTION execute_admin_sql(text) IS 
'Funzione per eseguire query SQL dall''admin panel. Richiede privilegi SECURITY DEFINER. 
Solo per uso amministrativo. Le query SELECT non sono supportate per sicurezza.';
