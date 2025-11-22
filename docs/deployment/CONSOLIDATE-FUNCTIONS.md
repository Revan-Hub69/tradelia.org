# 🔧 Consolidazione Serverless Functions per Limite Vercel

## 📊 Situazione

**Limite Vercel Hobby:** 12 Serverless Functions  
**Funzioni Attuali:** 15 funzioni  
**Da Rimuovere/Consolidare:** 3 funzioni

---

## 📋 Funzioni da Consolidare

### 1. `push.js` → Consolidare in `send-email.js`

**Stato:** ✅ Usato (push notifications)

**Soluzione:**

- Aggiungere parametro `action` a `send-email.js`
- Se `action=push` → gestisce push notifications
- Se `action=email` → gestisce email (comportamento attuale)

**Endpoint Unificato:**

```
POST /api/send-email
{
  "action": "push" | "email",
  "to": "...",
  "subject": "...",
  ...
}
```

**Vantaggi:**

- Riduce da 15 a 14 funzioni
- Logica email/push unificata

---

### 2. `create-user-and-token.js` → Consolidare in `admin.js`

**Stato:** ✅ Usato (admin dashboard)

**Soluzione:**

- Aggiungere parametro `action=create-user-token` a `admin.js`
- Gestisce creazione utente + token in un'unica chiamata

**Endpoint Unificato:**

```
POST /api/admin
{
  "action": "create-user-token",
  "email": "...",
  "profile": "...",
  ...
}
```

**Vantaggi:**

- Riduce da 14 a 13 funzioni
- Logica admin centralizzata

---

### 3. `request-free-token.js` → Verificare se Usato

**Stato:** ⚠️ Da verificare

**Soluzione:**

- Se non usato → Rimuovere
- Se usato → Consolidare in `request-dashboard-token.js` con parametro `type=free`

**Endpoint Unificato:**

```
POST /api/request-dashboard-token
{
  "email": "...",
  "type": "free" | "dashboard",
  ...
}
```

**Vantaggi:**

- Riduce da 13 a 12 funzioni (limite esatto)
- Logica token unificata

---

## 🎯 Piano di Consolidazione

### Step 1: Consolidare `push.js` → `send-email.js`

**Modifiche:**

1. Aggiungere logica push in `send-email.js`
2. Parametro `action` per distinguere email/push
3. Aggiornare frontend per usare nuovo endpoint
4. Rimuovere `push.js`

**Risultato:** 14 funzioni

---

### Step 2: Consolidare `create-user-and-token.js` → `admin.js`

**Modifiche:**

1. Aggiungere logica create-user-token in `admin.js`
2. Parametro `action=create-user-token`
3. Aggiornare frontend admin per usare nuovo endpoint
4. Rimuovere `create-user-and-token.js`

**Risultato:** 13 funzioni

---

### Step 3: Verificare `request-free-token.js`

**Modifiche:**

1. Cercare riferimenti nel codebase
2. Se non usato → Rimuovere
3. Se usato → Consolidare in `request-dashboard-token.js`

**Risultato:** 12 funzioni (limite esatto)

---

## ✅ Checklist

- [ ] Consolidare `push.js` → `send-email.js`
- [ ] Consolidare `create-user-and-token.js` → `admin.js`
- [ ] Verificare uso `request-free-token.js`
- [ ] Rimuovere/consolidare `request-free-token.js`
- [ ] Aggiornare frontend per nuovi endpoint
- [ ] Testare tutte le funzioni
- [ ] Verificare deploy su Vercel

---

## 📝 Note

- **Priorità:** Alta (blocca deploy su Vercel)
- **Tempo Stimato:** 2-3 ore
- **Rischio:** Basso (consolidazione logica, non rimozione)
