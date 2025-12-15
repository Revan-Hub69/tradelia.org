# Strategy Builder vs Trading Journal - Chiarimento

## 📊 Due Strumenti Separati

### 1. **Trading Journal** 📝
**Scopo**: Registrare operazioni di trading **REALI** che hai eseguito

**Quando usarlo**:
- Dopo aver eseguito un'operazione di trading (compra/vendita)
- Per tracciare performance reale
- Per analizzare win rate, profit factor, drawdown reali

**Funzionalità**:
- ✅ Aggiungi operazione: simbolo, entry price, exit price, quantità
- ✅ Registra strategia usata (opzionale)
- ✅ Calcola P&L automatico
- ✅ Statistiche: win rate, avg win/loss, total P&L
- ✅ Grafici: equity curve, P&L distribution

**Disponibilità**: Pro users

---

### 2. **Strategy Builder** 🎯
**Scopo**: Costruire e ottimizzare strategie di trading **TEORICHE** (simulazione)

**Quando usarlo**:
- Prima di eseguire operazioni reali
- Per testare strategie su dati storici
- Per evitare overfitting con Walk-Forward Optimization
- Per trovare parametri ottimali

**Funzionalità**:
- ✅ Seleziona strategie accademiche (MA Crossover, RSI, MACD, etc.)
- ✅ Configura parametri (Fast MA, Slow MA, RSI Period, etc.)
- ✅ Walk-Forward Optimization per evitare overfitting
- ✅ Metriche: Sharpe Ratio, Calmar Ratio, Win Rate, Profit Factor
- ✅ Analisi robustezza (In-Sample vs Out-of-Sample)

**Disponibilità**: Pro users

---

## 🔗 Relazione Attuale

**ATTUALMENTE**: Sono **separati** e **indipendenti**

- Il **Trading Journal** registra operazioni reali
- Lo **Strategy Builder** simula strategie teoriche
- Non c'è integrazione automatica

---

## 💡 Integrazione Futura (Roadmap)

**Possibile integrazione**:
1. **Validazione strategie con dati reali**:
   - Usare i dati del Trading Journal per validare le strategie ottimizzate
   - Confrontare performance teorica (Strategy Builder) vs performance reale (Journal)

2. **Backtesting con operazioni reali**:
   - Importare operazioni dal Journal nello Strategy Builder
   - Testare se la strategia avrebbe funzionato meglio

3. **Suggerimenti strategia**:
   - Basare suggerimenti strategia su performance reali del Journal

---

## ❓ FAQ

**Q: Quando posso usare lo Strategy Builder?**
A: Sempre (se Pro). Non serve avere operazioni nel Journal. È per testare strategie teoriche.

**Q: Quando posso usare il Trading Journal?**
A: Dopo aver eseguito un'operazione reale. Registra quello che hai fatto.

**Q: Devo usare entrambi?**
A: No, sono indipendenti:
- **Solo Strategy Builder**: Test strategie teoriche
- **Solo Trading Journal**: Traccia operazioni reali
- **Entrambi**: Test teorico + validazione reale (best practice)

**Q: Lo Strategy Builder usa i dati del Journal?**
A: **No, attualmente no**. Usa dati simulati. In futuro potremmo integrare.

---

## 🎯 Best Practice

**Workflow consigliato**:
1. **Strategy Builder**: Testa strategia su dati storici
2. **Trading Journal**: Esegui operazioni reali basate sulla strategia
3. **Confronto**: Valida se la performance reale matcha quella teorica

---

## 📍 Dove trovarli

**Trading Journal**: 
- Dashboard → Utilities → Performance → Trading Journal

**Strategy Builder**:
- Dashboard → Utilities → Advanced → Strategy Builder

**Entrambi**: Pro users only
