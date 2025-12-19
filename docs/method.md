# Metodo Tradelia

## Modello a 3 livelli

1. **Costi dichiarati**
   - Commissioni, spread, fee di funding e condizioni pubblicate dai provider.
2. **Costo atteso**
   - Stima deterministica dell’attrito operativo basata sul profilo dell’utente.
3. **Costo osservato (opzionale)**
   - Validazione tramite dati reali se disponibili e autorizzati dall’utente.

## Coverage: FULL / PARTIAL / INFO

- **FULL**: dati sufficienti per stimare costi e attrito in modo coerente.
- **PARTIAL**: dati parziali, stima limitata con caveat espliciti.
- **INFO**: dati insufficienti. Risultato **non valutabile**.

## Non valutabile

Quando un dominio non ha dati completi o fonti verificabili, Tradelia segnala il risultato come **non valutabile** e include le motivazioni nell’audit.
