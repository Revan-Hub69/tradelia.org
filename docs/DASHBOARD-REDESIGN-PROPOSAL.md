# Dashboard Redesign Proposal

## Problemi Identificati

1. **Indicatori troppo compressi**: 19 indicatori mostrati tutti insieme in griglia 4 colonne
2. **Mancanza di gerarchia visiva**: Tutti gli indicatori hanno lo stesso peso
3. **Informazioni poco leggibili**: Descrizioni troppo lunghe per lo spazio disponibile
4. **Nessuna categorizzazione**: Stock, Crypto, Forex, Commodity mescolati insieme
5. **Cruscotto "lacunoso"**: Mancanza di focus e organizzazione logica

## Proposta di Riorganizzazione

### 1. Struttura Dashboard Principale

```
┌─────────────────────────────────────────────────┐
│ Account Banner                                  │
├─────────────────────────────────────────────────┤
│ Moduli Principali (Analisi, Utilities, etc.)   │
├─────────────────────────────────────────────────┤
│ CRUSCOTTO OPERATIVO - Indicatori Chiave        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │  VIX    │ │  SPY    │ │ BTC Dom │ │ Fear&Gr ││
│ │  18.5   │ │ $450.2  │ │  52.3%  │ │   45    ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│ [Link: Vedi tutti gli indicatori →]            │
├─────────────────────────────────────────────────┤
│ Grafici Multi-Asset                            │
├─────────────────────────────────────────────────┤
│ News Feed                                       │
├─────────────────────────────────────────────────┤
│ Calendario Economico                            │
└─────────────────────────────────────────────────┘
```

### 2. Sezione Indicatori Dedicata

Creare una pagina/sezione dedicata `/dashboard/market-data` con:

- **Tab per categoria**: Stock, Crypto, Forex, Commodity, PRO
- **Cards più grandi**: Più spazio per valore, trend, descrizione
- **Filtri**: Per asset type, PRO/Free, importanza
- **Vista dettaglio**: Click su indicatore → vista espansa con grafico storico

### 3. Indicatori Chiave nel Cruscotto

Mostrare solo 4-6 indicatori più importanti:
- VIX (volatilità mercato)
- S&P 500 (SPY) - benchmark azionario
- Bitcoin Dominance - sentiment crypto
- Fear & Greed - sentiment generale
- EUR/USD - forza dollaro
- Gold - safe haven

### 4. Design Cards Migliorato

```
┌─────────────────────────────────────┐
│ VIX                    [Stock] [PRO] │
│ 18.5                                 │
│ ──────────────────────────────────── │
│ Trend: ↓ 2.3% (24h)                 │
│                                       │
│ Come leggere:                        │
│ < 20 = mercato calmo, trend rialzista│
│ 20-30 = volatilità normale           │
│ > 30 = alta volatilità, correzione   │
│                                       │
│ [Vedi dettagli →]                    │
└─────────────────────────────────────┘
```

### 5. Organizzazione Logica

1. **Dashboard Overview**: Indicatori chiave (4-6) + moduli + news
2. **Market Data Page**: Tutti gli indicatori organizzati per categoria
3. **Indicator Detail**: Vista singola indicatore con grafico e analisi

## Implementazione

1. Ridurre MarketDashboardWidget a 4-6 indicatori chiave
2. Creare sezione dedicata per tutti gli indicatori
3. Migliorare design cards con più spazio
4. Aggiungere categorizzazione e filtri
5. Aggiungere link "Vedi tutti" che porta a sezione completa
