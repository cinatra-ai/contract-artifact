# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- `camelCase` for TypeScript source files: `src/index.ts`
- `UPPER_CASE.md` for skill definitions: `skills/contract-matcher/SKILL.md`
- `kebab-case` for directory names: `skills/contract-matcher/`

**Functions / Variables:**
- `camelCase` for exported consts: `contractArtifactManifest` (`src/index.ts`)
- Descriptive, noun-phrase names for manifest exports

**Types:**
- Imported via `import type` — enforced by `verbatimModuleSyntax: true` in `tsconfig.json`
- Type names follow PascalCase from external SDK: `SemanticArtifactManifest`

**Package naming:**
- Scoped under `@cinatra-ai/` for all first-party packages
- Skill identifiers use `<package>:<skill-name>` dotted namespace: `@cinatra-ai/contract-artifact:contract-matcher`

## Code Style

**Formatting:**
- Not detected — no `.prettierrc`, `.eslintrc`, or `biome.json` present
- Single-file codebase (`src/index.ts`) is 22 lines; style is implicit from tsconfig strictness

**TypeScript strictness (`tsconfig.json`):**
- `"strict": true` enabled
- `"noImplicitAny": false` — explicit carve-out for any-typed patterns
- `"verbatimModuleSyntax": true` — enforces `import type` for type-only imports
- `"isolatedModules": true` — each file must be independently compilable
- `"target": "ES2023"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`

**Module system:**
- ESM only (`"type": "module"` in `package.json`)
- No CommonJS

## Import Organization

**Order:**
1. Type imports with `import type` (enforced by `verbatimModuleSyntax`)
2. No runtime imports in the single source file

**Path Aliases:**
- Not detected — no path aliases configured in `tsconfig.json`

**Peer dependencies:**
- All first-party `@cinatra-ai/*` packages declared as **optional** `peerDependencies` with `peerDependenciesMeta.optional: true`
- NEVER in `dependencies`, `devDependencies`, or `optionalDependencies` — enforced by CI gate in `.github/workflows/ci.yml`

## Error Handling

- Not applicable — the package is a pure manifest/data definition with no runtime logic or error paths

## Logging

- Not applicable — no runtime code

## Comments

**When to Comment:**
- Block comments at the top of source files explain design decisions and constraints, e.g., why `.docx` is excluded, why 0.7 confidence threshold is used (`src/index.ts` lines 3–11)
- CI workflow files use inline `#` comments extensively to document skip logic and branching rationale (`.github/workflows/ci.yml`)

**JSDoc/TSDoc:**
- Not used — single exported const, self-documenting through types

## Function Design

**Exports:**
- Single named export per entry file: `export const contractArtifactManifest` (`src/index.ts`)
- No default exports

**Parameters:** Not applicable — no functions, only a const manifest object

## Module Design

**Exports:**
- `src/index.ts` is the sole module, referenced directly in `package.json` `"main"` and `"types"` fields
- No barrel files pattern needed at this scale

**Skill definitions:**
- Each skill lives in `skills/<skill-name>/SKILL.md`
- SKILL.md contains YAML front matter (`name`, `description`) followed by LLM prompt instructions
- Output contract is JSON with `{ matches: boolean, confidence: number, rationale: string }` — defined in prose within the SKILL.md

## Cinatra Artifact Manifest Pattern

The `package.json` `"cinatra"` block mirrors the TypeScript manifest export exactly — both declare the same `accepts`, `skills`, and `matcherConfidenceThreshold`. This duplication is intentional: the JSON block is machine-readable by the Cinatra platform without TypeScript compilation.

---

*Convention analysis: 2026-06-09*
