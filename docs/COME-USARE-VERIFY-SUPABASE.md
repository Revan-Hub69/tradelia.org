# Come Usare lo Script di Verifica Supabase

## Cosa fa lo script?

Lo script controlla se Supabase è configurato correttamente e se tutte le tabelle/funzioni necessarie esistono.

## Come eseguirlo

### Opzione 1: Via npm (consigliato)
```bash
npm run verify-supabase
```

### Opzione 2: Direttamente
```bash
node scripts/verify-supabase.js
```

## Cosa serve prima di eseguirlo?

Lo script ha bisogno delle variabili d'ambiente. Assicurati di avere:

1. **SUPABASE_URL** - L'URL del tuo progetto Supabase
   - Esempio: `https://xxxxx.supabase.co`
   - Dove trovarlo: Supabase Dashboard > Settings > API > Project URL

2. **SUPABASE_SERVICE_ROLE_KEY** - La service role key
   - Esempio: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Dove trovarlo: Supabase Dashboard > Settings > API > service_role key (secreta!)

## Come configurare le variabili d'ambiente

### Su Vercel (produzione)
1. Vai su Vercel Dashboard > Il tuo progetto > Settings > Environment Variables
2. Aggiungi:
   - `SUPABASE_URL` = il tuo URL Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = la tua service role key

### In locale (per test)
Crea un file `.env.local` nella root del progetto:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Oppure esporta le variabili nel terminale:
```bash
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
npm run verify-supabase
```

## Cosa vedrai quando lo esegui?

Lo script mostrerà:

- ✅ **Verde** = Tutto OK
- ❌ **Rosso** = Errore critico (da risolvere)
- ⚠️ **Giallo** = Warning (da verificare)
- ℹ️ **Cyan** = Informazioni

## Esempio di output

```
🔍 Verifica Configurazione Supabase
=====================================

============================================================
1. Verifica Variabili d'Ambiente
============================================================
✓ SUPABASE_URL: https://xxxxx.supabase.co...
✓ SUPABASE_SERVICE_ROLE_KEY configurata

============================================================
2. Test Connessione
============================================================
✓ Connessione a Supabase riuscita

============================================================
3. Verifica Tabelle
============================================================
✓ Tabella dashboard_access_tokens esiste e accessibile
✓ Tabella education_modules esiste e accessibile
...
```

## Cosa fare se ci sono errori?

### Errore: "SUPABASE_URL non configurata"
→ Aggiungi la variabile d'ambiente (vedi sopra)

### Errore: "Tabella X NON ESISTE"
→ Vai in Supabase Dashboard > SQL Editor
→ Esegui gli script SQL in `supabase/` per creare le tabelle

### Errore: "Connessione fallita"
→ Verifica che SUPABASE_URL sia corretto
→ Verifica che SUPABASE_SERVICE_ROLE_KEY sia la service_role (non anon key)

## Quando eseguirlo?

- ✅ Dopo aver configurato Supabase per la prima volta
- ✅ Dopo aver fatto modifiche al database
- ✅ Quando vedi errori 500 nelle API
- ✅ Prima di fare deploy in produzione

## Domande frequenti

**Q: Posso eseguirlo senza variabili d'ambiente?**
A: No, lo script ha bisogno di SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY per funzionare.

**Q: È sicuro eseguirlo?**
A: Sì, lo script solo LEGGE i dati, non modifica nulla.

**Q: Quanto tempo ci vuole?**
A: Di solito 5-10 secondi.

**Q: Cosa significa se vedo "warning"?**
A: Non è critico, ma è meglio verificare. Ad esempio, se non ci sono dati è normale se non hai ancora utenti.
