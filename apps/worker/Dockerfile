FROM node:18-alpine

WORKDIR /app

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
