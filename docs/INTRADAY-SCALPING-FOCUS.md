# Focus Intraday/Scalping - Crypto Trading con Leva

## Obiettivo

Sistema dedicato esclusivamente a **intraday/scalping** per crypto trading con **leva e futures**.

## Features Implementate

### 1. **Real-Time Order Book (L400 Multi-Exchange)**
- Aggregazione da Binance + OKX + Bybit
- 400 livelli (200 bid + 200 ask)
- Supporti/Resistenze real-time basati su concentrazione volume
- **Utile per**: Identificare livelli immediati di supporto/resistenza

### 2. **Funding Rates (Real-Time)**
- Tasso di funding corrente
- Prossimo funding time
- Mark price vs Index price
- Interpretazione sentiment (bullish/bearish)
- **Utile per**: Identificare estremi di sentiment, opportunità di funding rate arbitrage

### 3. **Open Interest**
- Open Interest totale (contracts)
- Open Interest value (USD)
- **Utile per**: Valutare leverage totale nel mercato, identificare posizionamento

### 4. **Long/Short Ratio**
- Ratio tra posizioni long e short
- % account long vs short
- **Utile per**: Identificare sentiment estremo, possibili reversal

### 5. **Liquidation Clusters**
- Prezzi di liquidazione per diversi leverage (5x, 10x, 20x, 50x, 100x)
- Distanza dal prezzo corrente
- Rischio liquidazione (low/medium/high/very-high)
- **Utile per**: Identificare zone di liquidazione, evitare trade vicini a liquidazioni

### 6. **Order Flow Analysis**
- Bid/Ask imbalance real-time
- Aggressive vs Passive orders
- Flow direction (buying/selling/neutral)
- Order book changes
- **Utile per**: Identificare pressione immediata, direzione del flusso ordini

### 7. **Leverage Metrics**
- Leverage raccomandato basato su rischio liquidazione
- Max leverage disponibile
- Stima leverage medio
- **Utile per**: Sizing posizioni, gestione rischio

### 8. **Spread & Arbitrage**
- Spread tra exchange
- Opportunità di arbitraggio cross-exchange
- Profitto netto dopo costi
- **Utile per**: Identificare opportunità di arbitraggio

## Features NON Incluse (Non Utili per Scalping)

### ❌ Volume Profile Storico
- **Perché**: Troppo lento per scalping, order book corrente è più rilevante

### ❌ Psychological Levels
- **Perché**: Meno rilevanti per scalping intraday, order book è più importante

### ❌ On-Chain Data
- **Perché**: Troppo lento (blocchi ogni 10 minuti), non utile per scalping

### ❌ Correlazioni a Lungo Termine
- **Perché**: Focus su dati real-time, non correlazioni storiche

### ❌ Market Cap Analysis
- **Perché**: Non rilevante per scalping, focus su microstruttura

## Dashboard Dedicata

**URL**: `/crypto-intraday-scalping`

### Sezioni:
1. **Futures Data**: Funding rates, Open Interest, Long/Short Ratio, Liquidation Risk
2. **Order Flow**: Imbalance, Flow Direction, Aggressive vs Passive
3. **Liquidation Clusters**: Prezzi di liquidazione per diversi leverage
4. **Auto-Refresh**: Dati aggiornati ogni 5 secondi

## Best Practices per Scalping

### 1. **Usa Order Book Real-Time**
- Supporti/Resistenze da order book sono utili per scalping
- Attenzione: I livelli cambiano rapidamente, verificare sempre prima di tradare

### 2. **Monitora Funding Rates**
- Funding rate alto (>0.1%) = molti long = rischio liquidazione long se prezzo scende
- Funding rate negativo (<-0.1%) = molti short = rischio liquidazione short se prezzo sale
- Reversal funding rate = possibile cambio trend

### 3. **Evita Zone di Liquidazione**
- Non tradare vicino a liquidation clusters
- Usa leverage conservativo se liquidation risk è high/very-high

### 4. **Order Flow è Chiave**
- Imbalance >0.2 = forte pressione rialzista
- Imbalance <-0.2 = forte pressione ribassista
- Aggressive orders = segnale più forte di passive orders

### 5. **Gestisci Leverage**
- Usa leverage raccomandato basato su liquidation risk
- Funding rate alto = usa leverage più basso
- Open Interest alto = più liquidità = più sicuro

## Warning Metodologici

1. **Order book è snapshot**: I livelli possono cambiare rapidamente
2. **Funding rates cambiano ogni 8h**: Verificare sempre prossimo funding time
3. **Liquidazioni sono stime**: Basate su leverage medio, non dati reali
4. **Order flow è intenzione**: Non garanzia di esecuzione
5. **Spread arbitrage richiede**: Velocità di esecuzione, costi di transazione, withdrawal fees

## Prossimi Sviluppi

1. **WebSocket Real-Time**: Order book updates in tempo reale (non polling)
2. **Liquidation Heatmap**: Visualizzazione grafica dei liquidation clusters
3. **Funding Rate Alerts**: Alert quando funding rate raggiunge soglie
4. **Order Flow History**: Grafico storico order flow
5. **Cross-Exchange Arbitrage**: Calcolo automatico opportunità con costi reali

## Conclusione

Sistema ottimizzato per **intraday/scalping** con focus su:
- **Real-time data** (order book, funding rates, order flow)
- **Leverage metrics** (liquidations, risk management)
- **Microstruttura** (order book depth, imbalance, spread)

Tutte le features non utili per scalping sono state rimosse o ridotte.

