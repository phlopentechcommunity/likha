# API contract

## POST /api/projects
Register a source project. Accepts source URL, provider, ref, visibility,
chart strategy and workload template kind.

## GET /api/projects
Lists projects. Production must scope results by authenticated tenant and
visibility; the starter endpoint is intentionally minimal.

## POST /api/projects/{id}/build
Dispatches the configured GitHub Actions workflow.

## POST /api/internal/scan-results
Bearer-authenticated callback. Persists release, scan and CVE records.
Production should add replay protection, idempotency, signature/digest checks,
payload limits and separate image/config scan records.
