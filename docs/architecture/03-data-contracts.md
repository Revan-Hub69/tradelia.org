Tradelia Desk — Data Contracts & Feature Registry

Versione: 1.0
Stato: LOCKED
Ambito: Backend Desk (Oracle) + Frontend Cockpit (Vercel, read-only)

0. Principio Fondamentale

I dati sono contratti, non implementazioni.
Il codice deve adattarsi ai contratti, non il contrario.

Se un dato:

non è definito qui

non ha semantica chiara

non ha unità

👉 non può essere usato.

1. EventEnvelope (Contratto Universale)
1.1 Definizione Canonica
export type EventEnvelope<T = unknown> = {
  id: string;                 // UUID v7
  type: EventType;            // enum chiuso
  ts_event: number;           // epoch ms (venue time)
  ts_ingest: number;          // epoch ms (Oracle monotonic)
  source: "SPOT" | "DERIVATIVES" | "SYSTEM";
  payload: T;
};

1.2 Regole

ts_ingest decide l’ordine

ts_event serve solo per causalità

eventi incompleti → PANIC

eventi non persistiti → inesistenti

2. EventType (Enumerazione Chiusa)
export enum EventType {
  SPOT_TRADE,
  SPOT_DEPTH,
  DERIV_OI,
  DERIV_FUNDING,
  DERIV_LIQUIDATION,
  DERIV_BASIS,
  FEATURE_VECTOR,
  POLICY_DECISION,
  EXECUTION_EVENT,
  SYSTEM_HEALTH
}


👉 Nessun string libero.
👉 Ogni nuovo tipo richiede update di questo file.

3. Feature Registry (Costituzione Quantitativa)
3.1 Meta-contratto
export type FeatureMeta = {
  name: string;                       // snake_case, stabile
  unit: string;                       // %, ms, ratio, quote
  window: string;                     // es: "5s", "1m", "event"
  domain: "SPOT" | "DERIVATIVES" | "SYSTEM";
  description: string;
  half_life_ms: number;
  critical: boolean;
};

4. Feature Registry — v1 (CHIUSO)
4.1 SPOT — Price & Volatility
name	unit	window	critical
price_last	quote	tick	✅
price_velocity_5s	%/s	5s	❌
price_range_1m	%	1m	❌
atr_1m	%	1m	❌
4.2 SPOT — Order Flow
name	unit	window	critical
delta_1s	base	1s	❌
delta_5s	base	5s	✅
delta_persistence_15s	ratio	15s	❌
trade_intensity_5s	trades/s	5s	❌
4.3 SPOT — Order Book
name	unit	window	critical
spread_1s	%	1s	✅
imbalance_5s	ratio	5s	✅
book_thinning_5s	ratio	5s	❌
top_depth_1pct	quote	snapshot	❌
4.4 DERIVATIVES — Context (Read-only)
name	unit	window	critical
oi_change_60s	%	60s	❌
oi_velocity_15s	%/s	15s	❌
funding_rate	%	event	❌
funding_state	enum	event	❌
liquidation_intensity_15s	quote	15s	❌
liquidation_bias_15s	enum	15s	❌
basis_change_60s	%	60s	❌
4.5 SYSTEM — Quality & Risk
name	unit	window	critical
venue_health_score	0-100	event	✅
ingest_lag_ms	ms	event	✅
queue_depth	count	event	❌
startup_phase	enum	state	✅
5. FeatureValue (Formato Unico)
export type FeatureValue = {
  value: number | string;
  ts_ingest: number;
  freshness: "FRESH" | "AGING" | "STALE";
};

Regole

freshness obbligatoria

feature critical + STALE → BLOCK

nessun fallback

6. FeatureVector (Unico Payload Consentito)
export type FeatureVector = {
  ts: number; // ts_ingest
  features: Record<string, FeatureValue>;
};


👉 Nessun modulo a valle legge:

book

trade

derivati raw

7. Naming & Versioning
Naming

snake_case

finestra solo se >1 variante

nessuna abbreviazione ambigua

❌ imb5
✅ imbalance_5s

Versioning

aggiunte → consentite

rinominare / rimuovere → vietato

modificare unità → nuova feature

8. Audit & Replay

Dal WAL è sempre possibile:

ricalcolare FeatureVector

confrontare versioni

validare bug

Se una feature non è ricalcolabile, è invalida.

9. Chiusura

Questo documento:

è la memoria permanente del sistema

guida direttamente il codice

impedisce drift architetturale

Se il codice viola questo contratto:

è un bug critico

il deploy è bloccato

Fine documento.
