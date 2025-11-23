# Piano Implementazione Autenticazione e Gestione Account

**Data**: 2025-01-XX  
**Versione**: 3.0.0  
**Scope**: Sistema completo autenticazione, pagamenti, gestione account

---

## 🎯 Obiettivi

1. **Autenticazione Robusta**
   - Email + Password come metodo principale
   - MFA obbligatorio per account Pro/Institutional
   - Token storage sicuro
   - Session management robusto

2. **Gestione Account**
   - Profilo utente completo
   - Gestione abbonamenti
   - Storico pagamenti
   - Impostazioni sicurezza

3. **Sistema Pagamenti**
   - Integrazione Stripe completa
   - Gestione subscription lifecycle
   - Webhook handling robusto
   - Invoice management

4. **Compliance**
   - NIST 800-63B Level 2
   - OWASP Best Practices
   - MiFID II compliance
   - GDPR compliance

---

## 📋 Architettura Sistema

### **1. Autenticazione Layer**

```
┌─────────────────────────────────────┐
│   Frontend (Dashboard)              │
│   - auth-modal.js (unificato)      │
│   - auth.js (session management)    │
│   - mfa.js (TOTP support)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   API Layer (/api/auth.js)          │
│   - Signup/Login                    │
│   - MFA verification                 │
│   - Token generation/refresh         │
│   - Session management               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Supabase Auth                     │
│   - User management                 │
│   - Password hashing                 │
│   - Email verification              │
└─────────────────────────────────────┘
```

### **2. Account Management Layer**

```
┌─────────────────────────────────────┐
│   Frontend (Dashboard)               │
│   - account-settings.js             │
│   - subscription-management.js      │
│   - payment-history.js              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   API Layer                         │
│   - /api/user.js (profile)          │
│   - /api/billing.js (subscriptions) │
│   - /api/payments.js (history)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Supabase Database                 │
│   - user_roles                      │
│   - subscriptions                   │
│   - payments                        │
│   - invoices                        │
└─────────────────────────────────────┘
```

### **3. Payment Processing Layer**

```
┌─────────────────────────────────────┐
│   Frontend (Dashboard)              │
│   - checkout.js (Stripe Elements)   │
│   - subscription-upgrade.js         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   API Layer                         │
│   - /api/billing.js                 │
│   - /api/webhooks.js (Stripe)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Stripe API                        │
│   - Customers                       │
│   - Subscriptions                   │
│   - Payment Methods                  │
└─────────────────────────────────────┘
```

---

## 🔧 Implementazione Step-by-Step

### **Fase 1: Unificare Autenticazione** (Priorità ALTA)

#### 1.1 Modificare auth-modal.js
- Rimuovere tab "Codice Accesso" (o mantenerlo solo per trial)
- Focus su Email + Password
- Migliorare UX per registrazione/login

#### 1.2 Migliorare Token Storage
- Creare `token-storage.js` con IndexedDB
- Implementare encryption per token
- Fallback a localStorage se IndexedDB non disponibile

#### 1.3 Session Management
- Implementare refresh tokens
- Auto-refresh token prima di scadenza
- Session timeout configurabile

**File da creare/modificare:**
- `assets/js/dashboard/token-storage.js` (NEW)
- `assets/js/dashboard/auth-modal.js` (MODIFY)
- `assets/js/dashboard/session.js` (MODIFY)
- `api/auth.js` (MODIFY - aggiungere refresh token)

---

### **Fase 2: Implementare MFA** (Priorità ALTA)

#### 2.1 Backend MFA Support
- Generare TOTP secret per utente
- Verificare TOTP code
- QR code generation per authenticator apps

#### 2.2 Frontend MFA UI
- Setup MFA flow
- QR code display
- Verification step
- Backup codes generation

**File da creare/modificare:**
- `api/auth.js` (MODIFY - aggiungere MFA endpoints)
- `assets/js/dashboard/mfa.js` (NEW)
- `assets/css/components/mfa.css` (NEW)

---

### **Fase 3: Account Management** (Priorità MEDIA)

#### 3.1 Profile Management
- Visualizza/modifica profilo
- Gestione email
- Cambio password
- Impostazioni privacy

#### 3.2 Subscription Management
- Visualizza abbonamento corrente
- Upgrade/downgrade
- Cancellazione abbonamento
- Storico abbonamenti

**File da creare/modificare:**
- `assets/js/dashboard/account-settings.js` (NEW)
- `assets/js/dashboard/subscription-management.js` (NEW)
- `api/user.js` (MODIFY/CREATE)
- `api/billing.js` (MODIFY)

---

### **Fase 4: Payment System** (Priorità MEDIA)

#### 4.1 Stripe Integration
- Stripe Elements per checkout
- Payment method management
- Subscription creation/update
- Invoice generation

#### 4.2 Webhook Handling
- Subscription events
- Payment success/failure
- Invoice paid
- Customer updated

**File da creare/modificare:**
- `assets/js/dashboard/checkout.js` (NEW)
- `api/billing.js` (MODIFY - Stripe integration)
- `api/webhooks.js` (MODIFY - Stripe webhooks)

---

### **Fase 5: Security Enhancements** (Priorità ALTA)

#### 5.1 Audit Logging
- Log tutti i tentativi di login
- Log token generation/revocation
- Log password changes
- Log subscription changes

#### 5.2 Rate Limiting Migliorato
- Per IP (non solo email)
- Progressive delays
- CAPTCHA dopo N tentativi

**File da creare/modificare:**
- `api/_lib/audit-log.js` (NEW)
- `api/auth.js` (MODIFY - aggiungere audit logging)
- `api/billing.js` (MODIFY - aggiungere audit logging)

---

## 📁 Struttura File Nuova

```
/workspace/
├── assets/
│   └── js/
│       └── dashboard/
│           ├── auth-modal.js (MODIFY - unificato)
│           ├── auth.js (MODIFY - session management)
│           ├── token-storage.js (NEW - IndexedDB)
│           ├── mfa.js (NEW - TOTP support)
│           ├── account-settings.js (NEW)
│           ├── subscription-management.js (NEW)
│           ├── checkout.js (NEW - Stripe)
│           └── payment-history.js (NEW)
├── assets/
│   └── css/
│       └── components/
│           ├── mfa.css (NEW)
│           ├── account-settings.css (NEW)
│           └── checkout.css (NEW)
├── api/
│   ├── auth.js (MODIFY - MFA, refresh tokens)
│   ├── user.js (MODIFY/CREATE - profile management)
│   ├── billing.js (MODIFY - Stripe integration)
│   ├── payments.js (NEW - payment history)
│   ├── webhooks.js (MODIFY - Stripe webhooks)
│   └── _lib/
│       ├── audit-log.js (NEW)
│       └── stripe.js (MODIFY - migliorare)
└── supabase/
    └── migrations/
        ├── add-mfa-tables.sql (NEW)
        ├── add-audit-log-table.sql (NEW)
        └── improve-subscriptions-schema.sql (NEW)
```

---

## 🔐 Security Checklist

- [ ] Token storage sicuro (IndexedDB criptato)
- [ ] MFA implementato (TOTP)
- [ ] Refresh tokens
- [ ] Session timeout
- [ ] Audit logging completo
- [ ] Rate limiting per IP
- [ ] CAPTCHA dopo N tentativi
- [ ] HTTPS only (già gestito da Vercel)
- [ ] CSP completo (già implementato)
- [ ] Input validation completa (già implementato)

---

## 📊 Database Schema Miglioramenti

### **MFA Tables**
```sql
CREATE TABLE user_mfa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Audit Log Table**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Refresh Tokens Table**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Timeline Implementazione

### **Settimana 1: Autenticazione Base**
- Unificare auth-modal.js
- Migliorare token storage
- Session management base

### **Settimana 2: MFA**
- Backend MFA support
- Frontend MFA UI
- Testing

### **Settimana 3: Account Management**
- Profile management
- Subscription management UI
- API endpoints

### **Settimana 4: Payment System**
- Stripe integration completa
- Webhook handling
- Invoice management

### **Settimana 5: Security & Polish**
- Audit logging
- Rate limiting migliorato
- Testing completo
- Documentation

---

## 📚 Riferimenti

- NIST 800-63B
- OWASP Authentication Cheat Sheet
- Stripe API Documentation
- Supabase Auth Documentation
- WebAuthn/FIDO2 Standards
