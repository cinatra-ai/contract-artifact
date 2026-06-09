# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Marketplace / Registry:**
- Service: `registry.cinatra.ai` — the Cinatra extension marketplace registry
- Role: publish destination for this artifact package on GitHub Release
- Auth: `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret (inherited in `.github/workflows/release.yml`)
- Submission path: MCP proxy saga (`extension-submit-for-review` → approve → promotion), not a direct Verdaccio publish

**Cinatra Monorepo (cinatra-ai/.github):**
- Reusable release workflow: `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`
- Provides build provenance attestation (GitHub OIDC `id-token: write`, `attestations: write`)

## Data Storage

**Databases:**
- Not applicable — this is a pure declaration/manifest package with no runtime data access

**File Storage:**
- Not applicable

**Caching:**
- Not applicable

## Authentication & Identity

**Auth Provider:**
- GitHub Actions OIDC — used for build-provenance attestation in the release workflow (`.github/workflows/release.yml`)
- `CINATRA_MARKETPLACE_VENDOR_TOKEN` — org-level secret for marketplace submission; inherited via `secrets: inherit`

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- CI step stdout only (GitHub Actions log); no application-level logging

## CI/CD & Deployment

**Hosting:**
- Cinatra Marketplace (`registry.cinatra.ai`) upon release promotion

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` — runs on push/PR to `main`; jobs: `build` (classify, install, typecheck, test, pack dry-run) and `kind-gates` (no extra gate for `artifact` kind)
  - `.github/workflows/release.yml` — triggered on published GitHub Release or manual `workflow_dispatch` against a tag; delegates entirely to the central reusable workflow

## Environment Configuration

**Required env vars:**
- None at runtime
- `CINATRA_MARKETPLACE_VENDOR_TOKEN` — required only during the GitHub Actions release job (org secret, not a local env var)

**Secrets location:**
- GitHub org-level secrets (not stored in this repo)

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable — extension submission is push-based via the marketplace MCP proxy, not a webhook

---

*Integration audit: 2026-06-09*
