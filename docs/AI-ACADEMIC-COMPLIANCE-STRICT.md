# AI Academic Compliance - Strict Guidelines

## Overview
Linee guida STRETTE per garantire che le analisi AI siano basate solo su dati reali e teorie accademiche verificate.

## Principi Fondamentali

### 1. NO Invenzioni
- ❌ NON inventare metriche non fornite
- ❌ NON inventare correlazioni non evidenti
- ❌ NON inventare pattern non supportati dai dati
- ❌ NON fare inferenze non supportate

### 2. Solo Dati Reali
- ✅ Analizza SOLO i numeri forniti
- ✅ Se pattern non evidente, dillo esplicitamente
- ✅ Usa solo metriche calcolate dai dati reali
- ✅ Descrivi, non predici

### 3. Riferimenti Accademici Verificabili
Usa SOLO questi riferimenti quando rilevanti:

#### Market Microstructure
- **Kyle (1985)**: "Continuous Auctions and Insider Trading" - Market microstructure
- **Glosten & Milgrom (1985)**: "Bid, Ask and Transaction Prices" - Bid-ask spread
- **Hasbrouck (2007)**: "Empirical Market Microstructure" - Order book analysis
- **O'Hara (1995)**: "Market Microstructure Theory" - Liquidity

#### Market Efficiency
- **Fama (1970)**: "Efficient Capital Markets" - EMH
- **Lo & MacKinlay (1988)**: "Stock Market Prices Do Not Follow Random Walks"
- **Jegadeesh & Titman (1993)**: "Returns to Buying Winners" - Momentum

#### Portfolio Theory
- **Markowitz (1952)**: "Portfolio Selection" - Modern Portfolio Theory
- **Sharpe (1964)**: "Capital Asset Prices" - CAPM, Sharpe Ratio
- **Fama & French (1992)**: "Cross-Section of Expected Returns" - Factor models

### 4. MIFID 2 Compliance
- ✅ Analisi puramente descrittiva
- ✅ ZERO consigli di investimento
- ✅ ZERO suggerimenti di timing
- ✅ ZERO predizioni di performance
- ✅ Sempre disclaimer esplicito

## System Prompt Template

```typescript
REGOLA FONDAMENTALE - CRITICA:
- ANALIZZA SOLO I DATI FORNITI. NON INVENTARE NESSUNA METRICA, CORRELAZIONE O PATTERN.
- Se i dati non mostrano un pattern chiaro, dillo esplicitamente.
- NON fare inferenze non supportate dai dati.

RIFERIMENTI ACCADEMICI VERIFICABILI (usa solo questi):
- [Lista specifica di paper accademici]

METRICHE QUANTITATIVE (analizza solo queste):
- [Lista metriche calcolate dai dati reali]

NON FARE MAI:
- Inventare metriche non fornite
- Fare predizioni
- Consigli di investimento (MIFID 2 violation)
- Inferenze non supportate

FARE:
- Analisi descrittiva oggettiva
- Spiegazioni educative basate su teorie verificate
- Alert su anomalie quantitative
- Riferimenti accademici specifici quando rilevanti
```

## Esempi Corretti vs Sbagliati

### ✅ CORRETTO
```
"Spread medio 0.015% indica liquidità moderata secondo Glosten & Milgrom (1985). 
I dati mostrano 65% delle crypto in positivo con cambio medio +3.2%."
```

### ❌ SBAGLIATO
```
"Il mercato mostra sentiment positivo e trend rialzista. 
Correlazione tra market cap e performance suggerisce opportunità."
```

### ✅ CORRETTO
```
"Imbalance +11.2% su BTC nei dati order book suggerisce maggiore pressione 
d'acquisto secondo Kyle (1985). Spread 0.002% indica alta liquidità."
```

### ❌ SBAGLIATO
```
"L'order book mostra segnali di accumulo istituzionale. 
Pattern suggerisce movimento imminente al rialzo."
```

## Validazione Risposte

### Checklist Pre-Publicazione
- [ ] Analisi basata solo su dati forniti?
- [ ] Pattern evidenti nei numeri?
- [ ] Riferimenti accademici verificabili?
- [ ] Zero consigli di investimento?
- [ ] Zero predizioni?
- [ ] Disclaimer MIFID presente?

### Red Flags da Evitare
- ❌ "Suggerisco di..."
- ❌ "Dovresti..."
- ❌ "Il mercato salirà/scenderà..."
- ❌ "Opportunità di guadagno..."
- ❌ "Pattern che indica..."
- ❌ Correlazioni non evidenti

## Implementazione

### System Prompts
Tutti i system prompts includono:
1. Regola fondamentale (NO invenzioni)
2. Lista riferimenti accademici verificabili
3. Metriche quantitative permesse
4. Lista esplicita di cosa NON fare
5. Esempi corretti vs sbagliati

### User Prompts
Tutti i user prompts includono:
1. Dati quantitativi forniti
2. Regole strette di analisi
3. Esempi di risposte corrette
4. Formato JSON strutturato

### Response Validation
- Parse JSON response
- Check per red flags
- Verify academic references
- Ensure MIFID compliance

## Conclusion

Le analisi AI sono:
- ✅ **Basate su dati reali**: Solo numeri forniti
- ✅ **Accademicamente valide**: Solo riferimenti verificabili
- ✅ **MIFID 2 compliant**: Zero consigli, solo descrizione
- ✅ **Trasparenti**: Se pattern non evidente, dillo
- ✅ **Educative**: Spiegano teorie, non predicono

Questo garantisce analisi rigorose e conformi agli standard accademici e normativi.
