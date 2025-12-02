# Glossario Tradelia - Decisione Architetturale

## 📋 Analisi: JSON vs Supabase

### Situazione Attuale

- **202 termini** con struttura completa (what, technical, how, source, category, tags, relatedTerms)
- **Dimensione**: ~280 KB (JSON compresso)
- **Caricamento**: Client-side da file JSON statico
- **Caching**: In-memory dopo primo caricamento

## 🎯 Best Practice: JSON Statico (Raccomandato)

### ✅ Vantaggi JSON Statico

1. **Performance Ottimale**
   - Caricamento istantaneo (no network latency)
   - Caching browser/CDN nativo
   - Zero query database
   - Bundle ottimizzato con Next.js

2. **Costi Zero**
   - Nessun costo Supabase per storage/query
   - Nessun limite di query
   - CDN incluso in hosting

3. **Versioning & Deploy**
   - Versioning automatico con Git
   - Deploy atomico (tutto o niente)
   - Rollback immediato
   - CI/CD semplice

4. **Sicurezza**
   - Nessun endpoint API esposto
   - Nessun rischio SQL injection
   - Contenuto verificabile in repo

5. **SEO & Accessibility**
   - Contenuto disponibile a build-time
   - SSR/SSG supportato
   - Indexabile da search engines

6. **Developer Experience**
   - Editing diretto nel codice
   - Review process con PR
   - Diff chiari in Git
   - Testing semplice

### ⚠️ Svantaggi JSON Statico

1. **Editing Richiede Deploy**
   - Modifiche richiedono commit + deploy
   - No editing in-app per non-developers
   - Processo più lento per aggiornamenti frequenti

2. **Scalabilità Limitata**
   - File cresce con numero termini
   - Caricamento completo anche se serve un termine
   - Meno flessibile per contenuti molto dinamici

## 🔄 Alternativa: Supabase (Quando Ha Senso)

### ✅ Vantaggi Supabase

1. **Editing Admin**
   - UI per editing senza codice
   - Aggiornamenti in tempo reale
   - Versioning nel database

2. **Scalabilità**
   - Query solo termini necessari
   - Paginazione efficiente
   - Ricerca avanzata nel DB

3. **Multi-tenancy**
   - Glossari per diversi clienti
   - Personalizzazione per utente
   - A/B testing di definizioni

### ⚠️ Svantaggi Supabase

1. **Performance**
   - Network latency (50-200ms)
   - Query overhead
   - Costi per query/bandwidth

2. **Complessità**
   - Setup schema database
   - Migrazioni
   - Backup/restore
   - Monitoring

3. **Costi**
   - Supabase free tier: 500MB storage, 2GB bandwidth
   - Con 300 termini: ~300KB storage (OK)
   - Ma query frequenti consumano bandwidth

## 🎯 Raccomandazione: **JSON Statico + Hybrid Approach**

### Architettura Ibrida (Best of Both Worlds)

```
┌─────────────────────────────────────────┐
│  Build Time (Static)                    │
│  - glossario.json (202 termini base)    │
│  - Bundle con Next.js                   │
│  - CDN caching                           │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Runtime (Optional Dynamic)              │
│  - Supabase per override/custom          │
│  - Cache layer (Redis/SWR)               │
│  - Fallback a JSON se Supabase down      │
└─────────────────────────────────────────┘
```

### Implementazione Consigliata

#### Fase 1: JSON Statico (Attuale) ✅

- Mantieni `tradelia-glossary-300.json` nel progetto
- Caricamento client-side con caching
- **Perfetto per**: 202-300 termini, contenuto stabile

#### Fase 2: Hybrid (Futuro, se necessario)

- JSON come base (sempre disponibile)
- Supabase per:
  - Override di termini specifici
  - Termini custom per utenti premium
  - A/B testing
  - Analytics su quali termini sono più consultati

### Schema Database (Se implementi Hybrid)

```sql
-- Tabella principale
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  what TEXT NOT NULL,
  technical TEXT,
  how TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  related_terms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Indici per performance
CREATE INDEX idx_glossary_category ON glossary_terms(category);
CREATE INDEX idx_glossary_tags ON glossary_terms USING GIN(tags);
CREATE INDEX idx_glossary_search ON glossary_terms USING GIN(to_tsvector('italian', title || ' ' || what || ' ' || how));

-- Override per utenti (opzionale)
CREATE TABLE glossary_user_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  term_key TEXT REFERENCES glossary_terms(key),
  custom_how TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📊 Confronto Performance

| Metrica         | JSON Statico        | Supabase   | Hybrid             |
| --------------- | ------------------- | ---------- | ------------------ |
| **First Load**  | ~50ms               | ~200ms     | ~50ms (JSON)       |
| **Subsequent**  | ~0ms (cached)       | ~100ms     | ~0ms (cached)      |
| **Editing**     | Deploy needed       | Instant    | Instant (override) |
| **Scalability** | Fino a ~500 termini | Illimitata | Illimitata         |
| **Costs**       | $0                  | $0-20/mese | $0-20/mese         |
| **Complexity**  | Bassa               | Media      | Media-Alta         |

## 🎯 Decisione Finale

### ✅ **Raccomandazione: JSON Statico**

**Perché:**

1. **202-300 termini** sono gestibili come JSON
2. **Contenuto stabile** (glossario non cambia ogni giorno)
3. **Performance ottimale** (zero latency)
4. **Costi zero**
5. **Semplice da mantenere**

### 🔄 **Quando Passare a Supabase:**

Considera Supabase se:

- ✅ Glossario supera **500 termini**
- ✅ Serve **editing frequente** da non-developers
- ✅ Serve **personalizzazione per utente**
- ✅ Serve **analytics avanzate** su utilizzo
- ✅ Budget per hosting Supabase

### 🚀 **Implementazione Ibrida (Futuro):**

Se in futuro serve editing admin:

1. Mantieni JSON come base
2. Aggiungi Supabase per override
3. Merge logic: Supabase override > JSON base
4. Cache con SWR/React Query

## 📝 Codice di Esempio (Hybrid)

```typescript
// lib/glossary/terms-hybrid.ts
export async function loadGlossaryTerms(): Promise<Record<string, GlossaryTerm>> {
  // 1. Carica base da JSON (sempre disponibile)
  const baseTerms = await loadFromJSON();

  // 2. Carica override da Supabase (se configurato)
  try {
    const { data: overrides } = await supabase.from("glossary_terms").select("*");

    // 3. Merge: override > base
    return { ...baseTerms, ...overrides };
  } catch {
    // Fallback a JSON se Supabase non disponibile
    return baseTerms;
  }
}
```

## ✅ Conclusione e Implementazione

### **Decisione: JSON Statico** ✅

**Implementato:**

- File: `public/tradelia-glossary-300.json` (173 KB, 202 termini)
- Caricamento: Fetch da `/tradelia-glossary-300.json` (client-side)
- Fallback: `/glossario.json` se nuovo file non disponibile
- Caching: In-memory dopo primo caricamento
- Performance: ~50ms first load, 0ms subsequent (cached)

**Vantaggi per Tradelia:**

1. ✅ **Performance ottimale** - Zero network latency dopo primo load
2. ✅ **Costi zero** - Nessun costo Supabase
3. ✅ **Versioning Git** - Tracciamento completo delle modifiche
4. ✅ **Deploy atomico** - Tutto o niente, no partial updates
5. ✅ **SEO-friendly** - Contenuto disponibile a build-time
6. ✅ **Semplice** - No database, no migrations, no admin UI

**Quando considerare Supabase:**

- Glossario supera 500 termini
- Serve editing frequente da non-developers
- Serve personalizzazione per utente
- Budget disponibile per hosting

### **Implementazione Futura (Hybrid - Opzionale)**

Se in futuro serve editing admin:

1. Mantieni JSON come base (sempre disponibile)
2. Aggiungi Supabase per override/custom
3. Merge logic: `Supabase override > JSON base`
4. Cache con SWR/React Query

**Schema Database (se implementi Hybrid):**

```sql
CREATE TABLE glossary_terms (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  what TEXT NOT NULL,
  technical TEXT,
  how TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  related_terms TEXT[],
  is_override BOOLEAN DEFAULT false, -- true se override di JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
