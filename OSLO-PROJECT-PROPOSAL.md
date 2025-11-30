# Progetto Oslo - App Companion per Gioco di Alleanze (GOG)

## 🎯 Obiettivo
App PWA/APK per gestire eventi, notifiche e coordinamento per alleanze di gioco.

## 📋 Funzionalità Base (Richiesta)

### 1. Area Admin - Gestione Eventi
- ✅ Creazione eventi settimanali/giornalieri
- ✅ **Nome evento** (campo testo)
- ✅ **Orario evento** (data e ora)
- ✅ **Flag ricorrenza** (giornaliero/settimanale/nessuna)
- ✅ Tipi di eventi (raid, guerra, donazioni, etc.)
- ✅ Modifica/cancellazione eventi
- ✅ **Tasto push immediato** - Invia notifica a tutti i membri alleanza

### 2. Sistema Notifiche Push
- ✅ Notifica push a tutti i membri dell'alleanza
- ✅ Riepilogo giornaliero eventi (mattina, es. 8:00)
- ✅ Notifica 40 minuti prima di ogni evento
- ✅ Gestione preferenze notifiche per utente

### 3. Dashboard Membri
- ✅ Visualizzazione eventi del giorno/settimana
- ✅ Calendario eventi
- ✅ Statistiche partecipazione
- ✅ Profilo utente con ruolo nell'alleanza

## 🚀 Funzionalità Aggiuntive (Proposte per Gioco di Alleanze)

### 4. Gestione Alleanza
- 📊 Statistiche alleanza (membri attivi, livello, ranking)
- 👥 Gestione membri (inviti, ruoli, permessi)
- 📈 Classifica membri (contributi, partecipazione eventi)
- 🏆 Achievement e badge per membri

### 5. Sistema Comunicazione Alleanza
- 📱 **Feed tipo Twitter** per comunicazione asincrona
  - Post con testo, immagini, video
  - Hashtag (#raid #guerra #donazioni)
  - Menzioni (@username)
  - Like, commenti, condivisioni
  - Threading per discussioni
- 🌍 **Autotraduzione automatica** (Google Translate API)
  - Rilevamento lingua automatico
  - Traduzione in tempo reale
  - Cache traduzioni per performance
  - Supporto 100+ lingue
- 📸 **Media Sharing**
  - Upload screenshot e video
  - Storage Supabase (CDN incluso)
  - Galleria media alleanza
  - Compressione automatica
- 💬 Chat live opzionale per eventi critici (War Room)

### 6. Analisi e Report
- 📊 Report partecipazione eventi
- 📈 Grafici attività membri
- 🎯 Obiettivi alleanza e progress tracking
- 📅 Storico eventi completati

### 7. Integrazione Gioco
- 🔗 API per sincronizzazione con gioco (se disponibile)
- 🎮 Link diretti a funzioni gioco
- 🔔 Notifiche eventi in-game (se supportato)

### 8. Social e Engagement
- 🏅 Leaderboard membri
- 🎁 Sistema ricompense/raccolte fondi
- 📸 Galleria screenshot eventi
- 🎉 Eventi speciali e celebrazioni

## 🏗️ Architettura Tecnica

### Stack Tecnologico
- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage Media**: Supabase Storage (CDN incluso)
- **Notifiche Push**: Web Push API + Service Worker
- **Traduzione**: Google Cloud Translation API
- **PWA**: Manifest + Service Worker
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui style

### Schema Database Principale

```sql
-- Tabelle principali
alliances (id, name, description, level, created_at)
users (id, email, username, alliance_id, role, created_at)

-- Eventi
alliance_events (
  id, alliance_id, title, description, 
  event_type, start_time, end_time, 
  recurrence_pattern, created_by, created_at
)
event_notifications (
  id, event_id, notification_type, 
  sent_at, status
)
event_participations (
  event_id, user_id, status, 
  confirmed_at, notes
)

-- Notifiche Push
user_push_subscriptions (
  user_id, subscription, alliance_id
)

-- Membri
alliance_members (
  user_id, alliance_id, role, 
  joined_at, last_active
)

-- Feed Alleanza (tipo Twitter)
alliance_posts (
  id, alliance_id, author_id,
  content, -- Testo originale
  original_language, -- 'it', 'en', 'es', etc.
  translated_content, -- JSON: {"en": "...", "it": "..."}
  media_urls, -- Array URL immagini/video
  post_type, -- 'text', 'image', 'video', 'event', 'announcement'
  hashtags, -- Array: ['#raid', '#guerra']
  mentions, -- Array user_id
  replies_to, -- post_id se risposta
  likes_count, replies_count,
  created_at, updated_at
)

-- Media
alliance_media (
  id, alliance_id, post_id,
  user_id, file_url, file_type,
  file_size, thumbnail_url, metadata,
  created_at
)

-- Preferenze Lingua
user_language_preferences (
  user_id, preferred_language,
  auto_translate_enabled
)

-- Cache Traduzioni
translation_cache (
  source_text_hash, source_language,
  target_language, translated_text,
  created_at
)
```

## 📱 Struttura Progetto

```
oslo/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   │   ├── events/          # Gestione eventi
│   │   ├── alliance/        # Info alleanza
│   │   │   ├── feed/        # Feed alleanza (tipo Twitter)
│   │   │   └── media/       # Galleria media
│   │   ├── members/         # Gestione membri
│   │   └── admin/           # Area admin
│   ├── api/
│   │   ├── events/          # CRUD eventi
│   │   ├── notifications/   # Invio notifiche
│   │   ├── alliance/        # Gestione alleanza
│   │   ├── posts/           # CRUD post feed
│   │   ├── translate/       # API traduzione
│   │   ├── media/           # Upload/download media
│   │   └── members/         # Gestione membri
│   └── layout.tsx
├── components/
│   ├── events/
│   ├── alliance/
│   │   ├── Feed/            # Componenti feed
│   │   ├── PostComposer/    # Composer post
│   │   └── MediaUpload/     # Upload media
│   ├── notifications/
│   └── admin/
├── lib/
│   ├── supabase/
│   ├── notifications/
│   ├── translation/         # Servizio traduzione
│   ├── media/               # Gestione media
│   └── scheduler/           # Scheduler notifiche
└── supabase/
    └── migrations/
```

## 🔔 Sistema Notifiche

### Tipi di Notifiche
1. **Riepilogo Giornaliero** (8:00 AM)
   - Lista eventi del giorno con orari
   
2. **Pre-Evento** (40 minuti prima)
   - Titolo evento
   - Orario evento
   - Tipo evento
   - Link rapido

3. **Evento Iniziato** (all'inizio)
   - Notifica evento iniziato
   
4. **Evento Terminato** (alla fine)
   - Riepilogo partecipazione

### Scheduler
- Cron job o funzione serverless per:
  - Invio riepilogo giornaliero
  - Invio notifiche 40 minuti prima
  - Cleanup notifiche vecchie

## 🎨 UI/UX Features

- **Dark Mode** (essenziale per gaming)
- **Tema personalizzabile** per alleanza
- **Notifiche in-app** oltre a push
- **Offline support** (PWA)
- **Mobile-first** design

## 🔐 Sicurezza e Permessi

- **Ruoli**: Admin, Officer, Member
- **RLS** (Row Level Security) in Supabase
- **Validazione** input con Zod
- **Rate limiting** per API

## 📦 Deployment

- **PWA**: Installabile su mobile/desktop
- **APK**: Build con Capacitor/Tauri (opzionale)
- **Hosting**: Vercel/Render
- **Database**: Supabase

## 🚦 Roadmap Implementazione

### Fase 1: Core (MVP)
1. ✅ Setup progetto Next.js + Supabase
2. ✅ Schema database base
3. ✅ Autenticazione e gestione alleanza
4. ✅ CRUD eventi (area admin)
5. ✅ Sistema notifiche push base
6. ✅ Dashboard eventi per membri

### Fase 2: Notifiche Avanzate
1. ✅ Scheduler notifiche (riepilogo + pre-evento)
2. ✅ Preferenze notifiche utente
3. ✅ Notifiche in-app

### Fase 3: Features Social
1. 📊 Statistiche e report
2. 👥 Gestione membri avanzata
3. 🏆 Achievement system

### Fase 4: Integrazione
1. 🔗 API gioco (se disponibile)
2. 📱 Build APK
3. 🎨 Personalizzazione tema

