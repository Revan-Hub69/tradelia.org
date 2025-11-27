# Migrazione Next.js - GitHub e Vercel

## Domande Frequenti

### 1. "Cosa cambia su GitHub?"

**Risposta: Quasi nulla!**

#### Prima (HTML Statico):

```
/workspace
  /dashboard.html
  /assets
    /js
    /css
  /api
  /vercel.json
```

#### Dopo (Next.js):

```
/workspace
  /app
    /dashboard
      /page.tsx (era dashboard.html)
    /api (stesso)
  /components
  /public (assets statici)
  /vercel.json (stesso)
```

**Cosa cambia:**

- ✅ Struttura cartelle (più organizzata)
- ✅ File `.tsx` invece di `.html`
- ✅ **Stesso repository GitHub**
- ✅ **Stesso branch**
- ✅ **Stesso workflow**

**Cosa NON cambia:**

- ✅ Stesso repository
- ✅ Stesso team
- ✅ Stesso accesso
- ✅ Stesso processo

---

### 2. "Vercel - possiamo cambiare da HTML statico a Next.js? È compatibile?"

**Risposta: SÌ, è PERFETTAMENTE compatibile!**

#### Vercel + Next.js = Match Perfetto

**Perché:**

1. **Vercel è la company dietro Next.js** (creata dagli stessi founder)
2. **Zero config** - Vercel rileva Next.js automaticamente
3. **Deploy automatico** - Push su GitHub = deploy automatico
4. **Performance ottimizzate** - Edge functions, CDN globale
5. **Preview deployments** - Ogni PR ha un URL di preview

#### Prima (HTML Statico):

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [{ "src": "/dashboard.html", "dest": "/dashboard.html" }]
}
```

#### Dopo (Next.js):

```json
// vercel.json (OPZIONALE - Vercel rileva Next.js automaticamente)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

**O ANCORA MEGLIO:**

- ✅ **Nessun vercel.json necessario!**
- ✅ Vercel rileva Next.js automaticamente
- ✅ Configurazione automatica

---

## Processo Migrazione

### Fase 1: Setup Next.js (NON rompe niente)

```bash
# Nel repository esistente
npx create-next-app@latest . --typescript --tailwind --app --skip-install

# Oppure creare cartella separata per test
npx create-next-app@latest tradelia-next --typescript --tailwind --app
```

**Cosa succede:**

- ✅ Crea cartella `/app` (non tocca file esistenti)
- ✅ Crea `/components` (nuova)
- ✅ Crea `next.config.js` (nuovo)
- ✅ **NON modifica** `dashboard.html` esistente
- ✅ **NON modifica** file esistenti

**Puoi testare senza rompere niente!**

---

### Fase 2: Migrare Home Page (Overview)

#### Prima (HTML Statico):

```
/dashboard.html
  → Carica /assets/js/dashboard/overview.js
  → Renderizza HTML con innerHTML
```

#### Dopo (Next.js):

```
/app/dashboard/page.tsx
  → Componente React
  → Server Component (performance)
  → Type-safe
```

**File da creare:**

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <DashboardOverview />;
}
```

**Vercel:**

- ✅ Rileva automaticamente `/app/dashboard/page.tsx`
- ✅ Crea route `/dashboard` automaticamente
- ✅ **Stesso URL** (`/dashboard`)

---

### Fase 3: Deploy su Vercel

#### Opzione A: Branch Separato (Consigliato)

```bash
# Creare branch per Next.js
git checkout -b feature/nextjs-migration

# Push su GitHub
git push origin feature/nextjs-migration
```

**Vercel:**

- ✅ Crea **preview deployment** automaticamente
- ✅ URL: `tradelia-nextjs-migration.vercel.app`
- ✅ **NON tocca** produzione
- ✅ Puoi testare senza rischi

#### Opzione B: Deploy Diretto

```bash
# Se tutto funziona, merge in main
git checkout main
git merge feature/nextjs-migration
git push origin main
```

**Vercel:**

- ✅ Deploy automatico su produzione
- ✅ **Stesso dominio** (`tradelia.org`)
- ✅ **Zero downtime** (Vercel gestisce)

---

## Compatibilità Vercel

### HTML Statico → Next.js

**È 100% compatibile perché:**

1. **Vercel supporta entrambi:**
   - ✅ HTML statico (attuale)
   - ✅ Next.js (dopo migrazione)

2. **Stesso processo:**
   - ✅ Push su GitHub
   - ✅ Vercel rileva automaticamente
   - ✅ Build automatico
   - ✅ Deploy automatico

3. **Zero config:**
   - ✅ Vercel rileva `package.json` con Next.js
   - ✅ Configurazione automatica
   - ✅ **Nessun vercel.json necessario**

---

## Esempio Concreto: Home Page

### Prima (HTML Statico):

```html
<!-- dashboard.html -->
<div id="overview-container">
  <!-- Content loaded by overview.js -->
</div>

<script type="module" src="/assets/js/dashboard/overview.js"></script>
```

```javascript
// assets/js/dashboard/overview.js (100+ righe)
export async function loadOverview() {
  const container = document.getElementById("overview-container");
  container.innerHTML = `
    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-value">${reports.length}</div>
        <div class="stat-label">Report Totali</div>
      </div>
    </div>
  `;
  // ... 100+ righe ...
}
```

### Dopo (Next.js):

```tsx
// app/dashboard/page.tsx
import { OverviewStats } from "@/components/dashboard/OverviewStats";

export default async function DashboardPage() {
  const reports = await getReports();

  return (
    <div className="dashboard-container">
      <OverviewStats reports={reports} />
    </div>
  );
}
```

```tsx
// components/dashboard/OverviewStats.tsx
export function OverviewStats({ reports }: { reports: Report[] }) {
  return (
    <div className="overview-stats">
      <StatCard value={reports.length} label="Report Totali" />
    </div>
  );
}
```

**Vantaggi:**

- ✅ **50% meno codice**
- ✅ **Type-safe**
- ✅ **Server-side rendering** (performance)
- ✅ **Stesso URL** (`/dashboard`)

---

## GitHub: Cosa Cambia

### Repository Structure

#### Prima:

```
tradelia.org/
  ├── dashboard.html
  ├── assets/
  │   ├── js/
  │   └── css/
  ├── api/
  └── vercel.json
```

#### Dopo:

```
tradelia.org/
  ├── app/
  │   ├── dashboard/
  │   │   └── page.tsx (era dashboard.html)
  │   └── api/ (stesso)
  ├── components/
  ├── public/ (assets statici)
  ├── next.config.js
  └── vercel.json (opzionale)
```

**Cambiamenti:**

- ✅ Struttura più organizzata
- ✅ File `.tsx` invece di `.html`
- ✅ **Stesso repository**
- ✅ **Stesso branch**
- ✅ **Stesso team**

---

## Vercel: Processo Deploy

### Scenario 1: Branch Separato (Test)

```bash
# 1. Creare branch
git checkout -b feature/nextjs-homepage

# 2. Setup Next.js (non tocca file esistenti)
npx create-next-app@latest . --typescript --tailwind --app

# 3. Migrare home page
# (creare app/dashboard/page.tsx)

# 4. Push
git push origin feature/nextjs-homepage
```

**Vercel:**

- ✅ Crea preview deployment
- ✅ URL: `tradelia-feature-nextjs-homepage.vercel.app`
- ✅ **NON tocca produzione**
- ✅ Puoi testare

### Scenario 2: Merge in Main

```bash
# Se tutto funziona
git checkout main
git merge feature/nextjs-homepage
git push origin main
```

**Vercel:**

- ✅ Deploy automatico su produzione
- ✅ **Stesso dominio** (`tradelia.org`)
- ✅ **Zero downtime**

---

## Risposte Dirette

### "Cosa cambia su GitHub?"

- ✅ **Quasi nulla** - stesso repository, stesso branch
- ✅ Solo struttura cartelle più organizzata
- ✅ File `.tsx` invece di `.html`

### "Vercel - possiamo cambiare da HTML statico?"

- ✅ **SÌ, perfettamente compatibile**
- ✅ Vercel è la company dietro Next.js
- ✅ Zero config - rileva automaticamente
- ✅ **Stesso processo** - push su GitHub = deploy

### "Partire dalla home page?"

- ✅ **Perfetto!** Home page è il punto di partenza ideale
- ✅ Meno complessa di Education
- ✅ Buon test per validare approccio

---

## Prossimi Passi

1. **Creare branch** `feature/nextjs-homepage`
2. **Setup Next.js** (non tocca file esistenti)
3. **Migrare home page** (`/dashboard` → `/app/dashboard/page.tsx`)
4. **Test su preview** (Vercel crea URL automaticamente)
5. **Se funziona → merge in main**

**Timeline:**

- Setup: 1 giorno
- Migrazione home: 2-3 giorni
- Test: 1 giorno
- **Totale: 1 settimana**

---

## Conclusione

**GitHub:**

- ✅ Stesso repository
- ✅ Stessa struttura (più organizzata)
- ✅ Zero breaking changes

**Vercel:**

- ✅ **Perfettamente compatibile**
- ✅ Zero config
- ✅ Deploy automatico
- ✅ Preview deployments

**Home Page:**

- ✅ Punto di partenza ideale
- ✅ Meno complessa
- ✅ Buon test

**Pronto per iniziare!** 🚀
