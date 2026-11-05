# Vercel + Neon + Upstash setup

LIKHA uses Vercel for the Next.js application, Neon for PostgreSQL, and Upstash Redis for optional cache/ephemeral coordination. GitHub Actions remains the isolated build executor; do not run Docker builds or Helm packaging inside Vercel Functions.

## 1. Provision services

1. Import this repository into Vercel and create the project.
2. In the Vercel Marketplace, add **Neon Postgres** and **Upstash Redis** integrations.
3. Create a Neon database named `likha` (or use the database name you prefer).
4. Copy the Neon **pooled** connection string to `DATABASE_URL`. Copy the **direct** connection string to `DIRECT_URL`. Both must use TLS (`sslmode=require`). The pooled URL should use the provider's pooler hostname.
5. Copy Upstash REST URL and token to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The REST credentials are used by `@upstash/redis`; do not use a raw `redis://` URL in these variables.
6. Set the remaining variables from `.env.example` in Vercel Project Settings → Environment Variables. Use separate values for Production and Preview.

## 2. Database migrations

Install dependencies and generate Prisma Client:

```bash
npm ci
npx prisma generate
```

The initial schema migration is committed in `prisma/migrations/`. For a new development database:

```bash
npx prisma migrate dev
```

For production, commit migration files and run this command as a controlled deployment step (or a one-off CI job) using `DIRECT_URL`:

```bash
npx prisma migrate deploy
```

Do not run `prisma migrate dev` against production. Do not use `prisma db push` as the production migration strategy.

## 3. Runtime behavior

- Prisma uses `DATABASE_URL` (Neon pooled endpoint) for application queries. `DIRECT_URL` is reserved for migration operations.
- A Prisma client is reused within each warm serverless instance. Keep the Neon pooler enabled and avoid creating clients per request.
- Redis is optional in local development. When configured, `getRedis()` creates one Upstash REST client per warm instance.
- `/api/health` checks PostgreSQL and Redis. Redis reports `not_configured` when absent; PostgreSQL is required.
- Redis is a cache/ephemeral coordination layer, not the source of truth. Persist projects, builds, releases, and scan results in PostgreSQL.

## 4. Verify

```bash
curl https://likha.phlopentech.org/api/health
```

Expected response when both services are configured:

```json
{
  "status": "ok",
  "service": "likha",
  "checks": { "postgres": "ok", "redis": "ok" }
}
```

## 5. Operational cautions

- Never commit `.env` or provider credentials.
- Use Vercel Preview environment variables that point to non-production Neon/Upstash resources.
- Configure Neon backups/restore retention and test a restore.
- Apply least-privilege database credentials and rotate credentials after exposure.
- Do not cache authorization decisions, secrets, or tenant-sensitive responses without tenant-scoped keys and explicit invalidation.
- Upstash Redis availability should not prevent core project metadata from being stored; avoid making Redis mandatory for writes.
