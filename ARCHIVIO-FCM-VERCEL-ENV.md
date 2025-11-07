# 🔑 Aggiungere Service Account in Vercel - Istruzioni

## ⚠️ IMPORTANTE
**NON committare il file JSON del Service Account!** Contiene informazioni sensibili.

---

## STEP 1: Aggiungere Variabile Ambiente in Vercel

### Passo 1.1: Aprire Vercel Dashboard
1. Vai su https://vercel.com e accedi
2. Seleziona il progetto Tradelia

### Passo 1.2: Aggiungere Variabile Ambiente
1. Vai su **Settings** → **Environment Variables**
2. Clicca su **"Add New"**

### Passo 1.3: Compilare Variabile
1. **Key**: `FIREBASE_SERVICE_ACCOUNT`
2. **Value**: Incolla **TUTTO** il contenuto del file JSON (dall'inizio `{` alla fine `}`)
3. **Environment**: Seleziona tutte:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
4. Clicca su **"Save"**

### Passo 1.4: Aggiungere API Key (Opzionale ma Consigliato)
Per proteggere l'endpoint `/api/send-push`:

1. Clicca su **"Add New"** di nuovo
2. **Key**: `PUSH_API_KEY`
3. **Value**: Una chiave segreta a tua scelta (es. `tradelia-push-secret-2025`)
4. **Environment**: Seleziona tutte
5. Clicca su **"Save"**

---

## STEP 2: Verificare Variabili Ambiente

Dovresti vedere nella lista:
- ✅ `FIREBASE_SERVICE_ACCOUNT`
- ✅ `PUSH_API_KEY` (opzionale)

---

## STEP 3: Riavviare Deploy

### Passo 3.1: Trigger Nuovo Deploy
1. Vai su **Deployments**
2. Clicca sui **tre puntini** (⋮) dell'ultimo deploy
3. Clicca su **"Redeploy"**
4. Oppure fai un commit/push per triggerare un nuovo deploy

### Passo 3.2: Verificare Deploy
1. Attendi che il deploy finisca
2. Verifica che non ci siano errori
3. Controlla i log per eventuali errori

---

## ✅ VERIFICA FINALE

### Test API Send Push
Dopo il deploy, testa l'API:

```bash
curl -X POST https://tuo-dominio.vercel.app/api/send-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tradelia-push-secret-2025" \
  -d '{
    "title": "Test Push",
    "body": "Questa è una notifica di test",
    "data": {
      "url": "/archivio/dashboard.html"
    }
  }'
```

**Dovresti ricevere:**
```json
{
  "success": true,
  "sent": 1,
  "total": 1
}
```

---

## 🐛 TROUBLESHOOTING

### Errore: "FIREBASE_SERVICE_ACCOUNT non configurato"
**Causa**: Variabile ambiente non configurata o deploy non aggiornato
**Soluzione**:
1. Verifica che la variabile ambiente sia presente
2. Riavvia il deploy
3. Verifica che il valore sia corretto (JSON completo)

### Errore: "Invalid service account"
**Causa**: JSON non valido o formattato male
**Soluzione**:
1. Verifica che il JSON sia completo (inizia con `{` e finisce con `}`)
2. Controlla che non ci siano spazi o caratteri extra
3. Copia di nuovo il contenuto del file JSON

---

## 📝 CHECKLIST

- [ ] Variabile `FIREBASE_SERVICE_ACCOUNT` aggiunta in Vercel
- [ ] Variabile `PUSH_API_KEY` aggiunta in Vercel (opzionale)
- [ ] Deploy riavviato
- [ ] API testata e funzionante
- [ ] File JSON del Service Account **NON** committato nel repository

---

## 🎉 COMPLETATO!

Una volta completati tutti gli step, le push notifications sono completamente configurate!

**Prossimi step:**
1. Testare push notifications dalla dashboard
2. Verificare che le subscriptions vengano salvate in Supabase
3. Testare invio push manuale

