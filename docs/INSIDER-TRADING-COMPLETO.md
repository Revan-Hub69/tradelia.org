# 📊 INSIDER TRADING - COSA POSSIAMO SAPERE REALMENTE

## ⚠️ **MANCA: INSIDER TRADING** ❌

**Status**: ❌ Non implementato
**Importanza**: ⭐⭐⭐⭐⭐ (Molto alta - indicator accademicamente valido)

---

## 🎯 **COSA SONO GLI INSIDER TRADING**

### **Definizione**:
- Transazioni di **dirigenti, amministratori, e grandi azionisti** (insider)
- Compravendita di azioni della loro azienda
- **Pubblico e legale** (non è insider trading illegale)
- **Form 4 SEC** (obbligatorio per legge)

### **Perché è importante**:
- ✅ **Insider buying** = Segnale positivo (credono nell'azienda)
- ✅ **Insider selling** = Segnale negativo (o semplicemente diversificazione)
- ✅ **Pattern di acquisto** = Possibile bottom
- ✅ **Pattern di vendita** = Possibile top
- ✅ **Accademicamente validato**: Seyhun (1986), Jaffe (1974)

---

## 📊 **1. DATI DA SEC FORM 4** (GRATIS)

### **API**: SEC EDGAR (GRATIS, no key)
**Endpoint**: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=4`

### **Cosa fornisce REALMENTE**:

#### ✅ **Dati Base**:
1. ✅ **Insider Name** - Nome insider (CEO, CFO, Director, etc.)
2. ✅ **Title** - Ruolo (CEO, CFO, Director, etc.)
3. ✅ **Transaction Date** - Data transazione
4. ✅ **Transaction Type** - Acquisto/Vendita
5. ✅ **Shares** - Numero azioni
6. ✅ **Price** - Prezzo transazione
7. ✅ **Value** - Valore totale (Shares × Price)
8. ✅ **Ownership After** - Ownership dopo transazione
9. ✅ **Transaction Code** - Tipo transazione (P = Purchase, S = Sale, etc.)

#### ✅ **Dati Avanzati**:
10. ✅ **Direct vs Indirect** - Diretto o indiretto (trust, etc.)
11. ✅ **Nature of Ownership** - Tipo ownership
12. ✅ **Acquisition/Disposition** - Acquisizione o disposizione
13. ✅ **Exercise of Options** - Esercizio opzioni
14. ✅ **Grant of Options** - Grant opzioni

---

## 📈 **2. INDICATORI INSIDER COMPOSITI**

### ⚠️ **Da Implementare** (FREE TIER)

#### a) **Insider Buy/Sell Ratio** ⭐⭐⭐⭐⭐
**Paper**: Seyhun (1986) - "Insiders' Profits, Costs of Trading, and Market Efficiency"

**Cosa fa**:
- Ratio tra insider buying e selling
- Ratio > 1 = Più acquisti che vendite (bullish)
- Ratio < 1 = Più vendite che acquisti (bearish)

**Calcolo**:
- Buy/Sell Ratio = Total Buy Value / Total Sell Value
- Normalizzato su periodo (30D, 90D, 1Y)

**API**: SEC Form 4 (GRATIS)
**Tempo**: 3-4 ore
**Status**: ⚠️ Da implementare

---

#### b) **Insider Accumulation Index** ⭐⭐⭐⭐⭐
**Paper**: Jaffe (1974) - "Special Information and Insider Trading"

**Cosa fa**:
- Accumula net buying/selling nel tempo
- Identifica pattern di accumulo
- Predittore di performance futura

**Calcolo**:
- Net Buying = Buy Value - Sell Value (per periodo)
- Cumulative Index = Somma cumulativa di Net Buying

**API**: SEC Form 4 (GRATIS)
**Tempo**: 3-4 ore
**Status**: ⚠️ Da implementare

---

#### c) **Insider Confidence Index** ⭐⭐⭐⭐⭐
**Paper**: Insider Trading Research

**Cosa fa**:
- Combina multiple metriche insider
- Score 0-100 (0 = massima vendita, 100 = massimo acquisto)

**Calcolo**:
- Buy/Sell Ratio (peso 40%)
- Number of Insiders Buying (peso 30%)
- Average Transaction Size (peso 20%)
- CEO/CFO Transactions (peso 10%)

**API**: SEC Form 4 (GRATIS)
**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

---

#### d) **Insider Cluster Analysis** ⭐⭐⭐⭐
**Cosa fa**:
- Identifica cluster di transazioni insider
- Multiple insider che comprano/vendono insieme
- Segnale più forte di singole transazioni

**Calcolo**:
- Raggruppa transazioni per periodo (7D, 30D)
- Identifica cluster (3+ insider stesso periodo)
- Calcola cluster strength

**API**: SEC Form 4 (GRATIS)
**Tempo**: 3-4 ore
**Status**: ⚠️ Da implementare

---

#### e) **CEO/CFO Transactions** ⭐⭐⭐⭐⭐
**Cosa fa**:
- Focus su transazioni CEO e CFO
- Più significative di altri insider
- Predittore più forte

**Calcolo**:
- Filtra transazioni CEO/CFO
- Calcola net buying/selling
- Weighted score

**API**: SEC Form 4 (GRATIS)
**Tempo**: 2-3 ore
**Status**: ⚠️ Da implementare

---

#### f) **Insider vs Price Divergence** ⭐⭐⭐⭐
**Cosa fa**:
- Identifica divergenze tra insider activity e prezzo
- Insider buying durante calo = Segnale forte
- Insider selling durante rialzo = Segnale debole

**Calcolo**:
- Correlazione tra insider activity e prezzo
- Identifica divergenze
- Score divergenza

**API**: SEC Form 4 + Finnhub Quote (GRATIS)
**Tempo**: 3-4 ore
**Status**: ⚠️ Da implementare

---

## 📊 **3. DATI DISPONIBILI CON FREE TIER**

### ✅ **SEC Form 4** (GRATIS, no key)

**Cosa fornisce**:
- ✅ Tutte le transazioni insider (pubbliche)
- ✅ Nome, ruolo, data, tipo, shares, price
- ✅ Ownership dopo transazione
- ✅ Transaction codes (P, S, A, D, etc.)

**Limitazioni**:
- ⚠️ Solo IPO USA (SEC è USA)
- ⚠️ Richiede parsing complesso (XML/HTML)
- ⚠️ Dati disponibili dopo 2 giorni dalla transazione

**Status**: ⚠️ Da implementare

---

### ✅ **Finnhub Insider Transactions** (FREE TIER)

**API**: Finnhub (GRATIS, 60 calls/min)

**Cosa fornisce**:
- ✅ Insider transactions
- ✅ Buy/Sell data
- ✅ Transaction details

**Endpoint**: `/stock/insider-transactions?symbol={symbol}`

**Limitazioni**:
- ⚠️ Potrebbe essere limitato nel free tier
- ⚠️ Da verificare disponibilità

**Status**: ⚠️ Da verificare e implementare

---

## 🚀 **4. PIANO IMPLEMENTAZIONE**

### **Fase 1: SEC Form 4 Parser** (6-8 ore)

1. **SEC EDGAR Client**
   - Fetch Form 4 filings per symbol
   - Parsare XML/HTML
   - Estrarre transaction data

2. **Data Processing**
   - Normalizzare transaction types
   - Calcolare values
   - Aggregare per periodo

3. **Storage**
   - Cache SEC data
   - Update daily

---

### **Fase 2: Insider Indicators** (8-10 ore)

1. **Buy/Sell Ratio** (3-4 ore)
2. **Accumulation Index** (3-4 ore)
3. **Confidence Index** (4-5 ore)
4. **Cluster Analysis** (3-4 ore)
5. **CEO/CFO Focus** (2-3 ore)
6. **Price Divergence** (3-4 ore)

---

### **Fase 3: Finnhub Integration** (2-3 ore)

1. **Verificare disponibilità** Finnhub insider data
2. **Integrare** se disponibile
3. **Fallback** a SEC se non disponibile

---

## 📋 **5. API ROUTE PROPOSTA**

### **`/api/market/insider-transactions`**

**Query Params**:
- `symbol` - Stock symbol
- `days` - Periodo (30, 90, 365)
- `type` - All, Buy, Sell
- `role` - All, CEO, CFO, Director

**Response**:
```json
{
  "symbol": "AAPL",
  "period": "30D",
  "transactions": [
    {
      "insiderName": "Tim Cook",
      "title": "CEO",
      "transactionDate": "2025-01-15",
      "type": "Purchase",
      "shares": 10000,
      "price": 150.00,
      "value": 1500000,
      "ownershipAfter": 0.05
    }
  ],
  "summary": {
    "totalBuyValue": 5000000,
    "totalSellValue": 2000000,
    "buySellRatio": 2.5,
    "netBuying": 3000000,
    "insiderConfidence": 75,
    "ceoCfoActivity": {
      "ceoBuying": true,
      "cfoBuying": true
    }
  },
  "indicators": {
    "buySellRatio": 2.5,
    "accumulationIndex": 125,
    "confidenceIndex": 75,
    "clusterStrength": 0.8
  }
}
```

---

## 📊 **6. INDICATORI INSIDER COMPOSITI**

### ⚠️ **Da Implementare** (FREE TIER)

#### a) **Insider Activity Composite** ⭐⭐⭐⭐⭐
**Paper**: Seyhun (1986), Jaffe (1974)

**Calcolo**:
- Buy/Sell Ratio (peso 30%)
- Accumulation Index (peso 25%)
- Confidence Index (peso 20%)
- CEO/CFO Activity (peso 15%)
- Cluster Strength (peso 10%)

**Score**: 0-100 (0 = massima vendita, 100 = massimo acquisto)

**API**: SEC Form 4 (GRATIS)
**Tempo**: 5-6 ore
**Status**: ⚠️ Da implementare

---

#### b) **Insider vs Institutional Flow** ⭐⭐⭐⭐
**Cosa fa**:
- Confronta insider activity con institutional flow (13F)
- Divergenze = Segnali interessanti
- Convergenza = Conferma

**Calcolo**:
- Insider Activity Score
- Institutional Flow Score (da 13F)
- Correlation/Divergence

**API**: SEC Form 4 + SEC 13F (GRATIS)
**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

---

## 🎯 **7. PRIORITÀ IMPLEMENTAZIONE**

### **Priorità ALTA**:
1. ✅ **SEC Form 4 Parser** (6-8 ore)
   - Base per tutti gli indicatori
   - Dati reali, pubblici, gratis

2. ✅ **Buy/Sell Ratio** (3-4 ore)
   - Indicatore semplice ma potente
   - Accademicamente validato

3. ✅ **CEO/CFO Transactions** (2-3 ore)
   - Più significative
   - Facile da implementare

### **Priorità MEDIA**:
4. ⚠️ **Accumulation Index** (3-4 ore)
5. ⚠️ **Confidence Index** (4-5 ore)
6. ⚠️ **Cluster Analysis** (3-4 ore)

### **Priorità BASSA**:
7. ⚠️ **Price Divergence** (3-4 ore)
8. ⚠️ **Insider vs Institutional** (4-5 ore)

---

## 📋 **8. RIEPILOGO COMPLETO**

### ✅ **Già Implementato**:
- ❌ Niente (insider trading non implementato)

### ⚠️ **Da Implementare** (FREE TIER):
1. ⚠️ SEC Form 4 Parser
2. ⚠️ Buy/Sell Ratio
3. ⚠️ Accumulation Index
4. ⚠️ Confidence Index
5. ⚠️ Cluster Analysis
6. ⚠️ CEO/CFO Focus
7. ⚠️ Price Divergence
8. ⚠️ Insider Activity Composite
9. ⚠️ Insider vs Institutional Flow

---

## 🚀 **9. TOTALE: 9 INDICATORI INSIDER**

### **Tempo Totale**: 30-40 ore (~4-5 giorni)

**TUTTI CON FREE TIER (SEC EDGAR)!**

---

## ✅ **10. CONCLUSIONE**

### **Situazione Attuale**:
- ❌ **Insider Trading: NON implementato**
- ❌ Manca completamente

### **Soluzione FREE TIER**:
- ✅ **SEC Form 4** (GRATIS, no key)
- ✅ **Dati reali** (pubblici, obbligatori per legge)
- ✅ **9 indicatori insider** possibili
- ⚠️ Richiede parsing complesso

### **Tempo Totale**: 30-40 ore

**Vuoi che implementi gli insider trading usando SEC Form 4?**

---

## 📊 **11. ESEMPIO DATI INSIDER COMPLETI**

```json
{
  "symbol": "AAPL",
  "period": "30D",
  "transactions": [
    {
      "insiderName": "Tim Cook",
      "title": "CEO",
      "transactionDate": "2025-01-15",
      "type": "Purchase",
      "shares": 10000,
      "price": 150.00,
      "value": 1500000,
      "ownershipAfter": 0.05,
      "transactionCode": "P"
    },
    {
      "insiderName": "Luca Maestri",
      "title": "CFO",
      "transactionDate": "2025-01-20",
      "type": "Purchase",
      "shares": 5000,
      "price": 152.00,
      "value": 760000,
      "ownershipAfter": 0.02,
      "transactionCode": "P"
    }
  ],
  "summary": {
    "totalBuyValue": 5000000,
    "totalSellValue": 2000000,
    "buySellRatio": 2.5,
    "netBuying": 3000000,
    "numberOfBuyers": 8,
    "numberOfSellers": 3,
    "ceoCfoActivity": {
      "ceoBuying": true,
      "cfoBuying": true,
      "directorsBuying": 5
    }
  },
  "indicators": {
    "buySellRatio": 2.5,
    "accumulationIndex": 125,
    "confidenceIndex": 75,
    "clusterStrength": 0.8,
    "priceDivergence": 0.65
  }
}
```
