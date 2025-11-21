# 🎓 Decisioni: Education e Access

**Data**: 2025-01-XX

---

## 📚 EDUCATION - Percorsi Formativi

### Situazione Attuale
- ✅ Esistono **50+ tutorial** in `/report/tutorial/`
- ✅ C'è `tutorials.html` (da verificare contenuto)
- ✅ Tutorial organizzati per argomento (azioni, ETF, obbligazioni, crypto, etc.)

### Proposta: Sistema Percorsi Formativi

**Struttura Percorsi:**
```
Percorsi Formativi
├── 📊 Analisi Tecnica Base
│   ├── Introduzione Analisi Tecnica
│   ├── Candlestick Patterns
│   ├── Chart Patterns
│   └── Indicatori Tecnici
│
├── 💼 Analisi Fondamentale
│   ├── Valutare Azioni
│   ├── Valutare ETF
│   ├── Valutare Obbligazioni
│   └── Analisi Macroeconomica
│
├── 🎯 Derivati e Strumenti Complessi
│   ├── Opzioni Vanilla
│   ├── Opzioni Esotiche
│   ├── Certificates Complessi
│   └── Note Strutturate
│
├── 🪙 Criptovalute
│   ├── Valutare Crypto
│   ├── Stablecoin Algoritmiche
│   └── Token Sintetici
│
└── 📈 Money Management
    ├── Position Sizing
    ├── Rebalancing Portafoglio
    └── Backtesting
```

### Implementazione

**Opzione A: Percorsi Statici (Veloce - 2-3 ore)**
- Lista percorsi con card
- Link ai tutorial esistenti
- Progress tracking base (localStorage)
- ✅ Vantaggi: Veloce, usa contenuti esistenti
- ⚠️ Svantaggi: Progress non persistente

**Opzione B: Percorsi Completi (Completo - 6-8 ore)**
- Percorsi strutturati con step
- Progress tracking in Supabase
- Certificati completamento
- Badge/achievements
- ✅ Vantaggi: Sistema completo, engagement
- ⚠️ Svantaggi: Più tempo, richiede DB

**Raccomandazione**: **Opzione A** per iniziare, poi espandere a Opzione B.

---

## 🔐 ACCESS - Gestione Accesso

### Situazione Attuale
- ✅ Sistema **token-based** (`tradelia-access-token-v1` in localStorage)
- ✅ API `/api/validate-dashboard-token.js` valida token
- ✅ Pagina `/accesso.html` per login/registrazione
- ✅ Token contiene: email, planRole, validUntil, etc.

### Opzioni

#### **Opzione A: Mantenere Token-Based** ✅ RACCOMANDATO

**Come funziona:**
- Token salvato in localStorage
- Validazione via `/api/validate-dashboard-token`
- Token contiene tutte le info necessarie
- Semplicità: ✅
- Sicurezza: ✅ (token validato server-side)

**Modulo Access Dashboard:**
```javascript
// Mostra info token corrente
- Token attivo: Sì/No
- Email associata
- Piano/Ruolo (Guest, Pro, Desk)
- Scadenza token
- Giorni rimanenti
- Link a /accesso.html per gestione
```

**Vantaggi:**
- ✅ Sistema già funzionante
- ✅ Nessuna migrazione necessaria
- ✅ Semplice da mantenere
- ✅ Compatibile con sistema esistente

**Svantaggi:**
- ⚠️ Token in localStorage (non ideale per sicurezza avanzata)
- ⚠️ Refresh token manuale

---

#### **Opzione B: Migrare a Supabase Auth** ⚠️ COMPLESSO

**Come funzionerebbe:**
- Supabase Auth per login/signup
- Session management automatico
- Refresh token automatico
- Integrazione con Supabase RLS

**Modulo Access Dashboard:**
```javascript
// Gestione completa auth
- Login/Logout
- Cambio password
- Gestione profilo
- Abbonamenti
```

**Vantaggi:**
- ✅ Sicurezza migliore (session-based)
- ✅ Refresh automatico
- ✅ Integrazione nativa Supabase
- ✅ RLS policies

**Svantaggi:**
- ⚠️ Migrazione complessa (tutto il sistema)
- ⚠️ Breaking changes
- ⚠️ Richiede refactoring `/accesso.html`
- ⚠️ 8-12 ore di lavoro

---

## 🎯 Raccomandazione Finale

### Education
✅ **Implementare Percorsi Statici (Opzione A)**
- Lista percorsi organizzati
- Link ai tutorial esistenti
- Progress tracking base (localStorage)
- **Tempo**: 2-3 ore
- **Futuro**: Espandere a sistema completo con Supabase

### Access
✅ **Mantenere Token-Based (Opzione A)**
- Modulo semplice che mostra info token
- Link a `/accesso.html` per gestione completa
- **Tempo**: 1-2 ore
- **Futuro**: Valutare migrazione a Supabase Auth se necessario

---

## 📋 Implementazione Suggerita

### Education Module
```javascript
// assets/js/dashboard/education.js
export async function loadEducation() {
  // Carica percorsi da JSON o hardcoded
  const percorsi = [
    {
      id: 'analisi-tecnica',
      title: 'Analisi Tecnica Base',
      description: 'Impara i fondamenti dell\'analisi tecnica',
      tutorials: [
        { title: 'Introduzione', url: '/report/tutorial/Analisi-Tecnica-Introduzione.html' },
        { title: 'Candlestick', url: '/report/tutorial/Candlestick-Patterns.html' },
        // ...
      ],
      progress: getProgress('analisi-tecnica') // localStorage
    },
    // ...
  ];
  
  renderPercorsi(percorsi);
}
```

### Access Module
```javascript
// assets/js/dashboard/access.js
export async function loadAccess() {
  const token = localStorage.getItem('tradelia-access-token-v1');
  
  if (token) {
    // Valida token e mostra info
    const info = await validateToken(token);
    renderTokenInfo(info);
  } else {
    // Mostra link a /accesso.html
    renderNoToken();
  }
}
```

---

## ✅ Prossimi Step

1. **Education**: Implementare percorsi statici (2-3 ore)
2. **Access**: Modulo info token + link (1-2 ore)
3. **On-Demand**: Form completo (2-3 ore) - PRIORITÀ
4. **Community**: Placeholder con link (0.5 ore)

**Totale**: ~6-8 ore per completare tutti i moduli mancanti.

