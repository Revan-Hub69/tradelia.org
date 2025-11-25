-- ============================================
-- CLEANUP MODULI VECCHI
-- ============================================
-- Rimuove moduli vecchi/non corretti e ricarica quelli giusti
-- ============================================

-- 1. Rimuovi moduli vecchi (quelli che vedi nella dashboard)
DELETE FROM education_lessons WHERE module_id IN (
  SELECT id FROM education_modules 
  WHERE slug IN (
    'fondamenti-finanza-personale',
    'approfondimento-universitario',
    'livello-accademico-scientifico'
  )
  OR title IN (
    'Fondamenti di Finanza Personale',
    'Approfondimento Universitario',
    'Livello Accademico e Scientifico'
  )
);

DELETE FROM education_tests WHERE module_id IN (
  SELECT id FROM education_modules 
  WHERE slug IN (
    'fondamenti-finanza-personale',
    'approfondimento-universitario',
    'livello-accademico-scientifico'
  )
  OR title IN (
    'Fondamenti di Finanza Personale',
    'Approfondimento Universitario',
    'Livello Accademico e Scientifico'
  )
);

DELETE FROM education_modules 
WHERE slug IN (
  'fondamenti-finanza-personale',
  'approfondimento-universitario',
  'livello-accademico-scientifico'
)
OR title IN (
  'Fondamenti di Finanza Personale',
  'Approfondimento Universitario',
  'Livello Accademico e Scientifico'
);

-- 2. Verifica moduli corretti esistenti
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count 
  FROM education_modules 
  WHERE slug IN (
    'fondamenti-investimento',
    'gestione-rischio',
    'risparmio',
    'strumenti-finanziari',
    'wealth-management',
    'trading-speculazione'
  )
  OR title LIKE '%Fondamenti di Investimento%'
  OR title LIKE '%Gestione del Rischio%'
  OR title LIKE '%Risparmio%'
  OR title LIKE '%Strumenti Finanziari%'
  OR title LIKE '%Wealth Management%'
  OR title LIKE '%Trading%';
  
  RAISE NOTICE '✅ Moduli corretti trovati: %', v_count;
  
  IF v_count = 0 THEN
    RAISE NOTICE '⚠️ Nessun modulo corretto trovato. Esegui i file seed-education-*.sql per creare i moduli corretti.';
  END IF;
END $$;

-- 3. Query per verificare cosa c'è nel database
-- Esegui queste query per vedere lo stato attuale:

-- SELECT 
--   id,
--   title,
--   slug,
--   order_index,
--   difficulty_level,
--   estimated_hours,
--   is_active
-- FROM education_modules
-- ORDER BY order_index;

-- SELECT 
--   m.title as modulo,
--   COUNT(l.id) as num_lezioni
-- FROM education_modules m
-- LEFT JOIN education_lessons l ON l.module_id = m.id
-- GROUP BY m.id, m.title
-- ORDER BY m.order_index;

