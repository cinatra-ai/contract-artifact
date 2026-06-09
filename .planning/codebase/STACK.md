# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript — `src/index.ts`, compiled to ESNext/ES2023 targeting the `dist/` output

**Secondary:**
- Not applicable (no secondary language detected)

## Runtime

**Environment:**
- Node.js 24 (as specified in `.github/workflows/ci.yml`)

**Package Manager:**
- pnpm (via corepack) — `corepack pnpm install`
- Lockfile: not committed (CI runs `--no-frozen-lockfile`)

## Frameworks

**Core:**
- None — this is a pure manifest/declaration package with a single TypeScript export

**Testing:**
- Not detected (no test framework configured; monorepo runs tests when integrated)

**Build/Dev:**
- TypeScript compiler (`tsc`) — config at `tsconfig.json`
- Target: ES2023, module: ESNext, moduleResolution: bundler
- Outputs to `dist/` with declarations and source maps enabled

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` — optional peer dependency providing `SemanticArtifactManifest` type; consumed in `src/index.ts`; resolved only within the Cinatra monorepo, never published to an external registry

**Infrastructure:**
- No runtime dependencies (zero `dependencies`, `devDependencies`, or `optionalDependencies`)

## Configuration

**Environment:**
- No `.env` file detected
- No environment variables required at build or runtime

**Build:**
- `tsconfig.json` — standalone strict TypeScript config, targets `src/`, outputs `dist/`
- `package.json` — Cinatra artifact manifest embedded under the `cinatra` key (apiVersion `cinatra.ai/v1`, kind `artifact`)
- `.npmrc` — present (existence noted; contents not read)

## Platform Requirements

**Development:**
- Node.js 24, corepack/pnpm
- Must be consumed inside the Cinatra monorepo for typecheck and test (host-internal peer `@cinatra-ai/sdk-extensions` is not on any public registry)

**Production:**
- Published to `registry.cinatra.ai` (Cinatra Marketplace) via the reusable release workflow at `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`
- Package shape validated via `npm pack --dry-run` in CI

---

*Stack analysis: 2026-06-09*
