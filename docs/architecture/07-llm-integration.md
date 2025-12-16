Tradelia Desk — LLM Integration (Groq)

Versione: 1.0
Stato: LOCKED
Ambito: Analisi asincrona, explainability, audit
LLM di riferimento: Groq (o equivalenti compatibili)

0. Principio Fondamentale

Un LLM non è parte del sistema decisionale.
È un osservatore intelligente a valle.

Il desk Tradelia:

non dipende dall’LLM per operare

non degrada se l’LLM è offline

non delega decisioni all’LLM

1. Ruolo dell’LLM nel Desk
1.1 Ruolo Canonico

L’LLM agisce come:

Explainability Engine

Post-mortem Analyst

Audit & Review Assistant

Hypothesis Generator (non vincolante)

👉 Mai come:

segnalatore

decisore

ottimizzatore automatico

2. Posizionamento Architetturale
REALTIME PATH (deterministico)
──────────────────────────────
Ingest → Core → Policy → Execution
              ↓
      Snapshot / Logs / Decisions
              ↓
      ┌──────────────────────┐
      │   LLM (Groq)         │
      │   async / offline    │
      └──────────────────────┘


Nessuna chiamata LLM nel realtime path

Nessun blocco operativo legato all’LLM

3. Processo Dedicato
Nome

tradelia-llm

Tipo

processo OS separato

asincrono

batch-oriented

4. Responsabilità del Processo LLM
CONSENTITO

leggere snapshot strutturati

leggere FeatureVector storici

leggere PolicyDecision

leggere RegimeState

generare output testuale

chiamare API Groq

VIETATO

ricevere eventi realtime

parlare con Event Bus

influenzare policy

modificare feature

accedere a exchange

accedere a execution

👉 Violazione = bug architetturale critico.

5. Input del Processo LLM
5.1 Origine

File-based, pull-only:

/data/llm_inputs/
  ├─ decision_YYYYMMDD_HHMM.json
  ├─ session_summary.json
  ├─ counterfactual_trace.json

5.2 Contenuto Ammesso

Feature aggregate

Stati (ALLOW/BLOCK)

Motivazioni della policy

Contesto regime

Metadati temporali

5.3 Contenuto VIETATO

raw order book

raw trades

API key

identificativi sensibili

dati personali

6. Output del Processo LLM
/data/llm_outputs/
  ├─ explanations/
  │    └─ decision_*.md
  ├─ reviews/
  │    └─ session_review.md
  ├─ reports/
  │    └─ weekly_report.md

Tipologie di Output

spiegazioni testuali delle decisioni

post-mortem di trade bloccati/eseguiti

report periodici

insight non vincolanti

7. Integrazione con la UI

il Gateway espone solo output testuale

read-only

nessuna azione derivabile

UI etichetta sempre:

“Analisi descrittiva – non operativa”

👉 Compliance-safe (MiFID).

8. Sicurezza & Segreti
API Key Groq

presente solo nel processo tradelia-llm

file: /etc/tradelia/secrets.env

permessi: 600

Logging

mai loggare prompt completi

mai loggare chiavi

mascherare identificativi

9. Costi & Performance

chiamate batch

nessun realtime

nessuno streaming

frequenza controllata

👉 Compatibile con free tier / low budget.

10. Failure Handling

Se tradelia-llm è DOWN:

nessun impatto operativo

nessun blocco

nessuna degradazione del desk

👉 LLM failure ≠ incident.

11. Non-Goals Espliciti

L’LLM non è un trader

L’LLM non fornisce segnali

L’LLM non ottimizza parametri

L’LLM non agisce in realtime

L’LLM non sostituisce la policy

12. Chiusura

Questo documento:

definisce l’unico modo corretto di usare Groq

impedisce derive “AI-trader”

protegge determinismo, sicurezza e compliance

Se un’implementazione:

viola questi limiti

introduce dipendenza realtime

dà potere decisionale all’LLM

👉 non è accettabile.

Fine documento.
