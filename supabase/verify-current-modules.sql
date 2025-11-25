-- ============================================
-- VERIFICA MODULI CORRENTI NEL DATABASE
-- ============================================
-- Esegui questo per vedere cosa c'è effettivamente nel database
-- ============================================

-- 1. Lista tutti i moduli con dettagli
SELECT 
  id,
  title,
  slug,
  order_index,
  difficulty_level,
  estimated_hours,
  is_active,
  created_at
FROM education_modules
ORDER BY order_index, created_at;

-- 2. Moduli con conteggio lezioni
SELECT 
  m.id,
  m.title as modulo,
  m.slug,
  m.order_index,
  m.difficulty_level,
  m.estimated_hours,
  COUNT(DISTINCT l.id) as num_lezioni,
  COUNT(DISTINCT t.id) as num_test,
  m.is_active
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id AND l.is_active = true
LEFT JOIN education_tests t ON t.module_id = m.id AND t.is_active = true
GROUP BY m.id, m.title, m.slug, m.order_index, m.difficulty_level, m.estimated_hours, m.is_active
ORDER BY m.order_index, m.created_at;

-- 3. Verifica moduli "vecchi" da rimuovere
SELECT 
  id,
  title,
  slug,
  order_index,
  'DA RIMUOVERE' as status
FROM education_modules 
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

-- 4. Verifica moduli "corretti" da mantenere
SELECT 
  id,
  title,
  slug,
  order_index,
  'CORRETTO' as status
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

