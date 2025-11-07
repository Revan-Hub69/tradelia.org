# 📋 Setup Votazioni con Supabase - Guida Step by Step

## 🎯 Obiettivo
Configurare le votazioni usando Supabase (gratuito) invece di Vercel KV (a pagamento).

---

## ✅ VANTAGGI

- ✅ **Gratuito** - Supabase free tier è sufficiente
- ✅ **Già configurato** - Abbiamo già Supabase attivo
- ✅ **Nessun servizio esterno** - Tutto in un posto
- ✅ **Più semplice** - Non serve configurare Vercel KV

---

## STEP 1: Aggiungere Tabella Votes in Supabase

### Passo 1.1: Aprire SQL Editor
1. Vai su https://supabase.com e accedi
2. Seleziona il progetto
3. Nel menu laterale, clicca su **SQL Editor**

### Passo 1.2: Eseguire Script SQL
1. Apri il file `/archivio/setup-supabase.sql`
2. **Copia solo questa parte** (la tabella votes):

```sql
-- ===== TABELLA VOTI =====
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL,
  votes INTEGER NOT NULL CHECK (votes >= 1 AND votes <= 10),
  user_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_votes_ticker ON votes(ticker);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(date);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_auth_user_id ON votes(auth_user_id);

-- RLS per votes (tutti possono vedere, solo autenticati possono votare)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono vedere i voti (per ranking pubblico)
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT
  USING (true);

-- Policy: Solo utenti autenticati possono votare
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Utenti possono aggiornare solo i propri voti
CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy: Utenti possono cancellare solo i propri voti
CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE
  USING (auth.uid() = auth_user_id);
```

3. **Incolla** nel SQL Editor di Supabase
4. Clicca su **Run** (o F5)
5. Attendi il completamento

### Passo 1.3: Verificare Tabella
1. Vai su **Table Editor** nel menu laterale
2. Dovresti vedere la tabella **`votes`** nella lista
3. Clicca sulla tabella per vedere la struttura

---

## STEP 2: Verificare API Aggiornata

### Passo 2.1: Verificare File API
Il file `/api/vote.js` è già stato aggiornato per usare Supabase invece di Vercel KV.

### Passo 2.2: Verificare Dipendenze
Assicurati che `@supabase/supabase-js` sia installato:

```bash
npm install @supabase/supabase-js
```

Oppure verifica in `package.json`:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

---

## STEP 3: Testare Votazioni

### Passo 3.1: Test API (GET)
Dopo il deploy, testa l'API:

```bash
curl https://tuo-dominio.vercel.app/api/vote
```

**Dovresti ricevere:**
```json
{"votes":[]}
```
(Array vuoto se non ci sono voti ancora)

### Passo 3.2: Test API (POST)
Per testare l'invio di un voto, devi essere autenticato. Testa dalla dashboard:

1. Vai su `/archivio/dashboard.html`
2. Fai login
3. Vai al tab **"Votazione"**
4. Inserisci un ticker (es. `AAPL`) e voti (1-10)
5. Clicca **"Vota"**
6. Verifica che il ranking si aggiorni

---

## ✅ VERIFICA FINALE

### Checklist:
- [ ] Tabella `votes` creata in Supabase
- [ ] Indici creati
- [ ] RLS policies configurate
- [ ] API `/api/vote.js` aggiornata
- [ ] `@supabase/supabase-js` installato
- [ ] Deploy su Vercel completato
- [ ] Test votazioni funzionante

---

## 🐛 TROUBLESHOOTING

### Errore: "relation votes does not exist"
**Causa**: Tabella non creata
**Soluzione**: Esegui di nuovo lo script SQL

### Errore: "Row Level Security policy violation"
**Causa**: Policies non configurate correttamente
**Soluzione**: Verifica che tutte le policies siano state create

### Errore: "Invalid input syntax for type uuid"
**Causa**: auth_user_id non valido
**Soluzione**: Verifica che l'utente sia autenticato correttamente

---

## 🎉 COMPLETATO!

Ora le votazioni funzionano con Supabase (gratuito) invece di Vercel KV (a pagamento)!

**Vantaggi:**
- ✅ Gratuito
- ✅ Già configurato
- ✅ Più semplice
- ✅ Tutto in un posto

