# syntax=docker/dockerfile:1
#
# OneEmergence Website — multi-stage, pnpm-aware Docker build.
#
# ---------------------------------------------------------------------------
# Env-at-build-time decision (read this before changing build args)
# ---------------------------------------------------------------------------
# `next build` unconditionally forces NODE_ENV=production for the Node
# process it spawns (this happens regardless of what NODE_ENV is set to in
# this Dockerfile — verified empirically, see below). Next also *executes*
# every route module server-side during its "Collecting page data" build
# step — including fully dynamic routes that are never statically rendered —
# to inspect their exports. Because src/lib/env.ts throws as a *module-load
# side effect* (not lazily) whenever NODE_ENV === 'production' and
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / DATABASE_URL are
# missing, this means:
#
#   1. Setting NODE_ENV only in the runner stage does NOT help — Next forces
#      production mode during `next build` no matter what.
#   2. DATABASE_URL — not just the NEXT_PUBLIC_* vars — must ALSO be a
#      non-empty string at build time, purely to satisfy this check. This
#      was confirmed by building locally: the build fails at "Collecting
#      page data for /api/guide" with "Missing required environment
#      variables in production: DATABASE_URL" when it's absent.
#
# The fix below is the smallest one that doesn't touch application code:
#   - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY get non-empty
#     PLACEHOLDER defaults (env.ts uses Zod .min(1) — an *empty string* build
#     arg fails validation immediately, harder than the production check).
#     These two ARE inlined into the client JS bundle by Next at build time,
#     so for a REAL deployment image you MUST override them:
#       docker build \
#         --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
#         --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
#         --build-arg NEXT_PUBLIC_SENTRY_DSN=https://...ingest.sentry.io/... .
#   - NEXT_PUBLIC_SENTRY_DSN stays genuinely *absent* (not empty-string) when
#     not provided, via an `unset` guard in the build RUN step — Sentry is
#     designed to be off when no DSN is configured (see next.config.ts),
#     and an empty string is an invalid value for that optional field.
#   - DATABASE_URL gets a non-connecting placeholder default. It is only
#     used to survive the build-time module-load check above — postgres-js
#     (src/lib/db/index.ts) does not eagerly connect when instantiated, so
#     the placeholder is never dialed. The REAL DATABASE_URL is supplied at
#     container *runtime* (docker-compose `env_file` / `docker run
#     --env-file`), and the standalone server re-reads process.env fresh
#     when server.js boots — nothing DB-related from the build stage is
#     baked into the runtime image.
#   - ANTHROPIC_API_KEY needs no build arg at all: src/lib/ai/provider.ts
#     tolerates a missing key at both build and runtime (Guide API returns a
#     503 "not configured" response instead of throwing).
# ---------------------------------------------------------------------------

ARG NODE_VERSION=22-alpine

# ---------------------------------------------------------------------------
# Stage 1: deps — install dependencies with pnpm, cached independently of
# source changes.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Native postinstalls (sharp, esbuild, @swc/core, ...) need glibc-compat libs
# on Alpine.
RUN apk add --no-cache libc6-compat

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

# pnpm-workspace.yaml carries pnpm 11's build-script allowlist (allowBuilds
# for esbuild/sharp/@swc/core/etc.) — it MUST be present before `pnpm
# install`, otherwise pnpm blocks those packages' native postinstall scripts
# and the build fails later with missing native binaries.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: builder — compile the Next.js app.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time —
# pass real values via --build-arg for a real deployment image (see header).
ARG NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ARG NEXT_PUBLIC_SENTRY_DSN=""
# Build-time-only placeholder — see header. Real value is runtime-only.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    DATABASE_URL=${DATABASE_URL} \
    NODE_ENV=production

# Keep NEXT_PUBLIC_SENTRY_DSN genuinely unset (not "") when no DSN was
# passed in — env.ts's schema rejects an empty string for this optional key.
RUN if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then \
      export NEXT_PUBLIC_SENTRY_DSN; \
    else \
      unset NEXT_PUBLIC_SENTRY_DSN; \
    fi; \
    pnpm build

# ---------------------------------------------------------------------------
# Stage 3: runner — minimal runtime image, non-root, standalone output only.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Use 127.0.0.1, not localhost: this image's /etc/hosts resolves localhost
# to ::1 first, but the server (HOSTNAME=0.0.0.0) only binds IPv4 — verified
# empirically, wget against "localhost" gets "Connection refused" on ::1
# while the app is demonstrably up and answering on 127.0.0.1.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
