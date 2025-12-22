FROM node:20-bookworm-slim

WORKDIR /app

# Prisma (and some native deps) require OpenSSL.
RUN apt-get update \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY prisma/schema.prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm install --include=dev

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Build shared package
RUN npm run build --workspace=@tradelia/shared

# Generate Prisma client
RUN npx prisma generate

# Build API
RUN npm run build --workspace=@tradelia/api

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=@tradelia/api"]
