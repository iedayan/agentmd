# AgentMD Installation & Usage

Installation options and full CLI reference for AgentMD.

## Installation status

| Method | Status | Notes |
|--------|--------|-------|
| From source | ✅ Available | Clone, build, run via `pnpm run agentmd --` |
| GitHub Action | ✅ Available | No install in CI; action builds and runs |
| npx / npm | 🔜 Not yet published | `@agentmd/cli` will be published at first release |

## Installation

### Option 1: From source (recommended)

Clone the repo and build:

```bash
git clone https://github.com/agentmd/agentmd.git
cd agentmd
pnpm install
pnpm run build:core
pnpm run build:cli
# Or build everything: pnpm run build
```

Run via the workspace script (use `--` before path/options):

```bash
pnpm run agentmd -- check . --contract
pnpm run agentmd -- init .
pnpm run agentmd -- improve . --apply
```

### Option 2: GitHub Action (CI)

Use the composite action in your workflow — no manual install required:

```yaml
# Pin to immutable SHA for security
- uses: iedayan/agentmd/.github/actions/agentmd@7f23caa9a688230815368fc07716828884479cad
  with:
    command: check
    contract: "true"
    path: .
```

The action checks out AgentMD, runs `pnpm install`, builds core + CLI, then executes your command. See [.github/actions/agentmd/README.md](../.github/actions/agentmd/README.md) for details.

### Option 3: npx (when published)

Once `@agentmd/cli` is published to npm:

```bash
npx @agentmd/cli validate .
npx @agentmd/cli init .
```

### Option 4: Global install (when published)

```bash
npm install -g @agentmd/cli
# or
pnpm add -g @agentmd/cli
```

Then run directly: `agentmd check . --contract`

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `init [path]` | Create AGENTS.md (auto-detects Node.js, Python, Rust, Go). Use `--template` to override. |
| `doctor [path]` | Diagnose AGENTS.md quality, runnable commands, and next steps. |
| `check [path]` | Validate AGENTS.md. Flags: `--contract`, `--output <file>`, `--json`. |
| `validate [path]` | Alias for `check [path]`. |
| `improve [path]` | Self-improve AGENTS.md from validation feedback. Use `--apply` to write changes. |
| `discover [path]` | Find all AGENTS.md files in the repo. |
| `parse [path]` | Parse and show structure (sections, commands). |
| `compose [path]` | Build AGENTS.md from fragments (`**/agents-md/**/*.md`, `**/*.agents.md`). |
| `run [path] [types]` | Execute commands. Flags: `--dry-run`, `--use-shell`, `--json`. |
| `score [path]` | Agent-readiness score (0–100). Use `--json` for machine output. |
| `export [path]` | Generate GitHub Actions workflow YAML. |
| `help` | Show help. |

### Common options

- `path` — Directory or path to AGENTS.md (default: `.`)
- `--json`, `-j` — Machine-readable output (validate, score, improve, parse)
- `--apply`, `-a` — For `improve`: write changes to file (default: preview only)
- `--dry-run` — For `run`: preview execution without running
- `--use-shell` — For `run`: allow shell operators (`|`, `&&`, redirects)
- `--template`, `-t` — For `init`: force template (node, python, rust, go, generic)

---

## Quick workflow

```bash
# 1. Create AGENTS.md
agentmd init .

# 2. Diagnose and improve
agentmd doctor .
agentmd improve . --apply

# 3. Validate and score
agentmd check . --contract
agentmd score .

# 4. Preview and run
agentmd run . --dry-run
agentmd run . test
```

## Pre-commit Contract Hook

Enable local pre-commit enforcement:

```bash
pnpm run hooks:install
```

This installs `.githooks/pre-commit` and runs:

```bash
agentmd check . --contract
```

---

## Requirements

- **Node.js** ≥ 20
- **pnpm** (when installing from source)
