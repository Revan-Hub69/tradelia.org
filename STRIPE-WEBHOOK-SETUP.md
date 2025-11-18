# Configurazione Webhook Stripe - Tradelia AI

## Best Practices Accademiche Implementate

Questo webhook segue le best practice accademiche per integrazione pagamenti sicura:

1. **Validazione Firma**: Ogni webhook viene validato usando `stripe.webhooks.constructEvent()` per garantire autenticità
2. **Idempotenza**: Controllo eventi duplicati per evitare processamento multiplo
3. **Logging Strutturato**: Log JSON strutturati per audit trail e debugging
4. **Gestione Errori Robusta**: Try-catch con logging dettagliato, risposte 200 per evitare retry infiniti
5. **Conformità PCI DSS**: Nessun dato carta memorizzato, tutto gestito da Stripe

## Setup Iniziale

### 1. Configurazione Stripe Dashboard

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com) > **Developers** > **Webhooks**
2. Clicca **Add endpoint**
3. URL endpoint: `https://tradelia.org/api/webhook-stripe`
4. Seleziona eventi da ascoltare:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.finalized`
5. Copia il **Signing secret** (inizia con `whsec_...`)
6. Aggiungi come variabile d'ambiente: `STRIPE_WEBHOOK_SECRET`

### 2. Creazione Products e Prices

1. **Piano Pro (€29/mese)**:
   - Vai su **Products** > **Add product**
   - Nome: "Tradelia AI - Piano Pro"
   - Prezzo: €29.00 EUR, Ricorrente mensile
   - Copia il **Price ID** (inizia con `price_...`)

2. **Piano Desk (€149/mese)**:
   - Crea nuovo Product: "Tradelia AI - Piano Desk"
   - Prezzo: €149.00 EUR, Ricorrente mensile
   - Copia il **Price ID**

### 3. Configurazione Price IDs nel Codice

Apri `api/webhook-stripe.js` e aggiorna il mapping:

```javascript
const STRIPE_PRICE_TO_ROLE = {
  'price_1ABC123def456': 'pro',           // Sostituisci con Price ID Pro reale
  'price_1XYZ789ghi012': 'institutional', // Sostituisci con Price ID Desk reale
};
```

### 4. Variabili d'Ambiente Vercel

Aggiungi in Vercel Dashboard > Settings > Environment Variables:

- `STRIPE_SECRET_KEY`: La tua Stripe Secret Key (inizia con `sk_...`)
- `STRIPE_WEBHOOK_SECRET`: Il Signing secret del webhook (inizia con `whsec_...`)
- `SUPABASE_URL`: URL Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key per operazioni webhook

### 5. Test Webhook

1. Usa **Stripe CLI** per testare localmente:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook-stripe
   ```

2. Invia evento di test:
   ```bash
   stripe trigger customer.subscription.created
   ```

3. Verifica i log in Vercel Dashboard > Functions > webhook-stripe

## Eventi Gestiti

| Evento Stripe | Azione |
|--------------|--------|
| `customer.subscription.created` | Crea/aggiorna subscription, sincronizza ruolo utente |
| `customer.subscription.updated` | Aggiorna subscription, sincronizza ruolo |
| `customer.subscription.deleted` | Cancella subscription, scade ruolo |
| `customer.subscription.paused` | Pausa subscription, scade ruolo |
| `checkout.session.completed` | Gestisce checkout completato |
| `invoice.payment_succeeded` | Registra pagamento, aggiorna subscription |
| `invoice.payment_failed` | Aggiorna status subscription a past_due |
| `invoice.finalized` | Traccia fattura finalizzata |

## Logging e Monitoraggio

Tutti gli eventi sono loggati in formato JSON strutturato:

```json
{
  "timestamp": "2025-11-17T10:30:00.000Z",
  "service": "stripe-webhook",
  "event_type": "customer.subscription.created",
  "event_id": "evt_1234567890",
  "status": "success",
  "email": "user@example.com",
  "subscriptionId": "sub_1234567890"
}
```

Monitora i log in:
- Vercel Dashboard > Functions > Logs
- Supabase Dashboard > Logs (se configurato)

## Sicurezza

- ✅ Validazione firma obbligatoria
- ✅ HTTPS richiesto (Vercel gestisce automaticamente)
- ✅ Service role key per operazioni Supabase (non anon key)
- ✅ Nessun dato carta memorizzato
- ✅ Logging senza dati sensibili

## Riferimenti Accademici

- Stripe Webhooks Best Practices (2025)
- PCI DSS Level 1 Compliance
- GDPR Compliance per trattamento dati pagamento
- Idempotency patterns per webhook processing

## Troubleshooting

### Webhook non ricevuto
- Verifica URL endpoint in Stripe Dashboard
- Controlla che il webhook sia attivo (non in test mode se usi produzione)
- Verifica variabili d'ambiente in Vercel

### Signature verification failed
- Verifica che `STRIPE_WEBHOOK_SECRET` sia corretto
- Assicurati che Vercel passi il raw body (configurato in `vercel.json`)

### Ruolo non sincronizzato
- Verifica che Price IDs siano configurati correttamente
- Controlla che l'email nel customer Stripe corrisponda all'utente Supabase
- Verifica log per errori di sincronizzazione

## Supporto

Per problemi o domande: `support@tradelia.org`

