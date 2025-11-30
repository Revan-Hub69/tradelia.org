# Integrazione Xolo Go - Guida Setup

## Panoramica

Xolo Go è un servizio di pagamento che supporta fatturazione B2B e gestione automatica delle fatture.

**IMPORTANTE**: Xolo Go non ha API, quindi i pagamenti vengono gestiti manualmente.

## Configurazione

### 1. Variabili d'Ambiente

Aggiungi al tuo `.env.local`:

```env
NEXT_PUBLIC_XOLO_PAYMENT_LINK=https://pay.xolo.io
NEXT_PUBLIC_XOLO_IBAN=IT60 X054 2811 1010 0000 0123 4567
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Setup Account Xolo Go

1. Crea account su [Xolo Go](https://xolo.io)
2. Ottieni il link di pagamento e l'IBAN per bonifici
3. Configura le variabili d'ambiente con i valori corretti
4. Abilita supporto per fatturazione B2B

## Flusso Pagamento

### Individuale

1. Utente seleziona piano su `/pricing`
2. Compila form dati personali su `/checkout`
3. Viene creato payment record con status `pending`
4. Utente reindirizzato a `/checkout/payment-instructions`
5. Utente completa pagamento tramite:
   - Link Xolo Go (se disponibile)
   - Bonifico bancario all'IBAN indicato
6. Admin verifica pagamento e conferma manualmente
7. Payment status aggiornato a `completed`
8. User role aggiornato in `user_roles` table

### Business (B2B)

1. Utente seleziona piano Institutional
2. Compila form dati aziendali (P.IVA, ragione sociale, etc.)
3. Seleziona "Richiedi fattura B2B"
4. Viene creato payment record + invoice draft
5. Utente completa pagamento (link o bonifico)
6. Admin verifica pagamento e conferma manualmente
7. Invoice status aggiornato a `issued`
8. Invoice generata e inviata via email

## API Routes

### POST `/api/checkout/create`

Crea una sessione di checkout.

**Request:**
```json
{
  "planId": "pro",
  "planType": "individual",
  "billingCycle": "monthly",
  "price": 29,
  "currency": "EUR",
  "customerData": { ... }
}
```

**Response:**
```json
{
  "paymentId": "uuid"
}
```

### POST `/api/checkout/xolo`

Aggiorna payment record con informazioni Xolo (opzionale, per tracking).

**Request:**
```json
{
  "paymentId": "uuid",
  "xoloPaymentId": "xolo_id",
  "xoloPaymentLink": "https://pay.xolo.io/..."
}
```

### PUT `/api/checkout/xolo`

Conferma pagamento manuale (chiamato dall'admin).

**Request:**
```json
{
  "paymentId": "uuid",
  "xoloPaymentId": "xolo_id" // opzionale
}
```

**Response:**
```json
{
  "success": true
}
```

## Gestione Admin

L'admin può gestire i pagamenti dalla sezione "Pagamenti" nell'admin dashboard:

1. Visualizza tutti i pagamenti (pending, completed, failed)
2. Filtra per status
3. Cerca per ID, email, nome cliente
4. Conferma pagamenti completati manualmente

Quando un pagamento viene confermato:
- Status aggiornato a `completed`
- User role aggiornato automaticamente
- Invoice generata (se B2B richiesta)

## Database Schema

### payments table
- `id`: UUID
- `user_id`: UUID (nullable per guest checkout)
- `amount`: number
- `currency`: string
- `provider`: string ('xolo')
- `status`: string ('pending', 'completed', 'failed')
- `metadata`: JSONB (planId, planType, billingCycle, customerData, xolo_payment_id)

### invoices table
- `id`: UUID
- `user_id`: UUID (nullable)
- `payment_id`: UUID
- `amount`: number
- `currency`: string
- `status`: string ('draft', 'issued', 'paid', 'cancelled')
- `issued_at`: timestamp
- `due_date`: timestamp
- `metadata`: JSONB (customerData, billingCycle)

## Sicurezza

1. **Webhook Signature**: Verifica sempre la signature Xolo
2. **Rate Limiting**: Applica rate limiting alle API routes
3. **Input Validation**: Valida tutti gli input lato server
4. **HTTPS**: Usa sempre HTTPS in produzione

## Testing

Per testare senza Xolo Go reale:
1. Usa mock responses nelle API routes
2. Simula webhook con `PUT /api/checkout/xolo`
3. Testa con paymentId di test

## Note Implementazione

- Guest checkout supportato (user_id può essere null)
- Fatturazione B2B automatica per business plans
- User role aggiornato automaticamente dopo pagamento
- Invoice generata solo se `requireInvoice: true`

