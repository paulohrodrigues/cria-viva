# ─── Dev stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json turbo.json ./
COPY yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN yarn install

COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["sh", "-c", "yarn workspace @cria-viva/shared build && yarn dev --host 0.0.0.0"]

# ─── Build stage ──────────────────────────────────────────────────────────────
FROM dev AS builder

RUN yarn build

# ─── Production stage (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$PORT $API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
