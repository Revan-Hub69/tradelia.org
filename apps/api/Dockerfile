# ---------- Build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /repo

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable

# Copio solo i manifest prima (cache migliore)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY prisma/schema.prisma prisma/schema.prisma

# Install (workspace intero)
RUN pnpm install --frozen-lockfile

# Copio il resto
COPY . .

# Build shared + prisma generate + build api
RUN pnpm --filter @tradelia/shared run build
RUN pnpm --filter @tradelia/api run prisma:generate
RUN pnpm --filter @tradelia/api run build

# Crea una cartella deploy "standalone" per l'API (solo deps necessarie)
RUN pnpm --filter @tradelia/api --prod deploy /out

# ---------- Runtime ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

# Copio output deploy
COPY --from=build /out ./

# Railway: espone PORT
EXPOSE 3000
CMD ["node", "dist/index.js"]
