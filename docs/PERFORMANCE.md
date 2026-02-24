# Performance and Compatibility

## Compatibility Guarantees

- Node.js: `>=20` (officially supported)
- Package manager: `pnpm` workspace workflow
- Platforms: macOS, Linux, Windows (CLI); dashboard validated in Node runtime

## Performance Notes

`@agentmd/core` is optimized for instruction-file workflows:

- Fast parse/validate loops for CI gating
- Preflight planning (`planCommandExecutions`) for deterministic execution readiness
- Safety checks are regex-based and linear in command length

## Reproducible Benchmark

Run:

```bash
pnpm --filter @agentmd/core run build
pnpm --filter @agentmd/core run bench
```

The benchmark script prints:

- average ms/operation
- operations per second
- Node version used

Benchmark scope:

- `parseAgentsMd`
- `validateAgentsMd`
- `planCommandExecutions`
- `isCommandSafe`

## Benchmark Interpretation

- Compare runs on the same machine before/after changes.
- Treat cross-machine comparisons as directional, not absolute.
- Regressions >10% on core parse/validate hot paths should be investigated.
