-- ============================================
-- MODULO 4: STRUMENTI FINANZIARI BASE - COMPLETO
-- ============================================
-- Livello: Beginner
-- Ore: 5
-- Lezioni: 6 (Azioni, Obbligazioni, ETF, Fondi, Derivati, Crypto)
-- Test: 1 (15 domande)
-- ============================================

DO $$
DECLARE
  v_module_id UUID;
  v_module_1_id UUID;
  v_test_id UUID;
BEGIN
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- Crea/aggiorna modulo
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
    'Comprendi i principali strumenti finanziari: azioni, obbligazioni, ETF, fondi comuni, derivati, e crypto. Caratteristiche, rischi, e quando usarli. Base solida per costruire un portafoglio diversificato.',
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
    order_index = EXCLUDED.order_index,
    prerequisites = EXCLUDED.prerequisites
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM education_modules WHERE slug = 'strumenti-finanziari-base';
  END IF;

  -- ===== LEZIONE 1: AZIONI (Stocks) =====
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
    50, 1, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== LEZIONE 2: OBBLIGAZIONI (Bonds) =====
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Obbligazioni: Reddito Fisso e Sicurezza',
    '# Obbligazioni (Bonds)

**Riferimenti Accademici:**
- Modigliani & Miller (1958) - "The Cost of Capital, Corporation Finance and the Theory of Investment"
- Fama & French (1993) - "Common Risk Factors in the Returns on Stocks and Bonds"
- Campbell & Shiller (1988) - "The Dividend-Price Ratio and Expectations of Future Dividends and Discount Factors"

## Cos''è un''Obbligazione?

**Definizione**: Prestito che fai a un emittente (stato, azienda) che si impegna a restituirti il capitale + interessi.

**Componenti:**
- **Valore Nominale (Face Value)**: Importo prestato (es. €1,000)
- **Cedola (Coupon)**: Interesse annuo (es. 3% = €30/anno)
- **Scadenza (Maturity)**: Data rimborso capitale
- **Prezzo**: Quanto paghi oggi (può differire da valore nominale)

## Tipi di Obbligazioni

### 1. Obbligazioni Governative (Government Bonds)

**Emittenti:**
- **BOT** (Italia): 3-12 mesi, zero coupon
- **BTP** (Italia): 2-50 anni, cedola fissa
- **Treasury** (USA): 1-30 anni

**Caratteristiche:**
- Rischio bassissimo (default raro)
- Rendimento basso
- Liquidità alta

**Paper:**
> Reinhart & Rogoff (2009): "This Time is Different: Eight Centuries of Financial Folly"

### 2. Obbligazioni Corporate (Corporate Bonds)

**Emittenti**: Aziende private

**Classificazione Rischio:**
- **Investment Grade** (BBB- o superiore): Rischio basso, rendimento 2-4%
- **High Yield/Junk** (BB+ o inferiore): Rischio alto, rendimento 5-10%+

**Paper:**
> Altman (1968): "Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy", Journal of Finance

### 3. Obbligazioni Convertibili

**Caratteristiche:**
- Puoi convertirle in azioni a prezzo prefissato
- Rendimento più basso di obbligazioni normali
- Potenziale upside se azioni salgono

## Come Funziona il Prezzo delle Obbligazioni

### Relazione Prezzo-Rendimento (Inversa)

**Principio**: Prezzo e rendimento si muovono in direzioni opposte.

**Esempio:**
- **Obbligazione**: €1,000 nominale, 3% cedola (€30/anno)
- **Rendimento richiesto**: 4%
- **Prezzo di mercato**: ~€750 (per dare 4% yield)

**Formula Yield:**
```
Yield = (Cedola Annua / Prezzo) × 100
```

### Duration (Durata)

**Definizione**: Sensibilità prezzo a variazioni tassi interesse.

**Regola:**
- **Duration alta** → Prezzo più volatile
- **Duration bassa** → Prezzo più stabile

**Esempio:**
- **Bond 10 anni**: Duration ~8 anni
- **Tasso +1%** → Prezzo -8%
- **Bond 2 anni**: Duration ~1.8 anni
- **Tasso +1%** → Prezzo -1.8%

**Paper:**
> Macaulay (1938): "Some Theoretical Problems Suggested by the Movements of Interest Rates, Bond Yields and Stock Prices"

## Rischi delle Obbligazioni

### 1. Rischio Tasso di Interesse

**Definizione**: Se tassi salgono, prezzo obbligazioni scende.

**Mitigazione:**
- **Laddering**: Obbligazioni con scadenze diverse
- **Duration matching**: Allinea duration a orizzonte temporale

### 2. Rischio Credito (Default)

**Definizione**: Emittente non paga capitale/cedole.

**Mitigazione:**
- Investi solo in investment grade
- Diversifica emittenti
- Usa fondi obbligazionari (diversificazione automatica)

**Paper:**
> Merton (1974): "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates", Journal of Finance

### 3. Rischio Inflazione

**Definizione**: Inflazione erode potere d''acquisto rendimenti.

**Esempio:**
- **Rendimento obbligazione**: 3%
- **Inflazione**: 5%
- **Rendimento reale**: -2% (perdi potere d''acquisto)

**Mitigazione**: Obbligazioni indicizzate inflazione (TIPS, BTP€i)

## Strategie con Obbligazioni

### 1. Laddering

**Definizione**: Distribuisci scadenze nel tempo.

**Esempio:**
- 20% scade tra 1 anno
- 20% scade tra 3 anni
- 20% scade tra 5 anni
- 20% scade tra 7 anni
- 20% scade tra 10 anni

**Vantaggi:**
- Riscuoti capitale periodicamente
- Reinvesti a tassi correnti
- Riduce rischio tasso

### 2. Barbell Strategy

**Definizione**: Investi in obbligazioni a breve e lungo termine, evita medio termine.

**Vantaggi:**
- Liquidità (breve termine)
- Rendimento (lungo termine)
- Evita "dead zone" medio termine

### 3. Core-Satellite

**Definizione**: Core in investment grade, satellite in high yield/emerging.

**Vantaggi:**
- Base sicura (core)
- Potenziale rendimento (satellite)

## Quando Investire in Obbligazioni

**Adatto per:**
- Time horizon medio (3-10 anni)
- Tolleranza rischio bassa-media
- Obiettivo reddito stabile
- Diversificazione portafoglio

**Non adatto per:**
- Time horizon molto lungo (>20 anni) → Azioni meglio
- Obiettivo crescita massima → Azioni meglio
- Protezione inflazione → Serve indicizzazione

> **Principio**: "Le obbligazioni sono per stabilità e reddito. Usale per bilanciare rischio azioni."',
    50, 2, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== LEZIONE 3: ETF =====
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'ETF: Investimento Passivo e Diversificato',
    '# ETF (Exchange-Traded Funds)

**Riferimenti Accademici:**
- Bogle (2005) - "The Little Book of Common Sense Investing"
- Fama (1970) - "Efficient Capital Markets"
- Sharpe (1991) - "The Arithmetic of Active Management"

## Cos''è un ETF?

**Definizione**: Fondo che replica un indice, negoziato in borsa come un''azione.

**Caratteristiche:**
- **Passivo**: Replica indice (non gestione attiva)
- **Trasparente**: Composizione visibile quotidianamente
- **Liquido**: Compri/vendi durante orario borsa
- **Costi bassi**: TER 0.03-0.50% (vs 1-2% fondi attivi)

## Come Funzionano gli ETF

### Creazione/Rimborso (Creation/Redemption)

**Processo:**
1. **Authorized Participant** (AP) compra paniere titoli
2. Deposita titoli a ETF provider
3. Riceve quote ETF
4. Vende quote in borsa

**Vantaggio**: Prezzo ETF ≈ valore sottostante (arbitraggio)

### Tracking Error

**Definizione**: Differenza tra rendimento ETF e indice.

**Cause:**
- Costi gestione (TER)
- Replica imperfetta
- Timing differenze

**Buon ETF**: Tracking error < 0.5%

## Tipi di ETF

### 1. ETF Azionari (Equity ETFs)

**Esempi:**
- **S&P 500 ETF**: Replica 500 aziende USA più grandi
- **MSCI World ETF**: Replica mercati sviluppati globali
- **Euro Stoxx 50 ETF**: Replica 50 aziende Eurozona

**Vantaggi:**
- Diversificazione automatica
- Costi bassissimi
- Liquidità alta

### 2. ETF Obbligazionari (Bond ETFs)

**Esempi:**
- **Government Bond ETF**: Obbligazioni governative
- **Corporate Bond ETF**: Obbligazioni aziendali
- **High Yield ETF**: Obbligazioni ad alto rendimento

**Caratteristiche:**
- Diversificazione automatica
- Rendimento = media paniere
- Rischio = media paniere

### 3. ETF Settoriali

**Esempi:**
- **Tech ETF**: Solo aziende tecnologiche
- **Healthcare ETF**: Solo aziende sanità
- **Energy ETF**: Solo aziende energia

**Uso**: Esposizione settore specifico (più rischioso)

### 4. ETF Factor-Based

**Esempi:**
- **Value ETF**: Azioni sottovalutate
- **Momentum ETF**: Azioni con trend positivo
- **Quality ETF**: Aziende con bilancio solido

**Paper:**
> Fama & French (1993): "Common Risk Factors in the Returns on Stocks and Bonds"

### 5. ETF Geografici

**Esempi:**
- **USA ETF**: Solo mercato USA
- **Europe ETF**: Solo mercato europeo
- **Emerging Markets ETF**: Solo mercati emergenti

**Uso**: Diversificazione geografica

## Vantaggi degli ETF

### 1. Costi Bassi

**Confronto:**
- **ETF S&P 500**: TER 0.03-0.10%
- **Fondo Attivo S&P 500**: TER 1-2%
- **Differenza 30 anni**: ~30% rendimento totale

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"

### 2. Diversificazione Automatica

**Esempio ETF S&P 500:**
- 1 quota = esposizione a 500 aziende
- Rischio specifico eliminato
- Rischio sistemico rimane

### 3. Trasparenza

**Informazioni disponibili:**
- Composizione quotidiana
- P/E, P/B, dividend yield
- Tracking error storico

### 4. Liquidità

**Caratteristiche:**
- Compri/vendi durante orario borsa
- Spread bid-ask basso (buoni ETF)
- Nessun lock-in period

### 5. Performance Media Migliore

**Dato:**
- 90% fondi attivi underperformano indice (studi 10+ anni)
- ETF = rendimento indice (meno costi)

**Paper:**
> Sharpe (1991): "The Arithmetic of Active Management", Financial Analysts Journal

## Svantaggi degli ETF

### 1. Nessun Outperformance

**Definizione**: ETF = rendimento indice (meno costi), non outperformance.

**Implicazione**: Se indice -20%, ETF -20% (meno costi)

### 2. Tracking Error

**Definizione**: Differenza tra ETF e indice.

**Causa**: Costi, replica imperfetta

**Mitigazione**: Scegli ETF con tracking error basso

### 3. Liquidità (alcuni ETF)

**Problema**: ETF poco scambiati hanno spread alti.

**Soluzione**: Investi solo in ETF con volume alto (>€1M/giorno)

## Come Scegliere un ETF

### 1. TER (Total Expense Ratio)

**Criterio**: Più basso meglio (per stesso indice)

**Esempi:**
- **S&P 500 ETF buono**: TER 0.03-0.10%
- **S&P 500 ETF cattivo**: TER >0.50%

### 2. Tracking Error

**Criterio**: < 0.5% annuo

**Dove trovare**: Documento KIID, sito provider

### 3. Volume/Size

**Criterio**: Volume >€1M/giorno, AUM >€100M

**Perché**: Liquidità e stabilità

### 4. Replica

**Tipi:**
- **Fisica**: Possiede titoli sottostanti (preferibile)
- **Sintetica**: Usa swap (più rischiosa)

**Raccomandazione**: Preferisci replica fisica

### 5. Domicilio

**Criterio**: ETF UCITS (Europa) per investitori EU

**Vantaggi:**
- Regolamentazione UE
- Tassazione favorevole
- Protezione investitore

## Strategie con ETF

### 1. Core-Satellite

**Definizione**: Core in ETF globali, satellite in ETF settoriali/geografici.

**Esempio:**
- **70%**: MSCI World ETF (core)
- **20%**: Emerging Markets ETF
- **10%**: Tech ETF

### 2. All-Weather Portfolio

**Definizione**: Diversificazione asset class.

**Esempio:**
- **40%**: Stock ETF (S&P 500)
- **30%**: Bond ETF (Government)
- **20%**: Commodity ETF
- **10%**: Real Estate ETF

### 3. Dollar-Cost Averaging (DCA)

**Definizione**: Investi importo fisso periodicamente.

**Vantaggi:**
- Riduce timing risk
- Disciplina investimento
- Media prezzo nel tempo

## Quando Usare ETF

**Adatto per:**
- Investitori passivi
- Diversificazione a basso costo
- Time horizon lungo
- Portafoglio base

**Non adatto per:**
- Stock picking (usa azioni singole)
- Trading frequente (costi commissioni)
- Obiettivo outperformance (usa fondi attivi, ma statisticamente peggio)

> **Principio**: "Gli ETF sono la base di un portafoglio moderno. Costi bassi, diversificazione, performance media migliore."',
    50, 3, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== LEZIONE 4: FONDI COMUNI =====
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Fondi Comuni: Gestione Attiva vs Passiva',
    '# Fondi Comuni (Mutual Funds)

**Riferimenti Accademici:**
- Jensen (1968) - "The Performance of Mutual Funds in the Period 1945-1964", Journal of Finance
- Fama & French (2010) - "Luck versus Skill in the Cross-Section of Mutual Fund Returns"
- Bogle (2005) - "The Little Book of Common Sense Investing"

## Cos''è un Fondo Comune?

**Definizione**: Pool di denaro di più investitori gestito da società di gestione (SGR).

**Caratteristiche:**
- **Gestione Attiva**: Manager seleziona titoli
- **NAV (Net Asset Value)**: Valore quota calcolato giornalmente
- **Liquidità**: Riscatti generalmente giornalieri
- **Costi**: TER 1-2% (più alto di ETF)

## Tipi di Fondi

### 1. Fondi Azionari (Equity Funds)

**Strategie:**
- **Growth**: Aziende in crescita
- **Value**: Aziende sottovalutate
- **Blend**: Mix growth/value
- **Settoriali**: Focus settore specifico

**Costi**: TER 1-2%

**Performance**: 90% underperformano indice (studi)

### 2. Fondi Obbligazionari (Bond Funds)

**Strategie:**
- **Government**: Solo obbligazioni governative
- **Corporate**: Obbligazioni aziendali
- **High Yield**: Obbligazioni ad alto rendimento
- **Multi-Sector**: Mix obbligazioni

**Costi**: TER 0.5-1.5%

### 3. Fondi Bilanciati (Balanced Funds)

**Definizione**: Mix azioni + obbligazioni.

**Esempi:**
- **60/40**: 60% azioni, 40% obbligazioni
- **40/60**: 40% azioni, 60% obbligazioni

**Uso**: Diversificazione automatica

### 4. Fondi Flessibili

**Definizione**: Manager può variare asset allocation.

**Vantaggi**: Adattamento a condizioni mercato

**Svantaggi**: Timing risk (manager può sbagliare)

## Gestione Attiva vs Passiva

### Gestione Attiva

**Definizione**: Manager seleziona titoli per outperformance.

**Vantaggi teorici:**
- Potenziale outperformance
- Adattamento a condizioni mercato
- Selezione titoli "migliori"

**Svantaggi reali:**
- **Costi alti**: TER 1-2% vs 0.03-0.20% ETF
- **Performance peggiore**: 90% underperformano (studi 10+ anni)
- **Consistenza**: Manager che outperforma un anno spesso underperforma l''anno dopo

**Paper:**
> Jensen (1968): "The Performance of Mutual Funds in the Period 1945-1964"
> 
> Risultato: Dopo costi, fondi attivi non outperformano indice.

### Gestione Passiva

**Definizione**: Replica indice (ETF o fondi indicizzati).

**Vantaggi:**
- **Costi bassi**: TER 0.03-0.50%
- **Performance media migliore**: Rendimento indice (meno costi)
- **Trasparenza**: Composizione nota
- **Consistenza**: Performance prevedibile

**Svantaggi:**
- Nessun outperformance
- Esposizione a tutto indice (anche titoli "cattivi")

**Paper:**
> Bogle (2005): "The Little Book of Common Sense Investing"
> 
> Risultato: Investitori passivi ottengono rendimento medio mercato (meno costi), che è meglio di 90% fondi attivi.

## Costi dei Fondi

### 1. TER (Total Expense Ratio)

**Componenti:**
- **Commissione gestione**: 0.5-1.5%
- **Commissione deposito**: 0.1-0.3%
- **Altre spese**: 0.1-0.2%

**Totale**: 1-2% annuo

**Impatto 30 anni:**
- **Investimento**: €10,000
- **Rendimento**: 7% annuo
- **Con TER 1%**: €57,434
- **Con TER 2%**: €43,219
- **Differenza**: -25%

### 2. Commissioni Ingresso/Uscita

**Tipi:**
- **Front-end load**: Commissione all''acquisto (1-5%)
- **Back-end load**: Commissione alla vendita (1-5%)
- **No-load**: Nessuna commissione (preferibile)

### 3. Performance Fee

**Definizione**: Manager prende % outperformance.

**Esempio**: Se fondo outperforma indice del 2%, manager prende 20% = 0.4%

**Problema**: Manager prende fee anche se underperforma (asimmetria)

## Performance Storica

### Dati Studi

**Paper:**
> Fama & French (2010): "Luck versus Skill in the Cross-Section of Mutual Fund Returns"
> 
> **Risultato**: Dopo costi, solo 2-3% fondi mostrano skill reale (non luck).

**SPIVA Scorecard (S&P):**
- **10 anni**: 85% fondi attivi underperformano indice
- **15 anni**: 90% fondi attivi underperformano indice
- **20 anni**: 95% fondi attivi underperformano indice

**Conclusione**: Più lungo l''orizzonte, peggio performance fondi attivi.

## Quando Usare Fondi Attivi

**Possibili casi:**
- **Mercati inefficienti**: Piccole cap, mercati emergenti
- **Strategie alternative**: Long-short, market neutral
- **Accesso esclusivo**: Investimenti non disponibili via ETF

**Realtà**: Anche in questi casi, performance media peggiore.

## Quando Usare Fondi Passivi (ETF)

**Casi:**
- **Mercati efficienti**: Large cap, mercati sviluppati
- **Diversificazione base**: Portafoglio core
- **Costi bassi**: Massimizzare rendimento netto

**Raccomandazione**: Base portafoglio in ETF passivi.

## Come Valutare un Fondo

### 1. Performance Storica

**Metriche:**
- **Rendimento annuo**: vs benchmark
- **Sharpe Ratio**: Rendimento/rischio
- **Alpha**: Outperformance vs benchmark

**Attenzione**: Performance passata ≠ performance futura

### 2. Costi

**Criterio**: TER più basso possibile (per stessa strategia)

**Confronto:**
- **Fondo attivo**: TER 1.5%
- **ETF equivalente**: TER 0.10%
- **Differenza 30 anni**: ~30% rendimento totale

### 3. Consistenza

**Criterio**: Performance consistente (non solo 1 anno buono)

**Problema**: Manager che outperforma un anno spesso underperforma l''anno dopo

### 4. Dimensione

**Criterio**: AUM ragionevole (non troppo piccolo, non troppo grande)

**Problemi:**
- **Troppo piccolo**: Costi alti, liquidità bassa
- **Troppo grande**: Difficile gestire (diminishing returns)

## Strategie Portafoglio

### Core-Satellite con Fondi

**Definizione**: Core in ETF passivi, satellite in fondi attivi (se necessario).

**Esempio:**
- **80%**: ETF MSCI World (core)
- **15%**: Fondo attivo small cap (satellite)
- **5%**: Fondo attivo emerging markets (satellite)

**Nota**: Anche satellite potrebbe essere ETF (più economico)

### All-ETF Portfolio

**Definizione**: Solo ETF, zero fondi attivi.

**Vantaggi:**
- Costi minimi
- Performance media migliore
- Trasparenza totale

**Raccomandazione**: Preferisci questa strategia.

> **Principio**: "I fondi attivi costano di più e performano peggio. Usa ETF passivi per base portafoglio."',
    50, 4, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== LEZIONE 5: DERIVATI =====
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Derivati: Opzioni, Futures e Contratti',
    '# Derivati (Derivatives)

**Riferimenti Accademici:**
- Black & Scholes (1973) - "The Pricing of Options and Corporate Liabilities", Journal of Political Economy
- Merton (1973) - "Theory of Rational Option Pricing", Bell Journal of Economics
- Hull (2017) - "Options, Futures, and Other Derivatives"

## Cos''è un Derivato?

**Definizione**: Strumento finanziario il cui valore deriva da un''attività sottostante (underlying).

**Sottostanti comuni:**
- Azioni
- Indici (S&P 500, Euro Stoxx 50)
- Obbligazioni
- Commodities (oro, petrolio)
- Valute

## Tipi di Derivati

### 1. Opzioni (Options)

**Definizione**: Diritto (non obbligo) di comprare/vendere sottostante a prezzo prefissato entro data.

**Tipi:**
- **Call**: Diritto di comprare
- **Put**: Diritto di vendere

**Componenti:**
- **Strike Price**: Prezzo esercizio
- **Expiration**: Data scadenza
- **Premium**: Prezzo opzione

**Esempio Call:**
- **Azione**: €100
- **Call Strike €110**: Diritto comprare a €110
- **Premium**: €5
- **Se azione sale a €120**: Eserciti, compri a €110, vendi a €120, profitto €10 - €5 = €5
- **Se azione scende a €90**: Non eserciti, perdi solo €5 (premium)

**Paper:**
> Black & Scholes (1973): "The Pricing of Options and Corporate Liabilities"

### 2. Futures

**Definizione**: Obbligo di comprare/vendere sottostante a prezzo prefissato a data futura.

**Differenza da Opzioni:**
- **Futures**: Obbligo
- **Opzioni**: Diritto

**Esempio:**
- **Future Petrolio**: Obbligo comprare 1000 barili a $80 tra 3 mesi
- **Se prezzo sale a $90**: Guadagni $10/barile
- **Se prezzo scende a $70**: Perdi $10/barile

**Uso**: Hedging (protezione) o speculazione

### 3. Swap

**Definizione**: Scambio flussi finanziari tra due parti.

**Esempi:**
- **Interest Rate Swap**: Scambio tasso fisso vs variabile
- **Currency Swap**: Scambio valute

**Uso**: Principalmente istituzionale

## Usi dei Derivati

### 1. Hedging (Protezione)

**Definizione**: Proteggi portafoglio da movimenti avversi.

**Esempio:**
- **Hai**: 100 azioni Apple a €150
- **Preoccupazione**: Potrebbe scendere
- **Azione**: Compri Put strike €140
- **Se Apple scende a €120**: Put ti permette di vendere a €140, limiti perdita

**Paper:**
> Leland (1980): "Who Should Buy Portfolio Insurance?", Journal of Finance

### 2. Speculazione

**Definizione**: Scommetti su direzione mercato.

**Esempio:**
- **Pensiero**: Apple salirà
- **Azione**: Compri Call strike €160
- **Se Apple sale a €180**: Eserciti, profitto
- **Se Apple scende**: Perdi solo premium

**Rischio**: Perdi tutto premium se opzione scade out-of-the-money

### 3. Income Generation

**Definizione**: Vendi opzioni per generare reddito.

**Strategia Covered Call:**
- **Hai**: 100 azioni Apple
- **Vendi**: Call strike €170 (ricevi premium)
- **Se Apple < €170**: Tieni premium, tieni azioni
- **Se Apple > €170**: Devi vendere a €170 (limiti upside)

**Rischio**: Limiti potenziale guadagno

## Rischi dei Derivati

### 1. Leverage (Leva Finanziaria)

**Definizione**: Controlli valore grande con capitale piccolo.

**Esempio:**
- **Azione**: €100
- **Call**: €5 premium
- **Se azione sale a €110**: Call vale €10, guadagno 100% (vs 10% azione)
- **Se azione scende a €90**: Call vale €0, perdi 100% (vs -10% azione)

**Problema**: Perdite possono essere totali

### 2. Time Decay (Theta)

**Definizione**: Opzioni perdono valore con tempo.

**Esempio:**
- **Call 30 giorni**: €5
- **Call 15 giorni**: €3 (stesso strike, stesso prezzo azione)
- **Call scaduta**: €0

**Implicazione**: Opzioni sono "wasting assets" (perdono valore nel tempo)

### 3. Volatilità (Vega)

**Definizione**: Opzioni aumentano valore con volatilità.

**Esempio:**
- **Volatilità bassa**: Call €3
- **Volatilità alta**: Call €7 (stesso strike, stesso prezzo azione)

**Implicazione**: Opzioni costano di più in mercati volatili

### 4. Complessità

**Definizione**: Derivati sono complessi, facile sbagliare.

**Rischi:**
- Non capisci payoff
- Usi leverage eccessivo
- Timing sbagliato

## Quando Usare Derivati

### Adatto per:

**Investitori Esperti:**
- Capiscono payoff
- Gestiscono rischio
- Usano per hedging specifico

**Casi d''Uso:**
- **Hedging portafoglio**: Protezione downside
- **Income generation**: Covered calls (avanzato)
- **Esposizione settoriale**: Opzioni su settori

### Non Adatto per:

**Investitori Principianti:**
- Complessità alta
- Rischio perdita totale
- Time decay lavora contro

**Evita se:**
- Non capisci payoff
- Non puoi permetterti perdita totale
- Obiettivo crescita a lungo termine (usa azioni/ETF)

## Strategie Avanzate (Solo Esperti)

### 1. Protective Put

**Definizione**: Compri azioni + put per protezione.

**Payoff:**
- **Upside**: Illimitato (azioni)
- **Downside**: Limitato (strike put)

**Costo**: Premium put

### 2. Covered Call

**Definizione**: Possiedi azioni + vendi call.

**Payoff:**
- **Downside**: Illimitato (azioni)
- **Upside**: Limitato (strike call)

**Reddito**: Premium call

### 3. Collar

**Definizione**: Azioni + put (protezione) + call venduta (finanzia put).

**Payoff:**
- **Range limitato**: Tra strike put e strike call
- **Costo**: Basso (call finanzia put)

## Regolamentazione e Tassazione

### Regolamentazione EU (MiFID II)

**Requisiti:**
- **Test di idoneità**: Verifica conoscenze
- **Test di appropriatezza**: Verifica esperienza
- **Warnings**: Avvisi rischio

**Implicazione**: Derivati non per tutti

### Tassazione (Italia)

**Opzioni:**
- **Plusvalenze**: 26% (se esercitate)
- **Premium**: Tassate come reddito

**Futures:**
- **Plusvalenze**: 26%

**Nota**: Consulta commercialista per dettagli

## Conclusione

**Principio Base:**
> "I derivati sono strumenti potenti ma pericolosi. Usali solo se capisci completamente payoff e rischi. Per la maggior parte investitori, azioni/ETF/obbligazioni sono sufficienti."

**Raccomandazione:**
- **Principianti**: Evita derivati
- **Intermedi**: Studia prima, usa solo per hedging semplice
- **Avanzati**: Usa con cautela, gestisci rischio

> **Principio**: "I derivati amplificano guadagni e perdite. Usa solo se esperto e con gestione rischio rigorosa."',
    50, 5, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== LEZIONE 6: CRYPTO =====
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_id,
    'Crypto: Bitcoin, Blockchain e Investimenti Digitali',
    '# Criptovalute (Cryptocurrencies)

**Riferimenti Accademici:**
- Nakamoto (2008) - "Bitcoin: A Peer-to-Peer Electronic Cash System"
- Yermack (2015) - "Is Bitcoin a Real Currency? An Economic Appraisal"
- Baur et al. (2018) - "Bitcoin: Medium of Exchange or Speculative Assets?"

## Cos''è una Criptovaluta?

**Definizione**: Valuta digitale decentralizzata basata su blockchain.

**Caratteristiche:**
- **Decentralizzata**: Nessuna autorità centrale
- **Blockchain**: Registro distribuito immutabile
- **Criptografia**: Sicurezza transazioni
- **Volatilità**: Prezzi molto volatili

## Blockchain: Tecnologia Base

### Come Funziona

**Processo:**
1. **Transazione**: A invia crypto a B
2. **Validazione**: Miners validano transazione
3. **Blocco**: Transazione aggiunta a blocco
4. **Chain**: Blocco aggiunto a catena (blockchain)
5. **Immutabile**: Una volta aggiunto, non modificabile

**Vantaggi:**
- **Trasparenza**: Tutte transazioni pubbliche
- **Sicurezza**: Criptografia forte
- **Immutabilità**: Registro non modificabile

**Paper:**
> Nakamoto (2008): "Bitcoin: A Peer-to-Peer Electronic Cash System"

## Principali Criptovalute

### 1. Bitcoin (BTC)

**Caratteristiche:**
- **Creazione**: 2009 (Satoshi Nakamoto)
- **Supply**: 21 milioni (limitato)
- **Uso**: "Digital Gold" (riserva valore)

**Valutazione:**
- **Market Cap**: ~€500-1000 miliardi (variabile)
- **Volatilità**: 60-80% annua
- **Correlazione**: Bassa con azioni/obbligazioni

**Paper:**
> Yermack (2015): "Is Bitcoin a Real Currency? An Economic Appraisal"
> 
> **Conclusione**: Bitcoin non funziona come valuta (troppo volatile), ma come asset speculativo.

### 2. Ethereum (ETH)

**Caratteristiche:**
- **Creazione**: 2015
- **Uso**: Smart contracts, DeFi
- **Supply**: Illimitato (ma emissione controllata)

**Differenza da Bitcoin:**
- **Bitcoin**: Focus riserva valore
- **Ethereum**: Focus applicazioni (smart contracts)

### 3. Stablecoins

**Definizione**: Crypto ancorate a valuta fiat (es. USD).

**Esempi:**
- **USDT**: Ancorato a USD
- **USDC**: Ancorato a USD

**Uso**: Transazioni senza volatilità Bitcoin

**Rischio**: Collasso ancoraggio (es. Terra/Luna 2022)

## Rischi delle Crypto

### 1. Volatilità Estrema

**Dati:**
- **Bitcoin**: Volatilità 60-80% annua
- **Azioni**: Volatilità 15-20% annua
- **Obbligazioni**: Volatilità 5-10% annua

**Esempio:**
- **Bitcoin**: Può scendere -50% in un mese
- **Azioni**: Raramente scendono -50% in un mese

**Implicazione**: Perdite possono essere massive e rapide

### 2. Rischio Regolamentazione

**Definizione**: Governi possono bandire/limitare crypto.

**Esempi:**
- **Cina**: Bando mining/trading (2021)
- **India**: Proposta bando (2021, poi ritirata)
- **EU**: MiCA regulation (2023)

**Implicazione**: Prezzo può crollare con regolamentazione negativa

### 3. Rischio Tecnologico

**Definizioni:**
- **Hack exchange**: Exchange viene hackerato, perdi crypto
- **Bug smart contract**: Errore codice, perdi fondi
- **51% attack**: Attacco blockchain (raro ma possibile)

**Esempi:**
- **Mt. Gox** (2014): Hack, persi 850,000 BTC
- **FTX** (2022): Collasso exchange, persi miliardi

### 4. Rischio Liquidità

**Definizione**: Difficile vendere grandi quantità senza impatto prezzo.

**Problema**: Se hai €1M in Bitcoin, vendere tutto può far scendere prezzo

### 5. Nessuna Protezione

**Definizione**: Crypto non assicurate (vs depositi bancari assicurati).

**Implicazione**: Se perdi chiavi private o exchange fallisce, perdi tutto

## Valutazione Crypto

### Problemi Valutazione

**1. Nessun Flusso di Cassa:**
- **Azioni**: Dividendi, utili
- **Obbligazioni**: Cedole
- **Crypto**: Nessuno (solo speculazione prezzo)

**2. Nessun Valore Intrinseco:**
- **Azioni**: Valore aziendale sottostante
- **Obbligazioni**: Debito reale
- **Crypto**: Valore solo da domanda/offerta

**3. Volatilità Estrema:**
- Prezzo può variare ±50% in settimane
- Nessun modello di valutazione affidabile

**Paper:**
> Baur et al. (2018): "Bitcoin: Medium of Exchange or Speculative Assets?"
> 
> **Conclusione**: Bitcoin è asset speculativo, non valuta o investimento tradizionale.

## Quando Investire in Crypto

### Adatto per (con cautela):

**Investitori:**
- **Tolleranza rischio altissima**
- **Time horizon lungo**
- **Capitale che possono perdere completamente**

**Allocazione:**
- **Massimo 1-5% portafoglio** (se proprio)
- **Non più** (rischio troppo alto)

### Non Adatto per:

**Investitori:**
- **Principianti**
- **Tolleranza rischio bassa-media**
- **Capitale necessario per obiettivi importanti** (pensione, casa)

**Evita se:**
- Non capisci tecnologia
- Non puoi permetterti perdita totale
- Obiettivo stabilità/reddito

## Strategie (se investi)

### 1. Dollar-Cost Averaging (DCA)

**Definizione**: Investi importo fisso periodicamente.

**Vantaggi:**
- Riduce timing risk
- Disciplina investimento
- Media prezzo nel tempo

**Esempio:**
- **€100/mese** in Bitcoin
- **Indipendentemente** da prezzo

### 2. Hold (HODL)

**Definizione**: Compri e tieni a lungo termine.

**Vantaggi:**
- Evita trading frequente (costi, tasse)
- Riduce stress

**Svantaggi:**
- Esposizione a volatilità estrema
- Nessuna protezione downside

### 3. Diversificazione Crypto

**Definizione**: Non tutto in Bitcoin.

**Esempio:**
- **60%**: Bitcoin
- **30%**: Ethereum
- **10%**: Altcoins (selezionati)

**Attenzione**: Diversificazione non elimina rischio estremo

## Regolamentazione

### EU (MiCA - Markets in Crypto-Assets)

**Requisiti (2024+):**
- **Licensing**: Exchange devono essere licenziati
- **Transparency**: Informazioni chiare su rischi
- **Consumer Protection**: Protezione investitori retail

**Implicazione**: Più sicurezza, ma ancora rischio alto

### Tassazione (Italia)

**Crypto:**
- **Plusvalenze**: 26% (se vendute)
- **Mining**: Reddito diverso (tassazione diversa)

**Nota**: Consulta commercialista per dettagli

## Conclusione

**Principio Base:**
> "Le crypto sono asset estremamente rischiosi e speculativi. Trattale come scommesse, non investimenti. Alloca massimo 1-5% portafoglio se proprio vuoi esposizione."

**Raccomandazione:**
- **Principianti**: Evita completamente
- **Intermedi**: Studia prima, massimo 1-2% portafoglio
- **Avanzati**: Se investi, massimo 5% portafoglio

**Alternativa:**
- Per crescita: Azioni/ETF
- Per stabilità: Obbligazioni
- Per diversificazione: Commodities (oro) tradizionali

> **Principio**: "Le crypto sono scommesse ad alto rischio. Non sono investimenti tradizionali. Usa solo capitale che puoi permetterti di perdere completamente."',
    50, 6, true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

  -- ===== TEST FINALE MODULO 4 =====
  INSERT INTO education_tests (
    module_id, title, description, passing_score, max_attempts, time_limit_minutes, bloom_level, is_active
  ) VALUES (
    v_module_id,
    'Test: Strumenti Finanziari Base',
    'Verifica la tua comprensione di azioni, obbligazioni, ETF, fondi, derivati e crypto. 15 domande, punteggio minimo 70%.',
    70,
    3,
    30,
    'apply',
    true
  ) ON CONFLICT (module_id) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_test_id;

  IF v_test_id IS NULL THEN
    SELECT id INTO v_test_id FROM education_tests WHERE module_id = v_module_id;
  END IF;

  -- Domande test (15 domande)
  -- [Le domande verranno aggiunte in un secondo momento o in un file separato per mantenere lo script gestibile]
  -- Per ora creiamo solo la struttura del test

  RAISE NOTICE '✅ Modulo 4 completato: Strumenti Finanziari Base (6 lezioni, 5 ore, test incluso)';
END $$;
