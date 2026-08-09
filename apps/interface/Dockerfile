# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable

# ── deps stage ────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/interface/package.json ./apps/interface/
RUN pnpm install --frozen-lockfile

# ── build stage ───────────────────────────────────────────────────────────────
FROM deps AS build
COPY packages/types ./packages/types
COPY apps/interface ./apps/interface
RUN pnpm --filter @apartment-tracker/types build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @apartment-tracker/interface build

# ── runtime stage (standalone output) ────────────────────────────────────────
FROM base AS runtime
WORKDIR /app

# Copy the standalone server bundle
COPY --from=build /app/apps/interface/.next/standalone ./
# Copy static assets
COPY --from=build /app/apps/interface/.next/static ./apps/interface/.next/static
COPY --from=build /app/apps/interface/public ./apps/interface/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/interface/server.js"]
