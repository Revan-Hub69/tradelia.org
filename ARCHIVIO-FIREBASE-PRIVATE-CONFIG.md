# 🔒 Firebase Private Config - Guida

## 📋 File Creato

Ho creato il file **`archivio/firebase-private-config.local.js`** per salvare le chiavi private localmente.

**IMPORTANTE**: Questo file è già nel `.gitignore` e **NON viene committato** per sicurezza.

---

## 📝 Come Usare

### Passo 1: Incollare VAPID Private Key Completa

1. Apri il file `archivio/firebase-private-config.local.js`
2. Trova la riga:
   ```javascript
   export const FIREBASE_VAPID_PRIVATE_KEY = 'E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ';
   ```
3. **Sostituisci** il valore con la VAPID private key completa che hai copiato da Firebase Console
4. **IMPORTANTE**: La chiave che vedi nel modal è troncata. Quando la copi, otterrai la chiave completa (80+ caratteri)

### Passo 2: Formato Corretto

La chiave privata dovrebbe essere una stringa lunga, senza spazi o interruzioni.

**Esempio**:
```javascript
export const FIREBASE_VAPID_PRIVATE_KEY = 'E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ...';
```

**NON deve contenere**:
- Spazi
- A capo
- Caratteri speciali oltre quelli previsti (lettere, numeri, `-`, `_`)

---

## 🔐 Sicurezza

### File Protetto
- ✅ Il file `firebase-private-config.local.js` è nel `.gitignore`
- ✅ **NON viene committato** nel repository
- ✅ Usa questo file solo per sviluppo locale

### Per Produzione
- ✅ Usa **Vercel Environment Variables** per produzione
- ✅ Aggiungi `FIREBASE_VAPID_PRIVATE_KEY` in Vercel → Settings → Environment Variables

---

## 📋 Prossimi Step

1. ✅ File creato: `archivio/firebase-private-config.local.js`
2. ⏳ Incollare VAPID private key completa nel file
3. ⏳ Aggiungere Service Account (quando lo hai)
4. ⏳ Aggiungere in Vercel come variabile ambiente
5. ⏳ Testare push notifications

---

## 🐛 Troubleshooting

### Problema: La chiave sembra troncata
**Soluzione**: Clicca sull'icona di copia in Firebase Console - otterrai la chiave completa negli appunti.

### Problema: Errore di sintassi
**Soluzione**: 
- Verifica che la chiave sia tra virgolette singole `'...'`
- Verifica che non ci siano spazi o a capo
- Verifica che la chiave sia completa

---

**Nota**: Questo file è solo per sviluppo locale. Per produzione, usa sempre Vercel Environment Variables.

