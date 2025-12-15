# Supporti e Resistenze: Metodologia e Lacune

## Da Dove Vengono i Supporti/Resistenze

### Metodologia Attuale

I supporti e resistenze vengono calcolati da **Order Book Depth aggregato** (L400 Multi-Exchange):

1. **Fonte Dati**: Order book aggregato da Binance + OKX + Bybit
2. **Profondità**: 400 livelli (200 bid + 200 ask)
3. **Metodo**:
   - **Supporti**: Cerca concentrazioni di **bid volume** (ordini di acquisto) **sotto** il prezzo corrente
   - **Resistenze**: Cerca concentrazioni di **ask volume** (ordini di vendita) **sopra** il prezzo corrente
   - Raggruppa volumi per fasce di prezzo (tolleranza 0.1%)
   - Classifica per forza basandosi su mediana volume:
     - `very-strong`: volume ≥ 5x mediana
     - `strong`: volume ≥ 2x mediana
     - `medium`: volume ≥ mediana
     - `weak`: volume ≥ 0.5x mediana
4. **Filtri**: 
   - Solo livelli entro 5% dal prezzo corrente
   - Solo top 5-10 livelli più forti

### Cosa Misura

- **Intenzione di trading**: Mostra dove ci sono molti ordini in attesa
- **Liquidità concentrata**: Identifica livelli con alta concentrazione di volume
- **Potenziali zone di reazione**: Dove il prezzo potrebbe rimbalzare o fermarsi

## Lacune Critiche del Sistema

### 1. **Order Book è Snapshot, Non Storico**

**Problema**: L'order book mostra solo lo stato **attuale**, non storico.

**Implicazioni**:
- I livelli possono cambiare rapidamente (ordini cancellati/modificati)
- Non considera se un livello è stato **testato ripetutamente** nel passato
- Un livello forte ora potrebbe scomparire tra pochi secondi

**Esempio**: Un supporto "very-strong" identificato alle 10:00 potrebbe non esistere più alle 10:01 se gli ordini vengono cancellati.

### 2. **Non Considera Volume Storico Reale**

**Problema**: Usa solo order book corrente, non volume **effettivamente scambiato** a quei livelli.

**Cosa manca**:
- Volume Profile storico (dove è stato scambiato più volume nel passato)
- POC (Point of Control) storico
- Value Area storica
- Test ripetuti di livelli (più test = più forte)

**Esempio**: Un livello potrebbe avere poco volume nell'order book ma essere stato un supporto forte storicamente (testato 10 volte).

### 3. **Order Book Può Essere Manipolato**

**Problema**: "Fake walls" - ordini grandi che vengono cancellati prima dell'esecuzione.

**Implicazioni**:
- Un supporto "very-strong" potrebbe essere un fake wall
- Market makers possono manipolare order book per influenzare prezzo
- Ordini iceberg (mostrano solo parte del volume reale)

**Esempio**: Un supporto a $50,000 con 100 BTC potrebbe essere cancellato quando il prezzo si avvicina.

### 4. **Non Considera Psychological Levels**

**Problema**: Non identifica livelli psicologici (round numbers, ATH, ATL).

**Cosa manca**:
- Round numbers ($50,000, $100,000)
- All-Time High (ATH) e All-Time Low (ATL)
- Livelli Fibonacci (se calcolati da swing)
- Livelli di prezzo "memorabili" (es. prezzo di lancio, IPO price)

**Esempio**: $50,000 potrebbe essere un supporto psicologico forte anche senza volume nell'order book.

### 5. **Limita a 5% di Distanza**

**Problema**: Filtra solo livelli entro 5% dal prezzo corrente.

**Implicazioni**:
- Perde supporti/resistenze importanti più lontani
- In mercati volatili, livelli chiave potrebbero essere oltre 5%
- Non considera supporti/resistenze a lungo termine

**Esempio**: Un supporto forte a -8% non viene mostrato.

### 6. **Non Considera Time-Weighted Volume**

**Problema**: Tutti i volumi hanno lo stesso peso, indipendentemente da quando sono stati inseriti.

**Cosa manca**:
- Volume recente potrebbe essere più rilevante
- Ordini vecchi potrebbero essere "dormienti"
- Non distingue tra ordini immediati vs limit orders a lungo termine

### 7. **Order Book Mostra Intenzione, Non Esecuzione**

**Problema**: Gli ordini nell'order book sono **intenzioni**, non esecuzioni reali.

**Implicazioni**:
- Ordini possono essere cancellati prima dell'esecuzione
- Non mostra volume **effettivamente scambiato** a quei livelli
- Non considera slippage o esecuzioni parziali

**Esempio**: Un supporto con 50 BTC potrebbe essere eseguito solo parzialmente o cancellato.

### 8. **Non Considera Market Structure**

**Problema**: Non distingue tra diversi tipi di ordini o partecipanti.

**Cosa manca**:
- Ordini retail vs institutional
- Market makers vs speculatori
- Stop-loss orders (che diventano market orders quando attivati)
- Take-profit orders

### 9. **Non Considera Correlazioni con Altri Indicatori**

**Problema**: Calcolo isolato, non integrato con altri dati.

**Cosa manca**:
- Conferma da Volume Profile storico
- Conferma da test ripetuti (price action)
- Conferma da indicatori tecnici (Fibonacci, moving averages)
- Conferma da on-chain data (whale accumulation/distribution)

### 10. **Non Considera Contexto Temporale**

**Problema**: Non distingue tra timeframe diversi.

**Cosa manca**:
- Supporti/resistenze intraday vs settimanali vs mensili
- Livelli validi per scalping vs swing trading vs investimento
- Non considera che livelli forti su timeframe più alti sono più rilevanti

## Cosa Dovremmo Aggiungere

### 1. **Volume Profile Storico**
- Calcola POC storico (prezzo con più volume scambiato)
- Identifica Value Area storica
- Mostra dove è stato scambiato più volume nel passato

### 2. **Price Action Analysis**
- Conta quante volte un livello è stato testato
- Identifica rimbalzi/rotture storiche
- Classifica livelli per "numero di test"

### 3. **Psychological Levels**
- Round numbers ($50k, $100k)
- ATH/ATL
- Livelli Fibonacci (se calcolati)

### 4. **On-Chain Data Integration**
- Whale accumulation/distribution zones
- Exchange netflows (supporti dove whale accumulano)
- Realized price (prezzo medio di acquisto)

### 5. **Multi-Timeframe Analysis**
- Supporti/resistenze su diversi timeframe (1h, 4h, 1d, 1w)
- Livelli più forti su timeframe più alti hanno più peso

### 6. **Order Book Quality Metrics**
- Distingue tra ordini "reali" vs potenziali fake walls
- Considera time-to-live degli ordini
- Analizza pattern di cancellazione/modifica

### 7. **Confirmation da Altri Indicatori**
- Volume Profile storico
- Moving averages (supporti/resistenze dinamiche)
- Fibonacci retracements
- On-chain metrics

## Raccomandazioni

### Per Uso Intraday/Scalping
- **Order book corrente è utile** per identificare livelli immediati
- **Attenzione**: I livelli cambiano rapidamente, verificare sempre prima di tradare
- **Combinare con**: Volume Profile intraday, bid/ask imbalance

### Per Swing Trading
- **Aggiungere**: Volume Profile storico, test ripetuti, psychological levels
- **Timeframe**: Considerare livelli su 4h, 1d, 1w
- **Conferma**: On-chain data, whale movements

### Per Investimento
- **Focus**: Livelli su timeframe settimanali/mensili
- **Aggiungere**: On-chain data, realized price, whale accumulation zones
- **Psychological levels**: ATH, round numbers, prezzo di lancio

## Warning Metodologici

1. **I supporti/resistenze da order book sono "intenzioni", non garanzie**
2. **I livelli possono cambiare rapidamente (ordini cancellati)**
3. **Non considerano volume storico reale**
4. **Possono essere manipolati (fake walls)**
5. **Non considerano psychological levels**
6. **Limitati a 5% di distanza - potrebbero perdere livelli importanti**
7. **Non considerano test ripetuti nel passato**
8. **Non distinguono tra timeframe diversi**

## Conclusione

Il sistema attuale è **utile per intraday/scalping** perché mostra livelli immediati basati su intenzioni di trading correnti. Tuttavia, ha **lacune significative** per swing trading e investimento, dove servono:
- Volume Profile storico
- Test ripetuti
- Psychological levels
- On-chain data
- Multi-timeframe analysis

**Raccomandazione**: Aggiungere questi elementi per rendere il sistema più completo e robusto.

