# Oslo - Specifiche Sistema Comunicazione e Media

## 💬 Sistema Comunicazione Alleanza

### Opzione 1: Feed Tipo Twitter (CONSIGLIATO) ✅

**Vantaggi:**
- ✅ Più scalabile (non richiede connessioni persistenti)
- ✅ Storico permanente e ricercabile
- ✅ Threading e risposte organizzate
- ✅ Facile integrare media (foto/video)
- ✅ Like/reazioni per engagement
- ✅ Hashtag per categorizzare (#raid #guerra #donazioni)
- ✅ Menzioni (@username) per notifiche
- ✅ Retweet/condivisione post
- ✅ Più adatto a comunicazione asincrona

**Struttura:**
```
Feed Post:
- ID, alliance_id, author_id
- Content (testo)
- Original_language (codice lingua)
- Translated_content (JSON: {en: "...", it: "...", es: "..."})
- Media (array: immagini/video)
- Type (text, image, video, event, announcement)
- Hashtags (array)
- Mentions (array user_id)
- Replies_to (post_id se risposta)
- Likes_count, replies_count
- Created_at, updated_at
```

### Opzione 2: Chat Tradizionale

**Svantaggi:**
- ❌ Richiede WebSocket/connessioni persistenti
- ❌ Più complesso da scalare
- ❌ Storico meno organizzato
- ❌ Difficile integrare media in modo elegante

**Quando usare:**
- Solo se serve comunicazione in tempo reale critica
- Per canali dedicati (es. "War Room" durante battaglie)

### 🎯 Raccomandazione: **Feed Ibrido**

**Feed Principale** (tipo Twitter) per:
- Comunicazioni generali
- Annunci
- Screenshot/video
- Discussioni strategiche
- Condivisione risultati

**Chat Live** (opzionale) per:
- Coordinamento durante eventi critici
- War Room durante battaglie
- Canali dedicati per eventi specifici

---

## 🌍 Sistema Autotraduzione

### Opzioni API Traduzione

#### 1. **Google Cloud Translation API** (CONSIGLIATO)
- ✅ 100+ lingue supportate
- ✅ Traduzione automatica di alta qualità
- ✅ Pricing: $20 per 1M caratteri
- ✅ API semplice e affidabile
- ✅ Supporta batch translation

#### 2. **DeepL API**
- ✅ Qualità superiore per alcune lingue
- ✅ 31 lingue supportate
- ✅ Pricing: €5.49 per 1M caratteri
- ⚠️ Meno lingue di Google

#### 3. **Azure Translator**
- ✅ Integrazione Microsoft
- ✅ 100+ lingue
- ✅ Pricing competitivo
- ✅ Buona qualità

#### 4. **OpenAI GPT-4** (per contesto avanzato)
- ✅ Migliore comprensione contesto
- ✅ Più costoso
- ✅ Utile per traduzioni con slang gaming

### Implementazione Autotraduzione

**Strategia:**
1. **Rilevamento Lingua Automatico** (opzionale)
   - Detect language del post originale
   - Salvare lingua originale

2. **Traduzione Lazy/On-Demand**
   - Traduci solo quando utente cambia lingua preferita
   - Cache traduzioni (evitare retraduzione)
   - Traduci in batch per efficienza

3. **Traduzione Pre-emptive** (opzionale)
   - Traduci automaticamente in lingue più comuni dell'alleanza
   - Cache per performance

**Schema Database:**
```sql
alliance_posts (
  id, alliance_id, author_id,
  content, -- Testo originale
  original_language, -- 'it', 'en', 'es', etc.
  translated_content, -- JSON: {"en": "...", "it": "...", "es": "..."}
  media_urls, -- Array URL immagini/video
  post_type, -- 'text', 'image', 'video', 'event', 'announcement'
  hashtags, -- Array: ['#raid', '#guerra']
  mentions, -- Array user_id
  replies_to, -- post_id se risposta
  likes_count, replies_count,
  created_at, updated_at
)

user_language_preferences (
  user_id, 
  preferred_language, -- 'it', 'en', 'es', etc.
  auto_translate_enabled -- boolean
)

translation_cache (
  source_text_hash, -- Hash del testo originale
  source_language,
  target_language,
  translated_text,
  created_at
)
```

**Flow Traduzione:**
```
1. Utente pubblica post in italiano
2. Sistema salva: content="Ciao alleanza!", original_language="it"
3. Utente con lingua preferita "en" apre feed
4. Sistema controlla cache traduzione
5. Se non in cache → chiama API traduzione
6. Salva in translated_content: {"en": "Hello alliance!"}
7. Mostra traduzione all'utente
8. Cache per future richieste
```

**API Endpoint:**
```
POST /api/posts/translate
Body: { post_id, target_language }
Response: { translated_text }

GET /api/posts/:id?lang=en
Response: Post con traduzione in lingua richiesta
```

---

## 📸 Gestione Media (Screenshot e Video)

### Storage Opzioni

#### 1. **Supabase Storage** (CONSIGLIATO per MVP)
- ✅ Integrato con Supabase
- ✅ CDN incluso
- ✅ Facile da implementare
- ✅ Pricing: 50GB gratuiti, poi $0.021/GB
- ✅ Supporta immagini e video
- ✅ Upload diretto da client

#### 2. **Cloudinary**
- ✅ Ottimizzazione automatica immagini
- ✅ Transformazioni on-the-fly
- ✅ Video processing
- ✅ Pricing: 25GB gratuiti

#### 3. **AWS S3 + CloudFront**
- ✅ Scalabile
- ✅ Più complesso da setup
- ✅ Costoso per piccole alleanze

### Implementazione Upload

**Limiti:**
- Immagini: Max 10MB, formati: JPG, PNG, WebP
- Video: Max 50MB, formati: MP4, WebM
- Compressione automatica lato client/server

**Schema:**
```sql
alliance_media (
  id, alliance_id, post_id, -- NULL se media standalone
  user_id, -- Autore
  file_url, -- URL storage
  file_type, -- 'image', 'video'
  file_size, -- bytes
  thumbnail_url, -- Per video
  metadata, -- JSON: width, height, duration, etc.
  created_at
)
```

**Flow Upload:**
```
1. Utente seleziona file (screenshot/video)
2. Client comprime/ottimizza (opzionale)
3. Upload a Supabase Storage
4. Genera thumbnail per video
5. Salva metadata in database
6. Associa media a post o crea post automatico
```

**Features Media:**
- ✅ Preview immagini/video nel feed
- ✅ Lightbox per visualizzazione fullscreen
- ✅ Download media (opzionale, con permessi)
- ✅ Galleria media alleanza
- ✅ Filtri per tipo media
- ✅ Compressione automatica per risparmiare storage

---

## 🎨 UI/UX Feed Alleanza

### Layout Feed (Tipo Twitter)

```
┌─────────────────────────────────────┐
│  [Nuovo Post] [Filtri] [Cerca]     │
├─────────────────────────────────────┤
│  👤 @username · 2h                  │
│  🎮 Grande vittoria nel raid!       │
│  [Screenshot]                        │
│  #raid #vittoria                    │
│  ❤️ 12  💬 3  🔄 2                  │
├─────────────────────────────────────┤
│  👤 @admin · 5h                     │
│  📢 Evento domani alle 20:00!       │
│  [Video]                             │
│  #evento #annuncio                  │
│  ❤️ 25  💬 5                        │
└─────────────────────────────────────┘
```

### Features UI

1. **Composer Post**
   - Textarea con supporto hashtag/mentions
   - Upload media drag & drop
   - Preview media prima di pubblicare
   - Pulsante traduci (per preview)

2. **Visualizzazione Post**
   - Mostra lingua originale (badge)
   - Pulsante "Traduci" se diversa da preferita
   - Auto-traduci se preferenza utente diversa
   - Toggle mostra originale/traduzione

3. **Interazioni**
   - Like/Unlike
   - Commenta (threading)
   - Condividi (retweet)
   - Segnala (moderazione)

4. **Filtri e Ricerca**
   - Filtra per hashtag
   - Filtra per tipo (testo/media/eventi)
   - Cerca nel feed
   - Ordina per recente/popolare

---

## 🔔 Notifiche Feed

### Tipi Notifiche

1. **Nuovo Post** (opzionale)
   - Notifica quando admin/officer pubblica
   - Filtrabile per tipo post

2. **Menzione** (@username)
   - Notifica quando menzionato
   - Sempre attiva

3. **Risposta**
   - Notifica quando qualcuno risponde al tuo post
   - Configurabile

4. **Like**
   - Notifica quando qualcuno mette like (opzionale)
   - Solo per post importanti

---

## 📊 Moderation e Sicurezza

### Controlli

1. **Filtro Contenuti**
   - Filtro parole inappropriate
   - Auto-moderation (opzionale con AI)

2. **Permessi**
   - Solo membri possono postare
   - Admin possono eliminare post
   - Report post inappropriati

3. **Rate Limiting**
   - Max X post per ora per utente
   - Previene spam

---

## 🚀 Implementazione Priorità

### Fase 1: MVP Feed Base
1. ✅ Creazione post testo
2. ✅ Visualizzazione feed
3. ✅ Like/Commenti base
4. ✅ Upload immagini

### Fase 2: Autotraduzione
1. ✅ Integrazione API traduzione
2. ✅ Rilevamento lingua
3. ✅ Cache traduzioni
4. ✅ UI toggle traduzione

### Fase 3: Media Avanzato
1. ✅ Upload video
2. ✅ Thumbnail video
3. ✅ Galleria media
4. ✅ Ottimizzazione media

### Fase 4: Features Social
1. ✅ Hashtag/Mentions
2. ✅ Condivisione post
3. ✅ Ricerca avanzata
4. ✅ Filtri personalizzati

---

## 💰 Costi Stimati (per 1000 utenti attivi)

- **Google Translate API**: ~$5-10/mese (dipende da volume)
- **Supabase Storage**: ~$2-5/mese (50GB base)
- **Bandwidth**: Incluso in Supabase

**Totale stimato**: ~$10-20/mese per alleanza media

---

## ✅ Decisioni Confermate

1. **Feed vs Chat**: ✅ Feed tipo Twitter (con chat opzionale per eventi)
2. **Autotraduzione**: ✅ Google Translate API (con cache)
3. **Storage Media**: ✅ Supabase Storage
4. **Lingue Supportate**: ✅ IT, EN, RU, FR, DE, ES, ZH (Cinese Semplificato), JA (Giapponese), RO (Rumeno) - 9 lingue
5. **Limiti Media**: ✅ 10MB immagini, 50MB video
6. **Push Immediato**: ✅ Tasto per inviare notifica push immediata a tutti i membri alleanza
7. **Login**: ✅ Supabase Auth (già implementato)
8. **Eventi**: ✅ Nome evento, orario, flag ricorrenza

