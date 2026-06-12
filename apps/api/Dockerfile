# ─── Dev stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json turbo.json ./
COPY yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install

# Compila o shared package para que @cria-viva/shared resolva via node_modules
COPY packages/shared/ ./packages/shared/
RUN yarn workspace @cria-viva/shared build

COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api

RUN yarn db:generate

EXPOSE 3001

CMD ["sh", "-c", "yarn workspace @cria-viva/shared build && npx prisma db push --accept-data-loss && yarn dev"]

# ─── Build stage ──────────────────────────────────────────────────────────────
FROM dev AS builder

RUN yarn build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS prod

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json turbo.json ./
COPY yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install --production

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
