# Implementation Guide 2025 — Tradelia Futures Engine

Questa guida traduce l’RFC in **passi operativi** con verifiche online obbligatorie.
È pensata per arrivare a un sistema **operativo e robusto** (non accademico).

> Base architetturale: `docs/RFC-001.md`

## 0) Fonti ufficiali da verificare online (obbligatorie)

Queste fonti vanno controllate prima di ogni implementazione perché possono cambiare:

- **Binance Derivatives Docs**: https://developers.binance.com/docs/derivatives  
- **Binance API Limits & Headers (Futures)**: https://developers.binance.com/docs/derivatives/usds-margined-futures/general-info  
- **Supabase Vault**: https://supabase.com/docs/guides/database/vault  
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security  
- **Railway Dockerfile builds**: https://docs.railway.com/deploy/dockerfiles  

> Questa guida assume che **le informazioni siano state verificate** nelle fonti sopra.

## 1) Obiettivo operativo (non accademico)

- **Replay logico** (auditabile, non tick‑perfect).
- **Features persistite** come sorgente unica per strategie.
- **OMS robusto** con idempotenza e job locking.
- **Rate‑limit** gestito con budget e circuit breaker.

## 2) Fase 1 — Database Supabase (DDL + RLS + Vault)

Usa il DDL già pronto in `docs/RFC-001.md`:

- Estensioni + trigger updated_at
- `profiles`
- `exchange_connections` (Vault reference)
- `symbol_universe`
- `feature_snapshots`
- `trade_plans`
- `jobs`
- `executions`

**Checklist**
- [ ] Esegui DDL come admin nel SQL editor
- [ ] Abilita RLS su tutte le tabelle
- [ ] Verifica policy “own rows”
- [ ] Abilita Vault e salva segreti (mai in chiaro)

## 3) Fase 2 — API (Fastify su Railway)

**Core**
- Autenticazione: Supabase JWT (middleware)
- Endpoints:
  - `GET /v1/universe`
  - `POST /v1/plans/build`
  - `POST /v1/plans/:planId/queue`
  - `GET /v1/plans`
  - `GET /v1/executions`

**Best practice 2025**
- Validazione payload (zod)
- Logging strutturato (pino)
- Idempotenza sugli enqueue

## 4) Fase 3 — Worker (Execution + Collector)

**Jobs**
- Poll su `jobs` con lock atomico (`locked_at`, `locked_by`)
- Stati: QUEUED → RUNNING → DONE/ERROR

**Execution**
- Carica TradePlan + ExchangeConnection
- Recupera segreto da Vault (service role)
- Esegui ordini su Binance Demo finché `is_testnet=true`

**Collector**
- WS L2 + snapshot REST (Binance)
- Feature emit ogni N secondi
- Persisti in `feature_snapshots`

## 5) Fase 4 — UI (Next.js su Vercel)

- Supabase Auth (no login hardcoded)
- Settings → salva API key su backend, non in client
- Dashboard → universe + jobs/executions
- Trade → build plan → preview → queue

## 6) Rate‑limit e resilienza (obbligatorio)

Implementare quanto descritto in `docs/RFC-001.md`:

- **Token bucket** IP + Order
- **Circuit breaker** (CLOSED/OPEN/HALF‑OPEN)
- **Backoff** su 429/418/5xx
- **Preferire WS** per market‑data

## 7) Runtime & Docker best practice (Prisma)

**Standard 2025 consigliato:**
- Node 20 + Debian Bookworm
- OpenSSL 3
- Prisma `binaryTargets = ["native", "debian-openssl-3.0.x"]`

Assicurati che **tutti i Dockerfile** siano allineati a questa base.

## 8) Environment variables

Le env var complete sono già elencate in `docs/RFC-001.md` (sezione 15).
Non duplicare: usa quella come fonte ufficiale.

## 9) Test plan minimo (operativo)

**DB**
- [ ] DDL applicato senza errori
- [ ] RLS attivo e policy funzionanti

**API**
- [ ] `GET /v1/universe` ritorna dati
- [ ] `POST /v1/plans/build` crea TradePlan deterministico
- [ ] `POST /v1/plans/:planId/queue` crea Job

**Worker**
- [ ] Job runner processa QUEUED
- [ ] Execution crea record + aggiorna stato

**Collector**
- [ ] L2 snapshot ok
- [ ] FeatureSnapshot scritto ogni N secondi

**UI**
- [ ] Auth ok
- [ ] Settings salva exchange connection
- [ ] Dashboard mostra jobs/executions

## 10) Regola d’oro

Se un punto non è verificato nelle fonti ufficiali, **non deployare**.
