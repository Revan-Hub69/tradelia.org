Tradelia Desk — Invarianti di Sistema

Versione: 1.0
Stato: LOCKED
Ambito: Tutto il backend desk (Oracle) e il frontend cockpit (Vercel)

0. Principio Fondamentale

Il sistema è corretto solo se le invarianti sono rispettate.
Il funzionamento non giustifica mai una violazione.

Qualsiasi modifica che viola anche una sola invariante:

non viene deployata

non viene testata

non viene discussa

1. Invarianti di Responsabilità
INV-01 — Separazione UI / Desk

La UI (Vercel) non prende decisioni

La UI non calcola feature

La UI non accede a exchange

La UI non invia ordini

La UI:

osserva

visualizza

richiede snapshot

👉 Qualsiasi logica decisionale in UI è vietata.

INV-02 — Accesso agli Exchange

Solo il processo ingest può:

connettersi via WS

chiamare REST exchange

Solo il processo execution può:

inviare ordini

Nessun altro processo:

importa SDK exchange

contiene API key

conosce endpoint exchange

INV-03 — Event Bus come Unica Fonte

Tutti i dati entrano nel sistema solo come EventEnvelope

Nessun modulo può:

leggere feed raw

calcolare su dati non passati dal bus

Nessun bypass è consentito

👉 Se non è un evento, non esiste.

2. Invarianti di Dato
INV-04 — Persistenza Prima della Pubblicazione

Ogni evento deve essere:

scritto su WAL

fsync completato

poi pubblicato sul bus

Se questo ordine non è rispettato:

l’evento è invalido

il sistema deve bloccare

INV-05 — EventEnvelope Canonico

Ogni evento DEVE contenere:

id

type

ts_event

ts_ingest

source

payload

Eventi incompleti:

non vengono pubblicati

generano PANIC

INV-06 — Feature Registry

Ogni feature:

deve esistere nel Feature Registry

deve avere unità, finestra, dominio

Feature non registrate:

non possono essere calcolate

non possono essere usate

INV-07 — Freshness Obbligatoria

Ogni feature ha uno stato di freshness

Feature critical:

se non FRESH → BLOCK

Non esistono:

fallback

override

eccezioni

3. Invarianti Temporali
INV-08 — Ordering Deterministico

L’ordine degli eventi è deciso solo da ts_ingest

ts_event è usato solo per causalità

Eventi fuori ordine:

vengono scartati

vengono loggati

INV-09 — Lag Come Rischio

Se ingest_lag_ms supera soglia:

VenueHealth = DEGRADED

Se supera soglia critica:

policy = BLOCK

👉 Meglio nessun trade che un trade in ritardo.

4. Invarianti di Processo
INV-10 — Isolamento dei Processi

ingest, core, execution, gateway sono processi separati

Un crash non deve propagarsi

Riavvii sono automatici

Se core non è READY:

execution non può operare

INV-11 — Startup Sicuro

All’avvio il sistema è:

BOOT

INGEST_WARMUP

FEATURE_STABLE

POLICY_ENABLED

Fino a POLICY_ENABLED:

BLOCK TOTALE

5. Invarianti di Decisione
INV-12 — Policy Engine Autorità Finale

Nessuna decisione di trading può avvenire:

senza Policy Engine

fuori dalle regole

Classifier e AI:

non decidono

propongono

INV-13 — Regime & Derivatives Gating

Se Regime = CHAOS_NO_TRADE → BLOCK

Se DerivativesContext = FORCED o UNCLEAR → BLOCK

Non esistono override manuali.

6. Invarianti di Execution
INV-14 — Execution Protetta

Execution avviene solo se:

policy = ALLOW

venueHealth = OK

startupPhase = POLICY_ENABLED

In caso contrario:

l’ordine è rifiutato localmente

INV-15 — Kill Switch

La presenza di /etc/tradelia/KILL_SWITCH:

blocca tutte le execution

sovrascrive ogni decisione

Questo meccanismo:

non dipende dal codice

non può essere disabilitato

7. Invarianti di Sicurezza
INV-16 — Segreti

Nessun segreto:

è nel repo

è nella UI

è nei log

I processi vedono solo i segreti necessari

INV-17 — Zero Trust Interno

Anche tra processi locali:

autenticazione

token

heartbeat

Un processo non autenticato:

è considerato DOWN

8. Invarianti Operative
INV-18 — Osservabilità

/health e /metrics devono riflettere lo stato reale

La UI non può mostrare “OK” se policy è BLOCK

INV-19 — Runbook

Ogni stato critico deve avere:

una procedura documentata

Se non è nel runbook:

è considerato non gestito

9. Chiusura

Queste invarianti:

non sono suggerimenti

non sono opinioni

sono legge

Qualsiasi violazione:

è un bug critico

blocca il deploy

richiede fix immediato

Fine documento.
