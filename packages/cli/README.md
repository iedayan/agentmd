# @agentmd-dev/cli

[![npm](https://img.shields.io/npm/v/@agentmd-dev/cli.svg)](https://www.npmjs.com/package/@agentmd-dev/cli) [![npm](https://img.shields.io/npm/dw/@agentmd-dev/cli.svg)](https://www.npmjs.com/package/@agentmd-dev/cli)

**AgentMD CLI** — Validate, score, discover, compose, and execute AGENTS.md files from the command line.

## Installation

```bash
pnpm add -g @agentmd-dev/cli
# or
npm install -g @agentmd-dev/cli
```

## Usage

```bash
# Check AGENTS.md validation and readiness score
agentmd check AGENTS.md

# Discover all AGENTS.md files in a project
agentmd discover .

# Compose AGENTS.md from fragments
agentmd compose .

# Execute commands (with safety checks)
agentmd run . --dry-run

# Export to GitHub Actions
agentmd export . --format github-actions
```

## Commands

- `check` — Validate and score AGENTS.md files
- `discover` — Find all AGENTS.md files in directory tree
- `compose` — Build AGENTS.md from fragments
- `run` — Execute commands with safety validation
- `export` — Convert to CI/CD formats (GitHub Actions)
- `doctor` — Diagnose project setup issues

## Examples

```bash
# Validate current directory
agentmd check .

# Check with detailed output
agentmd check . --verbose --contract

# Find all AGENTS.md files
agentmd discover . --recursive

# Execute with dry-run (safety first)
agentmd run . --dry-run --use-shell

# Export to GitHub Actions
agentmd export . --format github-actions > .github/workflows/agents.yml
```

## Global Options

- `--help` — Show help
- `--version` — Show version
- `--verbose` — Detailed output
- `--quiet` — Minimal output

## Safety

- Commands are validated for dangerous patterns
- Dry-run mode available for preview
- Permission-based execution control
- Sandboxed execution options

See [@agentmd-dev/core](https://www.npmjs.com/package/@agentmd-dev/core) for detailed API documentation.
