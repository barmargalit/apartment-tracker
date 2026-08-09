# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable

# ── deps stage: install all workspace deps ────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/main-service/package.json ./apps/main-service/
RUN pnpm install --frozen-lockfile

# ── build stage: compile types + service, then deploy prod bundle ─────────────
FROM deps AS build
COPY packages/types ./packages/types
COPY apps/main-service ./apps/main-service
RUN pnpm --filter @apartment-tracker/types build
RUN pnpm --filter @apartment-tracker/main-service build
# pnpm deploy produces a self-contained dir: prod node_modules + dist, no workspace symlinks
RUN pnpm --filter @apartment-tracker/main-service deploy --prod --legacy /app/deploy

# ── runtime stage ─────────────────────────────────────────────────────────────
FROM base AS runtime
WORKDIR /app
COPY --from=build /app/deploy .
EXPOSE 3001
CMD ["node", "dist/main"]
