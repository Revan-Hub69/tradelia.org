# Verifica Stato Supabase

## Query per Verificare Cosa è Già Presente

Esegui queste query su Supabase SQL Editor per vedere cosa è già stato creato:

```sql
-- Verifica tabelle esistenti
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'education%'
ORDER BY table_name;

-- Verifica moduli esistenti
SELECT id, title, slug, order_index, is_active
FROM education_modules
ORDER BY order_index;

-- Verifica lezioni esistenti
SELECT m.title as modulo, COUNT(l.id) as num_lezioni
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id
GROUP BY m.id, m.title
ORDER BY m.order_index;

-- Verifica policies esistenti
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename LIKE 'education%'
ORDER BY tablename, policyname;

-- Verifica funzioni esistenti
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%education%' OR routine_name LIKE '%spaced%' OR routine_name LIKE '%adaptive%'
ORDER BY routine_name;
```

## File da Eseguire (Versione Idempotente)

I file sono stati aggiornati per essere idempotenti (eseguibili più volte).

Se ricevi errori "already exists", puoi:

1. **Ignorare** (se il file usa `IF NOT EXISTS` o `ON CONFLICT`)
2. **Eseguire solo le parti mancanti**

## Ordine Consigliato

1. ✅ Verifica stato attuale (query sopra)
2. ✅ Esegui file schema (se tabelle mancanti)
3. ✅ Esegui file seed (se contenuti mancanti)
