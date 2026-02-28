# AgentMD VS Code Extension

ESLint for AGENTS.md — real-time linting, validation, and scoring in the editor.

## Features

- **Real-time diagnostics** — AMD001–AMD012 rules (missing Build/Test, empty command, bad frontmatter, etc.)
- **Score badge** — Agent-readiness score in the status bar when editing AGENTS.md
- **Commands** — `AgentMD: Validate AGENTS.md`, `AgentMD: Show Score Breakdown`
- **Hover & completions** — Section documentation and quick inserts

## Installation

1. Build from source: `pnpm run build:vscode`
2. Run the Extension Development Host (F5) from the repo root
3. Or package: `cd packages/agentmd-vscode && pnpm run package`

## Usage

Open any `AGENTS.md` file. Diagnostics appear in the Problems view. The status bar shows the agent-readiness score. Use the command palette for `AgentMD: Show Score Breakdown`.

## Diagnostic Rules

| Code   | Severity | Description                          |
| ------ | -------- | ------------------------------------ |
| AMD001 | Error    | Missing ## Build                     |
| AMD002 | Error    | Missing ## Test                      |
| AMD003 | Warning  | Missing ## Lint                      |
| AMD004 | Error    | Empty command block                  |
| AMD005 | Warning  | No frontmatter                       |
| AMD006 | Error    | Invalid YAML                         |
| AMD007 | Warning  | Absolute path in command             |
| AMD009 | Warning  | Missing `name` in frontmatter        |
| AMD010 | Warning  | Missing `description` in frontmatter |
| AMD011 | Error    | Duplicate section                    |
