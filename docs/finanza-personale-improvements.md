# Tradelia · Finanza Personale — Documento miglioramenti

## Scopo
Questo documento elenca **cosa migliorare** per rendere la pagina “Finanza personale” coerente con standard premium, best practice accademiche e requisiti di qualità (design, SEO/AI, performance, sicurezza, accessibilità, micro‑interazioni, copy).

> Nota: le voci che richiedono validazione con paper accademici sono marcate con **[RICHIEDE FONTI]**.

---

## 1) Design & UI (coerenza premium)
**Obiettivo:** rafforzare gerarchia visiva, leggibilità, coerenza brand.

- Verificare la **scala tipografica** (H1/H2/H3/body) per allineamento con Home.
- Consolidare **spaziature verticali** tra sezioni (ritmo visivo).
- Definire **componenti riusabili** per hero, callout, checklist, note.
- Aggiungere **macro‑sezioni visive** (divider, card, highlight).
- Garantire **coerenza cromatica** con palette Tradelia Main.

**[RICHIEDE FONTI]**: modelli accademici sulla leggibilità, gerarchie visive e carico cognitivo.

---

## 2) Copy & tono accademico
**Obiettivo:** mantenere tono operativo, verificabile, non promozionale.

- Rendere il copy più **sintetico** nelle sezioni lunghe.
- Inserire **micro‑sommari** all’inizio di sezioni complesse.
- Distinguere “cosa facciamo” vs “cosa non facciamo” con pattern chiari.
- Rimuovere ripetizioni (es. “nessun ranking/nessuna consulenza”).

**[RICHIEDE FONTI]**: principi di comunicazione accademica e decision support.

---

## 3) SEO / SEO AI / Semantica
**Obiettivo:** massimizzare indicizzazione tradizionale + “AI discovery”.

- Verificare **heading structure** coerente (1 H1, H2/H3 logici).
- Aggiungere **FAQ schema** per query semantiche.
- Inserire **internal linking** verso Metodo/Trasparenza/Disclaimer.
- Ottimizzare **meta description** con keywords “decision support, finanza personale”.

**[RICHIEDE FONTI]**: linee guida su SEO semantica/AI search.

---

## 4) Performance & UX
**Obiettivo:** contenuti ricchi senza impatti su LCP/CLS.

- Validare **render statico** e limitare componenti client.
- Evitare immagini pesanti nella hero (o usare SVG).
- Misurare LCP/CLS su pagina standalone.

**[RICHIEDE FONTI]**: performance e UX in contesti decision‑support.

---

## 5) Sicurezza & Legal
**Obiettivo:** evitare interpretazioni di consulenza finanziaria.

- Evidenziare disclaimer in header o sezione finale.
- Separare chiaramente “informativo” da “decisionale”.
- Audit dei claim “riduzione errori” con linguaggio prudente.

**[RICHIEDE FONTI]**: linee guida legali su contenuti finanziari informativi.

---

## 6) Accessibilità & contrasti
**Obiettivo:** AA/AAA dove possibile.

- Eseguire check contrasto colore (test automatizzato).
- Verificare focus states su tutti i link/CTA.
- Aggiungere skip links o landmarks ARIA se necessario.

**[RICHIEDE FONTI]**: standard W3C e studi su accessibilità cognitiva.

---

## 7) Micro‑interazioni & hover
**Obiettivo:** micro‑feedback, senza animazioni invasive.

- Uniformare hover dei link nella pagina Finanza personale.
- Garantire **reduced motion** rispettato.
- Inserire micro‑feedback sui CTA (hover/active).

**[RICHIEDE FONTI]**: studi su feedback micro‑interazioni.

---

## 8) Neurologia cognitiva / Decision support
**Obiettivo:** ridurre overload e bias.

- Inserire micro‑sezioni che **normalizzano l’errore**.
- Ridurre “overconfidence” con copy neutro.
- Evidenziare “nessuna soluzione” come esito valido.
- Strutturare contenuti in chunk progressivi (low cognitive load).

**[RICHIEDE FONTI]**: letteratura su decision support, bias, cognitive load.

---

## 9) Struttura della pagina (modularità)
**Obiettivo:** rendere pagina mantenibile.

- Estrarre sezioni in **componenti dedicati** (Hero, Problema, Metodo, Limiti, CTA).
- Definire props per dati statici (titoli, bullet).
- Ridurre file monolitico in `page.tsx`.

---

## 10) Contenuti “di sistema”
**Obiettivo:** integrare elementi istituzionali senza creare confusione.

- Inserire link strutturati a **Metodo / Trasparenza / Privacy / Disclaimer**.
- Distinguere percorso Finanza personale dal sito Main.
- Uniformare con footer premium.

---

## Prossimi step
1. Confermare **quali aree** richiedono supporto accademico prioritario.
2. Fornire accesso internet o bibliografia già selezionata.
3. Implementare miglioramenti in iterazioni modulari.

