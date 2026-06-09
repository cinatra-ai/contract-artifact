# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
contract-artifact/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Build, typecheck, pack dry-run, kind gates
│       └── release.yml     # Release workflow
├── skills/
│   └── contract-matcher/
│       └── SKILL.md        # LLM classifier prompt for contract documents
├── src/
│   └── index.ts            # Sole TypeScript source — exports contractArtifactManifest
├── .npmrc                  # npm/pnpm registry config
├── LICENSE                 # Apache-2.0
├── README.md               # Package documentation
├── package.json            # NPM manifest + cinatra platform block
└── tsconfig.json           # Standalone strict TypeScript config
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source for the package's programmatic API
- Contains: A single entry point file exporting the artifact manifest
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: Cinatra platform skill definitions — one subdirectory per skill
- Contains: `SKILL.md` files discovered and executed by the Cinatra skill-runner
- Key files: `skills/contract-matcher/SKILL.md`

**`.github/workflows/`:**
- Purpose: CI/CD pipeline definitions
- Contains: `ci.yml` (baseline gate for all extracted extensions), `release.yml`
- Key files: `.github/workflows/ci.yml`

## Key File Locations

**Entry Points:**
- `src/index.ts`: TypeScript entry; exports `contractArtifactManifest` as `SemanticArtifactManifest`
- `package.json`: Platform entry; `cinatra` block declares artifact kind, MIME types, matcher skill, confidence threshold

**Configuration:**
- `tsconfig.json`: Standalone TypeScript config (ES2023, ESNext modules, `bundler` moduleResolution, emits to `dist/`)
- `.npmrc`: Registry/auth settings for pnpm
- `package.json`: Package identity, peer dependency on `@cinatra-ai/sdk-extensions`, cinatra platform metadata

**Core Logic:**
- `skills/contract-matcher/SKILL.md`: All classification logic lives here as an LLM prompt

**CI:**
- `.github/workflows/ci.yml`: Validates dependency shape, conditionally runs install/typecheck/test/pack based on whether first-party peers are present

## Naming Conventions

**Files:**
- TypeScript sources: `camelCase.ts` (e.g., `index.ts`)
- Skill prompts: `SKILL.md` (uppercase, fixed name — platform convention)
- Workflows: `kebab-case.yml`

**Directories:**
- Skill directories: `kebab-case` matching the skill name (e.g., `contract-matcher`)
- Source directory: `src/` (singular)

**Exports:**
- Manifest constant: `camelCase` noun phrase + `Manifest` suffix — `contractArtifactManifest`

## Where to Add New Code

**New skill matcher:**
- Create `skills/<skill-name>/SKILL.md` following the YAML frontmatter + Markdown prompt pattern in `skills/contract-matcher/SKILL.md`
- Register the skill in `src/index.ts` under `skills.matchers` and in `package.json` `cinatra.artifact.skills.matchers`

**New TypeScript export:**
- Add to `src/index.ts` or create additional files under `src/` and re-export from `src/index.ts`
- `package.json` `main` and `types` both point to `./src/index.ts`; no build step changes needed for new source files

**Adjust acceptance criteria:**
- MIME types: update `accepts.file.mimeTypes` in both `src/index.ts` and `package.json` `cinatra.artifact.accepts`
- Confidence threshold: update `matcherConfidenceThreshold` in both locations

## Special Directories

**`dist/`:**
- Purpose: TypeScript compiler output (`tsc` emits here per `tsconfig.json` `outDir`)
- Generated: Yes
- Committed: No (not present in repo; built by monorepo or `npm pack`)

**`.planning/`:**
- Purpose: GSD planning documents (codebase maps, phase plans)
- Generated: Yes (by GSD tooling)
- Committed: Per project convention

---

*Structure analysis: 2026-06-09*
