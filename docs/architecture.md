# Architecture and trust boundaries

## Components
- Web: Next.js UI and REST endpoints.
- PostgreSQL: project, build, release, scan and vulnerability metadata.
- Redis: asynchronous orchestration queue (worker integration point).
- GitHub Actions: isolated build and scan executor.
- GHCR: OCI image and chart artifact store.
- Keycloak: OIDC identity provider (production integration point).

## Trust boundaries
1. Source repositories are untrusted input.
2. Build jobs execute outside the application cluster on isolated runners.
3. Build runners receive only scoped package-write and callback credentials.
4. Callback API accepts only authenticated, schema-validated data.
5. Artifacts are immutable and referenced by digest.
6. Private projects require authorization at every read and download endpoint.

## Production hardening still required
- Complete Keycloak OIDC/RBAC middleware and tenant authorization.
- GitHub App installation-token minting and repository installation flow.
- GitLab/Gitea provider adapters and credential vault integration.
- Durable queue worker, retries, idempotency keys and workflow run reconciliation.
- Digest extraction, chart provenance, Cosign verification and admission policy.
- Scan ingestion of both image and rendered-chart findings.
- Retention policies, PostgreSQL backups/PITR, Redis HA and audit logs.
- Rate limiting, CSRF protection, request size limits and security headers.
- Integration tests, threat modeling, load tests and disaster recovery exercise.
