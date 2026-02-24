# Semantic Versioning Policy

AgentMD follows SemVer with additional rules for pre-1.0 development.

## Versioning Rules

- Patch (`x.y.Z`): bug fixes, non-breaking internal improvements
- Minor (`x.Y.z`): new backward-compatible features
- Major (`X.y.z`): breaking changes to stable public APIs

## Pre-1.0 Clarification (`0.x`)

During `0.x`, we still treat the documented stable API in `docs/CORE_PUBLIC_API.md` as compatibility-sensitive:

- Breaking changes to stable APIs should be rare and clearly documented.
- If unavoidable, they must be called out in `CHANGELOG.md` and migration notes.

## Experimental APIs

APIs marked experimental/internal are excluded from strict semver guarantees and may change in minor releases.

## Release Checklist (SemVer)

Before release:

1. Update `CHANGELOG.md` (`Unreleased` -> versioned section)
2. Validate stable API docs and tests
3. Run:
   - `pnpm run lint`
   - `pnpm run test`
   - `pnpm run build`
