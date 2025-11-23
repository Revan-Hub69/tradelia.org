# Sistema Formativo con Gamification - Design Document
## Best Practice Accademica 2025

### 1. Architettura del Sistema

#### 1.1 Moduli Principali (4 moduli sequenziali)

1. **Fondamenti di Finanza Personale** (Beginner - 8h)
   - Target: Neofiti assoluti
   - Contenuti:
     - Cos'è il denaro e come funziona
     - Risparmio vs. Investimento
     - Bilancio personale
     - Fondamenti di inflazione
     - Introduzione ai mercati finanziari
   - Test: 20 domande (Bloom: Remember, Understand)

2. **Gestione del Rischio e Analisi dei Rischi** (Intermediate - 10h)
   - Prerequisito: Modulo 1 completato
   - Contenuti:
     - Tipi di rischio finanziario
     - Valutazione del rischio personale
     - Diversificazione
     - Risk-return tradeoff
     - Analisi di scenari
   - Test: 25 domande (Bloom: Understand, Apply, Analyze)

3. **Approfondimento Universitario** (Advanced - 12h)
   - Prerequisito: Modulo 2 completato
   - Contenuti:
     - Teoria del portafoglio (Markowitz)
     - Analisi fondamentale vs. tecnica
     - Valutazione di asset
     - Casi studio pratici
     - Analisi di mercato
   - Test: 30 domande (Bloom: Apply, Analyze, Evaluate)

4. **Livello Accademico e Scientifico** (Expert - 15h)
   - Prerequisito: Modulo 3 completato
   - Contenuti:
     - Metodologie di ricerca finanziaria
     - Modelli quantitativi avanzati
     - Behavioral finance
     - Ricerca accademica applicata
     - Paper scientifici e loro interpretazione
   - Test: 35 domande (Bloom: Evaluate, Create)

#### 1.2 Percorsi Specializzati (Post-moduli base)

Dopo il completamento dei 4 moduli, l'utente può scegliere uno o più percorsi:

1. **"Mi Interessa"** (Generale)
   - Approfondimenti trasversali
   - Aggiornamenti di mercato
   - Webinar e contenuti premium

2. **"Mettere da Parte ogni Mese"** (Savings)
   - Strategie di risparmio
   - Budgeting avanzato
   - Investimenti a basso rischio
   - Pianificazione a lungo termine

3. **"Gestire il Mio Patrimonio"** (Wealth Management)
   - Wealth management per retail
   - Diversificazione avanzata
   - Pianificazione fiscale
   - Successione e legacy planning

4. **"Speculare e Trading"** (Trading)
   - Analisi tecnica avanzata
   - Trading strategies
   - Gestione del rischio operativo
   - Psicologia del trading

### 2. Sistema di Gamification

#### 2.1 Elementi Gamification (Best Practice)

**Punti (Points)**
- Completamento lezione: 10 punti
- Completamento modulo: 100 punti
- Test superato: 50 punti
- Test perfetto (100%): 100 punti bonus
- Streak giornaliero: 5 punti/giorno

**Livelli (Levels)**
- Livello 1: 0-100 punti (Principiante)
- Livello 2: 101-300 punti (Studente)
- Livello 3: 301-600 punti (Avanzato)
- Livello 4: 601-1000 punti (Esperto)
- Livello 5: 1001+ punti (Maestro)

**Badge/Achievements**
- "Primo Passo": Prima lezione completata
- "Studente Dedicato": Modulo completato
- "Perfetto": Test con 100%
- "Streak 7 Giorni": 7 giorni consecutivi
- "Streak 30 Giorni": 30 giorni consecutivi
- "Maestro": Tutti i 4 moduli completati
- "Velocista": Modulo completato in < 50% tempo stimato
- "Perfezionista": Tutti i test con 100%

**Streak (Giorni consecutivi)**
- Calcolato su attività giornaliera (lezione o test)
- Reset se nessuna attività per 24h
- Bonus punti per streak lunghe

**Certificati**
- Certificato per ogni modulo completato
- Certificato Master al completamento di tutti i 4 moduli
- Certificato per percorso specializzato completato
- PDF scaricabile con codice di verifica

### 3. Sistema di Test (Best Practice Accademica)

#### 3.1 Bloom's Taxonomy Application

**Remember (20% delle domande)**
- Definizioni
- Concetti base
- Terminologia

**Understand (30% delle domande)**
- Spiegazioni
- Parafrasi
- Classificazioni

**Apply (25% delle domande)**
- Casi pratici
- Applicazione di formule
- Risoluzione problemi

**Analyze (15% delle domande)**
- Confronti
- Analisi di scenari
- Identificazione pattern

**Evaluate (7% delle domande)**
- Giudizi critici
- Valutazioni
- Decisioni

**Create (3% delle domande)**
- Progettazione strategie
- Creazione piani
- Sintesi concetti

#### 3.2 Tipi di Domande

1. **Multiple Choice** (70%)
   - 4 opzioni
   - 1 corretta, 3 distrattori plausibili
   - Spiegazione per ogni opzione

2. **True/False** (15%)
   - Con spiegazione dettagliata

3. **Short Answer** (10%)
   - Risposta breve (max 100 caratteri)
   - Valutazione semiautomatica

4. **Case Study** (5%)
   - Scenario reale
   - Domande multiple collegate
   - Valutazione analitica

#### 3.3 Spaced Repetition

- Domande sbagliate riproposte dopo 1, 3, 7 giorni
- Sistema di ripasso automatico
- Focus su aree deboli

### 4. Design UI/UX (Neurologia Applicata)

#### 4.1 Principi di Design Cognitivo

**Chunking (Miller, 1956)**
- Lezioni max 20 minuti
- Pause tra sezioni
- Informazioni raggruppate logicamente

**Progressive Disclosure**
- Informazioni mostrate gradualmente
- Evitare cognitive overload
- Mostrare solo ciò che serve ora

**Visual Hierarchy**
- Colori per difficoltà
- Icone per tipo contenuto
- Progress bars visibili

**Feedback Immediato**
- Conferme visive
- Animazioni microinterazioni
- Toast notifications

#### 4.2 Accessibilità (WCAG 2.2 AAA)

- Contrast ratio minimo 7:1
- Screen reader support completo
- Keyboard navigation
- Focus states visibili
- Testi alternativi per immagini

#### 4.3 Responsive Design

- Mobile-first approach
- Touch-friendly (min 44x44px)
- Leggibilità su tutti i dispositivi
- Offline support (PWA)

### 5. Implementazione Tecnica

#### 5.1 Database Schema

Vedi `supabase/add-education-system-schema.sql`

#### 5.2 API Endpoints

- `GET /api/education?action=modules` - Lista moduli
- `GET /api/education?action=module&moduleId=...` - Dettagli modulo
- `GET /api/education?action=lesson&lessonId=...` - Dettagli lezione
- `POST /api/education?action=update-lesson-progress` - Aggiorna progresso
- `GET /api/education?action=test&testId=...` - Dettagli test
- `POST /api/education?action=submit-test` - Invia test
- `GET /api/education?action=user-progress` - Progresso utente
- `GET /api/education?action=pathways` - Percorsi specializzati

#### 5.3 Frontend Components

- `education.js` - Main education module
- `education-lesson-view.js` - Lesson viewer
- `education-test-view.js` - Test interface
- `education-gamification.js` - Badge, points, levels
- `education-pathways.js` - Specialized paths

### 6. Best Practice Accademiche Applicate

#### 6.1 Pedagogia

- **Constructivism**: Costruzione attiva della conoscenza
- **Scaffolding**: Supporto graduale rimosso
- **Metacognition**: Riflessione sul proprio apprendimento
- **Active Learning**: Partecipazione attiva, non passiva

#### 6.2 Valutazione

- **Formative Assessment**: Feedback continuo durante apprendimento
- **Summative Assessment**: Test finali per verifica competenze
- **Self-Assessment**: Autovalutazione guidata
- **Peer Assessment**: (Futuro) Valutazione tra pari

#### 6.3 Retention

- **Spaced Repetition**: Ripasso distribuito nel tempo
- **Interleaving**: Mescolamento di argomenti correlati
- **Retrieval Practice**: Test come strumento di apprendimento
- **Elaboration**: Approfondimento attivo

### 7. Metriche e Analytics

- Completion rate per modulo
- Tempo medio per completamento
- Tasso di successo test
- Engagement metrics (streak, sessioni)
- Drop-off points
- Domande più difficili
- Feedback utente

### 8. Roadmap Implementazione

**Fase 1: Database e API** ✅
- Schema database
- API endpoints base
- Autenticazione e autorizzazione

**Fase 2: Frontend Base**
- Dashboard moduli
- Viewer lezioni
- Sistema progresso

**Fase 3: Sistema Test**
- Interface test
- Valutazione risposte
- Feedback e spiegazioni

**Fase 4: Gamification**
- Badge system
- Punti e livelli
- Streak tracking
- Certificati

**Fase 5: Percorsi Specializzati**
- Pathway selection
- Contenuti specializzati
- Progress tracking

**Fase 6: Ottimizzazioni**
- Spaced repetition
- Personalizzazione
- Analytics avanzati

### 9. Riferimenti Accademici

- Bloom, B. S. (1956). Taxonomy of Educational Objectives
- Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology
- Sweller, J. (1988). Cognitive Load Theory
- Deterding, S. et al. (2011). Gamification: Using Game Design Elements
- Miller, G. A. (1956). The Magical Number Seven, Plus or Minus Two
- Roediger, H. L. & Karpicke, J. D. (2006). Test-Enhanced Learning
