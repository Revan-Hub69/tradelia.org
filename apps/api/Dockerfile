# ---- Base Deps
FROM node:20-bookworm-slim AS base-deps
WORKDIR /

# OpenSSL (Prisma spesso lo richiede in runtime/build)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Enable Corepack (pnpm)
RUN corepack enable
RUN corepack prepare pnpm@9.12.3 --activate

# ---- Base Runner
FROM node:20-bookworm-slim AS base-runner
WORKDIR /app

# OpenSSL (Prisma spesso lo richiede in runtime/build)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Enable Corepack (pnpm)
RUN corepack enable

# ---- Dependencies
FROM base-deps AS deps

# Copia manifest workspace + lock
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./

# Copia i package.json di app + packages (minimo indispensabile per install)
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# ✅ AGGIUNGI QUESTO (prima di pnpm install)
COPY prisma prisma

# Install (workspace)
RUN pnpm install --frozen-lockfile

# Copia sorgenti workspace (necessari per link + build)
COPY packages/shared packages/shared
COPY apps/api apps/api

# Build shared + prisma generate (workspace-aware)
RUN pnpm --filter ./packages/shared run build
RUN pnpm --filter ./apps/api run prisma:generate

# ---- Build
FROM base-deps AS build

# Copy everything from deps
COPY --from=deps / /

# Build API (workspace-aware) ✅ (NO -C)
RUN pnpm --filter ./apps/api... run build

# ---- Runtime
FROM base-runner AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia l'API buildata
COPY --from=build /apps/api/dist ./dist
COPY --from=build /apps/api/package.json ./package.json

# Copia node_modules COMPLETO (include link workspace)
COPY --from=build /node_modules ./node_modules

# IMPORTANTISSIMO: copia anche il workspace target del link
COPY --from=build /packages/shared ./packages/shared

EXPOSE 3000
CMD ["node", "dist/index.js"]
