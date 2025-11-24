# Curriculum Formativo Completo - Tradelia

## Struttura Moduli

### Modulo 1: Fondamenti di Investimento ✅

- **File**: `supabase/seed-education-content.sql`
- **Livello**: Beginner
- **Ore**: 3
- **Lezioni**: 4
  - Cos'è un investimento?
  - Diversificazione del Portafoglio
  - Comprensione del Rischio
  - Costi e Commissioni
- **Test**: 1 (5 domande)
- **Prerequisiti**: Nessuno

### Modulo 2: Gestione Rischio e Rischi ✅

- **File**: `supabase/seed-education-module-2-risk-management.sql`
- **Livello**: Intermediate
- **Ore**: 5
- **Lezioni**: 3
  - Tassonomia Completa dei Rischi (con paper accademici)
  - Metriche Quantitative (Volatility, VaR, Sharpe, Sortino, Beta, Alpha)
  - Strategie Pratiche di Gestione Rischio
- **Test**: 1 (5 domande)
- **Prerequisiti**: Modulo 1

### Modulo 3: Voglio Risparmiare ✅

- **File**: `supabase/seed-education-module-3-saving.sql`
- **Livello**: Beginner
- **Ore**: 4
- **Lezioni**: 3
  - La Scienza del Risparmio (Thaler & Benartzi, SMarT)
  - Dove Mettere i Risparmi (Asset Allocation)
  - Errori Comuni (Barber & Odean, Myopic Loss Aversion)
- **Test**: 1 (5 domande)
- **Prerequisiti**: Modulo 2

### Modulo 4: Voglio Gestire il Mio Patrimonio ✅

- **File**: `supabase/seed-education-module-4-wealth-management.sql`
- **Livello**: Intermediate
- **Ore**: 5
- **Lezioni**: 2
  - Teoria del Portafoglio Ottimale (Markowitz, Merton, Black-Litterman, Fama-French)
  - Strategie di Prelievo in Pensione (Regola 4%, Guardrails, Bucket)
- **Test**: 1 (5 domande)
- **Prerequisiti**: Modulo 2

### Modulo 5: Voglio Speculare ✅

- **File**: `supabase/seed-education-module-5-speculation.sql`
- **Livello**: Advanced
- **Ore**: 6
- **Lezioni**: 2
  - La Realtà del Trading (Barber & Odean, Efficient Market Hypothesis)
  - Strategie Evidence-Based (Momentum, Value, Low-Vol, Quality)
- **Test**: 1 (5 domande)
- **Prerequisiti**: Modulo 2

## Paper Accademici Referenziati

### Modulo 2 (Rischio)

- Markowitz (1952) - Portfolio Selection
- Sharpe (1964) - CAPM
- Fama & French (1993) - Three-Factor Model
- Jorion (2007) - Value at Risk
- Artzner et al. (1999) - Coherent Risk Measures
- Sortino & Price (1994) - Sortino Ratio
- Amihud (2002) - Illiquidity
- Merton (1974) - Corporate Debt Pricing
- Kahneman & Tversky (1979) - Prospect Theory
- Barber & Odean (2000) - Trading is Hazardous
- Lo (2004) - Adaptive Markets Hypothesis

### Modulo 3 (Risparmio)

- Thaler & Benartzi (2004) - Save More Tomorrow
- Choi et al. (2002) - Defined Contribution Pensions
- Benartzi & Thaler (2007) - Heuristics and Biases
- Madrian & Shea (2001) - Automatic Enrollment
- Thaler (1985, 1999) - Mental Accounting
- Bryan et al. (2010) - Commitment Devices
- Merton (1969) - Lifetime Portfolio Selection
- Bengen (1994) - 4% Rule
- Constantinides (1979) - Dollar-Cost Averaging

### Modulo 4 (Wealth Management)

- Markowitz (1952) - Portfolio Selection
- Merton (1969) - Lifetime Portfolio Selection
- Samuelson (1969) - Lifetime Portfolio Selection
- Black & Litterman (1992) - Global Portfolio Optimization
- Fama & French (1993, 2015) - Factor Models
- Cocco et al. (2005) - Consumption and Portfolio Choice
- Bengen (1994) - 4% Rule
- Blanchett et al. (2022) - Guardrails Strategy
- Guyton & Klinger (2006) - Decision Rules
- Dammon et al. (2004) - Tax Optimization

### Modulo 5 (Speculazione)

- Barber & Odean (2000) - Trading is Hazardous
- Odean (1998, 1999) - Disposition Effect, Overconfidence
- Fama (1970) - Efficient Market Hypothesis
- Jegadeesh & Titman (1993) - Momentum
- Fama & French (1992) - Value Effect
- Frazzini & Pedersen (2014) - Betting Against Beta
- DeBondt & Thaler (1985) - Reversal Effect
- Asness et al. (2013) - Quality Factor
- Barber et al. (2014) - Day Trading
- Malkiel (2003, 2011) - Random Walk

## Come Eseguire gli Script

### Ordine di Esecuzione

1. **Modulo 1**: `supabase/seed-education-content.sql`
2. **Modulo 2**: `supabase/seed-education-module-2-risk-management.sql`
3. **Modulo 3**: `supabase/seed-education-module-3-saving.sql`
4. **Modulo 4**: `supabase/seed-education-module-4-wealth-management.sql`
5. **Modulo 5**: `supabase/seed-education-module-5-speculation.sql`

### Istruzioni

1. Apri **Supabase Dashboard → SQL Editor**
2. Esegui gli script **nell'ordine indicato**
3. Verifica con `supabase/verify-configuration.sql`

## Statistiche Curriculum

- **Moduli Totali**: 5
- **Lezioni Totali**: 14
- **Test Totali**: 5 (25 domande totali)
- **Ore Totali**: 23 ore
- **Paper Referenziati**: 50+ paper accademici
- **Livelli**: Beginner → Intermediate → Advanced

## Percorso Consigliato

1. **Principiante**: Modulo 1 → Modulo 2 → Modulo 3
2. **Intermedio**: Modulo 1 → Modulo 2 → Modulo 4
3. **Avanzato**: Modulo 1 → Modulo 2 → Modulo 5
4. **Completo**: Tutti i moduli in sequenza
