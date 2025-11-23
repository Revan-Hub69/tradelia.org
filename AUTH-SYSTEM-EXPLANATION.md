# Sistema Autenticazione Tradelia - Spiegazione

## 🔍 Situazione Attuale

Il sistema supporta **DUE metodi di autenticazione**:

### 1. **Codice di Accesso (Token)** - Metodo Principale
- **Come funziona**: Utente riceve un codice via email (gratuito o con piano attivo)
- **Dove si usa**: 
  - Tab "Codice Accesso" nel modale dashboard
  - Pagina `/accesso.html`
- **Validità**: 30 giorni (gratuito) o fino a scadenza piano
- **Storage**: `localStorage.setItem("tradelia-access-token-v1", code)`
- **API**: `/api/auth?action=validate` (valida token)
- **API**: `/api/auth?action=free-token` (richiesta codice gratuito)
- **API**: `/api/auth?action=token` (richiesta codice per piano attivo)

### 2. **Email + Password** - Metodo Alternativo
- **Come funziona**: Utente si registra con email/password, verifica email, poi fa login
- **Dove si usa**: 
  - Tab "Login" e "Registrati" nel modale dashboard
- **Validità**: Fino a scadenza piano o revoca
- **Storage**: `localStorage.setItem("tradelia-access-token-v1", token)` (stesso key!)
- **API**: `/api/auth?action=signup` (registrazione)
- **API**: `/api/auth?action=login` (login)
- **Backend**: Usa Supabase Auth per gestire password

## ⚠️ Problema: Confusione

**Entrambi i metodi salvano nello stesso posto** (`tradelia-access-token-v1`), ma:
- Il codice è un **token pre-generato** inviato via email
- Il login genera un **nuovo token** dopo autenticazione email/password

## 🤔 Domande da Chiarire

1. **Quale metodo è il principale?**
   - Codice di accesso (attualmente più prominente)
   - Email + Password (più tradizionale)

2. **Vuoi mantenere entrambi?**
   - ✅ Pro: Flessibilità (codice per trial, password per account permanenti)
   - ❌ Contro: Confusione utente, doppia manutenzione

3. **Vuoi unificare?**
   - Opzione A: Solo codice (più semplice, meno sicuro)
   - Opzione B: Solo email/password (più tradizionale, più sicuro)
   - Opzione C: Codice per trial, password per account (ibrido)

## 📋 Raccomandazione

**Suggerisco di mantenere entrambi ma chiarire meglio:**

1. **Codice di Accesso** = Per utenti trial/gratuiti o che preferiscono accesso rapido
2. **Email + Password** = Per utenti che vogliono account permanente

**Miglioramenti UX:**
- Spiegare meglio la differenza nel modale
- Rendere più chiaro quale metodo usare
- Forse unificare il flusso (se registri con email/password, non serve più codice)

## 🔧 Opzioni di Refactoring

### Opzione 1: Unificare a Email/Password (Raccomandato)
- Rimuovere tab "Codice Accesso"
- Tutti gli utenti si registrano con email/password
- Codice di accesso solo per admin/manuale

### Opzione 2: Unificare a Codice (Più Semplice)
- Rimuovere tab "Login" e "Registrati"
- Tutti gli utenti ricevono codice via email
- Più semplice ma meno sicuro

### Opzione 3: Mantenere Entrambi ma Chiarire
- Migliorare UI per spiegare differenza
- Guidare utente verso metodo appropriato
- Unificare storage/validazione backend
