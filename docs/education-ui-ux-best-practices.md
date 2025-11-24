# Best Practice UI/UX per Sistema Educativo

## 📚 Riferimenti Accademici

- **Nielsen (1994)**: "10 Usability Heuristics for User Interface Design"
- **Norman (2013)**: "The Design of Everyday Things"
- **Munzner (2014)**: "Visualization Analysis & Design"
- **Segel & Heer (2010)**: "Narrative Visualization: Telling Stories with Data"
- **Sailer et al. (2017)**: "How Gamification Motivates: An Experimental Study"
- **Deterding et al. (2011)**: "From Game Design Elements to Gamefulness"
- **WCAG 2.2**: Web Content Accessibility Guidelines

## 🎨 Design System

### 1. Visual Hierarchy

**Principio**: Importanza visiva = Importanza informativa

**Implementazione:**

- **Titoli**: H1 (32px) → H6 (14px), weight 700 → 400
- **Contenuto**: Body 16px, line-height 1.6
- **Contrasto**: Minimo 4.5:1 (WCAG AA), preferibile 7:1 (WCAG AAA)
- **Spaziatura**: 8px grid system (4px, 8px, 16px, 24px, 32px, 48px)

**Paper:**

> Norman (2013): "The Design of Everyday Things"

### 2. Color System

**Palette Educativa:**

- **Primary**: Blu (trust, knowledge) - `#2563EB`
- **Success**: Verde (completamento) - `#10B981`
- **Warning**: Arancione (attenzione) - `#F59E0B`
- **Error**: Rosso (errore) - `#EF4444`
- **Info**: Ciano (informazione) - `#06B6D4`
- **Neutral**: Grigi (testo, sfondi) - `#6B7280` → `#F9FAFB`

**Accessibilità:**

- Tutti i colori testati per contrasto WCAG 2.2 AA
- Non usare solo colore per comunicare (aggiungere icona/testo)

### 3. Typography

**Font Stack:**

```css
font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
  "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
```

**Scale:**

- **H1**: 32px / 1.2 (38.4px line-height)
- **H2**: 24px / 1.3 (31.2px)
- **H3**: 20px / 1.4 (28px)
- **Body**: 16px / 1.6 (25.6px)
- **Small**: 14px / 1.5 (21px)
- **Tiny**: 12px / 1.4 (16.8px)

**Paper:**

> Bringhurst (2004): "The Elements of Typographic Style"

### 4. Spacing System

**8px Grid:**

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

**Uso:**

- Padding interno componenti: md (16px)
- Gap tra elementi: md (16px)
- Margin sezioni: xl (32px)
- Spazio respiro: 2xl (48px)

## 🎮 Gamification Professionale

### 1. Progression System

**Livelli (Non Competitivi):**

- **Foundation** (1-100 XP): Base
- **Explorer** (101-300 XP): Intermedio
- **Scholar** (301-600 XP): Avanzato
- **Master** (601-1000 XP): Esperto
- **Grandmaster** (1000+ XP): Maestro

**XP Sources:**

- Completare lezione: 10 XP
- Quiz start: 10 XP
- Quiz end: 20 XP
- Test finale: 50 XP
- Test perfetto (100%): +25 XP bonus
- Spaced repetition session: 15 XP
- Reflection completata: 5 XP

**Paper:**

> Sailer et al. (2017): "How Gamification Motivates: An Experimental Study of the Effects of Specific Game Design Elements on Psychological Need Satisfaction", Computers in Human Behavior

### 2. Badge System Avanzato

**Categorie Badge:**

#### Achievement Badges

- **First Steps**: Prima lezione completata
- **Dedicated Learner**: 10 lezioni completate
- **Module Master**: Modulo completato
- **Perfect Score**: Test 100%
- **Speed Learner**: Modulo completato in < tempo medio

#### Milestone Badges

- **Week Warrior**: 7 giorni streak
- **Month Master**: 30 giorni streak
- **Century Club**: 100 giorni streak
- **Point Collector**: 1000 XP totali
- **Knowledge Seeker**: 5000 XP totali

#### Special Badges

- **Risk Expert**: Modulo Rischio completato
- **Reflection Master**: 50 reflection completate
- **Spaced Repetition Pro**: 100 sessioni spaced repetition
- **Retrieval Champion**: 200 retrieval practice completati

**Design:**

- Icone SVG custom
- Animazioni al unlock (confetti, scale)
- Tooltip con descrizione
- Progress bar per badge progressivi

**Paper:**

> Deterding et al. (2011): "From Game Design Elements to Gamefulness: Defining Gamification"

### 3. Progress Visualization

**Componenti:**

#### Progress Bar

- **Visual**: Barra lineare con percentuale
- **Color**: Verde (completato), Blu (in progress), Grigio (non iniziato)
- **Animation**: Smooth transition su update
- **Accessibility**: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

#### Circular Progress

- **Uso**: Completamento modulo/lezione
- **Visual**: Cerchio con percentuale centrale
- **Animation**: Smooth fill animation

#### Progress Steps

- **Uso**: Percorso multi-step
- **Visual**: Step indicator con connessioni
- **States**: Completed, Active, Pending

**Paper:**

> Munzner (2014): "Visualization Analysis & Design"

### 4. Streak System

**Meccanica:**

- **Daily Streak**: Studia almeno 1 lezione/quiz al giorno
- **Visual**: Fiamma icona con numero giorni
- **Rewards**:
  - 7 giorni: +50 XP
  - 30 giorni: +200 XP + Badge
  - 100 giorni: +500 XP + Badge speciale

**UX:**

- Notifica se streak a rischio (manca 1 giorno)
- Visualizzazione calendario con giorni completati
- Animazione quando si mantiene streak

### 5. Leaderboards (Non Competitivi)

**Principio**: Focus su miglioramento personale, non competizione.

**Tipi:**

- **Personal Progress**: Solo i tuoi progressi
- **Anonymous Comparison**: "Sei nel top 20%" (senza nomi)
- **Community Goals**: Obiettivi collettivi (es. "1000 utenti hanno completato Modulo 1")

**Paper:**

> Sailer et al. (2017): "Leaderboards possono demotivare se troppo competitive. Focus su self-improvement."

## 🎯 UI Components Best Practice

### 1. Lesson Card

**Design:**

- **Layout**: Card con immagine/icona, titolo, descrizione, progress bar
- **States**: Locked, Available, In Progress, Completed
- **Hover**: Elevation increase, scale 1.02
- **Click**: Smooth transition a lezione

**Accessibility:**

- `role="button"` se cliccabile
- `aria-label` descrittivo
- Keyboard navigation (Enter/Space)
- Focus visible

### 2. Quiz Component

**Design:**

- **Layout**: Domanda prominente, opzioni chiaramente separate
- **Feedback**: Immediato con animazione
- **Correct**: Verde con checkmark
- **Incorrect**: Rosso con X, mostra risposta corretta
- **Explanation**: Espansa dopo risposta

**UX:**

- Disabilita submit durante processing
- Loading state durante submit
- Success animation al completamento
- Progress indicator (domanda X di Y)

**Paper:**

> Roediger & Karpicke (2006): "Test-Enhanced Learning"

### 3. Progress Dashboard

**Design:**

- **Layout**: Grid di metriche chiave
- **Visual**: Cards con icona, valore grande, label
- **Color Coding**: Verde (buono), Giallo (attenzione), Rosso (critico)
- **Trends**: Freccia su/giù per trend

**Componenti:**

- Total XP
- Current Level
- Modules Completed
- Current Streak
- Study Time
- Upcoming Reviews (Spaced Repetition)

### 4. Reflection Modal

**Design:**

- **Layout**: Modal centrato, non invasivo
- **Size**: Max-width 600px, responsive
- **Input**: Textarea per risposte lunghe, scale 1-5 per rating
- **Actions**: Salva, Salta (opzionale)

**UX:**

- Non bloccare progresso (opzionale)
- Salvataggio automatico draft
- Preview prima di inviare

### 5. Spaced Repetition Review

**Design:**

- **Layout**: Card-based, una domanda per volta
- **Quality Input**: 5 stelle o buttons (0-5)
- **Visual Feedback**: Animazione qualità selezionata
- **Progress**: "Domanda 3 di 10"

**UX:**

- Focus su una domanda alla volta
- Transizione smooth tra domande
- Summary finale con statistiche

## 📱 Mobile-First Design

### 1. Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
```

### 2. Touch Targets

**WCAG 2.2:**

- **Minimo**: 44×44px
- **Raccomandato**: 48×48px
- **Spacing**: Minimo 8px tra target

### 3. Mobile-Specific Patterns

**Bottom Sheet:**

- Modal da bottom su mobile
- Swipe down per chiudere
- Safe area insets

**Pull-to-Refresh:**

- Refresh progress con pull gesture
- Haptic feedback (se disponibile)

**Swipe Gestures:**

- Swipe left/right per navigare lezioni
- Swipe down per chiudere modal

**Paper:**

> Apple Human Interface Guidelines (2024)

## ♿ Accessibility (WCAG 2.2)

### 1. Keyboard Navigation

- **Tab Order**: Logico, visibile focus
- **Skip Links**: Salta a contenuto principale
- **Shortcuts**:
  - `?` = Help
  - `Esc` = Chiudi modal
  - `Enter/Space` = Submit/Action

### 2. Screen Reader Support

- **ARIA Labels**: Descrittivi
- **ARIA Live Regions**: Annunci cambiamenti
- **Semantic HTML**: Usa elementi corretti (button, nav, main, etc.)

### 3. Color Contrast

- **Text**: Minimo 4.5:1 (AA), preferibile 7:1 (AAA)
- **Large Text**: Minimo 3:1 (AA)
- **UI Components**: Minimo 3:1 (AA)

### 4. Focus Management

- **Visible Focus**: Outline chiaro
- **Focus Trap**: In modal, focus intrappolato
- **Focus Restoration**: Dopo chiusura modal, focus torna a trigger

## 🎨 Animation & Micro-interactions

### 1. Principles

**Purpose**: Ogni animazione ha uno scopo

- **Feedback**: Conferma azione utente
- **Orientation**: Mostra cambiamento stato
- **Delight**: Migliora esperienza (senza distrarre)

**Timing:**

- **Fast**: 150ms (hover, click)
- **Medium**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

**Easing:**

- **Ease-out**: Per entrate (elementi appaiono)
- **Ease-in**: Per uscite (elementi scompaiono)
- **Ease-in-out**: Per transizioni bidirezionali

**Paper:**

> Nielsen (1994): "10 Usability Heuristics"

### 2. Specific Animations

**Progress Bar Fill:**

- Smooth transition su update
- Color change da in-progress a completed

**Badge Unlock:**

- Scale animation (0.8 → 1.2 → 1.0)
- Confetti effect (opzionale)
- Sound feedback (opzionale, disabilitabile)

**Quiz Feedback:**

- Correct: Checkmark scale + fade in
- Incorrect: X shake + fade in
- Explanation: Slide down

**Page Transitions:**

- Fade in/out (300ms)
- Slide (se navigazione sequenziale)

## 📊 Data Visualization

### 1. Progress Charts

**Line Chart:**

- XP nel tempo
- Smooth curve
- Tooltip su hover

**Bar Chart:**

- Moduli completati
- Color per stato

**Pie/Donut Chart:**

- Distribuzione tempo studio
- Percentuali chiare

**Paper:**

> Munzner (2014): "Visualization Analysis & Design"

### 2. Learning Analytics

**Dashboard:**

- Overview cards (metriche chiave)
- Trend charts (progresso nel tempo)
- Heatmap (attività giornaliera)
- Distribution charts (performance quiz)

**Paper:**

> Siemens & Long (2011): "Penetrating the Fog: Analytics in Learning and Education"

## 🎯 UX Patterns Educativi

### 1. Progressive Disclosure

**Principio**: Mostra informazioni gradualmente

**Esempi:**

- **Lesson Overview**: Mostra solo titolo, espandi per dettagli
- **Quiz**: Una domanda alla volta
- **Content**: Sezioni collassabili

**Paper:**

> Norman (2013): "The Design of Everyday Things"

### 2. Scaffolding

**Principio**: Supporto graduale, poi rimozione

**Esempi:**

- **Tooltips**: Aiuto iniziale, poi scompaiono
- **Hints**: Suggerimenti prima domande difficili
- **Examples**: Esempi prima esercizi

**Paper:**

> Vygotsky (1978): "Mind in Society"

### 3. Immediate Feedback

**Principio**: Feedback istantaneo su ogni azione

**Esempi:**

- **Quiz**: Risposta corretta/sbagliata immediata
- **Progress**: Update real-time
- **XP**: Animazione guadagno punti

**Paper:**

> Hattie & Timperley (2007): "The Power of Feedback"

### 4. Error Prevention

**Principio**: Previeni errori invece di correggerli

**Esempi:**

- **Confirmation**: Conferma azioni distruttive
- **Validation**: Validazione real-time
- **Constraints**: Disabilita azioni non disponibili

**Paper:**

> Nielsen (1994): "10 Usability Heuristics"

## 🚀 Performance UX

### 1. Loading States

**Skeleton Screens:**

- Placeholder durante caricamento
- Mantiene layout, evita jump

**Progress Indicators:**

- Per operazioni lunghe
- Mostra percentuale se possibile

### 2. Optimistic Updates

**Principio**: Aggiorna UI immediatamente, rollback se errore

**Esempi:**

- **Quiz Submit**: Mostra "Corretto" immediatamente
- **Progress Update**: Aggiorna barra subito

### 3. Offline Support

**Service Worker:**

- Cache lezioni già visitate
- Offline mode per review
- Sync quando online

## 📋 Checklist UI/UX

### Design

- [ ] Visual hierarchy chiara
- [ ] Color system accessibile (WCAG AA)
- [ ] Typography scale consistente
- [ ] Spacing system (8px grid)
- [ ] Componenti riutilizzabili

### Gamification

- [ ] Sistema livelli non competitivo
- [ ] Badge system completo
- [ ] Progress visualization chiara
- [ ] Streak system motivante
- [ ] XP system bilanciato

### Accessibility

- [ ] Keyboard navigation completa
- [ ] Screen reader support
- [ ] Color contrast WCAG AA
- [ ] Focus management
- [ ] Touch targets 44px+

### Mobile

- [ ] Responsive design
- [ ] Touch-friendly
- [ ] Bottom sheet su mobile
- [ ] Safe area insets
- [ ] Pull-to-refresh

### Performance

- [ ] Loading states
- [ ] Optimistic updates
- [ ] Offline support
- [ ] Smooth animations (60fps)

## 📖 Riferimenti

- **Nielsen (1994)**: "10 Usability Heuristics"
- **Norman (2013)**: "The Design of Everyday Things"
- **Munzner (2014)**: "Visualization Analysis & Design"
- **Sailer et al. (2017)**: "How Gamification Motivates"
- **WCAG 2.2**: Web Content Accessibility Guidelines
- **Apple HIG (2024)**: Human Interface Guidelines
- **Material Design (2024)**: Design System
