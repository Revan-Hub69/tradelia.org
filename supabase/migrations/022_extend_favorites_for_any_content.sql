-- Extend Favorites for Any Content Type
-- Rimuove limitazioni e permette di salvare qualsiasi contenuto
-- Version: 022
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times

SET search_path = public;

-- ============================================================================
-- EXTEND FAVORITES TABLE
-- ============================================================================

-- Rimuovi il CHECK constraint che limita item_type
ALTER TABLE favorites 
  DROP CONSTRAINT IF EXISTS favorites_item_type_check;

-- Modifica item_id per accettare stringhe (non solo UUID)
-- Prima verifica se la colonna esiste e il tipo
DO $$
BEGIN
  -- Se item_id è UUID, aggiungi una colonna temporanea per migrare i dati
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' 
    AND column_name = 'item_id' 
    AND data_type = 'uuid'
  ) THEN
    -- Aggiungi colonna item_id_string per contenuti generici
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'favorites' 
      AND column_name = 'item_id_string'
    ) THEN
      ALTER TABLE favorites ADD COLUMN item_id_string VARCHAR(500);
      
      -- Copia i dati UUID esistenti come stringhe
      UPDATE favorites 
      SET item_id_string = item_id::text 
      WHERE item_id IS NOT NULL;
    END IF;
    
    -- Rendi item_id nullable (mantieni per retrocompatibilità)
    ALTER TABLE favorites ALTER COLUMN item_id DROP NOT NULL;
  END IF;
END
$$;

-- Se item_id è già VARCHAR, non fare nulla
-- Se non esiste item_id_string, creala
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' 
    AND column_name = 'item_id_string'
  ) THEN
    ALTER TABLE favorites ADD COLUMN item_id_string VARCHAR(500);
  END IF;
END
$$;

-- Aggiungi metadata JSONB per dati aggiuntivi
ALTER TABLE favorites 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Modifica UNIQUE constraint per includere item_id_string
ALTER TABLE favorites 
  DROP CONSTRAINT IF EXISTS favorites_user_id_item_id_item_type_key;

-- Crea nuovo constraint che supporta sia UUID che stringhe
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_item_unique 
  ON favorites(user_id, COALESCE(item_id_string, item_id::text), item_type);

-- Aggiungi commenti
COMMENT ON COLUMN favorites.item_id_string IS 'ID del contenuto come stringa (supporta qualsiasi formato)';
COMMENT ON COLUMN favorites.item_type IS 'Tipo di contenuto (qualsiasi stringa, non più limitato)';
COMMENT ON COLUMN favorites.metadata IS 'Dati aggiuntivi del preferito in formato JSON';
