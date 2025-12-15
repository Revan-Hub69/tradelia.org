# 📊 IPO - COSA POSSIAMO SAPERE REALMENTE

## 🎯 VERIFICA COMPLETA DATI IPO DISPONIBILI

---

## ✅ **1. DATI DA FINNHUB IPO CALENDAR** (FREE TIER)

### **API**: Finnhub `/calendar/ipo`
**Costo**: GRATIS (60 calls/min)
**Status**: ✅ Già implementato

### **Cosa fornisce REALMENTE**:

#### ✅ **Dati Base** (Reali):
1. ✅ **Symbol** - Simbolo ticker
2. ✅ **Name** - Nome azienda
3. ✅ **Exchange** - Borsa (NASDAQ, NYSE, etc.)
4. ✅ **Date** - Data IPO
5. ✅ **Price** - Prezzo IPO (se disponibile)
6. ✅ **NumberOfShares** - Numero azioni offerte (se disponibile)

#### ⚠️ **Cosa NON fornisce**:
- ❌ Partecipazione istituzionale
- ❌ Soldi raccolti totali (proceeds)
- ❌ Underwriters
- ❌ Lock-up periods
- ❌ Allocation details
- ❌ Pre-IPO valuation
- ❌ Post-IPO performance (solo se fetchiamo separatamente)

---

## 📊 **2. COSA POSSIAMO CALCOLARE** (Dati Finnhub)

### ✅ **Market Cap IPO** (Calcolabile)
**Formula**: `Price × NumberOfShares`

**Esempio**:
- Price: $16
- NumberOfShares: 10,000,000
- **Market Cap IPO**: $160,000,000

**Status**: ✅ Già calcolato nel codice
**File**: `app/api/market/ipo-calendar/route.ts` (linea 139-141)

---

### ✅ **Price Range** (Stimato)
**Formula**: `Price × 0.9` (low) e `Price × 1.1` (high)

**Esempio**:
- Price: $16
- **Price Range**: $14.40 - $17.60

**Status**: ✅ Già calcolato nel codice (linea 133-136)
**Nota**: ⚠️ Stimato, non reale

---

### ✅ **Total Proceeds** (Calcolabile)
**Formula**: `Price × NumberOfShares`

**Esempio**:
- Price: $16
- NumberOfShares: 10,000,000
- **Total Proceeds**: $160,000,000

**Status**: ✅ Già calcolato (è il Market Cap IPO)
**Nota**: Questo è il totale raccolto dall'IPO

---

## 🔍 **3. DATI REALI DA SEC EDGAR** (GRATIS)

### ✅ **SEC S-1 Filing** (Pre-IPO Prospectus)

**API**: SEC EDGAR (GRATIS, no key)
**Endpoint**: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=S-1`

#### **Cosa possiamo estrarre**:

1. ✅ **Total Proceeds** (Soldi raccolti totali)
   - Sezione "Use of Proceeds"
   - Valore esatto in USD

2. ✅ **Shares Offered**
   - Numero esatto azioni offerte
   - Primary vs Secondary shares

3. ✅ **Price Range**
   - Range reale (non stimato)
   - Esempio: "$14.00 - $16.00"

4. ✅ **Underwriters**
   - Lista underwriters principali
   - Lead underwriters
   - Co-managers

5. ✅ **Institutional Allocation**
   - Percentuale istituzionale vs retail
   - Top institutional investors (se disponibile)
   - Allocation details

6. ✅ **Lock-up Period**
   - Durata lock-up
   - Data scadenza lock-up

7. ✅ **Pre-IPO Valuation**
   - Valuation pre-IPO
   - Post-money valuation

8. ✅ **Use of Proceeds**
   - Come useranno i soldi raccolti
   - Breakdown per categoria

9. ✅ **Risk Factors**
   - Risk factors principali
   - Warnings

10. ✅ **Financials Pre-IPO**
    - Revenue, EBITDA, Net Income
    - Growth rates
    - Margins

**Tempo**: 6-8 ore (parsing complesso)
**Status**: ⚠️ Da implementare

---

### ✅ **SEC 13F Filings** (Post-IPO Holdings)

**API**: SEC EDGAR (GRATIS, no key)
**Endpoint**: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=13F-HR`

#### **Cosa possiamo estrarre**:

1. ✅ **Institutional Holdings**
   - Holdings per istituzione
   - Percentuale ownership
   - Shares held

2. ✅ **Top Institutional Investors**
   - BlackRock, Vanguard, Fidelity, etc.
   - Holdings esatti
   - Changes quarter-over-quarter

3. ✅ **Total Institutional Ownership**
   - Percentuale totale istituzionale
   - Calcolato aggregando 13F

4. ✅ **Institutional Concentration**
   - Top 10 holders
   - Herfindahl index

**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

---

## 📈 **4. DATI DA ALTRE FONTI GRATUITE**

### ✅ **Yahoo Finance IPO Data** (GRATIS, non ufficiale)

**Cosa fornisce**:
- ✅ Prezzo IPO
- ✅ Data IPO
- ✅ Performance post-IPO
- ✅ Market cap
- ⚠️ **NON fornisce**: Proceeds, allocation, institutional data

**Status**: ⚠️ Non ufficiale, scraping fragile

---

### ✅ **Alpha Vantage IPO Calendar** (FREE TIER)

**API**: Alpha Vantage (GRATIS, 5 calls/min)

**Cosa fornisce**:
- ✅ IPO calendar
- ✅ Prezzo, data
- ❌ **NON fornisce**: Proceeds, allocation, institutional data

**Status**: ⚠️ Non migliore di Finnhub

---

### ✅ **IPO Performance Tracking** (Calcolabile)

**Cosa possiamo calcolare**:
- ✅ Prezzo corrente (da Finnhub quote)
- ✅ Change since IPO
- ✅ Change percent
- ✅ Days since IPO
- ✅ High/Low since IPO

**API**: Finnhub Quote (GRATIS)
**Tempo**: 2-3 ore
**Status**: ⚠️ Parzialmente implementato (simulato)

---

## 📋 **5. RIEPILOGO DATI IPO DISPONIBILI**

### ✅ **Dati REALI già disponibili** (Finnhub):
1. ✅ Symbol, Name, Exchange
2. ✅ IPO Date
3. ✅ Price (se disponibile)
4. ✅ NumberOfShares (se disponibile)
5. ✅ Market Cap IPO (calcolato: Price × Shares)
6. ✅ Total Proceeds (calcolato: Price × Shares)

### ⚠️ **Dati REALI da implementare** (SEC EDGAR):
7. ⚠️ **Total Proceeds** (reale da S-1, non calcolato)
8. ⚠️ **Price Range** (reale da S-1, non stimato)
9. ⚠️ **Underwriters** (da S-1)
10. ⚠️ **Institutional Allocation** (da S-1)
11. ⚠️ **Lock-up Period** (da S-1)
12. ⚠️ **Pre-IPO Valuation** (da S-1)
13. ⚠️ **Use of Proceeds** (da S-1)
14. ⚠️ **Financials Pre-IPO** (da S-1)
15. ⚠️ **Post-IPO Institutional Holdings** (da 13F)
16. ⚠️ **Top Institutional Investors** (da 13F)
17. ⚠️ **Total Institutional Ownership** (da 13F aggregato)

### ⚠️ **Dati da implementare** (Calcoli):
18. ⚠️ **IPO Performance Tracking** (reale, non simulato)
19. ⚠️ **High/Low since IPO**
20. ⚠️ **Volume analysis post-IPO**

---

## 🎯 **6. COSA POSSIAMO SAPERE REALMENTE - RIEPILOGO**

### ✅ **SUBITO** (Già implementato):
- ✅ Symbol, Name, Exchange, Date
- ✅ Price (se disponibile da Finnhub)
- ✅ Shares (se disponibile da Finnhub)
- ✅ Market Cap IPO (calcolato)
- ✅ Total Proceeds (calcolato = Market Cap)

### ⚠️ **CON SEC EDGAR** (Da implementare):
- ⚠️ **Total Proceeds** (reale, esatto)
- ⚠️ **Price Range** (reale, non stimato)
- ⚠️ **Underwriters** (lista reale)
- ⚠️ **Institutional Allocation** (percentuale reale)
- ⚠️ **Top Institutional Investors** (lista reale)
- ⚠️ **Lock-up Period** (data reale)
- ⚠️ **Pre-IPO Valuation** (valore reale)
- ⚠️ **Use of Proceeds** (breakdown reale)
- ⚠️ **Financials Pre-IPO** (revenue, EBITDA, etc.)
- ⚠️ **Post-IPO Holdings** (13F, quarterly)

### ⚠️ **CON CALCOLI** (Da implementare):
- ⚠️ **IPO Performance** (reale, non simulato)
- ⚠️ **High/Low since IPO**
- ⚠️ **Volume analysis**

---

## 🚀 **7. PIANO IMPLEMENTAZIONE**

### **Fase 1: Migliorare Dati Esistenti** (2-3 ore)
1. ✅ Fetch real price/performance post-IPO (Finnhub quote)
2. ✅ Calcolare High/Low since IPO
3. ✅ Volume analysis post-IPO

### **Fase 2: SEC S-1 Parser** (6-8 ore)
1. ✅ Fetch S-1 filings per IPO
2. ✅ Parsare Total Proceeds (reale)
3. ✅ Parsare Price Range (reale)
4. ✅ Parsare Underwriters
5. ✅ Parsare Institutional Allocation
6. ✅ Parsare Lock-up Period
7. ✅ Parsare Use of Proceeds
8. ✅ Parsare Financials Pre-IPO

### **Fase 3: SEC 13F Parser** (4-5 ore)
1. ✅ Fetch 13F filings post-IPO
2. ✅ Parsare Institutional Holdings
3. ✅ Aggregare Total Institutional Ownership
4. ✅ Lista Top Institutional Investors

---

## 📊 **8. ESEMPIO DATI COMPLETI IPO**

### **Con Implementazione Completa**:

```json
{
  "symbol": "EXAMPLE",
  "name": "Example Corp",
  "exchange": "NASDAQ",
  "ipoDate": "2025-02-15",
  
  // Dati Base (Finnhub - già disponibili)
  "price": 16.00,
  "shares": 10000000,
  "marketCapIPO": 160000000,
  
  // Dati Reali SEC S-1 (da implementare)
  "totalProceeds": 160000000, // Reale da S-1
  "priceRange": {
    "low": 14.00, // Reale da S-1
    "high": 16.00 // Reale da S-1
  },
  "underwriters": [
    "Goldman Sachs",
    "Morgan Stanley",
    "JPMorgan"
  ],
  "institutionalAllocation": {
    "percentage": 75, // Reale da S-1
    "retailPercentage": 25
  },
  "lockUpPeriod": {
    "days": 180,
    "expiryDate": "2025-08-15"
  },
  "preIPOValuation": 1500000000,
  "useOfProceeds": {
    "productDevelopment": 40,
    "salesMarketing": 30,
    "workingCapital": 20,
    "other": 10
  },
  "financialsPreIPO": {
    "revenue": 50000000,
    "ebitda": -10000000,
    "netIncome": -15000000,
    "growthRate": 45
  },
  
  // Dati Post-IPO (13F - da implementare)
  "institutionalHoldings": {
    "totalPercentage": 68, // Reale da 13F aggregato
    "topInvestors": [
      {
        "name": "BlackRock",
        "shares": 2500000,
        "percentage": 12.5
      },
      {
        "name": "Vanguard",
        "shares": 2000000,
        "percentage": 10.0
      }
    ]
  },
  
  // Performance (da implementare reale)
  "performance": {
    "currentPrice": 18.50,
    "changeSinceIPO": 2.50,
    "changePercent": 15.63,
    "highSinceIPO": 20.00,
    "lowSinceIPO": 14.50,
    "daysSinceIPO": 45
  }
}
```

---

## ✅ **9. CONCLUSIONE**

### **Cosa sappiamo SUBITO** (Già implementato):
- ✅ Symbol, Name, Exchange, Date
- ✅ Price, Shares (se disponibili)
- ✅ Market Cap IPO (calcolato)
- ✅ Total Proceeds (calcolato = Market Cap)

### **Cosa possiamo sapere REALMENTE** (Con SEC EDGAR):
- ✅ **Total Proceeds** (reale, esatto)
- ✅ **Price Range** (reale)
- ✅ **Underwriters** (lista reale)
- ✅ **Institutional Allocation** (percentuale reale)
- ✅ **Top Institutional Investors** (lista reale)
- ✅ **Lock-up Period** (data reale)
- ✅ **Pre-IPO Valuation** (valore reale)
- ✅ **Use of Proceeds** (breakdown reale)
- ✅ **Financials Pre-IPO** (revenue, EBITDA, etc.)
- ✅ **Post-IPO Holdings** (13F, quarterly)

### **Tempo Totale**: 12-16 ore

**TUTTO CON FREE TIER!**

**Vuoi che implementi i dati reali IPO usando SEC EDGAR?**
