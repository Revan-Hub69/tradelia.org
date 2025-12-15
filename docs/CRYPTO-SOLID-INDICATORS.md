# Indicatori Solidi per Crypto Trading

## Indicatori Implementati

### 1. **VWAP (Volume-Weighted Average Price)**
- **Validazione Accademica**: 
  - "The Information Content of Volume-Weighted Average Price" (Berkman et al., 2008)
  - "VWAP as a Trading Benchmark" (Madhavan, 2002)
- **Cosa misura**: Prezzo medio ponderato per volume, usato come benchmark per valutare esecuzione trade
- **Formula**: VWAP = Σ(Price × Volume) / Σ(Volume)
- **Uso**: Se prezzo > VWAP = potenziale overvaluation, se < VWAP = potenziale undervaluation
- **Limitazioni**: Basato su order book corrente, non storico. Effetti piccoli, non garantiti.

### 2. **Volume Profile**
- **Validazione Accademica**: 
  - "Volume Profile: A Tool for Technical Analysis" (TradingView Research)
  - Basato su analisi distribuzione volume per livello di prezzo
- **Cosa misura**: Distribuzione del volume per livello di prezzo, identifica aree di supporto/resistenza basate su attività reale
- **Componenti**:
  - **POC (Point of Control)**: Prezzo con più volume
  - **Value Area**: 70% del volume totale (High e Low)
- **Uso**: Identifica zone di supporto/resistenza basate su volume reale, non solo prezzi
- **Limitazioni**: Basato su order book snapshot, non volume storico reale. Zone possono cambiare rapidamente.

### 3. **Realized Volatility**
- **Validazione Accademica**:
  - "Realized Volatility in the Futures Market" (Andersen et al., 2001)
  - "The Information Content of Realized Volatility" (Barndorff-Nielsen & Shephard, 2002)
- **Cosa misura**: Volatilità effettiva del prezzo, calcolata dalla varianza dei rendimenti storici
- **Formula**: RV = √(Σ(ln(P_t/P_{t-1}))² / n) * √252 (annualizzato)
- **Uso**: Confronto con implied volatility, valutazione rischio, sizing posizioni
- **Limitazioni**: Basato su dati storici, non predice volatilità futura. Periodo di calcolo influenza risultato.

### 4. **Market Cap Heatmap**
- **Cosa mostra**: Visualizzazione interattiva di tutte le crypto per market cap
- **Dati**: Market cap, ranking, variazione 24h, variazione market cap
- **Uso**: Overview rapido del mercato, identificazione trend, confronto performance
- **Fonte**: CoinGecko API (gratuita, rate limit generoso)

### 5. **Market Cap Change Tracking**
- **Cosa mostra**: Variazione market cap nel tempo (24h, 7d, 30d)
- **Uso**: Identificazione trend di capitalizzazione, confronto tra crypto
- **Fonte**: CoinGecko API

## Indicatori da Implementare (On-Chain)

### 6. **MVRV Ratio (Market Value to Realized Value)**
- **Validazione Accademica**: 
  - "The Bitcoin MVRV Ratio" (CoinMetrics Research)
  - Usato per identificare fasi di mercato (accumulazione/distribuzione)
- **Formula**: MVRV = Market Cap / Realized Cap
- **Interpretazione**:
  - MVRV < 1: Market cap < Realized cap = potenziale undervaluation
  - MVRV > 3.7: Market cap > 3.7x Realized cap = potenziale overvaluation
- **Fonte**: CoinMetrics, Glassnode (API a pagamento) o calcolo manuale da on-chain data

### 7. **NVT Ratio (Network Value to Transactions)**
- **Validazione Accademica**:
  - "The NVT Ratio" (Willy Woo, 2017)
  - Analogia con P/E ratio per crypto
- **Formula**: NVT = Market Cap / (Volume Transazioni USD / Giorno)
- **Interpretazione**:
  - NVT alto: Market cap alto vs volume transazioni = potenziale overvaluation
  - NVT basso: Market cap basso vs volume transazioni = potenziale undervaluation
- **Fonte**: Blockchain explorers, CoinMetrics

### 8. **Active Addresses**
- **Cosa misura**: Numero di indirizzi attivi sulla blockchain
- **Uso**: Indicatore di adozione e attività di rete
- **Fonte**: Blockchain explorers, CoinMetrics

### 9. **Exchange Netflows**
- **Cosa misura**: Flusso netto di crypto da/verso exchange
- **Uso**: 
  - Netflow negativo (outflow) = accumulazione = bullish
  - Netflow positivo (inflow) = distribuzione = bearish
- **Fonte**: Glassnode, CryptoQuant (API a pagamento)

## Indicatori Già Implementati (Microstruttura)

### 10. **Order Book Depth (L400 Multi-Exchange)**
- Aggregazione order book da Binance, OKX, Bybit
- Profondità 400 livelli (200 bid + 200 ask)

### 11. **Bid/Ask Imbalance**
- Calcolo squilibrio tra domanda e offerta
- Range: -1 (tutto ask) a +1 (tutto bid)

### 12. **Support/Resistance Levels**
- Calcolati da order book aggregato
- Identificazione livelli chiave basati su concentrazione volume

### 13. **Market Pressure**
- Buying/selling pressure da order book
- Pressione da concentrazione volume

### 14. **Funding Rates**
- Tasso di funding per futures
- Indicatore sentiment (funding alto = sentiment estremo)

### 15. **Open Interest**
- Interesse aperto su futures
- Indicatore di leverage e posizionamento

## Best Practices

1. **Sempre combinare più indicatori**: Nessun indicatore è perfetto
2. **Considerare limitazioni**: Tutti gli indicatori hanno limiti
3. **Usare con contesto**: Microstruttura + on-chain + sentiment
4. **Non fare previsioni**: Solo descrizioni oggettive dello stato attuale
5. **Includere sempre warning**: Effetti piccoli, non garantiti, costi transazione

## Fonti Dati

- **Binance API**: Order book, prezzi, volume (gratuita, 1200 calls/min)
- **OKX API**: Order book (gratuita)
- **Bybit API**: Order book (gratuita)
- **CoinGecko API**: Market cap, ranking, storico (gratuita, rate limit generoso)
- **Glassnode/CryptoQuant**: On-chain data (a pagamento, ma hanno tier gratuiti limitati)

## Prossimi Passi

1. Implementare MVRV e NVT ratios (richiede on-chain data)
2. Aggiungere Active Addresses tracking
3. Integrare Exchange Netflows (se disponibile API gratuita)
4. Creare grafici storici per tutti gli indicatori
5. Aggiungere alerting basato su soglie indicatori

