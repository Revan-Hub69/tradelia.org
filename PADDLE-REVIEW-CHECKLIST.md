# Checklist Review Paddle - Tradelia.org

## ✅ Cosa Paddle verifica

### 1. **Dominio e proprietà**
- [x] Il dominio è pubblico e accessibile
- [x] Il sito è deployato su Vercel/Cloudflare
- [ ] **DA FARE**: Inserisci il dominio esatto in Paddle Dashboard (es. `tradelia.org` o il tuo dominio Vercel)

### 2. **Descrizione prodotti** ✅
- [x] **Trial (€0)**: Descrizione chiara - "Accesso formativo 14 giorni"
- [x] **Pro (€49/mese)**: Descrizione chiara - "Pro Research" con features elencate
- [x] **Desk (€149/mese)**: Descrizione chiara - "Desk Professionale" con white label e crediti
- [x] Features ben spiegate: deck SRD v5.0, MTB v3.1, crediti, white label
- [x] Limitazioni chiare: trial scade dopo 14 giorni, Guest ha accesso limitato

### 3. **Pricing visibile** ✅
- [x] Prezzi chiari su `/pricing.html`:
  - Trial: €0 per 14 giorni
  - Pro: €49 al mese
  - Desk: €149 al mese
  - Crediti Desk: €99 (1), €249 (3), €499 (7)
- [x] Link a pricing dalla homepage (`/pricing.html`)
- [x] Pricing accessibile senza login

### 4. **Compliance Acceptable Use Policy** ✅
- [x] **NON è consulenza finanziaria**: Informativa MiFID chiara che spiega finalità didattica
- [x] **NON è trading advice**: Disclaimer chiaro che è solo educativo
- [x] **NON promette guadagni**: Nessuna promessa di rendimento
- [x] **Contenuti legali**: Privacy policy, termini, informativa MiFID disponibili

### 5. **Nessun placeholder** ✅
- [x] Nessun "coming soon" o contenuto demo
- [x] Tutti i testi sono reali e descrittivi
- [x] Il sito sembra un prodotto reale e funzionante

## ⚠️ **POTENZIALI PROBLEMI**

### 1. **Checkout non ancora attivo**
**Problema**: I bottoni su `/pricing.html` portano a `mailto:` invece che a Paddle Checkout.

**Soluzione**:
- Per la **review**, puoi spiegare a Paddle che stai ancora configurando Paddle Checkout
- Oppure, crea una pagina di checkout mockup che mostra come funzionerà
- **Dopo l'approvazione**, sostituisci i `mailto:` con i link Paddle Checkout reali

### 2. **Dominio Vercel preview**
**Se stai usando un dominio Vercel preview** (es. `tradelia-xxx.vercel.app`):
- Paddle potrebbe richiedere il dominio finale `tradelia.org`
- Oppure approva prima il dominio preview, poi aggiungi quello finale dopo

## 📋 **Cosa fare PRIMA di submittere**

1. **Verifica dominio**:
   - Assicurati che il sito sia accessibile pubblicamente
   - Controlla che non ci siano errori 404 o pagine rotte
   - Testa su mobile e desktop

2. **Verifica pricing**:
   - Controlla che `/pricing.html` sia accessibile
   - Verifica che i prezzi siano chiari e visibili
   - Assicurati che ci sia un link ovvio a pricing dalla homepage

3. **Verifica compliance**:
   - Controlla che l'informativa MiFID sia accessibile
   - Verifica che i disclaimer siano chiari
   - Assicurati che non ci siano promesse di guadagno

4. **Rimuovi placeholder** (se presenti):
   - Cerca "coming soon", "demo", "test", "placeholder"
   - Sostituisci con contenuti reali

## 🚀 **Dopo l'approvazione**

1. **Sostituisci mailto con Paddle Checkout**:
   - In `pricing.html`, sostituisci i link `mailto:` con i link Paddle Checkout
   - Usa i Product IDs di Paddle per ogni piano

2. **Testa il flusso completo**:
   - Testa checkout Pro (€49/mese)
   - Verifica che i webhook funzionino
   - Controlla che i token vengano generati correttamente

## 📝 **Messaggio per Paddle (se chiedono del checkout)**

> "Stiamo ancora configurando Paddle Checkout. Attualmente i clienti possono richiedere l'attivazione via email, ma stiamo integrando Paddle per automatizzare il processo. Il sito descrive accuratamente i prodotti e i prezzi, e rispetta tutte le policy di Paddle."

## ✅ **Stato attuale**

- ✅ Descrizione prodotti: **COMPLETA**
- ✅ Pricing: **CHIARO E VISIBILE**
- ✅ Compliance: **OK (MiFID-safe)**
- ✅ Nessun placeholder: **OK**
- ⚠️ Checkout: **IN CONFIGURAZIONE** (mailto temporaneo)

**Raccomandazione**: Puoi submittere il dominio anche con i mailto, spiegando che Paddle Checkout è in fase di integrazione. Paddle di solito approva se tutto il resto è a posto.

