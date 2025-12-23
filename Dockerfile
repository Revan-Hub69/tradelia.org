# Use the official Node.js image
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Prisma (and some native deps) require OpenSSL.
RUN apt-get update \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack for pnpm
RUN corepack enable

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY prisma/schema.prisma ./prisma/

# Install dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Build shared package
RUN pnpm run build --filter @tradelia/shared

# Generate Prisma client
RUN pnpm run prisma:generate --filter @tradelia/api

# Build API
RUN pnpm run build --filter @tradelia/api

# Clean up devDependencies for production
RUN pnpm prune --prod

EXPOSE 3001

CMD ["pnpm", "run", "start", "--filter", "@tradelia/api"]
