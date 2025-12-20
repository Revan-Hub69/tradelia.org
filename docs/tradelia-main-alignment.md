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

## Sintesi anti-lacunare (versione accademica operativa)

### Cos’è Tradelia (in una frase, verificabile)
Tradelia è un sistema di supporto decisionale informativo che riduce errori nella scelta di strumenti finanziari, partendo dai casi d’uso reali e non da ranking o preferenze astratte.

- Non promette ottimizzazione.
- Non fornisce consulenza.
- Non assegna “migliori”.
- Non vende prodotti.

### Il problema strutturale (base accademica)
La ricerca in economia comportamentale e decision making mostra che:

- le persone non ottimizzano sistematicamente scelte finanziarie;
- l’inerzia, i costi di switching e la complessità riducono il confronto reale;
- ranking e confronti globali falliscono quando i vincoli variano per individuo;
- più informazione ≠ migliore decisione.

Questo non è un limite dell’utente. È una caratteristica strutturale del problema.

### Perché l’informazione finanziaria pubblica fallisce
Limiti sistemici (non morali). Blog, influencer, comparatori e anche portali autorevoli:

- sono incentivati a massimizzare ricavi da affiliazione;
- semplificano in ranking generici;
- confrontano prodotti, non casi d’uso;
- non dichiarano incompatibilità;
- non accettano l’esito “nessuna soluzione”.

Il risultato è informazione abbondante ma non decisionale.

### Cosa fa Tradelia (concretamente)
**Raccolta guidata del contesto d’uso**
- tramite un form;
- solo condizioni operative rilevanti;
- nessuna preferenza astratta;
- nessun obiettivo finanziario.

**Matching con un database interno**
- strumenti finanziari;
- contratti e clausole verificate;
- costi espliciti e nascosti;
- limiti operativi reali;
- casi d’uso osservati nel tempo.

**Processo di esclusione**
- le opzioni incompatibili vengono eliminate;
- anche se popolari o sponsorizzate.

**Output condizionato**
- opzioni compatibili con limiti espliciti;
- oppure nessuna opzione compatibile.

Questo è coerente con i Decision Support Systems accademici.

### Cosa significa “matchare”
Una soluzione è compatibile solo se:

- il contratto non introduce vincoli critici;
- i costi nel tempo sono coerenti con l’uso;
- i limiti operativi sono gestibili;
- i casi reali non mostrano incompatibilità ricorrenti.

Se una condizione fallisce → esclusione.

### Perché usiamo dati reali (oltre ai contratti)
- I contratti descrivono cosa può succedere.
- I dati reali mostrano cosa succede davvero.

Tradelia integra:
- documentazione ufficiale;
- clausole contrattuali;
- dati anonimi e aggregati di utilizzo;
- pattern ricorrenti di problemi.

Best practice accademica: regole + osservazioni.

### Cosa Tradelia non fa (limiti dichiarati)
Tradelia non:
- consiglia prodotti;
- assegna ranking;
- promette risparmio;
- forza una scelta;
- tratta investimenti, mutui, prestiti (nel tool Finanza Personale).

Dichiarare i limiti aumenta la qualità decisionale.

### Architettura del progetto (decisa)
**Tradelia Main (/)**  
Hub istituzionale: metodo, trasparenza, orientamento. Nessun wizard, nessuna raccolta dati.

**Tool separati (prodotti autonomi)**  
Tradelia · Investimenti  
Tradelia · Finanza Personale  
Tradelia · Business

Ogni tool:
- wizard dedicato;
- criteri dedicati;
- database logico dedicato;
- monetizzazione via affiliazioni solo a valle.

### Finanza personale — perimetro chiaro
**Trattiamo**
- conti;
- carte;
- servizi fintech di base;
- costi operativi;
- compatibilità profilo–strumento.

**Non trattiamo**
- investimenti;
- mutui/prestiti;
- assicurazioni;
- educazione motivazionale;
- budgeting.

### Neurologia decisionale (perché funziona)
Tradelia è progettata per:
- ridurre overconfidence;
- normalizzare l’errore;
- ridurre carico cognitivo;
- sfruttare eliminazione per incompatibilità;
- accettare esiti negativi.

Non stimola dopamina, stimola prudenza razionale.

### Monetizzazione (coerente)
- Solo affiliazioni.
- Mai in home.
- Mai nel metodo.
- Solo dopo esclusione motivata.
- Disclosure esplicita.
- Possibile esito: nessun link.

L’affiliazione è una conseguenza, non un obiettivo.

### Posizionamento finale (da non cambiare)
Tradelia non promette di trovare la soluzione migliore.  
Promette di ridurre la probabilità di scegliere una soluzione che non funzionerà nel tuo caso.

Questa frase è:
- accademicamente corretta;
- neurologicamente efficace;
- legalmente prudente;
- commercialmente sostenibile.
