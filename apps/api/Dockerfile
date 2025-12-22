# ---- Base
FROM node:20-bookworm-slim AS base
WORKDIR /app

# OpenSSL (Prisma spesso lo richiede in runtime/build)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Enable Corepack (pnpm)
RUN corepack enable

# ---- Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --prod=false

# ---- Build
FROM deps AS build
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api
RUN pnpm -C apps/api run build

# ---- Runtime
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=build /app/apps/api/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
