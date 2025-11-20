# 🔐 Come generare un token admin

## Problema
Se sei admin ma non hai ancora un abbonamento attivo, non hai un token per accedere alla dashboard admin.

## Soluzione

### Opzione 1: API endpoint (Raccomandato)

Usa l'endpoint `/api/generate-admin-token` per generare un token admin.

**Metodo:** `POST`

**Body:**
```json
{
  "email": "tua-email@example.com"
}
```

**Esempio con curl:**
```bash
curl -X POST https://tradelia.org/api/generate-admin-token \
  -H "Content-Type: application/json" \
  -d '{"email": "amministrazione@tradelia.org"}'
```

**Risposta:**
```json
{
  "ok": true,
  "message": "Token admin generato e inviato via email. Controlla la tua casella email."
}
```

**Oppure se l'email non può essere inviata:**
```json
{
  "ok": true,
  "token": "abc123...",
  "message": "Token generato. Email non inviata. Usa il token qui sopra.",
  "warning": "IMPORTANTE: Conserva questo token in un luogo sicuro. Non verrà mostrato di nuovo."
}
```

### Opzione 2: Script SQL diretto (Avanzato)

Se preferisci generare il token direttamente in Supabase:

1. Vai su **Supabase Dashboard → SQL Editor**
2. Esegui questo script (sostituisci `tua-email@example.com`):

```sql
-- Genera token admin manualmente
DO $$
DECLARE
  v_email text := 'tua-email@example.com';
  v_token text;
  v_token_hash text;
  v_user_id uuid;
BEGIN
  -- Verifica che l'email sia admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_emails WHERE email = v_email) THEN
    RAISE EXCEPTION 'Email non è admin: %', v_email;
  END IF;
  
  -- Genera token (32 caratteri hex)
  v_token := encode(gen_random_bytes(16), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  
  -- Cerca user_id se esiste
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = v_email 
  LIMIT 1;
  
  -- Revoca token vecchi
  UPDATE public.dashboard_access_tokens
  SET revoked = true, revoked_at = now()
  WHERE (email = v_email OR user_id = v_user_id)
    AND revoked = false;
  
  -- Inserisci nuovo token
  INSERT INTO public.dashboard_access_tokens (
    user_id,
    email,
    token_hash,
    plan_role,
    valid_until,
    source,
    metadata
  ) VALUES (
    v_user_id,
    v_email,
    v_token_hash,
    'institutional',
    now() + interval '1 year',
    'admin_manual_sql',
    jsonb_build_object('is_admin', true, 'generated_at', now())
  );
  
  -- Mostra il token (SOLO QUI, non verrà mostrato di nuovo!)
  RAISE NOTICE 'TOKEN GENERATO: %', v_token;
  RAISE NOTICE 'IMPORTANTE: Copia questo token ora. Non verrà mostrato di nuovo!';
END $$;
```

**⚠️ IMPORTANTE:** Il token viene mostrato solo nella console SQL di Supabase. Copialo subito!

### Opzione 3: Via Vercel Functions (Se hai accesso)

Se hai accesso a Vercel, puoi chiamare l'endpoint direttamente dal browser console:

```javascript
fetch('/api/generate-admin-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tua-email@example.com' })
})
.then(r => r.json())
.then(console.log);
```

## Requisiti

1. **L'email deve essere in `admin_emails`** in Supabase
   - Vai su Supabase Dashboard → Table Editor → `admin_emails`
   - Aggiungi la tua email se non c'è

2. **BREVO_API_KEY deve essere configurata** (per invio email)
   - Se non configurata, il token viene comunque generato ma mostrato nella risposta API

## Dopo aver ottenuto il token

1. Vai su `/accesso.html`
2. Inserisci il token
3. Clicca "Accedi alla dashboard"
4. Vai su `/user/admin.html` per accedere alla dashboard admin

## Sicurezza

- I token admin hanno scadenza di **1 anno**
- I token vecchi vengono **automaticamente revocati** quando ne generi uno nuovo
- I token sono **hashati** in database (SHA-256)
- Solo l'email in chiaro viene inviata via email (il token hashato è in database)

