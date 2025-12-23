# ---- Base
FROM node:20-bookworm-slim AS base
WORKDIR /app

# OpenSSL (Prisma spesso lo richiede in runtime/build)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Enable Corepack (pnpm)
RUN corepack enable

# ---- Dependencies
FROM base AS deps
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

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
RUN pnpm --filter @tradelia/shared run build
RUN pnpm --filter @tradelia/api run prisma:generate

# ---- Build
FROM base AS build
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# porta dentro node_modules e store
COPY --from=deps /repo/node_modules /repo/node_modules
COPY --from=deps /repo/pnpm-lock.yaml /repo/pnpm-lock.yaml
COPY --from=deps /repo/pnpm-workspace.yaml /repo/pnpm-workspace.yaml
COPY --from=deps /repo/package.json /repo/package.json
COPY --from=deps /repo/turbo.json /repo/turbo.json
COPY --from=deps /repo/tsconfig.base.json /repo/tsconfig.base.json

# ora copia il sorgente vero
COPY apps/api apps/api
COPY --from=deps /repo/packages/shared /repo/packages/shared

# Build API (workspace-aware) ✅ (NO -C)
RUN pnpm --filter @tradelia/api... run build

# ---- Runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia l'API buildata
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/package.json ./package.json

# Copia node_modules COMPLETO (include link workspace)
COPY --from=build /repo/node_modules ./node_modules

# IMPORTANTISSIMO: copia anche il workspace target del link
COPY --from=build /repo/packages/shared ./packages/shared

EXPOSE 3000
CMD ["node", "dist/index.js"]
