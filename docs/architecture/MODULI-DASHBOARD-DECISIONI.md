# 📋 Decisioni Moduli Dashboard

**Data**: 2025-01-XX  
**Stato**: 🟡 IN DECISIONE

---

## 📊 Stato Attuale Moduli

### ✅ Moduli Completati (7/11)

| Modulo | File | Stato | Funzionalità |
|--------|------|-------|--------------|
| **Overview** | `overview.js` | ✅ Completo | Statistiche, attività recente, quick actions |
| **Reports** | `reports.js` | ✅ Completo | Lista report, ricerca, filtri |
| **Frameworks** | `frameworks.js` | ✅ Completo | Documentazione SRD, MTB, PAC |
| **Requests History** | `requests-history.js` | ✅ Completo | Storico richieste, integrazione Supabase |
| **Notifications** | `notifications.js` | ✅ Completo | Sistema notifiche, Supabase |
| **Settings** | `settings.js` | ✅ Completo | Preferenze, export dati |
| **Resources** | `resources.js` | ✅ Completo | FAQ, guide, supporto |

### ⏳ Moduli Placeholder (4/11)

| Modulo | File | Stato | Priorità | Note |
|--------|------|-------|----------|------|
| **Education** | ❌ Non esiste | ⏳ Placeholder | 🟡 Media | Percorsi formativi, tutorial |
| **Access** | ❌ Non esiste | ⏳ Placeholder | 🟡 Media | Gestione accesso, token, permessi |
| **On-Demand** | ❌ Non esiste | ⏳ Placeholder | 🔴 Alta | Richiesta analisi on-demand |
| **Community** | ❌ Non esiste | ⏳ Placeholder | 🟢 Bassa | Community proposals, votazioni |

---

## 🎯 Decisioni da Prendere

### 1. **Education** - Percorsi Formativi

**Opzioni:**
- **A)** Implementare completamente
  - Lista tutorial/corsi
  - Progress tracking
  - Certificati completamento
  - **Tempo**: 4-6 ore
  
- **B)** Placeholder con link esterni
  - Link a `/tutorials.html` esistente
  - Lista percorsi statici
  - **Tempo**: 1-2 ore
  
- **C)** Rimuovere (se non necessario)
  - Se i tutorial sono già in `/tutorials.html`
  - **Tempo**: 0.5 ore

**Raccomandazione**: **Opzione B** - Placeholder con link, implementazione completa in futuro se necessario.

---

### 2. **Access** - Gestione Accesso

**Opzioni:**
- **A)** Implementare completamente
  - Visualizza token attivo
  - Gestione permessi
  - Storico accessi
  - Rinnovo token
  - **Tempo**: 4-6 ore
  
- **B)** Placeholder minimale
  - Mostra token corrente (se presente)
  - Link a gestione esterna
  - **Tempo**: 1-2 ore
  
- **C)** Rimuovere (se gestito altrove)
  - Se accesso gestito in `/accesso.html`
  - **Tempo**: 0.5 ore

**Raccomandazione**: **Opzione B** - Placeholder minimale, implementazione completa se necessario.

---

### 3. **On-Demand** - Analisi On-Demand ⚠️ PRIORITÀ ALTA

**Opzioni:**
- **A)** Implementare completamente
  - Form richiesta analisi
  - Integrazione Supabase (`analysis_requests`)
  - Validazione token/permessi
  - Tracking stato richieste
  - **Tempo**: 6-8 ore
  
- **B)** Form base + API
  - Form semplice
  - Invio a `/api/request-analysis`
  - **Tempo**: 2-3 ore
  
- **C)** Link esterno
  - Link a pagina dedicata
  - **Tempo**: 0.5 ore

**Raccomandazione**: **Opzione B** - Form base + API, poi espandere.

**Nota**: Questo modulo è **CRITICO** per funzionalità business.

---

### 4. **Community** - Community Proposals

**Opzioni:**
- **A)** Implementare completamente
  - Lista proposals
  - Sistema votazione
  - Integrazione Supabase (`asset_proposals`, `asset_votes`)
  - Filtri e ricerca
  - **Tempo**: 8-10 ore
  
- **B)** Placeholder con link
  - Link a pagina votazioni esistente
  - **Tempo**: 0.5 ore
  
- **C)** Rimuovere (se gestito altrove)
  - Se votazioni già in `/vote.html` o simile
  - **Tempo**: 0.5 ore

**Raccomandazione**: **Opzione B** - Placeholder, implementazione completa in futuro.

**Nota**: Secondo memoria, community proposals devono essere solo per Pro users.

---

## 📝 Piano di Implementazione Suggerito

### Fase 1: Quick Wins (2-3 ore)
1. ✅ **On-Demand** - Form base + API (PRIORITÀ ALTA)
2. ✅ **Education** - Placeholder con link
3. ✅ **Access** - Placeholder minimale
4. ✅ **Community** - Placeholder con link

### Fase 2: Completamento (Futuro)
- On-Demand completo (tracking, stato, etc.)
- Education completo (progress, certificati)
- Access completo (gestione token)
- Community completo (votazioni, proposals)

---

## ❓ Domande da Risolvere

1. **On-Demand**: 
   - Esiste già `/api/request-analysis`? ✅ (da verificare)
   - Quali campi servono nel form?
   - Validazione token necessaria?

2. **Education**:
   - I tutorial sono già in `/tutorials.html`?
   - Serve progress tracking?
   - Serve certificati?

3. **Access**:
   - Il token è gestito in `/accesso.html`?
   - Serve gestione permessi nella dashboard?
   - Serve storico accessi?

4. **Community**:
   - Esiste già sistema votazioni?
   - Solo Pro users? (secondo memoria: sì)
   - Serve integrazione Supabase?

---

## 🎯 Prossimo Step

**Decidere ora:**
1. Quali moduli implementare subito (On-Demand sicuramente)
2. Quali moduli placeholder (Education, Access, Community)
3. Quali moduli rimuovere (se non necessari)

**Raccomandazione**: Implementare **On-Demand** (form base) e creare **placeholder** per gli altri 3 moduli.

---

## 📋 Checklist Decisioni

- [ ] On-Demand: Form base o completo?
- [ ] Education: Link o implementazione?
- [ ] Access: Placeholder o completo?
- [ ] Community: Link o implementazione?
- [ ] Verificare API esistenti
- [ ] Verificare pagine esistenti
- [ ] Definire priorità finali

