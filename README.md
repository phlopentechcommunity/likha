# LIKHA — Project-to-Helm Factory

LIKHA turns Git repositories into versioned container images and Helm charts.
This repository is a production-oriented starter implementation. It includes:
- Next.js App Router portal
- PostgreSQL schema (Prisma)
- API endpoints for project registration, build dispatch, and scan ingestion
- GitHub Actions reusable pipeline
- Hybrid chart templates
- Kubernetes deployment baseline

## Architecture

1. User registers a GitHub/GitLab/Gitea repository.
2. LIKHA stores source metadata and dispatches a GitHub Actions workflow.
3. GitHub Actions checks out source, detects the project, builds an image, scans it,
   generates an SBOM, generates/validates a chart, and publishes OCI artifacts.
4. The workflow posts signed, authenticated scan/build metadata to LIKHA.
5. The portal displays project, release, image, chart and vulnerability data.

## Important production boundaries

- GitHub Actions is the build executor. LIKHA does not execute untrusted project code.
- Use GitHub App installation tokens or fine-grained tokens with least privilege.
- Never accept arbitrary workflow file paths or shell fragments from users.
- Build untrusted repositories on isolated ephemeral runners. Do not mount cluster
  credentials or privileged host paths into build jobs.
- Keep GHCR packages private by default; publish public packages only by explicit policy.
- Scan results are time-stamped and digest-bound. A scan is not a permanent guarantee.
- Generated charts are candidates. Require review/approval before production publication.
- Configure OIDC, Cosign keyless signing, protected environments and branch protection.
- The included manifests are a baseline; adapt resource limits, network policies,
  ingress annotations, backups, TLS and secret integration to the target cluster.

## Local development

Requirements: Node.js 22+ and npm. For hosted deployments use Neon PostgreSQL and Upstash Redis; local PostgreSQL/Redis are optional if you supply compatible connection credentials.

```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev
npm run dev
```

For Vercel + Neon + Upstash provisioning, environment variables, pooled connections, migrations, and health checks, see [docs/vercel-neon-upstash.md](docs/vercel-neon-upstash.md).

The UI is available at http://localhost:3000.

## Environment

See `.env.example`. Set `DATABASE_URL` to the Neon pooled connection string and `DIRECT_URL` to the Neon direct connection string. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the Upstash Vercel Marketplace integration. `INTERNAL_API_TOKEN` authenticates workflow callbacks.
`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_APP_INSTALLATION_ID` are
used by the production GitHub App integration. The starter's dispatch endpoint
supports GitHub `workflow_dispatch` using a token; replace it with installation
token minting before production if not already configured.

## GitHub integration

The workflow runs from the trusted LIKHA workflow repository and clones the
registered Git source URL. Public Git repositories work without a read token.
For private GitHub/GitLab/Gitea repositories, configure `SOURCE_GIT_USERNAME` and
`SOURCE_READ_TOKEN` as scoped repository/environment secrets in the workflow
repository. For a multi-tenant production service, replace these shared secrets
with short-lived provider credentials retrieved from a vault per project.
The workflow dispatch payload includes
`project_id`, `callback_url`, `image_name`, and `chart_name`.

Configure repository/org secrets:
- `LIKHA_API_URL`
- `LIKHA_CALLBACK_TOKEN`
- `GHCR_OWNER` (lowercase GitHub owner/org)
- `GHCR_TOKEN` only if `GITHUB_TOKEN` cannot publish the target package

Prefer `GITHUB_TOKEN` with `packages: write` for packages owned by the workflow
repository. For cross-repository publishing, use a narrowly scoped GitHub App token.

## Deployment

Build and publish the application image, create Kubernetes Secrets from an external
secret manager, then apply `deploy/kubernetes/`. Update the image reference and
Ingress class/domain. The default host is `likha.phlopentech.org`.

## API overview

- `POST /api/projects` — register a repository
- `GET /api/projects` — list projects
- `POST /api/projects/:id/build` — dispatch a GitHub Actions workflow
- `POST /api/webhooks/github` — receive GitHub webhook events (signature checked)
- `POST /api/internal/scan-results` — ingest workflow result (bearer token)
- `GET /api/projects/:id` — project details and latest scans/releases

## Release policy

Default policy blocks publication on Critical vulnerabilities. High findings are
reported and may be configured to block through `BLOCK_HIGH=true`. Exceptions must
be explicit, time-bound, and auditable. Do not silently suppress CVEs.
