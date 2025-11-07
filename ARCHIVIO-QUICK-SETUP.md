# ⚡ Setup Rapido Dashboard - Checklist Essenziale

## 🎯 Passaggi Essenziali (15 minuti)

### 1. Supabase (5 min)
- [ ] Esegui `/archivio/setup-supabase.sql` in Supabase SQL Editor
- [ ] Verifica che le tabelle `subscribers` e `push_subscriptions` siano create
- [ ] Crea un utente di test in Authentication → Users

### 2. Vercel KV (3 min)
- [ ] Crea database KV in Vercel Storage
- [ ] Aggiungi variabili d'ambiente: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

### 3. Test (5 min)
- [ ] Vai su `/archivio/dashboard.html`
- [ ] Fai login con utente di test
- [ ] Testa votazione (tab Votazione)

### 4. FCM (Opzionale - 5 min)
- [ ] Se vuoi push notifications, completa configurazione FCM
- [ ] Aggiorna `/archivio/assets/js/fcm-config.js` con credenziali Firebase

---

## 📋 Verifica Rapida

### ✅ Supabase
```sql
-- Esegui in SQL Editor per verificare
SELECT COUNT(*) FROM subscribers;
SELECT COUNT(*) FROM push_subscriptions;
```

### ✅ Vercel KV
```bash
# Test API votazioni
curl https://tuo-dominio.vercel.app/api/vote
# Dovrebbe restituire: {"votes":[]}
```

### ✅ Dashboard
1. Apri `/archivio/dashboard.html`
2. Login funziona? ✅
3. Tab Report mostra report? ✅
4. Tab Votazione funziona? ✅

---

## 🚨 Problemi Comuni

**"Failed to fetch" su API**
→ Verifica che Vercel KV sia configurato e deployato

**"Row Level Security policy violation"**
→ Esegui di nuovo lo script SQL completo

**"KV connection failed"**
→ Controlla variabili d'ambiente Vercel

---

Per dettagli completi, vedi: `ARCHIVIO-SETUP-MANUALE.md`

