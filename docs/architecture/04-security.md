Tradelia Desk — Security, Secrets & Access Control

Versione: 1.0
Stato: LOCKED
Ambito: Backend Desk (Oracle VM) + Frontend Cockpit (Vercel)

0. Principio Fondamentale

La sicurezza non è un layer.
È una conseguenza di confini rigidi e responsabilità chiare.

Questo documento definisce le regole di sicurezza non violabili del desk.

1. Gestione dei Segreti
1.1 Dove POSSONO stare

Solo sulla Oracle VM

Solo come file protetti

Solo caricati da systemd

Esempio:

/etc/tradelia/secrets.env


Permessi:

owner: root

mode: 600

1.2 Dove NON POSSONO stare

nel repository

in .env locali versionati

in Vercel

nel browser

nei log

in memory dump esportabili

👉 Una violazione = incidente critico.

2. Scoping dei Segreti (Least Privilege)
2.1 Exchange API Keys

Devono essere separate:

Key	Processo	Permessi
Ingest Key	ingest	Read-only
Execution Key	execution	Trade only

Regole:

no withdraw

no margin se non esplicitamente abilitato

IP whitelist sull’exchange

2.2 Segreti Interni
Segreto	Usato da
DESK_HMAC_SECRET	gateway
INTERNAL_WS_TOKEN	processi interni

Ogni processo riceve solo ciò che serve.

3. Autenticazione Oracle ↔ Vercel
3.1 Modello

HMAC request signing

timestamp + nonce

expiry breve

Headers obbligatori:

X-TS
X-NONCE
X-SIGNATURE


Firma:

HMAC_SHA256(secret, ts + nonce + body)

3.2 Regole

clock skew massimo consentito

replay protection

rate limit per IP

Richieste non firmate:

rifiutate (403)

loggate

4. WebSocket Security
4.1 Gateway WS

handshake con token firmato

scope read-only

rate limit per sessione

4.2 Violazioni

token invalido → close immediato

flood → ban temporaneo

5. Zero Trust Interno

Anche dentro la VM:

processi autenticati

token IPC

heartbeat firmato

Un processo che:

non si autentica

non invia heartbeat

👉 è considerato DOWN.

6. Network Hardening (Oracle VM)
6.1 Firewall (UFW)

allow: 22, 80, 443

deny: everything else

6.2 SSH

key-only

no root login

fail2ban attivo

7. Logging Sicuro
7.1 Regole

mai loggare segreti

mascherare token e chiavi

log strutturati JSON

Esempio:

{
  "ts": "...",
  "process": "gateway",
  "event": "AUTH_FAIL",
  "ip": "x.x.x.x"
}

8. Kill Switch Globale
8.1 Meccanismo

File-based:

/etc/tradelia/KILL_SWITCH

8.2 Effetti

policy = BLOCK

execution disabilitata

UI mostra “Emergency stop”

Non richiede:

deploy

restart

accesso UI

9. Incident Handling (MINIMO)

Ogni incidente deve:

essere loggato

avere timestamp

avere processo coinvolto

Il runbook definisce:

cosa fare

in che ordine

come ripristinare

10. Chiusura

Questo documento:

definisce le barriere di sicurezza

riduce la superficie d’attacco

impedisce escalation laterali

Se una modifica:

introduce nuove superfici

sposta segreti

indebolisce l’auth

👉 non è accettabile.

Fine documento.

🔒 STATO DEL PROGETTO ORA

A questo punto:

✅ memoria tecnica nel repo

✅ invarianti fissate

✅ contratti dati chiusi

✅ processi definiti

✅ sicurezza formalizzata

👉 La chat non è più una dipendenza.
