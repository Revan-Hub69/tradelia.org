# Tradelia Main – Documento di allineamento

## Architettura: Main vs Tool

**Main**
- Sito pubblico con contenuti informativi/educativi.
- Nessuna raccolta o memorizzazione di dati personali.
- Nessun tracking, profilazione o pixel.
- Contenuti editoriali con criteri dichiarati e verificabili.

**Tool**
- Strumenti operativi separati dalla parte informativa.
- Eventuali input utente sono gestiti in ambienti dedicati.
- I flussi Tool non devono introdurre dipendenze o tracking in Main.

## Checklist sezioni obbligatorie

- [ ] Hero con value proposition chiara.
- [ ] Domini/percorsi principali.
- [ ] Metodo e criteri verificabili.
- [ ] Trasparenza & confini (indipendenza, no tracking, no promesse).
- [ ] Footer con policy, contatti e disclaimer informativo.

## Vincoli di design

- UI pulita, senza blur/gradienti di background o griglie animate.
- Titoli e testi leggibili, niente effetti decorativi invasivi.
- CTA coerenti con varianti standard (primary/secondary/ghost).
- Link con underline custom, evitando stili duplicati.
- Motion ridotto: nessuna animazione non essenziale.
- Overlay decorativi con `pointer-events: none`.

## Snapshot di verifica

- Home senza background animati o blur.
- Header senza CTA extra, navigazione ben visibile.
- Trasparenza con “no tracking” esplicito.
- Footer con contatti completi e nota privacy/cookie.
- Metadata OG/Twitter con `og.svg` e `icon.svg`.
