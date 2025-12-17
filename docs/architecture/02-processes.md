Tradelia Desk — Processi & Flussi Operativi

Versione: 1.0
Stato: LOCKED
Ambito: Backend Desk (Oracle VM)

0. Principio Fondamentale

Ogni processo ha una sola responsabilità.
Se un processo fa di più, è un bug architetturale.

Il sistema è composto da processi OS separati, non microservizi, non thread logici.

1. Elenco Processi (CHIUSO)
Processo	Nome	Ruolo
Ingest	tradelia-ingest	Acquisizione dati
Core	tradelia-core	Intelligenza & decisioni
Execution	tradelia-execution	Invio ordini
Gateway	tradelia-gateway	Accesso esterno

👉 Nessun altro processo è ammesso.

2. Processo: INGEST
2.1 Responsabilità

Connessione a exchange (WS + REST)

Recupero snapshot

Normalizzazione dati

Creazione EventEnvelope

Invio eventi al Core

2.2 È L’UNICO che può

usare SDK exchange

parlare con WS exchange

conoscere endpoint exchange

2.3 È VIETATO

calcolare feature

prendere decisioni

scrivere su disco

conoscere policy o execution

2.4 Failure Handling

se ingest crasha:

Core resta vivo

VenueHealth = DEGRADED

Policy = BLOCK (se dati insufficienti)

3. Processo: CORE (AUTORITÀ CENTRALE)
3.1 Responsabilità

Event Bus broker

WAL (persistenza eventi)

Feature Engine

Regime Engine

Derivatives Context

Policy Engine

Venue Health

Startup lifecycle

👉 È il cervello del desk.

3.2 È L’UNICO che può

scrivere eventi su WAL

pubblicare eventi sul bus

decidere ALLOW / BLOCK

valutare freshness

valutare lag

3.3 È VIETATO

accedere a exchange

inviare ordini

esporre API pubbliche

3.4 Failure Handling

se core crasha:

systemd lo riavvia

replay WAL

startupPhase = INGEST_WARMUP

policy = BLOCK fino a stabilità

4. Processo: EXECUTION
4.1 Responsabilità

ricevere decisioni dal Core

inviare ordini (PAPER o LIVE)

raccogliere execution feedback

inviare ExecutionEvent al Core

4.2 È L’UNICO che può

conoscere API key di trading

inviare ordini a exchange

4.3 È VIETATO

decidere size

decidere timing

bypassare policy

operare se core ≠ READY

4.4 Failure Handling

se execution crasha:

policy = BLOCK

nessun ordine parte

riavvio automatico

5. Processo: GATEWAY
5.1 Responsabilità

esporre API HTTP (/health, /metrics)

gestire WebSocket verso UI

autenticare richieste esterne

inoltrare snapshot (read-only)

5.2 È L’UNICO che può

parlare con Vercel

gestire sessioni UI

5.3 È VIETATO

calcolare feature

decidere policy

parlare con exchange

inviare ordini

6. Comunicazione tra Processi
6.1 Meccanismo

WebSocket locale (127.0.0.1)

Protocollo tipizzato (contracts)

Heartbeat obbligatorio

6.2 Flussi Ammessi
INGEST  → CORE      (EventEnvelope)
CORE    → EXECUTION (PolicyDecision)
EXEC    → CORE      (ExecutionEvent)
CORE    → GATEWAY   (Snapshot / Metrics)
GATEWAY → UI        (Read-only)


👉 Ogni altro flusso è vietato.

7. Startup Lifecycle (OBBLIGATORIO)
BOOT
 ↓
INGEST_WARMUP
 ↓
FEATURE_STABLE
 ↓
POLICY_ENABLED

Regole

fino a POLICY_ENABLED → BLOCK TOTALE

Gateway mostra stato reale

Execution disabilitata

8. Stato & Health

Ogni processo espone:

{
  status: "STARTING" | "READY" | "DEGRADED" | "DOWN",
  last_heartbeat: number
}


Core aggrega e decide:

VenueHealth

Policy gating

9. Invarianti di Processo (RIEPILOGO)

Nessun processo multifunzione

Nessun bypass del Core

Nessun ordine senza Policy

Nessun accesso exchange non autorizzato

Nessuna API pubblica sul Core

10. Chiusura

Questo documento:

definisce chi fa cosa

impedisce coupling implicito

è riferimento diretto per il codice

Se un’implementazione:

viola un flusso

aggiunge comunicazioni

fonde processi

👉 è da considerarsi errata.

Fine documento.
