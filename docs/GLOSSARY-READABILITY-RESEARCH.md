# Ricerca Leggibilità - Glossario Tradelia

## Best Practice Accademiche per Font, Colori e Contrasto

### Font (Tipografia)

**Raccomandazioni Accademiche:**

- ✅ **Sans-serif preferito**: Arial, Helvetica, Tahoma, Verdana per leggibilità schermo
- ✅ **Font size minimo**: 16px per corpo testo (12-14pt per stampa)
- ✅ **Line height**: 1.5-1.75 (almeno 1.5x font size)
- ❌ Evitare: font decorativi, script, maiuscolo eccessivo

**WCAG 2.1 Standard:**

- Font size minimo: 16px (AA), 18px (AAA)
- Line height: minimo 1.5
- Font weight: normale o medium (400-500)

### Colori e Contrasto

**Raccomandazioni Accademiche:**

- ✅ **Massimo contrasto**: Testo nero (#000000) su sfondo bianco (#FFFFFF)
- ✅ **Contrast ratio minimo**: 4.5:1 (AA), 7:1 (AAA) per testo normale
- ✅ **Contrast ratio per testo grande**: 3:1 (AA), 4.5:1 (AAA)
- ❌ Evitare: combinazioni rosso/verde, rosso/blu, testo chiaro su sfondo scuro

**Soluzione Estrema (Paper Accademici):**

- **Contorni blu scuro** (#1e3a8a, #1e40af) per delimitazione chiara
- **Sfondo bianco puro** (#FFFFFF) per massimo contrasto
- **Testo nero** (#000000 o #1a1a1a) per leggibilità ottimale
- **Accenti blu scuro** per elementi interattivi

**Vantaggi Soluzione Estrema:**

1. Massimo contrasto (21:1) - supera tutti gli standard
2. Riduce affaticamento visivo
3. Migliore leggibilità per utenti con disabilità visive
4. Allineato con standard paper accademici (bianco/nero/blu)

### Struttura e Spacing

**Raccomandazioni:**

- Paragrafi: 500-1000 caratteri (spazi inclusi)
- Spacing tra paragrafi: 1.5-2em
- Max line length: 45-75 caratteri (idealmente 50-65)
- Allineamento: sinistra (non giustificato)

### Implementazione Proposta

**Drawer Estremo (Academic Mode):**

```css
/* Contenuto principale */
background: #FFFFFF
text: #000000 o #1a1a1a
font-family: 'Helvetica', 'Arial', sans-serif
font-size: 16px
line-height: 1.7

/* Contorni e delimitatori */
border-color: #1e3a8a (blu scuro)
accent-color: #1e40af (blu scuro)

/* Header/Footer */
background: #f8f9fa (grigio molto chiaro)
border-bottom: 2px solid #1e3a8a
```

**Vantaggi:**

- Contrasto massimo (21:1)
- Leggibilità ottimale
- Allineato con paper accademici
- Accessibile per tutti gli utenti
