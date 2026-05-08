FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# ── Instalar dependencias ────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/physics/package.json ./packages/physics/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/content/package.json ./packages/content/
RUN pnpm install --frozen-lockfile --filter "@pendulo/api..." --filter "@pendulo/physics" --filter "@pendulo/schemas" --filter "@pendulo/content"

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter "@pendulo/api" build

# ── Imagen de producción ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario
COPY --from=builder /app/apps/api/dist        ./dist
COPY --from=builder /app/apps/api/prisma      ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules         ./node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules_api

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 api && \
    mkdir -p /app/data && chown api:nodejs /app/data

USER api

EXPOSE 4000
ENV DATABASE_URL="file:/app/data/prod.db"

# Ejecutar migraciones y luego el servidor
CMD sh -c "npx prisma migrate deploy && node dist/server.js"
