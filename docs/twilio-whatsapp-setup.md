# Setup Twilio WhatsApp

## Opzione 1: Sandbox WhatsApp (Test/Inizio)

### Passo 1: Crea account Twilio

1. Vai su https://www.twilio.com/try-twilio
2. Crea account gratuito (hai $15 di credito)

### Passo 2: Attiva WhatsApp Sandbox

1. Vai su Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Ti verrà mostrato un numero sandbox: `whatsapp:+14155238886` (o simile)
3. Ti verrà dato un codice join (es: `join <codice>`)

### Passo 3: Aggiungi numeri al sandbox

Per ogni numero che vuoi notificare:

1. Apri WhatsApp sul telefono
2. Invia un messaggio al numero sandbox: `whatsapp:+14155238886`
3. Invia il messaggio: `join <codice>` (es: `join abc-def-ghi`)
4. Riceverai conferma che il numero è stato aggiunto

### Passo 4: Configura variabili ambiente

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886  # Per SMS (opzionale)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Numero sandbox WhatsApp
```

### Limitazioni Sandbox:

- ✅ Gratuito
- ✅ Funziona subito
- ❌ Puoi inviare solo a numeri che hanno fatto "join"
- ❌ Non puoi ricevere messaggi (solo inviare)

---

## Opzione 2: WhatsApp Business API (Produzione)

### Requisiti:

1. Numero telefono dedicato (non può essere usato con WhatsApp normale)
2. Business verificato su Twilio
3. Approvazione da Twilio per WhatsApp Business

### Passo 1: Richiedi numero WhatsApp Business

1. Twilio Console → Messaging → Senders → WhatsApp
2. Clicca "Request WhatsApp Sender"
3. Compila form business (ragione sociale, sito web, ecc.)
4. Attendi approvazione (1-3 giorni)

### Passo 2: Configura variabili ambiente

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+393491234567  # Il tuo numero Twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+393491234567  # Stesso numero con prefisso whatsapp:
```

### Costi:

- Numero Twilio: ~$1/mese
- Messaggi WhatsApp: ~$0.005/messaggio
- Messaggi SMS: ~$0.01-0.05/messaggio (dipende dal paese)

---

## Test

### Test Sandbox:

```bash
curl -X POST https://tradelia.org/api/send-whatsapp.js \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+393491234567",
    "message": "Test notifica Tradelia"
  }'
```

**Nota**: Il numero `+393491234567` deve aver fatto "join" al sandbox prima!

### Test Produzione:

Stesso comando, ma funziona con qualsiasi numero (dopo approvazione business).

---

## Raccomandazione

**Per iniziare**: Usa il **Sandbox** (gratuito, funziona subito)

- Aggiungi i tuoi numeri di test al sandbox
- Testa l'integrazione
- Quando sei pronto per produzione, richiedi WhatsApp Business

**Per produzione**: Richiedi **WhatsApp Business API**

- Verifica business su Twilio
- Richiedi numero WhatsApp Business
- Configura variabili ambiente con il numero verificato
