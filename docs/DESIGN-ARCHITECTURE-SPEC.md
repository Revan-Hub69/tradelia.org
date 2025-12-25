# TRADELIA
## Design, Metodo e Architettura — Documento di Riferimento (Best Practice 2025)

---

## 0. Scopo del documento

Questo documento definisce le **linee guida ufficiali di Tradelia** per:

- metodo educativo
- struttura dell'informazione
- architettura modulare
- qualità del codice
- UX/UI e micro-interazioni
- accessibilità
- performance
- sicurezza

È una **baseline vincolante**: ogni decisione di prodotto o tecnica deve essere coerente con quanto segue.

---

## 1. Posizionamento epistemico

Tradelia è un progetto educativo indipendente.

Non:
- fornisce segnali
- promette risultati
- suggerisce strumenti finanziari

Tradelia:
- riduce asimmetrie informative
- chiarisce il rischio
- aiuta l'utente a scegliere un livello di esposizione coerente

---

## 2. Metodo Tradelia (obbligatorio)

### 2.1 Principio fondante

> La maggior parte degli errori nel mondo crypto non deriva dalla mancanza di informazioni, ma da una cattiva interpretazione del rischio e del contesto decisionale.

---

### 2.2 Variabile primaria

- La variabile primaria NON è lo strumento
- La variabile primaria è il **livello di rischio**

Ogni contenuto viene classificato prima per rischio, poi per ambito.

---

### 2.3 Struttura fissa dei contenuti

Ogni contenuto Tradelia segue SEMPRE questa struttura:

1. Cosa dice la ricerca / documentazione ufficiale
2. Come lo spiega Tradelia (linguaggio accessibile)
3. Quali rischi reali comporta
   - tecnici
   - operativi
   - comportamentali
4. Errori ricorrenti osservati
5. Fonti verificabili

Se una sezione manca → il contenuto **non è pubblicabile**.

---

### 2.4 Regola linguistica

> Se un concetto non può essere spiegato in modo comprensibile senza perdere rigore, non è pronto.

---

## 3. Microlearning & Scienze cognitive

### 3.1 Principi applicati

- Cognitive Load Theory
- Progressive Disclosure
- Recognition > Recall
- Chunking
- Riduzione dell'ansia decisionale

---

### 3.2 Regole pratiche

- Una sezione = una domanda
- Un paragrafo = una idea
- Max 5 bullet per lista
- Nessun termine tecnico senza tooltip

---

## 4. Homepage (funzione cognitiva)

La homepage NON insegna.  
La homepage **orienta**.

Funzione unica:
> aiutare l'utente a riconoscere il proprio livello di rischio.

---

## 5. Percorsi per rischio (scala)

- Rischio contenuto → esposizione indiretta (ETF / ETP)
- Rischio intermedio → esposizione diretta con custodia
- Rischio elevato → esposizione operativa
- Rischio molto elevato → strumenti complessi (futures, opzioni, leva)

Nota fondamentale (sempre visibile):
> Salire di livello non è un progresso. È una scelta diversa.

---

## 6. Modularità (architettura)

### 6.1 Principi

- Un concetto = un modulo
- UI separata dai contenuti
- Nessun testo hard-coded nei componenti

---

### 6.2 Struttura consigliata

```
/app
/(site)
page.tsx # Homepage
/risk/[level]/page.tsx
/method/page.tsx
/glossary/page.tsx
/sources/page.tsx

/content
/pages
/paths
/glossary
/sources

/components
/layout
/ui
/content
```

---

## 7. Qualità del codice

### 7.1 Standard

- TypeScript strict
- ESLint + Prettier
- no `any` non motivato
- funzioni pure dove possibile

---

### 7.2 Testing minimo

- Unit: parsing contenuti, i18n, utils
- Component: Drawer, Tooltip, RiskScale
- Smoke: build, typecheck, lint

---

## 8. Performance (Web Vitals)

Target:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

Regole:
- animare solo `opacity` e `transform`
- niente layout shift
- contenuti statici SSG

---

## 9. Multilingua (i18n)

- URL per lingua (`/it`, `/en`)
- auto-detect + override persistente
- `hreflang` e canonical
- glossario condiviso per tutte le lingue

---

## 10. Design System (2025)

### 10.1 Principi

- Sobrietà istituzionale
- Dark mode default
- Niente estetica "crypto hype"

---

### 10.2 Palette (linee guida)

- Neutrali dominanti (80–90%)
- 1 colore brand
- colori rischio desaturati
- contrasto WCAG AA/AAA

---

### 10.3 Tipografia

- Max 2 famiglie
  - Sans: Inter / Source Sans / IBM Plex Sans
  - Mono: IBM Plex Mono / JetBrains Mono

Gerarchie chiare, line-height generosa (1.5–1.7).

---

## 11. Micro-interazioni & Animazioni

### 11.1 Regole

- Motion solo se funzionale
- Durata 120–240ms
- Easing sobrio
- `prefers-reduced-motion` rispettato

---

### 11.2 Stati UI obbligatori

Ogni elemento interattivo ha:
- default
- hover
- focus-visible
- active
- disabled
- loading
- error (se applicabile)

---

## 12. Tooltip & Drawer (approfondimenti)

### 12.1 Tooltip

- definizione breve
- accessibile
- funziona su mobile

---

### 12.2 Drawer

- approfondimento Metodo Tradelia
- focus trap
- ESC chiude
- ritorno focus al trigger
- scroll interno

---

## 13. Responsive & UX

- Mobile-first
- Grid 4 col mobile / 12 desktop
- CTA sobrie
- Footer istituzionale

---

## 14. Sicurezza (by design)

- Cookie essenziali only
- Nessun tracker marketing
- CSP restrittiva
- Headers di sicurezza
- Sanitizzazione contenuti
- Nessun segreto lato client

---

## 15. PWA

- Manifest + SW
- Offline fallback
- Icone proprietarie
- Installabile

---

## 16. Checklist finale di validazione

- [ ] Homepage orienta in <60s
- [ ] Metodo visibile e coerente
- [ ] Tooltip/drawer su tutti i concetti
- [ ] A11y (focus, contrasto, tastiera)
- [ ] Performance >90 Lighthouse
- [ ] Multilingua SEO-ready
- [ ] Sicurezza headers attivi
- [ ] Nessuna fuffa

---

## Stato finale

Tradelia è:
- accademicamente solida
- cognitivamente corretta
- tecnicamente mantenibile
- esteticamente sobria
- eticamente difendibile

Base pronta per crescere senza snaturarsi.
