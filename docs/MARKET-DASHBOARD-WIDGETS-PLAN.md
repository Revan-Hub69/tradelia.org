# Piano Widget Cruscotto Operativo - Panoramica Dashboard
## Analisi e Proposta Completa

**Data:** 2025-01-27  
**Obiettivo:** Creare un cruscotto operativo completo nella panoramica con i widget più importanti per un trader

---

## Analisi Indicatori Disponibili

### Indicatori Attualmente Disponibili
1. **VIX** - Volatilità mercati (già nel widget)
2. **Fear & Greed Index** - Sentiment crypto (già nel widget)
3. **Bitcoin Dominance** - Dominanza BTC (già nel widget)
4. **Crypto Market Cap** - Capitalizzazione totale crypto (già nel widget)
5. **Stock Indexes** - Indici azionari (S&P 500, NASDAQ, Dow Jones, FTSE, DAX, Nikkei)
6. **Forex** - Coppie forex principali (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD)
7. **Commodities** - Materie prime (Oro, Argento, Petrolio, Gas Naturale)
8. **Bond Yields** - Rendimenti obbligazionari (US 10Y, US 2Y, Bund, Gilt)
9. **Economic Indicators** - Indicatori economici (GDP, Inflation, Unemployment)

---

## Proposta Cruscotto Operativo Completo

### Fase 1: Widget Base (4 indicatori) - ✅ IMPLEMENTATO
**Priorità:** ALTA - Essenziali per vista operativa immediata

1. **VIX** ✅
   - Perché: Indicatore di volatilità e paura del mercato
   - Utilità: Capire se mercato è in stress o calmo
   - Formato: Valore + trend %

2. **Fear & Greed Index** ✅
   - Perché: Sentiment crypto in tempo reale
   - Utilità: Capire se mercato è in eccesso di rialzo o ribasso
   - Formato: Valore 0-100 + classificazione

3. **Bitcoin Dominance** ✅
   - Perché: Mostra se BTC sta guadagnando/perdendo terreno vs altcoin
   - Utilità: Capire rotazione capitali crypto
   - Formato: Percentuale + trend

4. **Crypto Market Cap** ✅
   - Perché: Dimensione totale mercato crypto
   - Utilità: Capire liquidità e dimensione mercato
   - Formato: $X.XXT

---

### Fase 2: Widget Estesi (8-12 indicatori)
**Priorità:** MEDIA - Aggiungere per vista più completa

#### Opzione A: Focus Crypto (8 indicatori)
1. VIX ✅
2. Fear & Greed ✅
3. Bitcoin Dominance ✅
4. Crypto Market Cap ✅
5. **BTC Price** - Prezzo Bitcoin con % change 24h
6. **ETH Price** - Prezzo Ethereum con % change 24h
7. **Total Crypto Volume 24h** - Volume scambiato ultime 24h
8. **DeFi TVL** - Total Value Locked in DeFi

#### Opzione B: Multi-Asset (10 indicatori)
1. VIX ✅
2. Fear & Greed ✅
3. Bitcoin Dominance ✅
4. Crypto Market Cap ✅
5. **S&P 500** - Indice azionario principale
6. **EUR/USD** - Coppia forex più scambiata
7. **Gold** - Oro (safe haven)
8. **Oil (WTI)** - Petrolio (commodity chiave)
9. **US 10Y Yield** - Rendimento obbligazionario USA
10. **DXY** - Dollar Index (forza dollaro)

#### Opzione C: Balanced (12 indicatori) - RACCOMANDATO
**Crypto (4):**
1. VIX ✅
2. Fear & Greed ✅
3. Bitcoin Dominance ✅
4. Crypto Market Cap ✅

**Stocks (2):**
5. **S&P 500** - Indice azionario principale USA
6. **NASDAQ** - Indice tech USA

**Forex (2):**
7. **EUR/USD** - Coppia più scambiata
8. **USD/JPY** - Coppia importante per carry trade

**Commodities (2):**
9. **Gold** - Oro (safe haven)
10. **Oil (WTI)** - Petrolio (commodity chiave)

**Bonds (1):**
11. **US 10Y Yield** - Rendimento obbligazionario USA

**Macro (1):**
12. **DXY** - Dollar Index (forza dollaro)

---

## Raccomandazione: Opzione C (Balanced - 12 indicatori)

### Perché 12 indicatori?
- **Copertura completa:** Crypto, Stocks, Forex, Commodities, Bonds, Macro
- **Vista operativa:** Tutti gli asset class principali in un colpo d'occhio
- **Layout ottimale:** 3 righe x 4 colonne (desktop) o 2 righe x 6 (tablet)
- **Performance:** Caricamento parallelo, cache 5 minuti

### Layout Proposto

#### Desktop (≥1024px)
```
┌─────────┬─────────┬─────────┬─────────┐
│   VIX   │ Fear&Gr │ BTC Dom │ Crypto$ │
├─────────┼─────────┼─────────┼─────────┤
│  S&P500 │ NASDAQ  │ EUR/USD │ USD/JPY │
├─────────┼─────────┼─────────┼─────────┤
│  Gold   │  Oil    │ US 10Y  │   DXY   │
└─────────┴─────────┴─────────┴─────────┘
```

#### Tablet (768px-1023px)
```
┌─────────┬─────────┬─────────┐
│   VIX   │ Fear&Gr │ BTC Dom │
├─────────┼─────────┼─────────┤
│ Crypto$ │  S&P500 │ NASDAQ  │
├─────────┼─────────┼─────────┤
│ EUR/USD │ USD/JPY │  Gold   │
├─────────┼─────────┼─────────┤
│  Oil    │ US 10Y  │   DXY   │
└─────────┴─────────┴─────────┘
```

#### Mobile (<768px)
```
┌─────────┬─────────┐
│   VIX   │ Fear&Gr │
├─────────┼─────────┤
│ BTC Dom │ Crypto$ │
├─────────┼─────────┤
│  S&P500 │ NASDAQ  │
├─────────┼─────────┤
│ EUR/USD │ USD/JPY │
├─────────┼─────────┤
│  Gold   │  Oil    │
├─────────┼─────────┤
│ US 10Y  │   DXY   │
└─────────┴─────────┘
```

---

## Implementazione

### Step 1: Estendere MarketDashboardWidget
- Aggiungere fetch per gli 8 indicatori aggiuntivi
- Implementare layout responsive (grid 4/3/2 colonne)
- Aggiungere loading states per ogni indicatore
- Gestire errori gracefully (se un indicatore fallisce, mostra gli altri)

### Step 2: Creare API Endpoints (se necessario)
- Verificare quali API esistono già
- Creare endpoint mancanti per:
  - S&P 500, NASDAQ
  - EUR/USD, USD/JPY
  - Gold, Oil
  - US 10Y Yield
  - DXY

### Step 3: Ottimizzazioni
- **Parallel fetching:** Tutti gli indicatori in parallelo
- **Caching:** 5 minuti cache per ogni indicatore
- **Error handling:** Se un indicatore fallisce, mostra "—" invece di bloccare tutto
- **Progressive loading:** Mostra indicatori disponibili mentre altri caricano

### Step 4: Personalizzazione (Futuro)
- Permettere all'utente di scegliere quali indicatori mostrare
- Salvare preferenze in `user_preferences`
- Drag & drop per riordinare (futuro)

---

## Priorità Implementazione

### Fase 1: Base (4 indicatori) - ✅ COMPLETATO
- VIX, Fear & Greed, BTC Dominance, Crypto Market Cap

### Fase 2: Crypto Esteso (8 indicatori) - PROSSIMO
- Aggiungere: BTC Price, ETH Price, Total Volume 24h, DeFi TVL
- **Tempo stimato:** 2-3 ore
- **Priorità:** ALTA (se focus è crypto)

### Fase 3: Multi-Asset (12 indicatori) - FUTURO
- Aggiungere: S&P 500, NASDAQ, EUR/USD, USD/JPY, Gold, Oil, US 10Y, DXY
- **Tempo stimato:** 4-6 ore
- **Priorità:** MEDIA (per copertura completa)

---

## Considerazioni UX

### Performance
- **Loading:** Max 2-3 secondi per tutti gli indicatori
- **Refresh:** Auto-refresh ogni 5 minuti
- **Cache:** Client-side cache per evitare troppe chiamate

### Accessibilità
- **Screen readers:** Ogni widget ha aria-label descrittivo
- **Keyboard navigation:** Tab order logico
- **Color contrast:** Trend indicators con icone + testo

### Mobile
- **Touch targets:** Minimo 44x44px per ogni widget
- **Scroll:** Vertical scroll su mobile, orizzontale su tablet
- **Compact view:** Mostra solo valore + trend su mobile

---

## Domande da Risolvere

1. **Focus principale?**
   - Crypto-only → Fase 2 (8 indicatori)
   - Multi-asset → Fase 3 (12 indicatori)

2. **Layout preferito?**
   - Grid fisso (4 colonne desktop)
   - Grid responsive (si adatta automaticamente)
   - Carousel (scroll orizzontale)

3. **Personalizzazione?**
   - Widget fissi per tutti
   - Utente può scegliere quali mostrare
   - Admin può configurare default

4. **Refresh rate?**
   - 5 minuti (attuale)
   - 1 minuto (più real-time, più chiamate API)
   - Manuale (bottone refresh)

---

**Documento preparato per:** Implementazione cruscotto operativo completo  
**Versione:** 1.0  
**Stato:** In attesa di decisione su focus e priorità
