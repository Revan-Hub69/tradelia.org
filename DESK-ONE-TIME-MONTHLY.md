# 💼 Piano Desk: Pagamento Una Tantum Mensile

## 🎯 Modello Proposto

**Piano Desk:**
- **Prezzo:** €149 una tantum mensile
- **Servizio:** Accesso a report brandizzati (white-label) per quel mese
- **Tipo:** Pagamento one-time (non subscription ricorrente)

**Vantaggi:**
- ✅ Più accademico (pagamento per servizio, non abbonamento)
- ✅ Compliance fiscale semplice (prestazione occasionale se < 5k€/anno)
- ✅ Nessuna pressione retention
- ✅ Cliente decide ogni mese se rinnovare

---

## 📊 Confronto Modelli

### Opzione A: Una Tantum Mensile (Proposta)

**Come Funziona:**
- Cliente paga €149 una tantum
- Riceve accesso report brandizzati per 1 mese
- Fine mese: accesso scade
- Cliente decide se rinnovare (nuovo pagamento)

**Vantaggi:**
- ✅ Più accademico (servizio on demand)
- ✅ Compliance semplice (prestazione occasionale)
- ✅ Nessun abbonamento ricorrente
- ✅ Cliente ha controllo totale

**Svantaggi:**
- ⚠️ Cliente deve ricordare di rinnovare
- ⚠️ Revenue meno prevedibile
- ⚠️ Gestione manuale (o semi-automatica)

---

### Opzione B: Abbonamento Ricorrente (Tradizionale)

**Come Funziona:**
- Cliente paga €149/mese automaticamente
- Accesso continuo
- Cancellazione quando vuole

**Vantaggi:**
- ✅ Revenue prevedibile
- ✅ Gestione automatica (Stripe)
- ✅ Cliente non deve ricordare

**Svantaggi:**
- ❌ Attività continuativa (serve partita IVA)
- ❌ Pressione retention
- ❌ Meno accademico (SaaS commerciale)

---

## 🎓 Perché Una Tantum è Più Accademico

### 1. Allineamento con Modelli Accademici

**Esempi:**
- **Research Contracts:** Pagamento per progetto/mese
- **Consulting Services:** Compenso per periodo specifico
- **Access Fees:** Pagamento per accesso temporaneo

**Tradelia AI:**
- ✅ "Accesso mensile a report brandizzati" = servizio specifico
- ✅ Non "abbonamento continuo" = più accademico
- ✅ Cliente paga per servizio, non per "membership"

---

### 2. Trasparenza

**Una Tantum:**
- ✅ Cliente paga per servizio specifico (1 mese accesso)
- ✅ Fine servizio = fine pagamento
- ✅ Nessuna "trappola" abbonamento

**Abbonamento:**
- ⚠️ Pagamento continuo automatico
- ⚠️ Cliente può dimenticare di cancellare
- ⚠️ Percepito come "commerciale"

---

### 3. Compliance Fiscale

**Una Tantum Mensile:**
- ✅ Se < 5.000€/anno → prestazione occasionale
- ✅ Non serve partita IVA inizialmente
- ✅ Dichiari nel 730

**Abbonamento Ricorrente:**
- ❌ Attività continuativa
- ❌ Serve partita IVA obbligatoria
- ❌ Gestione più complessa

---

## 💰 Modello Economico

### Scenario Realistico

**Clienti Desk:**
- 2-3 clienti/mese = €298-447/mese
- 5 clienti/mese = €745/mese
- 10 clienti/mese = €1.490/mese

**Con Analisi On Demand:**
- Analisi: €1.000-2.000/mese
- Desk: €500-1.500/mese
- **Totale: €1.500-3.500/mese**

---

### Vantaggi Revenue

**Una Tantum:**
- ✅ Cliente può pagare quando serve
- ✅ Nessun "commitment" lungo termine
- ✅ Più facile convertire (prova 1 mese)

**Abbonamento:**
- ⚠️ Cliente deve "impegnarsi" mensile
- ⚠️ Barriera più alta all'ingresso
- ⚠️ Cancellazioni più frequenti

---

## 🛠️ Implementazione Tecnica

### Stripe: One-Time Payment

**Prodotto:**
- Nome: "Accesso Mensile Report Brandizzati - Tradelia AI"
- Prezzo: €149.00
- Tipo: **One-time payment** (non subscription)

**Workflow:**
1. Cliente paga €149 una tantum
2. Riceve accesso report brandizzati per 30 giorni
3. Fine periodo: accesso scade
4. Cliente può rinnovare (nuovo pagamento)

---

### Gestione Accesso

**Opzione A: Manuale**
- Cliente paga → Tu attivi accesso manualmente
- Fine mese → Disattivi accesso
- Semplice ma richiede gestione

**Opzione B: Semi-Automatica**
- Cliente paga → Webhook Stripe attiva accesso
- Timer 30 giorni → Disattiva automaticamente
- Più complesso ma automatizzato

**Opzione C: Token/Code**
- Cliente paga → Riceve codice accesso valido 30 giorni
- Usa codice per scaricare report brandizzati
- Semplice e automatizzato

---

## 📋 Setup Stripe

### Prodotto "Accesso Mensile Desk"

**Nome:**
```
Accesso Mensile Report Brandizzati - Tradelia AI
```

**Descrizione:**
```
Accesso per 1 mese a tutti i report Tradelia AI in formato white-label (PDF con intestazione personalizzata). 
Include download illimitato di report brandizzati per newsletter e canali. 
Accesso valido 30 giorni dalla data di pagamento.
```

**Prezzo:**
```
149.00 EUR
```

**Tipo:**
```
One-time payment
```

**Metadata:**
```json
{
  "tipo": "accesso-mensile",
  "durata": "30_giorni",
  "servizio": "white-label",
  "dispositivi": "5"
}
```

---

## 🎯 Messaging

### Homepage/Pricing

**Testo:**
```
Piano Desk - Accesso Mensile Report Brandizzati

€149 una tantum per accesso mensile completo a tutti i report Tradelia AI 
in formato white-label. Download illimitato di PDF brandizzati per newsletter 
e canali. Accesso valido 30 giorni.

[Paga €149 - Accesso 1 Mese]
```

**Vantaggi:**
- ✅ Chiaro: "una tantum"
- ✅ Trasparente: "30 giorni"
- ✅ Nessun "abbonamento" implicito

---

## ⚠️ Considerazioni

### 1. Gestione Accesso

**Sfida:**
- Come gestire scadenza 30 giorni?
- Come rinnovare facilmente?

**Soluzioni:**
- **Token con scadenza:** Codice valido 30 giorni
- **Email reminder:** 3 giorni prima scadenza
- **Rinnovo facile:** Link diretto per nuovo pagamento

---

### 2. Revenue Prevedibilità

**Una Tantum:**
- ⚠️ Revenue meno prevedibile
- ⚠️ Cliente può non rinnovare

**Mitigazione:**
- ✅ Email reminder scadenza
- ✅ Sconto rinnovo (es: €129 invece di €149)
- ✅ Valore chiaro: report brandizzati utili

---

### 3. Percezione Cliente

**Una Tantum:**
- ✅ "Provo 1 mese" = barriera bassa
- ✅ "Nessun commitment" = più attraente
- ⚠️ "Devo ricordare di rinnovare" = potenziale fatica

**Abbonamento:**
- ⚠️ "Commitment mensile" = barriera più alta
- ✅ "Automatico" = comodo
- ⚠️ "Trappola abbonamento" = percezione negativa

---

## ✅ Raccomandazione

### Modello Ibrido (Consigliato)

**Piano Desk:**
- **Opzione 1:** €149 una tantum mensile (accesso 30 giorni)
- **Opzione 2:** €129/mese abbonamento (sconto 13% per commitment)

**Vantaggi:**
- ✅ Cliente sceglie modello preferito
- ✅ Una tantum = più accademico, più facile entry
- ✅ Abbonamento = revenue prevedibile, sconto per commitment
- ✅ Entrambi disponibili

---

### Setup Consigliato

**Stripe:**
1. **Prodotto 1:** "Accesso Mensile Desk" - €149 one-time
2. **Prodotto 2:** "Abbonamento Mensile Desk" - €129/mese subscription

**Messaging:**
```
Piano Desk - Scegli il modello che preferisci:

• Accesso Mensile: €149 una tantum (30 giorni)
  Perfetto per provare o uso occasionale

• Abbonamento: €129/mese (sconto 13%)
  Per uso continuativo, rinnovo automatico
```

---

## 📋 Checklist Setup

### Stripe:
- [ ] Prodotto "Accesso Mensile Desk" - €149 one-time
- [ ] Prodotto "Abbonamento Desk" - €129/mese subscription (opzionale)
- [ ] Metadata per tracking

### Sito:
- [ ] Pagina pricing aggiornata
- [ ] Messaging chiaro: "una tantum" vs "abbonamento"
- [ ] Workflow accesso (token/code o manuale)

### Gestione:
- [ ] Sistema scadenza 30 giorni
- [ ] Email reminder scadenza
- [ ] Link rinnovo facile

---

## ✅ Conclusione

**Una Tantum Mensile è:**
- ✅ Più accademico (servizio on demand)
- ✅ Compliance semplice (prestazione occasionale)
- ✅ Barriera entry più bassa
- ✅ Nessuna pressione retention

**Raccomandazione:**
- ✅ Offri **entrambe le opzioni** (una tantum + abbonamento)
- ✅ Una tantum = entry point
- ✅ Abbonamento = per clienti fedeli (con sconto)

**Setup:**
- Una tantum: €149 (one-time)
- Abbonamento: €129/mese (sconto 13% per commitment)

