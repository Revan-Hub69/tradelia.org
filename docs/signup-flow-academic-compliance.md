# Compliance Accademica: Flusso Iscrizione/Accesso

**Versione**: 1.0  
**Data**: 2025-01-27  
**Standard Riferimento**: WCAG 2.2 AA, OWASP Authentication, Nielsen Norman Group, W3C WebAuthn

---

## 📚 Fonti Accademiche e Best Practice

### 1. **Nielsen Norman Group (2023-2024)**

- **Principio**: Minimizzare i passaggi di registrazione
- **Raccomandazione**: Massimo 3 campi obbligatori (email, password, conferma password)
- **Feedback**: Validazione in tempo reale, non solo al submit

### 2. **OWASP Authentication Cheat Sheet (2024)**

- **Sicurezza Password**:
  - Minimo 12 caratteri (non 8)
  - Non forzare complessità eccessiva (NIST 800-63B)
  - Password strength indicator visibile
- **Rate Limiting**: Max 5 tentativi login, poi lockout temporaneo
- **HTTPS**: Obbligatorio per tutte le comunicazioni

### 3. **WCAG 2.2 AA (2023)**

- **Accessibilità Form**:
  - Label espliciti per tutti gli input
  - Errori associati ai campi (aria-describedby)
  - Messaggi di errore chiari e azionabili
  - Focus management corretto
- **Keyboard Navigation**: Tutti i controlli accessibili da tastiera
- **Screen Reader**: Annunci appropriati per errori/successi

### 4. **W3C Web Authentication API (2024)**

- **Passwordless**: Considerare WebAuthn per autenticazione senza password
- **Multi-factor**: Supporto 2FA opzionale
- **Biometric**: Supporto Face ID/Touch ID quando disponibile

### 5. **GDPR Compliance (2018)**

- **Consenso Esplicito**: Checkbox per privacy policy (non pre-selezionata)
- **Minimizzazione Dati**: Raccogliere solo dati necessari
- **Trasparenza**: Chiarire come vengono usati i dati

---

## ✅ Piano Proposto vs Best Practice

### **PUNTO 1: Tab Switcher "Codice" | "Email/Password"**

| Best Practice                              | Piano Proposto        | Compliance |
| ------------------------------------------ | --------------------- | ---------- |
| **NNG**: Evitare scelte che confondono     | ✅ Due opzioni chiare | ✅ ALTA    |
| **WCAG**: Navigazione da tastiera          | ⚠️ Da implementare    | ⚠️ MEDIA   |
| **UX**: Indicare quale metodo è più comune | ❌ Manca              | ❌ BASSA   |

**Miglioramenti Necessari**:

- [ ] Aggiungere indicatore visivo quale metodo è consigliato
- [ ] Supporto completo tastiera (Tab, Enter, Arrow keys)
- [ ] Screen reader annuncia opzioni disponibili

---

### **PUNTO 2: Form Registrazione**

| Best Practice                          | Piano Proposto               | Compliance |
| -------------------------------------- | ---------------------------- | ---------- |
| **NNG**: Max 3 campi obbligatori       | ✅ Email, Password, Conferma | ✅ ALTA    |
| **OWASP**: Password strength indicator | ❌ Manca                     | ❌ BASSA   |
| **OWASP**: Rate limiting               | ❌ Manca                     | ❌ BASSA   |
| **WCAG**: Label espliciti              | ✅ Previsto                  | ✅ ALTA    |
| **WCAG**: Errori associati ai campi    | ⚠️ Da verificare             | ⚠️ MEDIA   |
| **GDPR**: Consenso privacy             | ❌ Manca                     | ❌ BASSA   |
| **NNG**: Validazione in tempo reale    | ❌ Manca                     | ❌ BASSA   |

**Miglioramenti Necessari**:

- [ ] Password strength indicator (debole/media/forte)
- [ ] Validazione email in tempo reale (formato + disponibilità)
- [ ] Checkbox privacy policy (non pre-selezionata)
- [ ] Rate limiting su API (max 5 tentativi/ora)
- [ ] Messaggi errore specifici e azionabili

---

### **PUNTO 3: Form Login**

| Best Practice                                | Piano Proposto | Compliance |
| -------------------------------------------- | -------------- | ---------- |
| **OWASP**: Rate limiting                     | ❌ Manca       | ❌ BASSA   |
| **OWASP**: Account lockout                   | ❌ Manca       | ❌ BASSA   |
| **WCAG**: "Password dimenticata" accessibile | ✅ Previsto    | ✅ ALTA    |
| **NNG**: "Ricordami" opzionale               | ❌ Manca       | ❌ BASSA   |
| **W3C**: Supporto passwordless               | ❌ Manca       | ❌ BASSA   |

**Miglioramenti Necessari**:

- [ ] Rate limiting (max 5 tentativi, poi 15 min lockout)
- [ ] Checkbox "Ricordami" (opzionale)
- [ ] Messaggi errore generici (non rivelare se email esiste)
- [ ] Considerare WebAuthn per futuro

---

### **PUNTO 4: API Signup/Login**

| Best Practice                               | Piano Proposto       | Compliance |
| ------------------------------------------- | -------------------- | ---------- |
| **OWASP**: Password hashing (bcrypt/argon2) | ✅ Supabase gestisce | ✅ ALTA    |
| **OWASP**: HTTPS obbligatorio               | ✅ Vercel gestisce   | ✅ ALTA    |
| **OWASP**: CSRF protection                  | ⚠️ Da verificare     | ⚠️ MEDIA   |
| **GDPR**: Logging minimo                    | ⚠️ Da verificare     | ⚠️ MEDIA   |
| **OWASP**: Email verification               | ✅ Previsto          | ✅ ALTA    |

**Miglioramenti Necessari**:

- [ ] Verificare CSRF protection (Vercel/Next.js)
- [ ] Logging minimo (no password in log)
- [ ] Email verification obbligatoria prima di login
- [ ] Token expiration ragionevole (30 giorni max)

---

### **PUNTO 5: Integrazione Token ↔ Email/Password**

| Best Practice              | Piano Proposto   | Compliance |
| -------------------------- | ---------------- | ---------- |
| **NNG**: Coerenza UX       | ✅ Stesso step 2 | ✅ ALTA    |
| **Security**: Token sicuro | ✅ Hash SHA-256  | ✅ ALTA    |
| **UX**: Transizione fluida | ✅ Automatica    | ✅ ALTA    |

**Compliance**: ✅ ALTA

---

## 🔴 LACUNE CRITICHE IDENTIFICATE

### 1. **Password Strength Indicator** (Priorità: ALTA)

- **Problema**: Nessun feedback visivo sulla forza password
- **Soluzione**: Implementare indicatore debole/media/forte con colori
- **Riferimento**: OWASP, NIST 800-63B

### 2. **Rate Limiting** (Priorità: ALTA)

- **Problema**: Nessuna protezione contro brute force
- **Soluzione**: Max 5 tentativi/ora, poi lockout 15 min
- **Riferimento**: OWASP Authentication Cheat Sheet

### 3. **GDPR Compliance** (Priorità: ALTA)

- **Problema**: Manca checkbox consenso privacy
- **Soluzione**: Checkbox non pre-selezionata + link privacy policy
- **Riferimento**: GDPR Art. 7

### 4. **Validazione Real-time** (Priorità: MEDIA)

- **Problema**: Validazione solo al submit
- **Soluzione**: Validazione formato email + disponibilità in tempo reale
- **Riferimento**: Nielsen Norman Group 2024

### 5. **Accessibilità Keyboard** (Priorità: MEDIA)

- **Problema**: Tab switcher non navigabile da tastiera
- **Soluzione**: Supporto completo Tab, Enter, Arrow keys
- **Riferimento**: WCAG 2.2.1 Keyboard

---

## 📊 Compliance Score

| Categoria         | Score | Note                                         |
| ----------------- | ----- | -------------------------------------------- |
| **Sicurezza**     | 6/10  | Manca rate limiting, password strength       |
| **Accessibilità** | 7/10  | Buona base, migliorare keyboard nav          |
| **UX**            | 7/10  | Buona struttura, manca validazione real-time |
| **GDPR**          | 5/10  | Manca consenso esplicito                     |
| **Best Practice** | 6/10  | Buona base, miglioramenti necessari          |

**TOTALE: 6.2/10** - **COMPLIANCE: MEDIA**

---

## ✅ Piano Migliorato (Compliance ALTA)

### **FASE 1: Fondamenta (Priorità ALTA)**

1. ✅ Tab switcher con keyboard navigation
2. ✅ Password strength indicator
3. ✅ Rate limiting API (5 tentativi/ora)
4. ✅ Checkbox privacy policy (GDPR)
5. ✅ Validazione email real-time

### **FASE 2: Sicurezza (Priorità ALTA)**

6. ✅ Account lockout dopo 5 tentativi
7. ✅ Messaggi errore generici (non rivelare email esistente)
8. ✅ CSRF protection verificata
9. ✅ Logging minimo (no password)

### **FASE 3: UX Avanzata (Priorità MEDIA)**

10. ✅ Checkbox "Ricordami" opzionale
11. ✅ Indicatore metodo consigliato
12. ✅ Transizioni fluide tra stati

### **FASE 4: Futuro (Priorità BASSA)**

13. ⚠️ WebAuthn passwordless (futuro)
14. ⚠️ 2FA opzionale (futuro)

---

## 📚 Riferimenti Accademici

1. **Nielsen Norman Group** (2024). "Login Form Best Practices"
2. **OWASP** (2024). "Authentication Cheat Sheet"
3. **W3C** (2023). "WCAG 2.2 Guidelines"
4. **NIST** (2020). "SP 800-63B: Digital Identity Guidelines"
5. **GDPR** (2018). "Regulation (EU) 2016/679"

---

## 🎯 Conclusione

Il piano proposto ha una **buona base** ma necessita di **miglioramenti critici** per raggiungere compliance ALTA:

- ✅ **Struttura**: Solida
- ⚠️ **Sicurezza**: Migliorare rate limiting e password strength
- ⚠️ **GDPR**: Aggiungere consenso esplicito
- ⚠️ **Accessibilità**: Migliorare keyboard navigation
- ⚠️ **UX**: Aggiungere validazione real-time

**Raccomandazione**: Implementare FASE 1 e FASE 2 prima del deploy.
