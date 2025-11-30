# Configurazione Twilio per SMS e WhatsApp

## Panoramica

Tradelia supporta l'invio di notifiche via SMS e WhatsApp tramite Twilio. Questo documento spiega come configurare l'integrazione.

## Servizi Supportati

- **SMS**: Invio notifiche via SMS standard
- **WhatsApp**: Invio notifiche via WhatsApp Business API

## Setup Twilio

### 1. Crea Account Twilio

1. Vai su https://www.twilio.com
2. Crea un account gratuito (include $15 di credito per test)
3. Verifica il tuo numero di telefono

### 2. Ottieni Credenziali

Dalla dashboard Twilio, ottieni:

- **Account SID**: Trova in "Account Info"
- **Auth Token**: Trova in "Account Info" (clicca "View" per rivelarlo)
- **Phone Number**: Un numero Twilio per SMS (gratuito per test)

### 3. Configura WhatsApp (Opzionale)

#### Opzione A: WhatsApp Sandbox (per test)

1. Vai su https://console.twilio.com/us1/develop/sms/sandbox
2. Segui le istruzioni per aggiungere il tuo numero WhatsApp al sandbox
3. Il numero sandbox è: `whatsapp:+14155238886`

#### Opzione B: WhatsApp Business API (per produzione)

1. Richiedi accesso a WhatsApp Business API tramite Twilio
2. Completa la verifica del business
3. Ottieni il numero WhatsApp Business approvato

### 4. Configura Variabili d'Ambiente

Aggiungi al tuo `.env.local`:

```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# SMS Configuration
TWILIO_PHONE_NUMBER=+1234567890  # Il tuo numero Twilio per SMS

# WhatsApp Configuration (opzionale)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox o numero Business
```

### 5. Installa Dipendenze (se necessario)

Twilio usa solo `fetch` nativo, non serve installare pacchetti aggiuntivi.

## Utilizzo

### Configurazione Utente

Gli utenti possono configurare SMS/WhatsApp da:

- Dashboard → Notifiche → Impostazioni
- Seleziona "SMS" o "WhatsApp" come metodo preferito
- Inserisci il numero di telefono (formato internazionale: +39 123 456 7890)

### Invio Notifiche

Le notifiche vengono inviate automaticamente quando:

- Un'analisi è completata
- Un piano sta per scadere
- Ci sono crediti bassi
- Notifiche di sistema

Il sistema invia automaticamente via:

- **SMS** se `notification_method = 'sms'` e `phone_number` è configurato
- **WhatsApp** se `notification_method = 'whatsapp'` e `phone_number` è configurato
- **Push** se l'utente ha abilitato le notifiche push
- **Email** come fallback o se configurato

## Formato Numeri Telefono

Il sistema normalizza automaticamente i numeri:

- `+39 123 456 7890` → `+391234567890`
- `0039 123 456 7890` → `+391234567890`
- `0123 456 7890` (Italia) → `+391234567890`

**Formato richiesto**: Internazionale con prefisso `+` (es. `+393491234567`)

## Costi

### SMS

- **Test**: Gratuito con account trial ($15 di credito = ~1.800 SMS)
- **Produzione**: $0.0083 (~€0.0076) per SMS (Italia/Europa)
- **Numero telefono**: $1.15/mese (~€1.05/mese) per numero locale

### WhatsApp

- **Sandbox**: Gratuito per test (limitato a numeri verificati)
- **Business API**: $0.005 (~€0.0046) per messaggio
- **Tariffe Meta**: Aggiuntive per messaggi modello (variano per paese/tipo)

### Stime Mensili

- **100 notifiche/mese**: ~€2-3/mese
- **1.000 notifiche/mese**: ~€10-15/mese
- **10.000 notifiche/mese**: ~€60-80/mese (con sconti volume)

**Vedi `docs/COSTI-SMS-WHATSAPP.md` per analisi dettagliata e alternative**

## Limitazioni

### Account Trial

- Puoi inviare SMS solo a numeri verificati
- Limiti di rate limiting
- Non adatto per produzione

### Produzione

- Richiede upgrade account Twilio
- Verifica del business per WhatsApp
- Rate limits più alti

## Troubleshooting

### Errore: "Twilio non configurato"

- Verifica che tutte le variabili d'ambiente siano impostate
- Controlla che i valori siano corretti (no spazi extra)

### Errore: "Numero telefono non valido"

- Assicurati che il numero sia in formato internazionale
- Il sistema normalizza automaticamente, ma verifica il formato

### SMS/WhatsApp non arrivano

- Verifica che il numero destinatario sia corretto
- Per account trial, assicurati che il numero sia verificato
- Controlla i log Twilio nella dashboard per dettagli

## Best Practices

1. **Validazione**: Il sistema valida automaticamente i numeri
2. **Normalizzazione**: I numeri vengono normalizzati prima dell'invio
3. **Error Handling**: Gli errori vengono loggati ma non bloccano altre notifiche
4. **Rate Limiting**: Rispetta i limiti Twilio per evitare blocchi
5. **Consenso**: Assicurati di avere il consenso dell'utente prima di inviare SMS/WhatsApp

## Note su Skype

Skype non offre API pubbliche per l'invio di messaggi programmatici. Per questo motivo, Skype non è supportato come metodo di notifica.

Alternative consigliate:

- **WhatsApp**: Più diffuso, API stabile
- **SMS**: Universale, funziona su tutti i dispositivi
- **Push**: Gratuito, immediato

## Supporto

Per problemi con Twilio:

- Documentazione: https://www.twilio.com/docs
- Supporto: https://support.twilio.com
