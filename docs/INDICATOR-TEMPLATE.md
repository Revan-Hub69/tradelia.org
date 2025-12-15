# Template Standard per Indicatori di Mercato

## 📋 Struttura Obbligatoria per Ogni Indicatore

Ogni indicatore DEVE avere:

### 1. Spiegazione Accademica
- **Riferimento accademico**: Paper/studio che ha introdotto o validato l'indicatore
- **Definizione**: Cosa misura l'indicatore
- **Metodologia**: Come viene calcolato (breve)
- **Contesto storico**: Quando e perché è stato creato

### 2. Spiegazione di Come Leggerlo Accademicamente
- **Interpretazione**: Cosa significano i valori
- **Range di valori**: Cosa è normale, estremo, etc.
- **Segnali**: Cosa indicano valori alti/bassi
- **Limitazioni**: Quando l'indicatore può essere fuorviante

### 3. Lettura AI (Groq)
- **Analisi descrittiva**: Cosa mostra il valore attuale
- **Contesto**: Come si inserisce nel quadro generale
- **NO predizioni**: Solo lettura descrittiva
- **MIFID 2 compliant**: Zero consigli, solo informazione

## 📝 Template Componente Frontend

```tsx
export default function IndicatorComponent() {
  // ... state e fetch ...

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h2>Nome Indicatore</h2>
        <p>Breve descrizione</p>
      </div>

      {/* Visualizzazione Dati */}
      <div>
        {/* Chart/Value */}
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <h3 className="text-sm font-semibold mb-2">Riferimento Accademico</h3>
        <div className="text-xs text-text-tertiary space-y-1">
          <p><strong>Paper:</strong> Autore (Anno) - "Titolo"</p>
          <p><strong>Definizione:</strong> Cosa misura...</p>
          <p><strong>Metodologia:</strong> Come viene calcolato...</p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerlo */}
      <div className="border-t border-border-subtle pt-4">
        <h3 className="text-sm font-semibold mb-2">Interpretazione Accademica</h3>
        <div className="text-xs text-text-tertiary space-y-1">
          <p><strong>Range Normal:</strong> X-Y significa...</p>
          <p><strong>Valori Estremi:</strong> >X indica..., &lt;Y indica...</p>
          <p><strong>Segnali:</strong> Valori alti suggeriscono..., valori bassi suggeriscono...</p>
          <p><strong>Limitazioni:</strong> L'indicatore può essere fuorviante quando...</p>
        </div>
      </div>

      {/* SEZIONE 3: Lettura AI */}
      <div className="border-t border-border-subtle pt-4">
        <h3 className="text-sm font-semibold mb-2">Lettura Mercato (Groq AI)</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading}
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.
        </p>
      </div>
    </div>
  );
}
```

## 📝 Template API Route

```typescript
/**
 * Get Groq AI reading for Indicator
 */
async function getIndicatorAIReading(
  value: number,
  // ... altri parametri
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi di [TIPO INDICATORE].

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- [Autore] ([Anno]) - "[Titolo Paper]"
- [Breve contesto accademico]`;

  const userPrompt = `Leggi i dati [NOME INDICATORE] forniti.

DATI FORNITI:
- [Parametro 1]: ${value}
- [Parametro 2]: ${otherValue}
- [Contesto]: [Aggiungere contesto se necessario]

INTERPRETAZIONE ACCADEMICA:
- [Range 1]: Significa [interpretazione]
- [Range 2]: Significa [interpretazione]
- [Range 3]: Significa [interpretazione]

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale basata sui dati forniti.
MENTIONA il valore attuale e la sua interpretazione accademica.
NO predizioni, NO consigli, solo lettura descrittiva.`;

  // ... chiamata Groq API ...
}
```

## ✅ Checklist per Nuovo Indicatore

- [ ] Riferimento accademico identificato (paper/studio)
- [ ] Definizione chiara dell'indicatore
- [ ] Metodologia di calcolo documentata
- [ ] Range di valori e interpretazione definiti
- [ ] Limitazioni documentate
- [ ] Componente frontend con 3 sezioni (Accademico, Interpretazione, AI)
- [ ] API route con Groq AI reading
- [ ] Traduzioni IT/EN
- [ ] Test funzionamento

## 📚 Esempi Riferimenti Accademici

### VIX
- **Paper**: Whaley (1993) - "Derivatives on Market Volatility"
- **Definizione**: Indice di volatilità implicita del mercato azionario
- **Interpretazione**: <12 bassa, 12-20 normale, 20-30 elevata, >30 alta (paura)

### Fear & Greed Index
- **Paper**: Behavioral Finance principles
- **Definizione**: Indice sintetico di sentiment di mercato
- **Interpretazione**: 0-24 Extreme Fear, 25-44 Fear, 45-55 Neutral, 56-75 Greed, 76-100 Extreme Greed

### Term Structure
- **Paper**: Fama & French (1987) - "Commodity Futures Prices"
- **Definizione**: Differenza tra prezzi futures e spot
- **Interpretazione**: Contango (futures > spot), Backwardation (futures < spot)

### Bitcoin Dominance
- **Paper**: Market cap analysis, no specific academic paper
- **Definizione**: % di Bitcoin sul totale market cap crypto
- **Interpretazione**: >60% Bitcoin dominante, <40% Altcoin season

### Bond Yields
- **Paper**: Vari (term structure theory)
- **Definizione**: Rendimento dei titoli di stato
- **Interpretazione**: Yield curve invertita = segnale recessione
