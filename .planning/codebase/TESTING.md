# Testing Patterns

**Analysis Date:** 2026-06-09

## Test Framework

**Runner:**
- Not detected — no test framework installed or configured
- No `jest.config.*`, `vitest.config.*`, or equivalent present
- No `test` script in `package.json`

**Run Commands:**
```bash
# No standalone test command defined.
# CI runs: corepack pnpm test --if-present
# Because this repo declares @cinatra-ai/* as optional peerDependencies,
# CI skips standalone testing entirely — the cinatra monorepo runs tests.
```

## Test File Organization

**Location:**
- No test files present in the repository
- `.github/workflows/ci.yml` documents that host-internal-peer repos have their tests run by the parent monorepo, not standalone

**Naming:**
- Not applicable — no test files exist

## Test Structure

The repo is a **source mirror** / extracted extension. It has no standalone test suite by design. The CI gate in `.github/workflows/ci.yml` explicitly skips the `Test` step when `first_party=1` (i.e., when any `@cinatra-ai/*` optional peer is declared):

```yaml
- name: Test
  run: |
    if [ "$first_party" = "1" ]; then
      echo "Skipping standalone tests (host-internal @cinatra-ai/* peers — the cinatra monorepo runs these)."
      exit 0
    fi
    corepack pnpm test --if-present
```

## Mocking

- Not applicable — no tests and no runtime logic to mock

## Fixtures and Factories

**Test Data:**
- Not applicable

## Coverage

**Requirements:** Not enforced — no test runner configured

## Test Types

**Unit Tests:**
- Not present in this repo; expected to live in the cinatra monorepo

**Integration Tests:**
- Not present

**E2E Tests:**
- Not present

## CI Validation Gates

Although no test suite exists, CI enforces two structural correctness gates:

**Dependency shape gate** (`.github/workflows/ci.yml`, `Classify repo` step):
- Fails if any `@cinatra-ai/*` package appears in `dependencies`, `devDependencies`, or `optionalDependencies`
- Fails if any first-party peer is missing `peerDependenciesMeta.optional: true`
- This is the primary correctness assertion for this repo type

**Pack dry-run gate** (`.github/workflows/ci.yml`, `Pack (dry run)` step):
- Runs `npm pack --dry-run` to validate package shape and publish payload without resolving peers
- Catches missing files, bad `main`/`types` references, or malformed `package.json`

**Kind-specific gate** (`.github/workflows/ci.yml`, `kind-gates` job):
- For `artifact` kind: no extra gate currently applied (placeholder step only)
- For `workflow`/`agent` kinds: `extension-kind-gate.mjs` would be appended by the extraction script

## Skill Testing Approach

The `skills/contract-matcher/SKILL.md` defines an LLM classifier. Testing of classifier accuracy and confidence thresholds is handled in the monorepo, not here. The SKILL.md itself encodes the expected output contract:

```json
{ "matches": <boolean>, "confidence": <number 0..1>, "rationale": "<short explanation>" }
```

Confidence bands are documented in the skill prompt and serve as the behavioral specification for any future regression tests.

---

*Testing analysis: 2026-06-09*
