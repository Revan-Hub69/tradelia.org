# Tradelia AI

Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.

## 🏗️ Architettura

Progetto moderno basato su **Next.js 14** con App Router, TypeScript, Tailwind CSS e Supabase.

### Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Deploy**: Vercel

## 📁 Struttura del Progetto

```
/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard utente
│   ├── layout.tsx         # Layout principale
│   └── page.tsx           # Homepage
├── components/            # Componenti React riutilizzabili
│   ├── dashboard/        # Componenti dashboard
│   └── home/             # Componenti homepage
├── lib/                  # Librerie e utilities
│   ├── supabase/         # Client Supabase (client/server)
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

- Headers di sicurezza HTTP configurati in `next.config.js`
- Autenticazione gestita da Supabase
- Row Level Security (RLS) nel database
- Validazione input lato server
- TypeScript per type safety

## 🎨 Design System

Il design system utilizza:

- **Tailwind CSS** per utility classes
- **CSS Modules** per componenti specifici
- **Design tokens** in `design-tokens/` per consistenza

## 📚 Documentazione

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 Licenza

Proprietario - Tradelia AI
