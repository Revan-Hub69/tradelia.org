# 🔗 Integrazione Supabase con Cursor

## 🎯 Obiettivo

Eseguire script SQL su Supabase **direttamente da Cursor** senza dover copiare/incollare nel SQL Editor.

---

## 🚀 Metodo 1: Supabase CLI (Consigliato)

### ✅ Vantaggi

- ✅ Metodo **ufficiale** Supabase
- ✅ Più affidabile per script complessi
- ✅ Supporta migrazioni, rollback, diff
- ✅ Integrazione con Git

### 📋 Setup

#### 1. Installa Supabase CLI

```bash
npm install -g supabase
```

Oppure con Homebrew (macOS):

```bash
brew install supabase/tap/supabase
```

#### 2. Login

```bash
supabase login
```

Ti aprirà il browser per autenticarti.

#### 3. Link al Progetto

```bash
# Trova il project ref dalla URL Supabase: https://<ref>.supabase.co
supabase link --project-ref <your-project-ref>
```

#### 4. Configura Variabili (Opzionale)

Crea `.env.local` nella root:

```env
SUPABASE_URL=https://xxx.supabase.co
```

### 📝 Uso

#### Eseguire un file SQL specifico:

```bash
npm run supabase:cli:push <file.sql>
```

Esempio:

```bash
npm run supabase:cli:push setup-education-system-simple.sql
```

#### Eseguire tutti i file SQL:

```bash
npm run supabase:cli:push:all
```

#### Lista file disponibili:

```bash
npm run supabase:cli:list
```

---

## 🔧 Metodo 2: API Supabase (Alternativo)

### ⚠️ Limitazioni

- ⚠️ Richiede Service Role Key (sensibile!)
- ⚠️ Non supporta tutti i tipi di query
- ⚠️ Meno affidabile per script complessi

### 📋 Setup

#### 1. Ottieni Service Role Key

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Settings → API
4. Copia **Service Role Key** (⚠️ **NON** anon key!)

#### 2. Configura Variabili

Crea `.env.local` nella root:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Aggiungi `.env.local` a `.gitignore` (già fatto).

### 📝 Uso

```bash
# Eseguire un file SQL
npm run supabase:push <file.sql>

# Lista file disponibili
npm run supabase:push:list

# Eseguire tutti i file (non consigliato)
npm run supabase:push:all
```

---

## 📊 Confronto Metodi

| Caratteristica       | CLI        | API                           |
| -------------------- | ---------- | ----------------------------- |
| **Affidabilità**     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐                        |
| **Sicurezza**        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (richiede service key) |
| **Facilità Setup**   | ⭐⭐⭐     | ⭐⭐⭐⭐                      |
| **Script Complessi** | ✅ Sì      | ⚠️ Limitato                   |
| **Migrazioni**       | ✅ Sì      | ❌ No                         |
| **Rollback**         | ✅ Sì      | ❌ No                         |

**Raccomandazione**: Usa **Supabase CLI** per produzione, API solo per test rapidi.

---

## 🛠️ Script NPM Disponibili

Dopo il setup, hai questi comandi:

```bash
# === CLI Method ===
npm run supabase:cli:push <file.sql>    # Esegui file SQL
npm run supabase:cli:push:all           # Esegui tutti i file
npm run supabase:cli:list               # Lista file disponibili

# === API Method ===
npm run supabase:push <file.sql>        # Esegui file SQL
npm run supabase:push:list              # Lista file disponibili
npm run supabase:push:all               # Esegui tutti i file
```

---

## 🔒 Sicurezza

### ⚠️ Service Role Key

- **NON** committare mai la Service Role Key
- **NON** condividerla pubblicamente
- Usa solo per sviluppo locale
- In produzione, usa variabili d'ambiente Vercel

### ✅ Best Practices

1. **`.env.local`** è già in `.gitignore`
2. Usa **Supabase CLI** quando possibile (più sicuro)
3. Per CI/CD, usa **Vercel Environment Variables**

---

## 🐛 Troubleshooting

### Errore: "Supabase CLI non installato"

```bash
npm install -g supabase
```

### Errore: "Not authenticated"

```bash
supabase login
```

### Errore: "Project not linked"

```bash
supabase link --project-ref <ref>
```

### Errore: "SUPABASE_URL non configurata"

Crea `.env.local` con:

```env
SUPABASE_URL=https://xxx.supabase.co
```

### Errore: "SUPABASE_SERVICE_ROLE_KEY non configurata"

Solo per metodo API. Aggiungi a `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Errore: "Permission denied"

- Verifica di aver fatto `supabase login`
- Verifica che il project ref sia corretto
- Verifica che la Service Role Key sia valida (metodo API)

---

## 📚 Risorse

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Supabase Management API](https://supabase.com/docs/reference/api)
- [Environment Variables Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎯 Prossimi Passi

1. ✅ Installa Supabase CLI
2. ✅ Fai login: `supabase login`
3. ✅ Link progetto: `supabase link --project-ref <ref>`
4. ✅ Prova: `npm run supabase:cli:push setup-education-system-simple.sql`

---

## 💡 Suggerimenti

- **Per sviluppo**: Usa CLI per script complessi
- **Per test rapidi**: Usa API per query semplici
- **Per produzione**: Usa migrazioni Supabase CLI
- **Per debugging**: Usa SQL Editor nel dashboard Supabase
