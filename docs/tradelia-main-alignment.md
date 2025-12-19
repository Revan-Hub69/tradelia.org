# Tradelia Main — Alignment & Verification Log

**Versione:** v1.0 (LOCKED)

Questo documento serve a mantenere contesto tra sessioni su *Tradelia Main* (home) e a verificare che l’implementazione resti conforme all’architettura decisa.

## Ambito consentito (Main)
- Homepage (`/`)
- Header / Footer
- Copy statico
- Accessibilità
- SEO base

## Ambito vietato (Main)
- Wizard / form
- Engine
- API
- DB / Prisma
- Assessment

---

## Architettura decisa (non negoziabile)
- **Tradelia Main (/):** hub istituzionale, riassunto progetto, metodo & trasparenza, *solo reindirizzamento ai tool.*
- **Tool separati:** `/investimenti`, `/finanza-personale`, `/business`
  - Ogni tool è autonomo: wizard + criteri + motore propri
  - Monetizzazione solo via affiliazioni interne al tool

👉 **La home non è un prodotto**. 👉 **I tool sono i prodotti**.

---

## Obiettivo della home (singola frase)
Costruire fiducia istituzionale e orientare correttamente l’utente verso il tool giusto, senza influenzare la scelta.

---

## Struttura obbligatoria della home
1. **Header** (sticky, minimale)
   - Logo/nome Tradelia
   - Nav primaria: Domini · Metodo · Trasparenza
2. **Hero** (above the fold)
   - H1 unico
   - Max 2 CTA (scroll + metodo)
   - Micro-disclaimer visibile
   - Zero superlativi
3. **Orientamento**
   - 1 frase chiave
   - 3 bullet max
   - 1 CTA → Trasparenza
4. **Domini (CORE)**
   - 3 card equivalenti
   - CTA solo navigazionale (“Vai a…”)
   - Nessuna anticipazione di wizard o risultati
5. **Metodo in pillole**
   - 4 bullet fissi
   - Nessun esempio operativo
   - CTA → Metodo
6. **Trasparenza & confini**
   - Testo breve
   - Nessun dettaglio legale pesante
   - CTA → Trasparenza
7. **Footer istituzionale**
   - Claim sobrio
   - Disclaimer
   - Navigazione completa + policy

---

## Checklist errori di design (critica)
### Palette
- ✅ dark neutro
- ✅ un solo accento max
- ❌ no neon/glow/gradienti aggressivi

### Contrasto & accessibilità
- ✅ WCAG AA minimo
- ✅ link distinguibili senza hover
- ✅ focus ring visibile

### Effetti & animazioni
- ❌ no parallax / scroll-jacking
- ❌ no animazioni automatiche decorative
- ✅ hover leggeri, transizioni brevi

### Tipografia
- ✅ massimo 1–2 font
- ✅ gerarchia chiara
- ❌ no uppercase aggressivo

---

## Sezioni vietate in home
- Wizard / form
- Report preview
- Testimonial
- “Come funziona in 3 step”
- Pricing
- Partner / logo grid
- FAQ operative
- Ranking / comparazioni

---

## Verifiche implementazione attuale (snapshot)
**File principale:** `src/app/page.tsx`

### Stato generale
- **Struttura macro:** presente (Hero, Orientamento, Domini, Metodo in pillole, Trasparenza & confini).
- **Wizard/assessment:** assenti in home (OK).

### Allineamento (per requisito)
| Requisito | Stato | Note | Evidenza (file) |
| --- | --- | --- | --- |
| Header minimale con nav Domini/Metodo/Trasparenza | Da verificare | Header non in `page.tsx` (prob. layout/component). | `src/app/layout.tsx` o `src/components` |
| Hero: H1 unico, max 2 CTA, micro-disclaimer | OK (parziale) | H1 unico; 2 CTA; micro-disclaimer presente. | `src/app/page.tsx` |
| Orientamento: 1 frase + 3 bullet + CTA Trasparenza | OK | Presente CTA “Vai alla Trasparenza”. | `src/app/page.tsx` |
| Domini: 3 card equivalenti, CTA navigazionale | OK | “Vai a …” in ogni card. | `src/app/page.tsx` |
| Metodo in pillole: 4 bullet fissi + CTA Metodo | **Da verificare** | 4 bullet fissi presenti; CTA “Leggi il Metodo” presente. | `src/app/page.tsx` |
| Trasparenza & confini: testo breve + CTA | **Parziale** | Testo breve ok, ma due card aggiuntive (“Cosa facciamo / non facciamo”). | `src/app/page.tsx` |
| Footer istituzionale | Da verificare | Footer non in `page.tsx`. | `src/app/layout.tsx` o `src/components` |
| Palette neutra senza glow/gradienti | **Possibile rischio** | Presenza di gradienti/blur/animated grid. | `src/app/page.tsx` |
| Animazioni automatiche assenti | **Possibile rischio** | “animated-grid” + `FadeIn` potrebbero introdurre animazioni. | `src/app/page.tsx` |

### Rischi da monitorare
- **Gradienti/blur/glow** in hero e background (`animated-grid`, blur circles) potrebbero violare la regola “no fintech-hype”.
- **Trasparenza & confini** include due card extra: verificare se il requisito “testo breve” consente blocchi aggiuntivi.
- **Animazioni**: `FadeIn` e `animated-grid` vanno rivisti rispetto al vincolo “nessuna animazione automatica”.

---

## Note operative
- Ogni modifica alla home deve rispettare **“La home non è un prodotto”**.
- Se una modifica riguarda raccolta dati o logica decisionale → **STOP**.
- Aggiornare questo documento dopo ogni intervento sulla home.

