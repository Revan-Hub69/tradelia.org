# 🚀 Quick Start: Push SQL a Supabase da Cursor

## ⚡ Setup Rapido (5 minuti)

### Opzione 1: Supabase CLI (Consigliato) ⭐

```bash
# 1. Installa Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link progetto (trova project-ref da https://<ref>.supabase.co)
supabase link --project-ref <your-project-ref>

# 4. Configura .env.local (opzionale)
echo "SUPABASE_URL=https://<ref>.supabase.co" > .env.local
```

**Ora puoi eseguire:**

```bash
npm run supabase:cli:push setup-education-system-simple.sql
```

---

### Opzione 2: SQL Editor (Più Semplice)

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona progetto → SQL Editor
3. Copia/incolla script SQL
4. Esegui

**Vantaggio**: Zero configurazione, funziona subito.

---

## 📋 Comandi Disponibili

### Supabase CLI (Metodo Ufficiale)

```bash
# Esegui un file SQL
npm run supabase:cli:push <file.sql>

# Lista tutti i file disponibili
npm run supabase:cli:list

# Esegui tutti i file (attenzione!)
npm run supabase:cli:push:all
```

### API Method (Limitato)

```bash
# Lista file disponibili
npm run supabase:push:list

# Nota: Esecuzione via API non supportata per script complessi
# Usa CLI o SQL Editor invece
```

---

## 🎯 Quale Metodo Usare?

| Scenario               | Metodo Consigliato |
| ---------------------- | ------------------ |
| **Sviluppo rapido**    | SQL Editor         |
| **Script complessi**   | Supabase CLI       |
| **Produzione**         | Supabase CLI       |
| **Team collaboration** | Supabase CLI       |
| **Zero setup**         | SQL Editor         |

---

## 🔧 Troubleshooting

### "Supabase CLI non installato"

```bash
npm install -g supabase
```

### "Not authenticated"

```bash
supabase login
```

### "Project not linked"

```bash
supabase link --project-ref <ref>
```

### "SUPABASE_URL non configurata"

Crea `.env.local`:

```env
SUPABASE_URL=https://xxx.supabase.co
```

---

## 📚 Documentazione Completa

Vedi `docs/SUPABASE-INTEGRATION-CURSOR.md` per dettagli completi.

---

## ✅ Prossimi Passi

1. ✅ Scegli metodo (CLI o SQL Editor)
2. ✅ Setup (se CLI)
3. ✅ Prova: `npm run supabase:cli:push setup-education-system-simple.sql`
4. ✅ Verifica nel dashboard Supabase
