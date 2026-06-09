# Codebase Concerns

**Analysis Date:** 2026-06-09

## Tech Debt

**No lockfile committed:**
- Issue: `package.json` declares `peerDependencies` but no `pnpm-lock.yaml` or similar lockfile is committed. The CI workflow explicitly uses `--no-frozen-lockfile`, acknowledging this intentional gap. Resolution of transitive (or future) deps is non-deterministic across CI runs.
- Files: `package.json`, `.github/workflows/ci.yml` (line 81)
- Impact: If a dependency (even an indirect one added later) releases a breaking version, CI could silently consume it with no lockfile to pin the last-known-good state.
- Fix approach: Commit a lockfile once the repo is promoted to standalone (no first-party peer deps), or explicitly document the no-lockfile policy in README so it is a deliberate choice, not an oversight.

**`main` and `types` point to raw TypeScript source:**
- Issue: `package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"`. This means the published package ships raw `.ts` rather than compiled `.js` + `.d.ts`. Consumers with a non-TypeScript toolchain or strict module resolution cannot consume the package without additional configuration.
- Files: `package.json`
- Impact: Breaks standard Node.js consumers; only works inside the Cinatra monorepo where the host build pipeline compiles the source directly.
- Fix approach: Add a `build` script (e.g., `tsc`) and update `main`/`types` to point to `dist/index.js` and `dist/index.d.ts`. The `tsconfig.json` already has `outDir: "dist"` and `noEmit: false`, so the build step is already configured — it just is not wired into `package.json` exports.

**`strict: true` overridden by `noImplicitAny: false`:**
- Issue: `tsconfig.json` enables `"strict": true` but immediately overrides it with `"noImplicitAny": false`. `strict` subsumes `noImplicitAny`; disabling it post-hoc creates a misleading signal that the codebase is fully strict when it is not.
- Files: `tsconfig.json`
- Impact: Implicit `any` types can enter `src/` undetected, defeating part of the value of `strict` mode.
- Fix approach: Either remove `noImplicitAny: false` to enforce the full strict baseline, or document why `any` is intentionally permitted and consider using `unknown` with guards instead.

**`jsx: "react-jsx"` in a non-React package:**
- Issue: `tsconfig.json` sets `"jsx": "react-jsx"` and includes `"DOM"` and `"DOM.Iterable"` in `lib`. This package (`src/index.ts`) is a pure data manifest with no UI components or browser APIs.
- Files: `tsconfig.json`
- Impact: Dead configuration bloat; a future contributor may incorrectly assume React/browser code is intended. DOM types leak into the type environment, potentially masking server-side-only type errors.
- Fix approach: Remove `jsx` and the `DOM`/`DOM.Iterable` lib entries. Use `"lib": ["ES2023"]` for a pure Node/manifest package.

**Release workflow depends on org infrastructure that does not yet exist:**
- Issue: `.github/workflows/release.yml` explicitly states it is "Dormant until the org infra exists (the cinatra-ai/.github reusable workflow + the CINATRA_MARKETPLACE_VENDOR_TOKEN org secret)."
- Files: `.github/workflows/release.yml`
- Impact: Any GitHub Release created now will trigger the workflow and fail, producing a confusing error. There is no guard comment on the release event itself.
- Fix approach: Add a conditional in the workflow (e.g., check for the secret's existence) or document clearly in README that releases must not be cut until the org infrastructure is provisioned.

## Known Bugs

**No bugs detected** in the current surface area (single 23-line manifest file). The package is minimal enough that bugs are unlikely, but the `main`/`types` pointing to `.ts` source (see Tech Debt above) would surface as a runtime import failure for any non-monorepo consumer.

## Security Considerations

**`.npmrc` committed with registry configuration:**
- Risk: `.npmrc` is committed to the repository. Currently it only contains `auto-install-peers=false`, which is benign, but committing `.npmrc` creates a precedent; a future contributor might add an auth token (`//registry.npmjs.org/:_authToken=...`) to the same file and accidentally commit it.
- Files: `.npmrc`
- Current mitigation: File currently contains no secrets.
- Recommendations: Add a CI lint step (e.g., `grep -q '_authToken' .npmrc && exit 1`) or add a `.gitignore` note warning that auth tokens must never be added to the committed `.npmrc`.

**`secrets: inherit` in release workflow:**
- Risk: The release job passes all org secrets to the reusable workflow via `secrets: inherit`. If the reusable workflow at `cinatra-ai/.github` is ever compromised or its ref (`@main`) is tampered with, all inherited secrets are exposed.
- Files: `.github/workflows/release.yml`
- Current mitigation: Scoped to `release: [published]` event, reducing attack surface.
- Recommendations: Pin the reusable workflow to a SHA ref rather than `@main` to prevent supply-chain drift. When org infra is ready, enumerate only the specific secrets needed rather than using `secrets: inherit`.

## Performance Bottlenecks

**LLM matcher confidence threshold at 0.7 may cause borderline misclassifications:**
- Problem: The `matcherConfidenceThreshold` is set to `0.7`, and the SKILL.md guidance notes that contract templates with placeholders should return confidence `0.70–0.80`. This means a template just at the boundary (confidence = 0.70) passes, while one slightly below (e.g., 0.69 due to model variance) is rejected — a narrow margin for a structured document class.
- Files: `src/index.ts`, `skills/contract-matcher/SKILL.md`
- Cause: The LLM confidence scale for templates deliberately overlaps the threshold, making classification of borderline templates sensitive to minor model-output variance.
- Improvement path: Consider raising template confidence guidance to `0.75–0.85` in SKILL.md, or lowering the threshold to `0.65` for the template sub-case (if the platform supports per-subtype thresholds).

## Fragile Areas

**Manifest duplication between `src/index.ts` and `package.json`:**
- Files: `src/index.ts`, `package.json`
- Why fragile: The artifact definition (accepted MIME types, skill reference, confidence threshold) is duplicated verbatim in both files. A change in one (e.g., adding `application/vnd.openxmlformats-officedocument.wordprocessingml.document` for `.docx`) must be mirrored in the other manually. There is no code-generation or validation step to enforce consistency.
- Safe modification: Update both `src/index.ts` and the `cinatra.artifact` block in `package.json` together, then run `npm pack --dry-run` to confirm the package shape.
- Test coverage: No test asserts that the two representations agree.

**`.docx` explicitly excluded with no tracking issue:**
- Files: `src/index.ts` (comment on line 9)
- Why fragile: The comment "`.docx` is not in the LLM capability registry" explains the current exclusion but does not link to a tracking issue or roadmap item. When `.docx` support is added to the registry, there is no automated reminder to update this artifact's `mimeTypes`.
- Safe modification: Add a `// TODO:` comment or a GitHub Issue reference so the gap is discoverable.

## Scaling Limits

**Single-file package with no versioning strategy documented:**
- Current capacity: One artifact type, two MIME types, one skill.
- Limit: As the artifact gains more skills (e.g., extraction, summarization, redlining), the single `src/index.ts` manifest pattern may become unwieldy or require a breaking API version bump.
- Scaling path: Document a versioning policy (semver + `cinatra.apiVersion`) before publishing v1.0.0; establish whether adding skills is a minor or patch change.

## Dependencies at Risk

**`@cinatra-ai/sdk-extensions` pinned to `"*"` (any version):**
- Risk: The peer dependency uses `"*"` as the version range. Any future breaking change to `sdk-extensions` would silently be accepted by a consumer's package manager.
- Impact: Runtime or type-level breakage if `sdk-extensions` releases a major version with incompatible `SemanticArtifactManifest` shape.
- Files: `package.json`
- Migration plan: Once `sdk-extensions` reaches a stable API, narrow the peer range (e.g., `">=1.0.0 <2.0.0"`) to communicate compatibility expectations.

## Missing Critical Features

**No tests of any kind:**
- Problem: There are zero test files in the repository. No unit tests validate the manifest shape, no integration tests confirm the skill returns expected JSON, and no snapshot tests guard against accidental changes to the exported constant.
- Blocks: Confidence that manifest changes are non-breaking cannot be verified automatically.

**No build script:**
- Problem: `package.json` has no `build`, `prepare`, or `prepack` script. `tsconfig.json` is configured to emit to `dist/`, but no automation triggers it.
- Blocks: Reliable standalone distribution; `npm pack --dry-run` passes (it just packs source) but would ship raw `.ts` to consumers.

## Test Coverage Gaps

**Manifest shape not validated:**
- What is not tested: No test asserts that `contractArtifactManifest` satisfies the `SemanticArtifactManifest` interface at runtime (only at compile time via TypeScript), nor that the `package.json` `cinatra.artifact` block matches the exported constant.
- Files: `src/index.ts`, `package.json`
- Risk: A manual edit diverging the two representations would not be caught until the monorepo runs integration tests.
- Priority: Medium

**Skill prompt not tested against example documents:**
- What is not tested: `skills/contract-matcher/SKILL.md` defines classification rules but there are no fixture documents or golden-output tests exercising the LLM matcher against known-positive (NDA, MSA, SOW) and known-negative (policy, brief, proposal) inputs.
- Files: `skills/contract-matcher/SKILL.md`
- Risk: Prompt regressions (e.g., a rewrite that accidentally drops a negative example) would not be caught before deployment.
- Priority: High — matcher accuracy is the primary value of this artifact.

---

*Concerns audit: 2026-06-09*
