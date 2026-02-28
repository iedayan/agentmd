# AgentMD GitHub Action

CI/CD control plane for AI agents. Validate or execute `AGENTS.md` in your pipeline.

## How it works

The action checks out the AgentMD repo, installs dependencies, builds core + CLI, then runs your command. No manual install required — add the step and it runs.

1. Checkout AgentMD to `.agentmd-src`
2. Setup pnpm + Node.js (with cache)
3. `pnpm install --frozen-lockfile` and build
4. Execute `agentmd <command>` against your workspace

## Usage

### Check AGENTS.md (recommended for CI)

```yaml
- uses: iedayan/agentmd/.github/actions/agentmd@main
  with:
    command: check
    path: .
    contract: 'true'
```

### Score (agent-readiness 0–100)

```yaml
- uses: iedayan/agentmd/.github/actions/agentmd@main
  with:
    command: score
    path: .
```

Outputs `score` for use in later steps. See `.github/workflows/agentmd-pr-score.yml.example` for posting the score to PRs.

### Run commands (dry-run by default)

```yaml
- uses: iedayan/agentmd/.github/actions/agentmd@main
  with:
    command: run
    path: .
    dry-run: 'true' # preview only, no execution (default)
    use-shell: 'false' # set true for commands with |, &&, etc.
```

### Execute for real

```yaml
- uses: iedayan/agentmd/.github/actions/agentmd@main
  with:
    command: run
    path: .
    dry-run: 'false'
```

## Inputs

| Input             | Description                                   | Default |
| ----------------- | --------------------------------------------- | ------- |
| `command`         | `check`, `validate`, `run`, or `score`        | `check` |
| `path`            | Path to repo root (containing AGENTS.md)      | `.`     |
| `contract`        | For check/validate: require `output_contract` | `false` |
| `output`          | For check/validate: output file to validate   | `""`    |
| `dry-run`         | For run: preview only                         | `true`  |
| `use-shell`       | For run: allow shell operators                | `false` |
| `fail-on-warning` | For check: exit 1 if there are warnings       | `false` |

## Example workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  agentmd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check AGENTS.md contract
        uses: iedayan/agentmd/.github/actions/agentmd@main
        with:
          command: check
          contract: 'true'
```

## See also

- [Installation & CLI reference](../../../docs/INSTALL.md) — Full install options and all commands
