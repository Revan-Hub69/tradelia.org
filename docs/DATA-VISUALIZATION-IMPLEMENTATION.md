# Data Visualization - Documentazione Implementazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo di data visualization con Recharts, conforme a principi accademici (Few, Tufte) per visualizzazione dati quantitativi.

---

## 📊 CHART COMPONENTS BASE

### 1. LineChart (`components/charts/LineChart.tsx`)
**Funzionalità**:
- Grafico a linee per trend e serie temporali
- Multiple lines support
- Customizable colors e stroke width
- Grid, tooltip, legend

**Usage**:
```tsx
<LineChart
  data={[
    { name: 'Jan', value: 100, other: 150 },
    { name: 'Feb', value: 120, other: 160 },
  ]}
  lines={[
    { key: 'value', label: 'Valore', color: '#3b82f6' },
    { key: 'other', label: 'Altro', color: '#10b981' },
  ]}
  height={300}
/>
```

### 2. BarChart (`components/charts/BarChart.tsx`)
**Funzionalità**:
- Grafico a barre per confronti
- Stacked bars support
- Multiple series

**Usage**:
```tsx
<BarChart
  data={[
    { name: 'Q1', sales: 100, expenses: 80 },
  ]}
  bars={[
    { key: 'sales', label: 'Vendite', color: '#3b82f6' },
  ]}
  stacked
/>
```

### 3. PieChart (`components/charts/PieChart.tsx`)
**Funzionalità**:
- Grafico a torta per proporzioni
- Custom colors
- Percentage labels
- Legend

**Usage**:
```tsx
<PieChart
  data={[
    { name: 'Stocks', value: 60, color: '#3b82f6' },
    { name: 'Bonds', value: 40, color: '#10b981' },
  ]}
  showLabel
/>
```

### 4. AreaChart (`components/charts/AreaChart.tsx`)
**Funzionalità**:
- Grafico ad area per accumulazione
- Stacked areas
- Fill opacity customizable

**Usage**:
```tsx
<AreaChart
  data={data}
  areas={[
    { key: 'value', label: 'Valore', color: '#3b82f6' },
  ]}
  stacked
/>
```

### 5. CandlestickChart (`components/charts/CandlestickChart.tsx`)
**Funzionalità**:
- Grafico candlestick per dati OHLC
- Volume support
- Color coding (green/red)

**Usage**:
```tsx
<CandlestickChart
  data={[
    { date: '2025-01-01', open: 100, high: 110, low: 95, close: 105 },
  ]}
  showVolume
/>
```

### 6. DataTable (`components/charts/DataTable.tsx`)
**Funzionalità**:
- Tabella sortable
- Pagination
- Search/filter
- Custom column rendering
- Accessibilità completa

**Usage**:
```tsx
<DataTable
  data={trades}
  columns={[
    { key: 'symbol', label: 'Symbol', sortable: true },
    { key: 'pnl', label: 'P&L', render: (val) => `€${val.toFixed(2)}` },
  ]}
  pagination
  pageSize={10}
/>
```

---

## 🎯 CHART COMPONENTS SPECIALIZZATI

### 1. PortfolioCharts (`components/charts/PortfolioCharts.tsx`)
**Grafici**:
- **Allocation Pie Chart**: Distribuzione per simbolo
- **Performance Line Chart**: Trend valore portfolio
- **Top Performers Bar Chart**: Top 5 asset per performance

**Usage**:
```tsx
<PortfolioCharts
  positions={positions}
  performanceData={[
    { date: '2025-01-01', value: 10000 },
  ]}
/>
```

### 2. TradingJournalCharts (`components/charts/TradingJournalCharts.tsx`)
**Grafici**:
- **Equity Curve**: Curva equity cumulativa
- **P&L Distribution**: Distribuzione profitti/perdite
- **Monthly P&L**: P&L mensile
- **Win Rate by Strategy**: Win rate per strategia

**Stats**:
- Total Trades
- Win Rate
- Total P&L
- Average P&L

**Usage**:
```tsx
<TradingJournalCharts trades={trades} />
```

### 3. ExpenseCharts (`components/charts/ExpenseCharts.tsx`)
**Grafici**:
- **Category Distribution**: Distribuzione per categoria
- **Monthly Trends**: Trend spese mensili
- **Top Categories**: Top 5 categorie

**Stats**:
- Spese Totali
- Media Mensile
- Numero Categorie

**Usage**:
```tsx
<ExpenseCharts expenses={expenses} />
```

---

## 🎨 DESIGN PRINCIPLES

### Few (2006) - Information Dashboard Design
- **Information Density**: Grafici compatti ma leggibili
- **Visual Hierarchy**: Colori e dimensioni per importanza
- **Consistency**: Stile uniforme tra tutti i chart

### Tufte (2001) - Visual Display of Quantitative Information
- **Data-Ink Ratio**: Massimo contenuto informativo, minimo inchiostro
- **Chartjunk Avoidance**: Niente elementi decorativi non necessari
- **Small Multiples**: Grafici multipli per confronti

### WCAG 2.1 AAA
- **Color Contrast**: Contrasto minimo 4.5:1
- **Alternative Text**: Descrizioni per screen reader
- **Keyboard Navigation**: Navigazione completa da tastiera

---

## 📚 BEST PRACTICES

### 1. Data Preparation
- Trasformare dati in formato chart-ready
- Calcolare aggregazioni (sum, avg, etc.)
- Gestire dati mancanti/null

### 2. Responsive Design
- `ResponsiveContainer` per adattamento automatico
- Breakpoints per mobile/desktop
- Touch-friendly su mobile

### 3. Performance
- Memoization con `useMemo` per calcoli pesanti
- Lazy loading per chart grandi
- Virtualization per tabelle con molti dati

### 4. Accessibility
- ARIA labels per chart
- Alternative text descriptions
- Keyboard navigation
- Screen reader support

---

## 🔧 CONFIGURAZIONE

### Installazione
```bash
npm install recharts
```

### Dependencies
- `recharts`: ^2.10.3
- `date-fns`: Per formattazione date

---

## 📖 ESEMPI COMPLETI

### Portfolio Dashboard
```tsx
import { PortfolioCharts } from '@/components/charts/PortfolioCharts';

function PortfolioDashboard() {
  const { data: positions } = useApi('/api/portfolio');
  const { data: performance } = useApi('/api/portfolio/performance');

  return (
    <div>
      <PortfolioCharts
        positions={positions}
        performanceData={performance}
      />
    </div>
  );
}
```

### Trading Journal Analytics
```tsx
import { TradingJournalCharts } from '@/components/charts/TradingJournalCharts';
import { DataTable } from '@/components/charts/DataTable';

function TradingAnalytics() {
  const { data: trades } = useApi('/api/trading-journal');

  return (
    <div className="space-y-6">
      <TradingJournalCharts trades={trades} />
      <DataTable
        data={trades}
        columns={[
          { key: 'symbol', label: 'Symbol', sortable: true },
          { key: 'entry_date', label: 'Entry Date', sortable: true },
          { key: 'profit_loss', label: 'P&L', render: (val) => `€${val?.toFixed(2) || '0.00'}` },
        ]}
        pagination
      />
    </div>
  );
}
```

---

## 🚀 ROADMAP FUTURO

### Miglioramenti Possibili
- [ ] Real-time chart updates
- [ ] Chart export (PNG, SVG)
- [ ] Interactive chart annotations
- [ ] Custom chart themes
- [ ] 3D visualizations (se necessario)
- [ ] Advanced candlestick patterns

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

