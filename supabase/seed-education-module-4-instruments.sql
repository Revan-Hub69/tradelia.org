-- ============================================
-- MODULO 4: STRUMENTI FINANZIARI BASE
-- ============================================
-- Livello: Beginner
-- Ore: 5
-- Lezioni: 6
-- ============================================

DO $$
DECLARE
  v_module_id UUID;
  v_module_1_id UUID;
BEGIN
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- Crea modulo
  INSERT INTO education_modules (
    title,
    slug,
    description,
    difficulty_level,
    estimated_hours,
    order_index,
    is_active,
    prerequisites
  ) VALUES (
    'Strumenti Finanziari Base: Azioni, Obbligazioni, ETF e Altro',
    'strumenti-finanziari-base',
    'Comprendi i principali strumenti finanziari: azioni, obbligazioni, ETF, fondi comuni, derivati, e crypto. Caratteristiche, rischi, e quando usarli.',
    'beginner',
    5,
    4,
    true,
    '["fondamenti-investimento"]'::jsonb
  ) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    difficulty_level = EXCLUDED.difficulty_level,
    estimated_hours = EXCLUDED.estimated_hours,
    order_index = EXCLUDED.order_index
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM education_modules WHERE slug = 'strumenti-finanziari-base';
  END IF;

  -- LEZIONE 1: Azioni (Stocks)
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Azioni: Cosa Sono e Come Funzionano',
    '# Azioni (Stocks/Equity)

**Riferimenti Accademici:**
- Fama (1970) - "Efficient Capital Markets: A Review of Theory and Empirical Work"
- Shiller (1981) - "Do Stock Prices Move Too Much to be Justified by Subsequent Changes in Dividends?"
- Bogle (2005) - "The Little Book of Common Sense Investing"

## Cos''è un''Azione?

**Definizione**: Titolo che rappresenta una quota di proprietà di un''azienda.

**Diritti Azionista:**
- **Dividendi**: Parte degli utili distribuiti
- **Voto**: Diritto voto assemblea
- **Capitale**: Parte del valore aziendale

## Tipi di Azioni

### 1. Common Stock (Azioni Ordinarie)

**Caratteristiche:**
- Diritto voto
- Dividendi (se distribuiti)
- Ultimi in caso liquidazione

**Esempio:**
- Possiedi 100 azioni Apple
- Apple vale €2,000 miliardi
- Le tue azioni rappresentano quota proporzionale

### 2. Preferred Stock (Azioni Privilegiate)

**Caratteristiche:**
- Dividendi fissi (come obbligazioni)
- Priorità su common stock
- Spesso senza voto

**Uso**: Investitori che vogliono reddito stabile

## Come Si Guadagna con le Azioni

### 1. Capital Gains (Plusvalenze)

**Definizione**: Guadagno dalla vendita a prezzo superiore all''acquisto.

**Esempio:**
- **Acquisto**: €100
- **Vendita**: €150
- **Capital Gain**: €50 (+50%)

### 2. Dividends (Dividendi)

**Definizione**: Distribuzione utili aziendali agli azionisti.

**Esempio:**
- **Azione**: €100
- **Dividendo annuo**: €3 (3% yield)
- **Reddito**: €3 per azione

**Paper:**
> Fama & French (2001): "Disappearing Dividends: Changing Firm Characteristics or Lower Propensity to Pay?", Journal of Financial Economics

## Valutazione Azioni

### 1. Price-to-Earnings (P/E)

**Formula:**
```
P/E = Prezzo per Azione / Utile per Azione
```

**Interpretazione:**
- **P/E Basso** (<15): Potenzialmente sottovalutata
- **P/E Alto** (>25): Potenzialmente sopravvalutata
- **Media Storica**: ~15-20

**Paper:**
> Shiller (2000): "Irrational Exuberance"

### 2. Price-to-Book (P/B)

**Formula:**
```
P/B = Prezzo per Azione / Valore Contabile per Azione
```

**Interpretazione:**
- **P/B < 1**: Prezzo < valore contabile (potenziale valore)
- **P/B > 3**: Prezzo > valore contabile (potenziale crescita)

### 3. Dividend Yield

**Formula:**
```
Dividend Yield = Dividendo Annuo / Prezzo Azione
```

**Interpretazione:**
- **Alto** (>4%): Reddito, ma crescita limitata
- **Basso** (<2%): Crescita, ma reddito limitato

## Rischi delle Azioni

### 1. Rischio Mercato (Market Risk)

**Definizione**: Tutte le azioni possono scendere insieme.

**Esempio**: Crisi 2008 → Azioni globali -50%

**Mitigazione**: Diversificazione geografica e settoriale

### 2. Rischio Specifico (Company Risk)

**Definizione**: Rischio specifico di una singola azienda.

**Esempio**: Azienda fallisce → Azioni a €0

**Mitigazione**: Diversificazione (non tutto in una azienda)

**Paper:**
> Markowitz (1952): "Portfolio Selection", Journal of Finance

### 3. Volatilità

**Definizione**: Fluttuazioni prezzo nel tempo.

**Misura**: Deviazione standard rendimenti

**Esempio:**
- **Volatilità 20%**: Prezzo può variare ±20% in un anno
- **Volatilità 40%**: Prezzo può variare ±40% in un anno

## Strategie di Investimento in Azioni

### 1. Stock Picking

**Definizione**: Selezione singole azioni.

**Vantaggi:**
- Potenziale alto rendimento
- Controllo su cosa possiedi

**Svantaggi:**
- Rischio concentrazione
- Richiede tempo e competenze
- Performance media peggiore (studi)

**Paper:**
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth", Journal of Finance

### 2. Index Investing

**Definizione**: Investi in indice (es. S&P 500).

**Vantaggi:**
- Diversificazione automatica
- Costi bassi (TER 0.03-0.20%)
- Performance media migliore (90% fondi attivi underperformano)

**Svantaggi:**
- Nessun controllo su singole aziende
- Rendimento = media mercato (non outperformance)

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"

### 3. Factor Investing

**Definizione**: Investi in fattori (Value, Momentum, Quality, etc.).

**Paper:**
> Fama & French (1993): "Common Risk Factors in the Returns on Stocks and Bonds", Journal of Financial Economics

**Fattori:**
- **Value**: Azioni sottovalutate (P/E, P/B bassi)
- **Momentum**: Azioni con trend positivo
- **Quality**: Aziende con bilancio solido
- **Low-Vol**: Azioni a bassa volatilità

## Quando Investire in Azioni

**Adatto per:**
- Time horizon lungo (10+ anni)
- Tolleranza rischio medio-alta
- Obiettivo crescita capitale

**Non adatto per:**
- Time horizon breve (<5 anni)
- Tolleranza rischio bassa
- Obiettivo reddito immediato

> **Principio**: "Le azioni sono per crescita a lungo termine. Diversifica sempre."',
    'text', 1, 20, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- LEZIONE 2: Obbligazioni (Bonds)
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Obbligazioni: Reddito Fisso e Sicurezza',
    '# Obbligazioni (Bonds)

**Riferimenti Accademici:**
- Modigliani & Miller (1958) - "The Cost of Capital, Corporation Finance and the Theory of Investment"
- Fama (1976) - "Inflation Uncertainty and Expected Returns on Treasury Bills"
- Duffie & Singleton (2003) - "Credit Risk: Pricing, Measurement, and Management"

## Cos''è un''Obbligazione?

**Definizione**: Prestito che fai a un''entità (stato, azienda) che si impegna a restituirti il capitale + interessi.

**Componenti:**
- **Valore Nominale (Face Value)**: Importo prestato (es. €1,000)
- **Cedola (Coupon)**: Interesse annuo (es. 3% = €30/anno)
- **Scadenza (Maturity)**: Data rimborso (es. 10 anni)
- **Prezzo**: Quanto paghi oggi (può essere diverso da valore nominale)

## Tipi di Obbligazioni

### 1. Obbligazioni Governative (Government Bonds)

**Caratteristiche:**
- Emesse da stati/governi
- Rischio default molto basso (stati raramente falliscono)
- Rendimento più basso
- Esempi: BTP (Italia), Bund (Germania), Treasury (USA)

**Rating:**
- **AAA/AA**: Stati molto solidi (Germania, Svizzera)
- **BBB**: Stati solidi ma con debito (Italia, Spagna)
- **BB o inferiore**: Stati ad alto rischio

**Paper:**
> Reinhart & Rogoff (2009): "This Time is Different: Eight Centuries of Financial Folly"

### 2. Obbligazioni Corporate (Corporate Bonds)

**Caratteristiche:**
- Emesse da aziende
- Rischio default più alto
- Rendimento più alto (premio rischio)
- Rating: AAA (Apple) → D (default)

**Tipi:**
- **Investment Grade** (BBB- o superiore): Aziende solide
- **High Yield/Junk** (BB+ o inferiore): Aziende rischiose, rendimento alto

**Paper:**
> Altman (1968): "Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy", Journal of Finance

### 3. Obbligazioni Convertibili (Convertible Bonds)

**Caratteristiche:**
- Obbligazione normale + opzione di conversione in azioni
- Rendimento più basso (paghi per l''opzione)
- Potenziale upside se azione sale

**Esempio:**
- Obbligazione €1,000, convertibile in 10 azioni
- Se azione sale a €150 → Converti → Valore €1,500

## Come Si Guadagna con le Obbligazioni

### 1. Rendimento da Cedola (Coupon Yield)

**Formula:**
```
Rendimento = (Cedola Annua / Prezzo) × 100
```

**Esempio:**
- **Obbligazione**: €1,000
- **Cedola**: €30/anno (3%)
- **Rendimento**: 3%

### 2. Capital Gain/Loss

**Definizione**: Guadagno/perdita dalla vendita prima della scadenza.

**Esempio:**
- **Acquisto**: €1,000
- **Vendita**: €1,050
- **Capital Gain**: €50 (+5%)

### 3. Rendimento a Scadenza (Yield to Maturity - YTM)

**Definizione**: Rendimento totale se tieni fino a scadenza.

**Formula complessa** (calcolo interno tasso rendimento):
```
YTM = Tasso che eguaglia: Prezzo = Σ(Cedole / (1+r)^t) + Valore Nominale / (1+r)^n
```

**Interpretazione:**
- **YTM Alto**: Obbligazione sottovalutata (buon affare)
- **YTM Basso**: Obbligazione sopravvalutata

**Paper:**
> Fama (1976): "Inflation Uncertainty and Expected Returns on Treasury Bills"

## Relazione Prezzo-Rendimento

### Regola Fondamentale

**Prezzo e Rendimento sono INVERSAMENTE correlati.**

**Esempio:**
- **Obbligazione**: €1,000, cedola 3% (€30/anno)
- **Scenario 1**: Prezzo sale a €1,100
  - Rendimento = €30 / €1,100 = 2.7% (scende)
- **Scenario 2**: Prezzo scende a €900
  - Rendimento = €30 / €900 = 3.3% (sale)

**Perché?**
- Cedola è fissa (€30)
- Se prezzo sale → Rendimento % scende
- Se prezzo scende → Rendimento % sale

## Rischi delle Obbligazioni

### 1. Rischio Default (Credit Risk)

**Definizione**: Emittente non paga capitale/cedole.

**Mitigazione:**
- Investi solo in obbligazioni con rating alto (AAA-BBB)
- Diversifica tra emittenti diversi
- Evita concentrazione (non tutto in una azienda)

**Paper:**
> Merton (1974): "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates", Journal of Finance

### 2. Rischio Tasso di Interesse (Interest Rate Risk)

**Definizione**: Se tassi salgono, valore obbligazioni esistenti scende.

**Esempio:**
- **Hai**: Obbligazione 3% a 10 anni
- **Tassi salgono**: Nuove obbligazioni offrono 5%
- **Risultato**: La tua obbligazione 3% vale meno (chi la comprerebbe?)

**Durata (Duration):**
- **Alta Duration** (10+ anni): Molto sensibile a tassi
- **Bassa Duration** (1-2 anni): Poco sensibile a tassi

**Paper:**
> Macaulay (1938): "Some Theoretical Problems Suggested by the Movements of Interest Rates"

### 3. Rischio Inflazione (Inflation Risk)

**Definizione**: Inflazione erode potere d''acquisto rendimenti.

**Esempio:**
- **Cedola**: 3% annuo
- **Inflazione**: 5% annuo
- **Risultato**: Perdita reale -2% (rendimento negativo in termini reali)

**Mitigazione:**
- Obbligazioni indicizzate inflazione (TIPS, BTP Italia)
- Diversifica con asset che battono inflazione (azioni)

**Paper:**
> Fama & Schwert (1977): "Asset Returns and Inflation", Journal of Financial Economics

### 4. Rischio Liquidità (Liquidity Risk)

**Definizione**: Difficoltà a vendere rapidamente senza perdite.

**Esempio:**
- **Obbligazione corporate illiquida**: Devi vendere con sconto 5-10%
- **Obbligazione governativa liquida**: Vendi immediatamente a prezzo di mercato

## Strategie di Investimento in Obbligazioni

### 1. Ladder Strategy

**Definizione**: Distribuisci scadenze su più anni.

**Esempio:**
- 20% scadenza 1 anno
- 20% scadenza 3 anni
- 20% scadenza 5 anni
- 20% scadenza 7 anni
- 20% scadenza 10 anni

**Vantaggi:**
- Rinnovi costanti (se tassi salgono, reinvesti a tassi più alti)
- Riduce rischio tasso
- Liquidità periodica

### 2. Barbell Strategy

**Definizione**: Solo obbligazioni a breve (1-2 anni) e lungo termine (10+ anni).

**Vantaggi:**
- Liquidità breve termine
- Rendimento lungo termine
- Evita medio termine (spesso peggiore rendimento)

### 3. Bullet Strategy

**Definizione**: Tutte obbligazioni stessa scadenza.

**Uso**: Quando sai esattamente quando ti servono i soldi (es. pensione tra 10 anni).

## Quando Investire in Obbligazioni

**Adatto per:**
- Time horizon breve-medio (1-10 anni)
- Tolleranza rischio bassa-media
- Obiettivo reddito fisso
- Diversificazione portafoglio

**Non adatto per:**
- Time horizon molto lungo (20+ anni) → Azioni meglio
- Tolleranza rischio alta → Azioni meglio
- Obiettivo crescita massima → Azioni meglio

**Allocazione Tipica:**
- **Giovane (20-30 anni)**: 10-20% obbligazioni
- **Mezza età (40-50 anni)**: 30-40% obbligazioni
- **Vicino pensione (60+ anni)**: 50-70% obbligazioni

> **Principio**: "Le obbligazioni sono per stabilità e reddito. Diversifica sempre e considera inflazione."',
    'text', 2, 50, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- LEZIONE 3: ETF (Exchange Traded Funds)
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'ETF: Diversificazione a Basso Costo',
    '# ETF (Exchange Traded Funds)

**Riferimenti Accademici:**
- Bogle (2005) - "The Little Book of Common Sense Investing"
- Fama & French (2010) - "Luck versus Skill in the Cross-Section of Mutual Fund Returns"
- Cremers & Petajisto (2009) - "How Active Is Your Fund Manager?"

## Cos''è un ETF?

**Definizione**: Fondo che replica un indice (es. S&P 500) e si compra/vende come un''azione.

**Caratteristiche:**
- **Scambiato in borsa**: Come azioni, compri/vendi durante giornata
- **Replica indice**: Performance = indice (meno costi)
- **Costi bassi**: TER 0.03-0.50% (vs fondi attivi 1-2%)
- **Trasparenza**: Vedi esattamente cosa contiene

**Esempi:**
- **SPY**: Replica S&P 500 (USA)
- **VWCE**: Replica MSCI World (globale)
- **EIMI**: Replica mercati emergenti

## Tipi di ETF

### 1. ETF Azionari (Equity ETFs)

**Caratteristiche:**
- Replicano indici azionari
- Diversificazione automatica
- Esempi: S&P 500, MSCI World, FTSE MIB

**Vantaggi:**
- Esposizione a centinaia/migliaia di azioni
- Costi bassi (TER 0.03-0.20%)
- Liquidità alta

### 2. ETF Obbligazionari (Bond ETFs)

**Caratteristiche:**
- Replicano indici obbligazionari
- Diversificazione tra obbligazioni
- Esempi: Governative, Corporate, High Yield

**Vantaggi:**
- Diversificazione creditizia
- Liquidità (vs obbligazioni singole)
- Costi bassi

### 3. ETF Settoriali (Sector ETFs)

**Caratteristiche:**
- Replicano settori specifici (tech, healthcare, energy)
- Maggiore concentrazione
- Volatilità più alta

**Esempi:**
- **XLK**: Technology (USA)
- **XLE**: Energy (USA)
- **XLV**: Healthcare (USA)

**Paper:**
> Fama & French (1997): "Industry Costs of Equity", Journal of Financial Economics

### 4. ETF Geografici (Geographic ETFs)

**Caratteristiche:**
- Replicano regioni specifiche
- Diversificazione geografica
- Esempi: USA, Europa, Asia, Mercati Emergenti

**Esempi:**
- **VTI**: USA totale
- **VGK**: Europa
- **VPL**: Asia-Pacifico

### 5. ETF Factor-Based (Smart Beta)

**Caratteristiche:**
- Replicano fattori (Value, Momentum, Quality, Low-Vol)
- Basati su ricerca accademica
- Potenziale outperformance vs indice market-cap

**Paper:**
> Fama & French (1993): "Common Risk Factors in the Returns on Stocks and Bonds"

**Fattori:**
- **Value**: Azioni sottovalutate (P/E, P/B bassi)
- **Momentum**: Azioni con trend positivo
- **Quality**: Aziende con bilancio solido
- **Low-Vol**: Azioni a bassa volatilità

## Come Funzionano gli ETF

### 1. Creazione/Rimborso (Creation/Redemption)

**Processo:**
- **Authorized Participants** (AP) creano/rimborsano quote
- **Creazione**: AP dà paniere azioni → Riceve quote ETF
- **Rimborso**: AP dà quote ETF → Riceve paniere azioni

**Risultato**: Prezzo ETF rimane allineato a valore sottostante (arbitraggio)

### 2. Replica

**Tipi:**
- **Fisica**: ETF possiede realmente le azioni
- **Sintetica**: ETF usa derivati (swap) per replicare indice

**Preferenza**: Fisica (meno rischio controparte)

### 3. Tracking Error

**Definizione**: Differenza tra performance ETF e indice.

**Causa:**
- Costi (TER)
- Replica imperfetta
- Dividendi (timing)

**Buon ETF**: Tracking error < 0.5%

## Vantaggi degli ETF

### 1. Costi Bassi

**Confronto:**
- **ETF passivo**: TER 0.03-0.20%
- **Fondo attivo**: TER 1-2% + commissioni
- **Differenza 1%**: Su 30 anni = -26% rendimento totale

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"

### 2. Diversificazione Automatica

**Esempio:**
- **VWCE (MSCI World)**: 1,600+ aziende, 23 paesi
- **Costo**: 1 quota ETF
- **Alternativa**: Comprare 1,600 azioni singole (impossibile)

### 3. Liquidità

**Caratteristiche:**
- Compri/vendi durante giornata (come azioni)
- Spread bid-ask basso (0.01-0.10%)
- Volumi alti (migliaia di scambi/giorno)

### 4. Trasparenza

**Informazioni disponibili:**
- Composizione completa (giornaliera)
- TER (costi)
- Tracking error
- Dividendi distribuiti

### 5. Flessibilità

**Caratteristiche:**
- Compri/vendi quando vuoi
- Nessun minimo investimento (1 quota)
- Nessun lock-in period

## Svantaggi degli ETF

### 1. Nessun Outperformance

**Definizione**: Performance = indice (meno costi), non meglio.

**Implicazione**: Non batterai il mercato (ma 90% fondi attivi non lo fanno comunque)

**Paper:**
> Fama & French (2010): "Luck versus Skill in the Cross-Section of Mutual Fund Returns"

### 2. Tracking Error

**Definizione**: Piccola differenza vs indice (costi, replica imperfetta).

**Mitigazione**: Scegli ETF con tracking error basso (<0.5%)

### 3. Liquidità (per ETF piccoli)

**Problema**: ETF poco scambiati hanno spread alti.

**Soluzione**: Investi solo in ETF con volumi alti (>€1M/giorno)

### 4. Rischio Controparte (ETF Sintetici)

**Definizione**: ETF sintetici usano swap (derivati) → Rischio controparte.

**Mitigazione**: Preferisci ETF fisici

## Strategie di Investimento con ETF

### 1. Core-Satellite

**Definizione**: Core (80%) in ETF globali, Satellite (20%) in ETF settoriali/geografici.

**Esempio:**
- **Core (80%)**: VWCE (MSCI World)
- **Satellite (20%)**: ETF tech, emerging markets, small cap

### 2. All-Weather Portfolio

**Definizione**: Diversificazione tra asset class (azioni, obbligazioni, REIT, commodities).

**Esempio:**
- 60% ETF azionari globali
- 30% ETF obbligazionari
- 10% ETF REIT/commodities

**Paper:**
> Dalio (2015): "All Weather Portfolio"

### 3. Dollar-Cost Averaging (DCA)

**Definizione**: Investi importo fisso periodicamente (es. €500/mese).

**Vantaggi:**
- Riduce timing risk
- Disciplina investimento
- Media costi (compri più quando prezzo basso)

**Paper:**
> Constantinides (1979): "A Note on the Suboptimality of Dollar-Cost Averaging as an Investment Policy"

## Quando Usare ETF

**Adatto per:**
- Investitori passivi (non vogliono stock picking)
- Diversificazione a basso costo
- Time horizon lungo (10+ anni)
- Costi minimi

**Non adatto per:**
- Investitori che vogliono outperformance (meglio stock picking, ma rischioso)
- Time horizon molto breve (<1 anno) → Volatilità alta

**Allocazione Tipica:**
- **Portafoglio base**: 70-100% ETF globali
- **Portafoglio avanzato**: 50-70% ETF + 30-50% azioni singole

> **Principio**: "Gli ETF sono la base di un portafoglio diversificato. Costi bassi, diversificazione automatica, performance = mercato."',
    'text', 3, 50, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- LEZIONE 4: Fondi Comuni (Mutual Funds)
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Fondi Comuni: Gestione Attiva vs Passiva',
    '# Fondi Comuni (Mutual Funds)

**Riferimenti Accademici:**
- Jensen (1968) - "The Performance of Mutual Funds in the Period 1945-1964", Journal of Finance
- Sharpe (1966) - "Mutual Fund Performance", Journal of Business
- Fama & French (2010) - "Luck versus Skill in the Cross-Section of Mutual Fund Returns"

## Cos''è un Fondo Comune?

**Definizione**: Fondo gestito professionalmente che raccoglie denaro da molti investitori e investe in portafoglio diversificato.

**Caratteristiche:**
- **Gestione attiva**: Manager sceglie investimenti
- **NAV (Net Asset Value)**: Valore quota calcolato giornalmente
- **Acquisto/Vendita**: Solo fine giornata (vs ETF in tempo reale)
- **Costi**: TER 0.5-2% + commissioni

## Tipi di Fondi Comuni

### 1. Fondi Attivi (Active Funds)

**Definizione**: Manager cerca di battere il mercato (stock picking, timing).

**Caratteristiche:**
- **Costi alti**: TER 1-2% + commissioni
- **Performance**: 90% underperformano indice (studi)
- **Rischio**: Dipende da skill manager

**Paper:**
> Jensen (1968): "The Performance of Mutual Funds in the Period 1945-1964"
> 
> **Risultato**: Dopo costi, fondi attivi non battono mercato.

**Paper:**
> Fama & French (2010): "Luck versus Skill in the Cross-Section of Mutual Fund Returns"
>
> **Risultato**: Performance passata non predice performance futura (luck vs skill).

### 2. Fondi Passivi (Index Funds)

**Definizione**: Replicano indice (come ETF) senza gestione attiva.

**Caratteristiche:**
- **Costi bassi**: TER 0.10-0.50%
- **Performance**: = Indice (meno costi)
- **Vantaggio**: Nessun tracking error significativo

**Confronto ETF:**
- **Fondi passivi**: NAV fine giornata, costi leggermente più alti
- **ETF**: Prezzo tempo reale, costi leggermente più bassi

### 3. Fondi Bilanciati (Balanced Funds)

**Definizione**: Mix azioni + obbligazioni (es. 60/40, 70/30).

**Caratteristiche:**
- **Allocazione fissa**: 60% azioni, 40% obbligazioni
- **Rebalancing automatico**: Manager mantiene allocazione
- **Costi**: TER 0.50-1.5%

**Vantaggi:**
- Diversificazione automatica
- Rebalancing automatico
- Adatto investitori non esperti

### 4. Fondi Target-Date (Target-Date Funds)

**Definizione**: Allocazione si adatta automaticamente all''avvicinarsi della data target (es. pensione 2050).

**Caratteristiche:**
- **Giovane (2050)**: 90% azioni, 10% obbligazioni
- **Mezza età (2040)**: 70% azioni, 30% obbligazioni
- **Vicino pensione (2030)**: 50% azioni, 50% obbligazioni

**Vantaggi:**
- Gestione automatica rischio
- Adatto pensione (set-and-forget)
- Diversificazione completa

**Paper:**
> Poterba, Rauh, Venti & Wise (2007): "The Shift from Defined Benefit to Defined Contribution Pension Plans"

## Costi dei Fondi Comuni

### 1. TER (Total Expense Ratio)

**Definizione**: Costi totali annui (% patrimonio).

**Componenti:**
- **Management fee**: 0.5-1.5%
- **Custody fee**: 0.1-0.3%
- **Other expenses**: 0.1-0.2%

**Esempio:**
- **TER 1.5%**: Su €10,000 = €150/anno
- **Su 30 anni**: -37% rendimento totale (compound)

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"

### 2. Commissioni di Ingresso/Uscita

**Tipi:**
- **Front-end load**: Commissione acquisto (1-5%)
- **Back-end load**: Commissione vendita (1-5%)
- **No-load**: Nessuna commissione (preferibile)

**Esempio:**
- **Front-end 3%**: Su €10,000 = €300 persi subito
- **Impatto**: -3% rendimento immediato

### 3. Performance Fee

**Definizione**: Manager prende % extra se batte benchmark.

**Esempio:**
- **Performance fee 20%**: Se fondo batte S&P 500 del 5%, manager prende 1% extra
- **Problema**: Asimmetria (guadagna se va bene, non perde se va male)

## Performance Fondi Attivi vs Passivi

### Studi Accademici

**Paper:**
> Sharpe (1966): "Mutual Fund Performance"
>
> **Risultato**: Dopo costi, fondi attivi non battono mercato.

**Paper:**
> Jensen (1968): "The Performance of Mutual Funds in the Period 1945-1964"
>
> **Risultato**: Alpha medio = -1.1% (dopo costi, underperformano).

**Paper:**
> Fama & French (2010): "Luck versus Skill in the Cross-Section of Mutual Fund Returns"
>
> **Risultato**: Solo 3% fondi mostrano skill reale (non luck). Performance passata non predice futuro.

**Paper:**
> Cremers & Petajisto (2009): "How Active Is Your Fund Manager?"
>
> **Risultato**: Fondi più attivi (high active share) performano meglio, ma ancora 70% underperformano.

### Perché Fondi Attivi Underperformano?

**1. Costi Alti**
- TER 1-2% vs ETF 0.03-0.20%
- Differenza 1% su 30 anni = -26% rendimento totale

**2. Skill Manager**
- Solo 3% manager hanno skill reale (Fama & French 2010)
- Performance passata non predice futuro

**3. Market Efficiency**
- Mercati sono efficienti (Fama 1970)
- Informazioni già incorporate nei prezzi
- Difficile trovare opportunità

**4. Trading Costs**
- Fondi attivi fanno più trading
- Spread, commissioni, impatto mercato

## Quando Usare Fondi Comuni

### Fondi Attivi: QUASI MAI

**Eccezioni:**
- Manager con track record eccezionale (10+ anni, alpha consistente)
- Settori illiquidi (small cap, emerging markets) dove skill può aiutare
- **Ma**: Anche qui, 70% underperformano

**Realtà:**
- 90% fondi attivi underperformano dopo costi
- Performance passata non predice futuro
- Costi erodono rendimenti

### Fondi Passivi: SEMPRE MEGLIO

**Vantaggi:**
- Costi bassi (TER 0.10-0.50%)
- Performance = Indice
- Diversificazione automatica

**Confronto ETF:**
- **Fondi passivi**: NAV fine giornata, costi leggermente più alti
- **ETF**: Prezzo tempo reale, costi leggermente più bassi
- **Verdetto**: Simili, ETF leggermente meglio

### Fondi Target-Date: PER PENSIONE

**Adatto per:**
- Investitori non esperti
- Pensione (set-and-forget)
- Allocazione automatica rischio

**Svantaggi:**
- Costi più alti di ETF semplici
- Meno controllo su allocazione

## Strategie di Investimento

### 1. Evita Fondi Attivi (Tranne Eccezioni)

**Regola:**
- Investi in fondi passivi/ETF
- Se vuoi gestione attiva, fai stock picking tu stesso (ma rischioso)

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"

### 2. Confronta Costi

**Checklist:**
- ✅ TER < 0.50% (fondi passivi)
- ✅ No-load (nessuna commissione)
- ✅ Tracking error basso (<0.5%)

### 3. Diversifica

**Esempio:**
- 70% ETF globale (VWCE)
- 20% ETF obbligazionari
- 10% ETF settoriali/geografici

## Conclusione

**Fondi Attivi:**
- ❌ 90% underperformano dopo costi
- ❌ Costi alti (TER 1-2%)
- ❌ Performance passata non predice futuro
- ✅ Solo 3% manager hanno skill reale

**Fondi Passivi/ETF:**
- ✅ Costi bassi (TER 0.03-0.50%)
- ✅ Performance = Indice
- ✅ Diversificazione automatica
- ✅ Trasparenza

**Raccomandazione:**
> **Principio**: "Per 99% investitori, fondi passivi/ETF sono migliori. Fondi attivi solo se hai manager eccezionale (raro)."',
    'text', 4, 50, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- LEZIONE 5: Derivati Base
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Derivati: Opzioni, Futures e Contratti a Termine',
    '# Derivati: Opzioni, Futures e Contratti a Termine

**Riferimenti Accademici:**
- Black & Scholes (1973) - "The Pricing of Options and Corporate Liabilities", Journal of Political Economy
- Merton (1973) - "Theory of Rational Option Pricing", Bell Journal of Economics
- Hull (2017) - "Options, Futures, and Other Derivatives"

## Cos''è un Derivato?

**Definizione**: Strumento finanziario il cui valore deriva da un''attività sottostante (underlying asset).

**Caratteristiche:**
- **Sottostante**: Azioni, obbligazioni, indici, commodities, valute
- **Leverage**: Controllo grande posizione con piccolo capitale
- **Rischio**: Molto alto (puoi perdere tutto)
- **Uso**: Hedging, speculazione, arbitraggio

**⚠️ AVVERTENZA**: Derivati sono strumenti avanzati e rischiosi. Solo per investitori esperti.

## Tipi di Derivati

### 1. Opzioni (Options)

**Definizione**: Diritto (non obbligo) di comprare/vendere asset a prezzo fisso (strike) entro data (expiry).

**Tipi:**
- **Call Option**: Diritto di COMPRARE a strike price
- **Put Option**: Diritto di VENDERE a strike price

**Esempio Call:**
- **Azione Apple**: €150
- **Call Strike €160, Expiry 1 mese**: Prezzo €2
- **Scenario 1** (Apple sale a €170):
  - Eserciti call → Compri a €160 → Vendi a €170 → Profitto €10 - €2 = €8
- **Scenario 2** (Apple scende a €140):
  - Non eserciti → Perdi solo €2 (premium)

**Esempio Put:**
- **Azione Apple**: €150
- **Put Strike €140, Expiry 1 mese**: Prezzo €2
- **Scenario 1** (Apple scende a €130):
  - Eserciti put → Vendi a €140 → Compri a €130 → Profitto €10 - €2 = €8
- **Scenario 2** (Apple sale a €160):
  - Non eserciti → Perdi solo €2 (premium)

**Paper:**
> Black & Scholes (1973): "The Pricing of Options and Corporate Liabilities"
>
> **Formula Black-Scholes**: Prezzo opzione = f(S, K, T, r, σ)
> - S = Prezzo sottostante
> - K = Strike price
> - T = Tempo a scadenza
> - r = Tasso risk-free
> - σ = Volatilità

### 2. Futures

**Definizione**: Obbligo di comprare/vendere asset a prezzo fisso in data futura.

**Differenza vs Opzioni:**
- **Opzioni**: Diritto (puoi non esercitare)
- **Futures**: Obbligo (devi comprare/vendere)

**Esempio:**
- **Future S&P 500, Scadenza 3 mesi**: Prezzo €4,000
- **Acquisti 1 contratto** (valore €200,000)
- **Scadenza**:
  - Se S&P 500 = €4,100 → Profitto €100 × 50 = €5,000
  - Se S&P 500 = €3,900 → Perdita €100 × 50 = -€5,000

**Caratteristiche:**
- **Leverage**: Margine 5-10% (controlli €200,000 con €10,000-20,000)
- **Rischio**: Puoi perdere più del margine (margin call)
- **Uso**: Hedging, speculazione

### 3. Swap

**Definizione**: Scambio flussi di cassa tra due parti.

**Tipi:**
- **Interest Rate Swap**: Scambio tasso fisso vs variabile
- **Currency Swap**: Scambio valute
- **Credit Default Swap (CDS)**: Assicurazione default

**Esempio Interest Rate Swap:**
- **Azienda A**: Ha debito a tasso variabile (rischio)
- **Azienda B**: Ha debito a tasso fisso (vuole variabile)
- **Swap**: Azienda A paga fisso a B, B paga variabile ad A
- **Risultato**: Azienda A ha tasso fisso (riduce rischio)

**Paper:**
> Hull (2017): "Options, Futures, and Other Derivatives"

## Uso dei Derivati

### 1. Hedging (Copertura)

**Definizione**: Ridurre rischio posizione esistente.

**Esempio:**
- **Hai**: 100 azioni Apple a €150 (valore €15,000)
- **Rischio**: Apple può scendere
- **Hedging**: Compri Put Strike €140
- **Risultato**: Se Apple scende sotto €140, put compensa perdita

**Paper:**
> Modigliani & Miller (1958): "The Cost of Capital, Corporation Finance and the Theory of Investment"

### 2. Speculazione

**Definizione**: Scommettere su direzione prezzo.

**Esempio:**
- **Pensi**: Apple salirà
- **Speculazione**: Compri Call Apple
- **Rischio**: Perdi tutto se Apple non sale

**⚠️ AVVERTENZA**: Speculazione con derivati è molto rischiosa. Puoi perdere tutto.

### 3. Arbitraggio

**Definizione**: Sfruttare differenze prezzo tra mercati.

**Esempio:**
- **Apple**: €150 su mercato A
- **Future Apple**: €152 su mercato B
- **Arbitraggio**: Vendi future, compri azione → Profitto €2

**Paper:**
> Fama (1970): "Efficient Capital Markets: A Review of Theory and Empirical Work"

## Rischi dei Derivati

### 1. Leverage Risk

**Definizione**: Controlli grande posizione con piccolo capitale.

**Esempio:**
- **Future S&P 500**: Valore €200,000
- **Margine**: €10,000 (5%)
- **S&P scende 2%**: Perdita €4,000 (40% margine)
- **S&P scende 5%**: Perdita €10,000 (100% margine) → Margin call

**⚠️ AVVERTENZA**: Leverage amplifica perdite. Puoi perdere più del capitale investito.

### 2. Time Decay (Opzioni)

**Definizione**: Opzioni perdono valore con tempo (theta decay).

**Esempio:**
- **Call Apple**: Prezzo €5, 30 giorni a scadenza
- **Dopo 15 giorni**: Prezzo €3 (time decay)
- **Dopo 29 giorni**: Prezzo €0.50 (time decay accelerato)

**Implicazione**: Opzioni out-of-the-money perdono valore rapidamente.

### 3. Volatilità Risk

**Definizione**: Volatilità impatta prezzo opzioni.

**Esempio:**
- **Call Apple**: Prezzo €5, volatilità 20%
- **Volatilità sale a 30%**: Prezzo call sale a €7
- **Volatilità scende a 10%**: Prezzo call scende a €3

**Paper:**
> Black & Scholes (1973): Volatilità (σ) è input chiave per pricing opzioni.

### 4. Controparte Risk (Swap)

**Definizione**: Rischio che controparte non paghi.

**Esempio:**
- **Hai**: Interest rate swap con Azienda B
- **Azienda B fallisce**: Non ricevi più pagamenti
- **Risultato**: Perdita totale

**Mitigazione**: Usa clearinghouse (garanzia centrale)

## Strategie con Opzioni

### 1. Covered Call

**Definizione**: Possiedi azione + vendi call.

**Esempio:**
- **Hai**: 100 azioni Apple a €150
- **Vendi**: Call Strike €160, Premium €3
- **Risultato**:
  - Se Apple < €160: Tieni premium €3
  - Se Apple > €160: Vendi a €160, ma hai guadagnato €10 + €3 = €13

**Uso**: Reddito extra su posizione esistente.

### 2. Protective Put

**Definizione**: Possiedi azione + compri put.

**Esempio:**
- **Hai**: 100 azioni Apple a €150
- **Compri**: Put Strike €140, Premium €2
- **Risultato**:
  - Se Apple sale: Perdi solo €2 (premium)
  - Se Apple scende sotto €140: Put compensa perdita

**Uso**: Hedging (protezione downside).

### 3. Straddle

**Definizione**: Compri call + put stesso strike.

**Esempio:**
- **Compri**: Call Strike €150 + Put Strike €150
- **Risultato**: Profitti se Apple sale MOLTO o scende MOLTO

**Uso**: Scommettere su alta volatilità.

## Quando Usare Derivati

**Adatto per:**
- ✅ Investitori esperti (capiscono rischi)
- ✅ Hedging posizioni esistenti
- ✅ Portafogli grandi (diversificazione)
- ✅ Tolleranza rischio molto alta

**NON adatto per:**
- ❌ Investitori principianti
- ❌ Portafogli piccoli
- ❌ Tolleranza rischio bassa
- ❌ Obiettivo crescita stabile

**⚠️ AVVERTENZA FINALE**: Derivati sono strumenti avanzati. Puoi perdere tutto. Solo per investitori esperti che capiscono rischi.

> **Principio**: "I derivati sono per esperti. Hedging ok, speculazione molto rischiosa. Capisci rischi prima di usarli."',
    'text', 5, 50, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- LEZIONE 6: Crypto e Asset Digitali
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Crypto e Asset Digitali: Rischi e Opportunità',
    '# Crypto e Asset Digitali: Rischi e Opportunità

**Riferimenti Accademici:**
- Nakamoto (2008) - "Bitcoin: A Peer-to-Peer Electronic Cash System"
- Baur, Hong & Lee (2018) - "Bitcoin: Medium of Exchange or Speculative Assets?", Journal of International Financial Markets
- Yermack (2015) - "Is Bitcoin a Real Currency? An Economic Appraisal", Handbook of Digital Currency

## Cos''è una Criptovaluta?

**Definizione**: Valuta digitale decentralizzata basata su blockchain (tecnologia distribuita).

**Caratteristiche:**
- **Decentralizzata**: Nessuna autorità centrale (banca/governo)
- **Blockchain**: Registro distribuito immutabile
- **Pseudonima**: Transazioni pubbliche, identità private
- **Volatilità**: Molto alta (può variare ±50% in un giorno)

**⚠️ AVVERTENZA**: Crypto sono molto rischiose. Volatilità estrema, regolamentazione incerta, rischio hacking.

## Tipi di Asset Digitali

### 1. Bitcoin (BTC)

**Definizione**: Prima criptovaluta (2009), creata da Satoshi Nakamoto.

**Caratteristiche:**
- **Supply limitato**: 21 milioni BTC (mai più)
- **Mining**: Proof-of-Work (consumo energia alto)
- **Market cap**: ~€1,000 miliardi (2024)
- **Volatilità**: 60-80% annua

**Paper:**
> Nakamoto (2008): "Bitcoin: A Peer-to-Peer Electronic Cash System"
>
> **Innovazione**: Blockchain, decentralizzazione, trust senza intermediari.

**Paper:**
> Yermack (2015): "Is Bitcoin a Real Currency?"
>
> **Risultato**: Bitcoin non funziona come valuta (troppo volatile), ma come asset speculativo.

**Uso:**
- **Store of value**: "Digital gold" (tesaurizzazione)
- **Speculazione**: Trading, investimento
- **Pagamenti**: Limitato (volatilità alta)

### 2. Ethereum (ETH)

**Definizione**: Blockchain programmabile (smart contracts).

**Caratteristiche:**
- **Smart contracts**: Contratti automatici eseguibili
- **DeFi**: Decentralized Finance (lending, trading, yield farming)
- **NFT**: Non-Fungible Tokens (arte digitale)
- **Volatilità**: 70-90% annua

**Differenza vs Bitcoin:**
- **Bitcoin**: Store of value (gold digitale)
- **Ethereum**: Piattaforma (computer decentralizzato)

### 3. Stablecoin

**Definizione**: Crypto ancorate a valuta fiat (es. USD, EUR).

**Tipi:**
- **Fiat-backed**: Riserve in banca (USDT, USDC)
- **Crypto-backed**: Collateral in crypto (DAI)
- **Algorithmic**: Algoritmo mantiene peg (rischio)

**Uso:**
- **Trading**: Evitare volatilità durante trading
- **DeFi**: Lending, yield farming
- **Pagamenti**: Stabilità prezzo

**⚠️ RISCHIO**: Stablecoin possono perdere peg (es. Terra/LUNA crash 2022).

### 4. Altcoin (Alternative Coins)

**Definizione**: Tutte crypto diverse da Bitcoin.

**Esempi:**
- **Cardano (ADA)**: Proof-of-Stake
- **Solana (SOL)**: Alta velocità transazioni
- **Polygon (MATIC)**: Layer 2 Ethereum

**⚠️ RISCHIO**: 99% altcoin falliscono. Solo poche sopravvivono.

## Come Funziona Blockchain

### 1. Transazioni

**Processo:**
1. **Utente A** invia 1 BTC a **Utente B**
2. **Transazione** broadcastata a rete
3. **Miners** verificano transazione
4. **Block** creato con transazione
5. **Block** aggiunto a blockchain (immutabile)

**Caratteristiche:**
- **Immutabile**: Una volta aggiunto, non può essere modificato
- **Trasparente**: Tutte transazioni pubbliche
- **Pseudonimo**: Indirizzi pubblici, identità private

### 2. Mining (Proof-of-Work)

**Definizione**: Miners risolvono problemi matematici complessi per validare transazioni.

**Processo:**
- **Miners** competono per risolvere hash
- **Primo miner** che risolve → Crea block → Riceve reward (BTC)
- **Consumo energia**: Alto (Bitcoin = consumo paese medio)

**Paper:**
> Nakamoto (2008): Proof-of-Work previene double-spending e garantisce sicurezza.

### 3. Proof-of-Stake (Alternativa)

**Definizione**: Validatori "scommettono" crypto per validare transazioni.

**Vantaggi:**
- **Energia**: 99% meno consumo vs Proof-of-Work
- **Scalabilità**: Più veloce

**Esempi**: Ethereum 2.0, Cardano, Solana

## Rischi delle Crypto

### 1. Volatilità Estrema

**Definizione**: Prezzo può variare ±50% in un giorno.

**Esempi:**
- **Bitcoin 2021**: €60,000 → €30,000 (-50%) in 2 mesi
- **Bitcoin 2022**: €30,000 → €15,000 (-50%) in 6 mesi
- **Altcoin**: -80-90% comuni

**Implicazione**: Puoi perdere metà capitale in giorni.

**Paper:**
> Baur, Hong & Lee (2018): "Bitcoin: Medium of Exchange or Speculative Assets?"
>
> **Risultato**: Bitcoin è asset speculativo, non valuta (volatilità troppo alta).

### 2. Rischio Regolamentazione

**Definizione**: Governi possono bandire/limitare crypto.

**Esempi:**
- **Cina 2021**: Bando mining e trading
- **USA**: Regolamentazione incerta
- **Europa**: MiCA (Markets in Crypto-Assets) in arrivo

**Implicazione**: Bando può far crollare prezzo 50-80%.

### 3. Rischio Hacking

**Definizione**: Exchange/wallet possono essere hackerati.

**Esempi:**
- **Mt. Gox 2014**: 850,000 BTC rubati (€500M)
- **FTX 2022**: Collasso, fondi utenti persi
- **Wallet privati**: Chiavi private perse = fondi persi per sempre

**Mitigazione:**
- **Cold wallet**: Hardware wallet (Ledger, Trezor)
- **Exchange**: Solo exchange regolamentati, grandi
- **Non tutto in un posto**: Diversifica

### 4. Rischio Tecnologico

**Definizione**: Bug software, vulnerabilità blockchain.

**Esempi:**
- **DAO Hack 2016**: $50M rubati (bug smart contract)
- **Poly Network 2021**: $600M rubati (vulnerabilità)

**Mitigazione**: Usa progetti con audit di sicurezza, codice open-source.

### 5. Rischio Liquidità

**Definizione**: Difficoltà a vendere grandi quantità senza impatto prezzo.

**Esempio:**
- **Hai**: 100 BTC (valore €3M)
- **Vendi tutto**: Impatto prezzo -5-10%
- **Risultato**: Perdita €150,000-300,000

### 6. Rischio Controparte (DeFi)

**Definizione**: Smart contract possono avere bug, progetti possono essere scam.

**Esempi:**
- **Rug pull**: Creatori abbandonano progetto, fondi rubati
- **Smart contract bug**: Fondi bloccati/rubati
- **Yield farming**: Progetti falliscono, fondi persi

**Mitigazione**: Investi solo in progetti auditati, con team verificato, TVL alto.

## Performance Storica

### Bitcoin

**Performance:**
- **2010-2020**: +9,000,000% (da $0.01 a $10,000)
- **2020-2021**: +500% (da $10,000 a $60,000)
- **2021-2022**: -75% (da $60,000 a $15,000)
- **2023-2024**: +150% (da $15,000 a $40,000)

**Volatilità**: 60-80% annua (vs azioni 15-20%)

**Paper:**
> Baur, Hong & Lee (2018): Bitcoin ha correlazione bassa con asset tradizionali (diversificazione), ma volatilità estrema.

### Altcoin

**Performance:**
- **99% falliscono**: Valore → €0
- **1% sopravvivono**: Alcuni diventano molto grandi
- **Esempi successo**: Ethereum, Binance Coin, Solana

**⚠️ RISCHIO**: Investire in altcoin = scommessa. 99% perdono tutto.

## Strategie di Investimento

### 1. Allocazione Conservativa

**Definizione**: Solo Bitcoin, piccola % portafoglio (1-5%).

**Ragionamento:**
- **Bitcoin**: Più stabile, più liquidità, più adozione
- **Piccola %**: Limita rischio totale portafoglio
- **Diversificazione**: Non tutto in crypto

**Allocazione:**
- **90-95%**: Asset tradizionali (azioni, obbligazioni)
- **5-10%**: Bitcoin

### 2. Diversificazione Crypto

**Definizione**: Bitcoin + Ethereum + Stablecoin.

**Allocazione:**
- **60%**: Bitcoin
- **30%**: Ethereum
- **10%**: Stablecoin (liquidità)

**⚠️ RISCHIO**: Anche questa allocazione è molto rischiosa.

### 3. Trading (Molto Rischioso)

**Definizione**: Comprare/vendere frequentemente per profitti.

**⚠️ AVVERTENZA**: Trading crypto è estremamente rischioso. 90% trader perdono soldi.

**Rischi:**
- Volatilità estrema
- Timing difficile
- Costi trading
- Tassazione (plusvalenze)

## Regolamentazione

### Europa: MiCA (Markets in Crypto-Assets)

**Stato**: In arrivo (2024-2025)

**Cosa fa:**
- Regolamenta stablecoin
- Requisiti exchange
- Protezione consumatori
- KYC/AML obbligatori

**Implicazione**: Più sicurezza, ma anche più restrizioni.

### USA: Regolamentazione Incerta

**Stato**: Frammentato (SEC, CFTC, stati)

**Problema**: Regolamentazione inconsistente, incertezza.

**Implicazione**: Rischio regolamentazione alto.

## Quando Investire in Crypto

**Adatto per:**
- ✅ Tolleranza rischio MOLTO alta
- ✅ Portafoglio già diversificato (asset tradizionali)
- ✅ Allocazione piccola (1-5% max)
- ✅ Time horizon lungo (5+ anni)
- ✅ Capisci tecnologia e rischi

**NON adatto per:**
- ❌ Tolleranza rischio bassa
- ❌ Portafoglio piccolo
- ❌ Obiettivo stabilità
- ❌ Time horizon breve (<1 anno)
- ❌ Non capisci tecnologia

**⚠️ AVVERTENZA FINALE**: Crypto sono molto rischiose. Puoi perdere tutto. Investi solo quello che puoi permetterti di perdere.

> **Principio**: "Le crypto sono speculazione, non investimento. Allocazione massima 1-5% portafoglio. Capisci rischi prima di investire."',
    'text', 6, 50, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- TEST FINALE MODULO 4
  INSERT INTO education_tests (
    module_id, title, description, passing_score, max_attempts, time_limit_minutes, bloom_level, is_active
  ) VALUES (
    v_module_id,
    'Test: Strumenti Finanziari Base',
    'Verifica comprensione azioni, obbligazioni, ETF, fondi, derivati e crypto. 15 domande, 70% per passare.',
    70,
    3,
    30,
    'apply',
    true
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Modulo 4b completato: Strumenti Finanziari Base (6 lezioni complete, 5 ore, test finale)';
END $$;
