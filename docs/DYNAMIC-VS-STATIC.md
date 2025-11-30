# Dashboard - Analisi Dinamico vs Statico

## ✅ COMPONENTI DINAMICI (da Supabase)

### 1. OverviewStats ✅
- **Status**: ✅ DINAMICO
- **Fonte**: `/api/dashboard/stats` → `getDashboardStats()` da Supabase
- **Dati**: totalReports, activeCourses, pendingRequests, recentActivity
- **Aggiornamento**: Real-time via API

### 2. RecentActivity ✅
- **Status**: ✅ DINAMICO
- **Fonte**: `/api/dashboard/activities` → `getUserActivities()` da Supabase
- **Dati**: Attività utente (report_viewed, course_started, etc.)
- **Filtri**: All, Reports, Courses, Analysis

### 3. ProgressTracking ✅
- **Status**: ✅ DINAMICO
- **Fonte**: `/api/dashboard/progress` → `getUserCourseProgress()` + `getUserAchievements()` da Supabase
- **Dati**: Corsi, progresso, achievements
- **Aggiornamento**: Real-time via API

### 4. GlobalSearch ✅
- **Status**: ✅ DINAMICO
- **Fonte**: `/api/dashboard/search` → `searchDashboardContent()` da Supabase
- **Dati**: Reports, Courses, Modules
- **Ricerca**: Full-text search su Supabase

---

## ❌ COMPONENTI HARDCODATI (da rendere dinamici)

### 1. ModuleGrid ❌
- **Status**: ❌ HARDCODATO
- **File**: `components/dashboard/ModuleGrid.tsx`
- **Problema**: Array `modules` hardcodato (linea 12)
- **Dovrebbe**: Caricare da Supabase tabella `modules`
- **Priorità**: 🔴 ALTA (moduli devono essere configurabili)

**Attuale:**
```typescript
const modules = [
  { id: 'reports', title: 'Report Ufficiali', ... },
  { id: 'education', title: 'Percorsi Formativi', ... },
  // ... hardcodato
];
```

**Dovrebbe essere:**
```typescript
const { data: modules } = useApi('/api/dashboard/modules');
```

### 2. Favorites ❌
- **Status**: ❌ localStorage (non Supabase)
- **File**: `components/dashboard/Favorites.tsx`
- **Problema**: Usa `localStorage` invece di Supabase
- **Dovrebbe**: Salvare/caricare da Supabase tabella `favorites`
- **Priorità**: 🟡 MEDIA (funziona ma non sincronizzato)

**Attuale:**
```typescript
const saved = localStorage.getItem('dashboard-favorites');
```

**Dovrebbe essere:**
```typescript
const { data: favorites } = useApi('/api/dashboard/favorites');
```

### 3. QuickLinks ⚠️
- **Status**: ⚠️ STATICO (potrebbe rimanere così)
- **File**: `components/dashboard/QuickLinks.tsx`
- **Problema**: Array `links` hardcodato
- **Dovrebbe**: Opzionale - può rimanere statico se sono link fissi
- **Priorità**: 🟢 BASSA (link fissi potrebbero essere OK)

### 4. QuickActions ⚠️
- **Status**: ⚠️ STATICO (potrebbe rimanere così)
- **File**: `components/dashboard/QuickActions.tsx`
- **Problema**: Array `actions` hardcodato
- **Dovrebbe**: Opzionale - può rimanere statico se sono azioni fisse
- **Priorità**: 🟢 BASSA (azioni fisse potrebbero essere OK)

---

## 📋 PRIORITÀ DI MIGRAZIONE

### 🔴 ALTA PRIORITÀ

1. **ModuleGrid** → Supabase `modules` table
   - I moduli devono essere configurabili dall'admin
   - Aggiunta/rimozione moduli senza deploy
   - Ordine, priorità, visibilità configurabili

### 🟡 MEDIA PRIORITÀ

2. **Favorites** → Supabase `favorites` table
   - Sincronizzazione cross-device
   - Backup automatico
   - Condivisione (futuro)

### 🟢 BASSA PRIORITÀ (Opzionale)

3. **QuickLinks** → Potrebbe rimanere statico
   - Link fissi (Glossary, Widgets, Utilities)
   - Non cambiano spesso

4. **QuickActions** → Potrebbe rimanere statico
   - Azioni fisse (Richiedi Analisi, Aggiungi Posizione, etc.)
   - Non cambiano spesso

---

## 🗄️ SCHEMA SUPABASE NECESSARIO

### Tabella `modules`
```sql
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  href TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('primary', 'secondary')),
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  badge_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabella `favorites`
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('report', 'course', 'module')),
  title TEXT NOT NULL,
  description TEXT,
  href TEXT NOT NULL,
  icon TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);
```

---

## 🚀 PIANO DI MIGRAZIONE

### Step 1: ModuleGrid → Supabase
1. Creare tabella `modules` in Supabase
2. Popolare con dati iniziali
3. Creare API route `/api/dashboard/modules`
4. Aggiungere `getModules()` in `server-services.ts`
5. Migrare `ModuleGrid.tsx` a usare `useApi`

### Step 2: Favorites → Supabase
1. Creare tabella `favorites` in Supabase
2. Creare API route `/api/dashboard/favorites`
3. Aggiungere `getUserFavorites()`, `addFavorite()`, `removeFavorite()` in `server-services.ts`
4. Migrare `Favorites.tsx` a usare `useApi` invece di localStorage
5. Mantenere localStorage come fallback/cache

---

## ✅ CHECKLIST

- [x] OverviewStats - DINAMICO
- [x] RecentActivity - DINAMICO
- [x] ProgressTracking - DINAMICO
- [x] GlobalSearch - DINAMICO
- [ ] ModuleGrid - DA MIGRARE
- [ ] Favorites - DA MIGRARE
- [ ] QuickLinks - OPZIONALE
- [ ] QuickActions - OPZIONALE

