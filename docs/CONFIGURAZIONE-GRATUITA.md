# Configurazione Gratuita - Tradelia

## 🎯 Obiettivo

Configurare Tradelia per operare **completamente gratis** con notifiche Push ed Email, senza costi per SMS/WhatsApp.

## ✅ Configurazione Base (Gratuita)

### 1. Push Notifications (Gratuito)

**Variabili d'ambiente necessarie:**

```env
# VAPID Keys per Push Notifications (gratuito)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_SUBJECT=mailto:support@tradelia.org
```

**Come generare VAPID keys:**

```bash
npx web-push generate-vapid-keys
```

**Costo**: €0 (completamente gratuito)

---

### 2. Email Notifications (Gratuito)

**Via Supabase Auth (Raccomandato):**

Supabase include email gratuite fino a **50.000 email/mese**.

**Configurazione:**

1. Vai su Supabase Dashboard → Authentication → Email Templates
2. Personalizza i template (opzionale)
3. **Nessuna configurazione aggiuntiva necessaria** ✅

**Costo**: €0 (fino a 50K email/mese)

**Limiti:**

- Rate limiting: 4 email/secondo
- Branding Supabase (personalizzabile)

---

### 3. In-App Notifications (Gratuito)

**Via Supabase Database:**

Le notifiche in-app sono salvate nel database Supabase (già incluso).

**Costo**: €0 (incluso in Supabase)

---

## 🚫 SMS/WhatsApp (Disabilitati)

### Per Disabilitare Completamente

**Non configurare Twilio:**

```env
# NON aggiungere queste variabili:
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_NUMBER=
```

**Risultato:**

- SMS/WhatsApp non funzioneranno
- Il codice li ignora automaticamente
- L'UI mostra badge "Premium" su SMS/WhatsApp
- Solo Push ed Email sono disponibili

---

## 📋 Checklist Configurazione Gratuita

### ✅ Variabili d'Ambiente Minime

```env
# Supabase (già configurato)
NEXT_PUBLIC_SUPABASE_URL=xxxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Push Notifications (gratuito)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_SUBJECT=mailto:support@tradelia.org

# Email (gratuito via Supabase)
# Nessuna configurazione aggiuntiva necessaria
```

### ❌ Variabili NON Necessarie (per modalità gratuita)

```env
# NON configurare Twilio (SMS/WhatsApp)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_NUMBER=
```

---

## 🎨 Comportamento UI

### Con Configurazione Gratuita

1. **Dashboard → Notifiche**:
   - ✅ Push Notifications: Disponibile
   - ✅ Email: Disponibile (default)
   - ⚠️ SMS: Mostra badge "Premium" (non funziona)
   - ⚠️ WhatsApp: Mostra badge "Premium" (non funziona)

2. **Messaggio Informativo**:
   - Mostra: "Modalità Gratuita: Push e Email sono sempre disponibili (€0/mese)"

3. **Se Utente Seleziona SMS/WhatsApp**:
   - Mostra messaggio: "SMS/WhatsApp richiedono configurazione Twilio"

---

## 💰 Costi Reali

### Configurazione Gratuita (Attuale)

| Servizio             | Costo | Limite       |
| -------------------- | ----- | ------------ |
| Push Notifications   | €0    | Illimitato   |
| Email (Supabase)     | €0    | 50.000/mese  |
| In-App Notifications | €0    | Illimitato   |
| SMS/WhatsApp         | €0    | Disabilitato |

**TOTALE**: **€0/mese** ✅

---

## 🔧 Verifica Configurazione

### Test Push Notifications

1. Vai su Dashboard → Notifiche
2. Clicca "Abilita" su Push Notifications
3. Dovresti vedere il prompt del browser
4. ✅ Funziona se vedi il prompt

### Test Email

1. Vai su Dashboard → Notifiche
2. Seleziona "Email" come metodo preferito
3. Le email vengono inviate automaticamente via Supabase
4. ✅ Funziona se ricevi email

### Test SMS/WhatsApp (Dovrebbe Fallire)

1. Vai su Dashboard → Notifiche
2. Prova a selezionare "SMS" o "WhatsApp"
3. Dovresti vedere messaggio: "SMS/WhatsApp richiedono configurazione Twilio"
4. ✅ Funziona se SMS/WhatsApp non funzionano

---

## 📊 Monitoraggio Costi

### Dashboard Supabase

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su "Usage" → "Email"
4. Verifica che sei sotto 50.000 email/mese

### Alert Automatici

Supabase ti avvisa automaticamente se:

- Superi 80% del limite (40.000 email/mese)
- Superi il limite (50.000 email/mese)

---

## 🚀 Scalabilità Gratuita

### Fino a 50.000 Email/Mese

- **Costo**: €0
- **Utenti stimati**: ~10.000-50.000 (dipende da frequenza notifiche)
- **Configurazione**: Nessuna modifica necessaria

### Oltre 50.000 Email/Mese

**Opzioni:**

1. **Resend** (€20/mese per 50K email)
   - API moderna
   - Template React
   - Analytics

2. **Supabase Pro** (€25/mese)
   - Include 100K email/mese
   - Altri servizi inclusi

3. **Ottimizzazione**
   - Riduci frequenza notifiche
   - Usa più Push (gratuito)
   - Email solo per comunicazioni importanti

---

## ✅ Conclusione

**Tradelia può operare completamente gratis** con:

✅ **Push Notifications**: Gratuito, illimitato  
✅ **Email**: Gratuito fino a 50K/mese (Supabase)  
✅ **In-App**: Gratuito, illimitato  
❌ **SMS/WhatsApp**: Disabilitati (non necessari)

**Costo totale**: **€0/mese** per volumi educativi tipici.

**Per abilitare SMS/WhatsApp in futuro**: Vedi `docs/TWILIO-SETUP.md`
