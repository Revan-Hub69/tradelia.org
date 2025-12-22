FROM node:20-bookworm-slim

WORKDIR /app

# Prisma (and some native deps) require OpenSSL.
RUN apt-get update \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/
COPY prisma/schema.prisma ./prisma/

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker
COPY prisma ./prisma

RUN npm run build --workspace=@tradelia/shared
RUN npx prisma generate
RUN npm run build --workspace=@tradelia/worker

CMD ["npm", "run", "start", "--workspace=@tradelia/worker"]
