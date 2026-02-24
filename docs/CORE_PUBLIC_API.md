# @agentmd/core Public API Surface

This document defines the stable public API surface for `@agentmd/core` as of `0.1.x`.

## Stability Levels

- Stable: covered by semver guarantees (`docs/SEMVER_POLICY.md`)
- Experimental: public but may change in minor releases
- Internal: not guaranteed; consumers should avoid direct dependency

## Stable Exports

Core parse/validate/discovery:

- `parseAgentsMd`
- `findSection`
- `extractCommands`
- `getSuggestedExecutionOrder`
- `validateAgentsMd`
- `computeAgentReadinessScore`
- `discoverAgentsMd`
- `findNearestAgentsMd`
- `parseFrontmatter`
- `parseDirectives`
- `getDirectiveTarget`
- `getDirectivePriority`

Composition and CI:

- `discoverFragments`
- `loadComposeConfig`
- `composeAgentsMd`
- `exportToGitHubActions`

Execution:

- `isCommandSafe`
- `isCommandAllowed`
- `requiresShellFeatures`
- `planCommandExecutions`
- `executeCommand`
- `executeCommands`
- `executeCommandsParallel`

Marketplace verification core:

- `computeTrustScore`
- `isCertified`
- `SECURITY_CHECKLIST`

Shared types:

- `ParsedAgentsMd`
- `ExtractedCommand`
- `CommandType`
- `ValidationResult`
- `DiscoveredAgentsMd`
- `ExecutionResult`
- `ExecutorOptions`
- `CommandExecutionPlan`
- `CommandExecutionPlanItem`

## Experimental / No-Semver-Guarantee

The following modules are exported but currently treated as experimental:

- `enterprise/*` APIs (RBAC/license/policy/approval/audit helpers)
- `marketplace/*` APIs outside trust verification primitives

These are intended for first-party platform evolution and may change before `1.0.0`.

## API Freeze Enforcement

The test `packages/core/src/__tests__/public-api-surface.test.ts` enforces presence of stable exports.
If stable exports change, update this document and changelog in the same PR.
