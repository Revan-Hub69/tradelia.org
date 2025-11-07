# 🏛 F1 — Screening / Macro Context (v19 esteso)

## Componenti

- **F1A** = Ticker Macro Context
- **F1B** = Market Regime

## Finalità

- Educativa e informativa (no MiFID)
- Orizzonte: Swing 3–10 giorni

## Fonti Tier-1

Bloomberg · Reuters · FRED · CBOE · Finviz Premium · ETFdb · CME · Sell-side (JP Morgan, Goldman Sachs, BofA, Citi, Morgan Stanley)

## Stati e Freshness

- Stati: **ACTIVE** / **HOLD** / **REVIEW**
- Freshness: **≤ T-1**

---

## 🎯 Obiettivo F1B

Fornire la lettura di mercato complessiva per lo swing (3–10 giorni):

- Risk appetite
- Leadership settoriale
- Curva tassi
- Credito
- FX
- Volatilità
- Narrativa istituzionale giornaliera

⚠️ **F1B è giornaliero, non ticker-specifico.**

---

## 📥 Input Utente (F1B)

Identico alla versione base:

- Settori 1D/1W/1M
- Size buckets (MegaCap, Large, Mid, Small, Micro)
- Futures board

---

## 🌐 Processo automatico via web (F1B)

Richiama e sincronizza:

- **VIX** (CBOE)
- **Treasury curve** (2Y, 10Y, 30Y) - FRED
- **Credit OAS** (Investment Grade)
- **FX majors** (EUR/USD, USD/JPY, DXY)
- **Commodities** (Oil WTI, Gold, Copper)
- **Headlines T-1** da Bloomberg/Reuters/sell-side

---

## 🧮 Calcoli F1B

Metriche calcolate:

- `Breadth_1M` - Quota settori positivi su 30 giorni
- `RiskTilt_1M` - Pro-rischio vs Difensivo
- `SmallCapPressure_1W` - Performance relativa small vs mega
- `IndexMomentum_1W` - Momentum cross-indici
- `VolRegime` - Regime volatilità (+1/0/-1)
- `LiquidityRegimeScore` - Curva e funding
- `CreditRiskBlock` - Spread credito
- `FX_Regime` - Dollar tone
- `RegimeScore` - Appetito rischio sintetico [-1..+1]
- `StrategyMode_macro` - Momentum / Momentum-light / Pullback

---

## 📤 OUTPUT F1B (esteso v19-Dynamic)

### F1B|MARKET|

```
Breadth_1M=<...> | RiskTilt_1M=<...> |
SmallCapPressure_1W=<...> | IndexMomentum_1W=<...> |
VolRegime=<+1/0/−1> | LiquidityRegimeScore=<...> |
CreditRiskBlock=<...> | FX_Regime=<...> |
RegimeScore=<...> | StrategyMode_macro=<Momentum / Momentum-light / Pullback>
```

### F1B|ANALYSIS_T1_HEADLINES|

```
T1_MacroNews="Bloomberg oggi riporta che ..." |
T1_SellSideNotes="JP Morgan indica …, Goldman evidenzia …" |
T1_ConsensusTone="…" |
T1_AuditSrc={"Bloomberg <timestamp>", "Reuters <timestamp>", "JPM <timestamp>"}
```

### F1B|SECTORS|

```
LeadersMultiTF=[...] |
DefensiveLeadership=[...] |
Lagging=[...] |
SizeBias=<SmallCap / MegaCap / Mixed>
```

### F1B|FEEDTOF2|

```
FocusSectors=[...] |
RiskWindow="Oil %, Gold %, USD %, curva 2s10s, Credit OAS Δ, VIX 7d" |
Notes="macro eventi di rischio imminenti (Fed, CPI, OPEC, earnings bancarie)."
```

---

## 🧩 Nuova sezione — F1B | FINVIZ_FILTERS (Dynamic)

**Funzione:** genera automaticamente query Finviz Premium coerenti con StrategyMode_macro, LeadersMultiTF e SizeBias, per guidare la ricerca dei ticker più coerenti con il regime corrente.

### Logica dinamica

| StrategyMode_macro | Filtri dinamici principali | Focus tipico |
|-------------------|---------------------------|--------------|
| **Momentum** | `sector:(LeadersMultiTF[0–2]) AND (marketcap:Large OR Mega) AND (performance:WeekUp OR MonthUp) AND RSI(14)<70 AND beta>1.0 AND avgvolume>800000 AND price>10 AND country:USA` | grandi growth / trend forti |
| **Momentum-light** | `sector:(LeadersMultiTF[0–2]) AND (marketcap:Mid OR Large) AND performance:MonthUp AND RSI(14)<65 AND avgvolume>800000 AND price>10 AND country:USA` | trend moderato / rotazioni |
| **Pullback** | `sector:(DefensiveLeadership[0–2]) AND (marketcap:Small OR Mid) AND performance:WeekDown AND RSI(14)<40 AND avgvolume>800000 AND price>10 AND country:USA` | difensivi / mean-reverting |

### Output formattato

```
F1B|FINVIZ_FILTERS|
QueryString="sector:(Technology OR Industrials OR Communication Services)
AND marketcap:Large OR Mega
AND performance:WeekUp OR MonthUp
AND RSI(14)<70 AND beta>1.0
AND avgvolume>800000 AND price>10 AND country:USA" |
FilterType="Momentum" |
GeneratedFrom="StrategyMode_macro=Momentum, LeadersMultiTF, SizeBias=MegaCap" |
AuditSrc={"Finviz Premium <timestamp>", "ETFdb <timestamp>"}
```

---

## 🔄 Feed a F2

Nel JSON `F1B|FEEDTOF2|` viene aggiunto il campo:

```json
"FinvizQuery": "<QueryString>"
```

➡ In questo modo F2 esegue automaticamente la scansione dei ticker coerenti col regime di mercato e costruisce i vettori SCI/IPI/ICR solo per questi.

---

## ⚙️ Esecuzione (aggiornata)

Identica alla versione precedente, con la sola aggiunta del blocco Finviz dinamico come fase finale.

---

## ✅ Audit Note

- Tutti i filtri Finviz sono dinamici, ricreati a ogni sessione T-1 su base ETFdb e Finviz Premium
- Nessuna selezione manuale di titoli né analisi tecnica in F1B
- I filtri servono solo a popolare F2 con un universo coerente col regime di mercato

---

## 📋 Workflow Input/Output

Vedi documento separato: **[01-F1-Workflow.md](./01-F1-Workflow.md)**

