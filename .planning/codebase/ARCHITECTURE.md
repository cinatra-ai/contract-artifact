<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Cinatra Monorepo (host environment)             │
│  Resolves @cinatra-ai/sdk-extensions peer, runs tests        │
└──────────────────────────┬──────────────────────────────────┘
                           │ optional peer
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           @cinatra-ai/contract-artifact (this repo)          │
│                                                              │
│  src/index.ts                                                │
│  └── contractArtifactManifest (SemanticArtifactManifest)     │
│       ├── accepts: text/markdown, application/pdf            │
│       ├── skills.matchers: contract-matcher                  │
│       └── matcherConfidenceThreshold: 0.7                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ references
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           skills/contract-matcher/SKILL.md                   │
│  LLM prompt: classifies document as legal contract           │
│  Output: { matches, confidence, rationale }                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact manifest | Declares accepted MIME types, matcher skill reference, confidence threshold | `src/index.ts` |
| contract-matcher skill | LLM prompt that classifies a document as a legal contract | `skills/contract-matcher/SKILL.md` |
| package.json cinatra block | Machine-readable duplicate of the artifact manifest used by the Cinatra platform at install time | `package.json` |

## Pattern Overview

**Overall:** Cinatra semantic artifact extension — a source-mirror package extracted from the Cinatra monorepo.

**Key Characteristics:**
- Single exported constant (`contractArtifactManifest`) typed against `SemanticArtifactManifest` from `@cinatra-ai/sdk-extensions`
- Skill-based classification: no runtime code — matching logic lives entirely in the LLM prompt at `skills/contract-matcher/SKILL.md`
- `@cinatra-ai/sdk-extensions` is an optional peer dependency; the monorepo provides it. This repo is not standalone-installable
- Confidence threshold of 0.7 gates whether the matcher result is accepted by the platform

## Layers

**Manifest Layer:**
- Purpose: Declare artifact identity and capabilities to the Cinatra platform
- Location: `src/index.ts`, `package.json` (`cinatra` block)
- Contains: A single exported `SemanticArtifactManifest` object
- Depends on: `@cinatra-ai/sdk-extensions` (type-only import)
- Used by: Cinatra platform host / monorepo workspace

**Skill Layer:**
- Purpose: Provide the LLM classifier prompt for contract document detection
- Location: `skills/contract-matcher/SKILL.md`
- Contains: Structured prompt with positive/negative classification rules and confidence guidance
- Depends on: Cinatra platform skill-runner (external, not in this repo)
- Used by: Platform at match-time when a file is submitted to this artifact type

## Data Flow

### Primary Classification Path

1. User submits a `text/markdown` or `application/pdf` file to the Cinatra platform
2. Platform resolves the artifact type from `package.json` (`cinatra.artifact`) and checks `accepts.file.mimeTypes`
3. Platform invokes the `@cinatra-ai/contract-artifact:contract-matcher` skill with the file bytes
4. LLM evaluates the file against the rules in `skills/contract-matcher/SKILL.md`
5. LLM returns `{ matches: boolean, confidence: number, rationale: string }` as raw JSON
6. Platform compares `confidence` against `matcherConfidenceThreshold: 0.7`; routes accordingly

### Manifest Export Path

1. Monorepo workspace imports `@cinatra-ai/contract-artifact`
2. `src/index.ts` exports `contractArtifactManifest` typed as `SemanticArtifactManifest`
3. Host uses manifest programmatically for registration or SDK integration

**State Management:**
- Stateless. No runtime state, no database, no session. Pure declaration + LLM prompt.

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: Platform interface type describing what file types an artifact accepts and which skills classify it
- Examples: `src/index.ts` (sole implementation)
- Pattern: Single exported const satisfying the interface; duplicate declared in `package.json` `cinatra` block

**SKILL.md:**
- Purpose: Convention-over-configuration LLM prompt file; the Cinatra platform discovers and runs it by path `skills/<name>/SKILL.md`
- Examples: `skills/contract-matcher/SKILL.md`
- Pattern: YAML frontmatter (`name`, `description`) followed by structured Markdown prompt with explicit output JSON contract

## Entry Points

**TypeScript entry point:**
- Location: `src/index.ts`
- Triggers: Imported by monorepo host or SDK consumers
- Responsibilities: Exports `contractArtifactManifest`

**Platform manifest entry point:**
- Location: `package.json` (`cinatra` block)
- Triggers: Read by Cinatra platform tooling at install/registration time
- Responsibilities: Declares `apiVersion`, `kind: "artifact"`, MIME type acceptance, matcher skill reference, confidence threshold

**Skill entry point:**
- Location: `skills/contract-matcher/SKILL.md`
- Triggers: Invoked by Cinatra platform skill-runner when classifying a submitted document
- Responsibilities: Instructs LLM to output `{ matches, confidence, rationale }`

## Architectural Constraints

- **Threading:** Not applicable — no runtime process; pure declaration + prompt
- **Global state:** None
- **Circular imports:** None (single source file, one type-only import)
- **Peer dependency:** `@cinatra-ai/sdk-extensions` is optional peer; repo cannot be standalone typechecked or tested without the monorepo resolving it. CI explicitly skips install/typecheck/test for this reason (see `.github/workflows/ci.yml`)
- **MIME scope:** Only `text/markdown` and `application/pdf` accepted; `.docx` explicitly excluded (not in LLM capability registry per `src/index.ts` comment)

## Anti-Patterns

### Promoting first-party deps out of peerDependencies

**What happens:** Moving `@cinatra-ai/*` packages into `dependencies` or `devDependencies`
**Why it's wrong:** These packages exist only in the Cinatra monorepo and are never published to any registry; standalone install would fail
**Do this instead:** Keep all `@cinatra-ai/*` / `@cinatra/` packages as `peerDependencies` with `peerDependenciesMeta[pkg].optional: true` — CI enforces this in `.github/workflows/ci.yml`

### Hardcoding classification logic in TypeScript

**What happens:** Embedding contract-detection rules as code rather than in `SKILL.md`
**Why it's wrong:** The platform's skill-runner is the execution environment; TypeScript in this repo has no runtime
**Do this instead:** All classification rules belong in `skills/contract-matcher/SKILL.md`

## Error Handling

**Strategy:** Not applicable at the library level. The skill returns a structured JSON response with a `confidence` number; the platform enforces the threshold (0.7). No try/catch or error types are defined in this repo.

**Patterns:**
- LLM outputs below threshold are rejected by the platform (not by code in this repo)
- CI fails hard (`exit 1`) if first-party dependency shape is wrong (see `.github/workflows/ci.yml`)

## Cross-Cutting Concerns

**Logging:** None — stateless package
**Validation:** Performed by CI (`ci.yml` `Classify repo + validate first-party dep shape` step)
**Authentication:** Not applicable

---

*Architecture analysis: 2026-06-09*
