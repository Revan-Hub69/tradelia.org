# Tradelia AI

Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.

## 🏗️ Architettura

Progetto moderno basato su **Next.js 14** con App Router, TypeScript, Tailwind CSS e Supabase.

### Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS + Design Tokens
- **Componenti UI**: shadcn/ui style (modulari)
- **Animazioni**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Forms**: React Hook Form + Zod
- **Deploy**: Vercel

## 📁 Struttura del Progetto

```
/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard utente
│   ├── layout.tsx        # Layout principale
│   └── page.tsx          # Homepage
├── components/            # Componenti React riutilizzabili
│   ├── ui/               # Componenti base (Button, Card, Badge)
│   ├── layout/           # Header, Footer, Navigation
│   └── home/             # Componenti homepage
├── lib/                  # Librerie e utilities
│   ├── supabase/         # Client Supabase (client/server)
│   ├── seo/              # SEO e metadata
│   ├── i18n/             # Multilingua
│   └── utils/            # Utility functions
├── hooks/                # React hooks personalizzati
├── types/                # TypeScript type definitions
├── public/               # File statici (immagini, favicon, etc.)
├── supabase/             # Schema database e migrazioni SQL
└── design-tokens/        # Design tokens (colori, spacing, etc.)
```

## 🚀 Getting Started

### Prerequisiti

- Node.js 18+ 
- npm o yarn
- Account Supabase

### Installazione

```bash
# Clona il repository
git clone <repository-url>

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp .env.local.example .env.local
# Aggiungi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Sviluppo

```bash
# Avvia il server di sviluppo
npm run dev

# Apri http://localhost:3000
```

### Build

```bash
# Build per produzione
npm run build

# Avvia il server di produzione
npm start
```

## 🧪 Testing

```bash
# Esegui i test
npm test

# Test con UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 📝 Scripts Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Lint e fix automatico
- `npm run lint:check` - Solo check lint
- `npm run format` - Formatta il codice
- `npm run type-check` - Verifica i tipi TypeScript
- `npm test` - Esegui i test

## 🔒 Sicurezza

Il progetto implementa best practices di sicurezza:

- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Content Security Policy**: Configurato per Supabase
- **Autenticazione**: Gestita da Supabase
- **Row Level Security (RLS)**: Nel database
- **Validazione input**: Zod schemas
- **TypeScript**: Type safety completo

## 🎨 Design System

Il design system utilizza:

- **Tailwind CSS** per utility classes
- **Design Tokens** centralizzati in `tailwind.config.ts`
- **Componenti modulari** (shadcn/ui style)
- **Varianti** con class-variance-authority

## 🌍 Multilingua

- **Lingue supportate**: Italiano (IT), English (EN)
- **Routing**: `/` per IT, `/en` per EN
- **Dictionaries**: JSON modulari in `lib/i18n/`

## 🔍 SEO & AI Search

- **Structured Data**: Schema.org EducationalOrganization
- **AI Search Optimization**: ChatGPT, Perplexity, Claude
- **Sitemap**: Dinamico con Next.js
- **Robots.txt**: Ottimizzato per AI crawlers
- **Open Graph**: Completo per social sharing

## 📚 Documentazione

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 📄 Licenza

Proprietario - Tradelia AI
