# AgentMD VS Code Extension

ESLint for AGENTS.md — real-time linting, validation, scoring, and productivity features in the editor.

## Features

### 🔍 Real-time Diagnostics
- **Live Validation**: AMD001–AMD012 rules (missing Build/Test, empty command, bad frontmatter, etc.)
- **Smart Error Detection**: Syntax errors, missing contracts, dangerous commands
- **Warning System**: Best practices and improvement suggestions
- **Visual Indicators**: Color-coded diagnostics in Problems view

### 📊 Agent-readiness Scoring
- **Live Score Badge**: Real-time 0-100 score in status bar
- **Detailed Breakdown**: Click status bar for scoring factors
- **Progress Tracking**: Monitor improvements over time

### ⚡ Productivity Features
- **Template Library**: Insert 17 framework templates instantly
- **Keyboard Shortcuts**: Quick access to common actions
- **Command Palette Integration**: Full VS Code command support
- **Dry-run Execution**: Preview commands without running
- **Interactive Prompts**: Guided next steps when files exist

### 🎯 Smart Assistance
- **Auto-completion**: Context-aware suggestions
- **Quick Fixes**: One-click error resolution
- **Hover Documentation**: Section information and guidance

## Installation

1. **From VS Code Marketplace**: Search "AgentMD" and install
2. **Build from source**: `pnpm run build:vscode`
3. **Development**: Run Extension Development Host (F5) from repo root
4. **Package**: `cd packages/agentmd-vscode && pnpm run package`

## Usage

Open any `AGENTS.md` file. Diagnostics appear in Problems view. The status bar shows the agent-readiness score. Use command palette for full feature access.

### Commands
- **`AgentMD: Validate AGENTS.md`**: Run full validation (`Ctrl+Shift+V`)
- **`AgentMD: Show Score Breakdown`**: View detailed scoring (`Ctrl+Shift+S`)
- **`AgentMD: Create from Template`**: Insert framework template
- **`AgentMD: Dry Run Execution`**: Preview commands safely

### Templates Available
- **Frontend**: React, Vue, Svelte, Astro, Next.js, Remix, Nuxt
- **Backend**: FastAPI, Express, NestJS
- **Languages**: Node.js, Python, Rust, Go
- **Frameworks**: Django, Rails
- **General**: Monorepo, Generic

## Configuration

```json
{
  "agentmd.diagnostics.enabled": true,
  "agentmd.diagnostics.debounceMs": 300,
  "agentmd.score.showInStatusBar": true,
  "agentmd.autoValidate": true,
  "agentmd.showStatusBar": true,
  "agentmd.enableRealTime": true
}
```

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
| AMD012 | Error    | Dangerous command without safeguards   |

## Workflow Integration

### Development Workflow
1. **Initialize**: `agentmd init . --template [framework]`
2. **Edit**: Real-time validation and scoring in VS Code
3. **Validate**: `Ctrl+Shift+V` for comprehensive check
4. **Score**: `Ctrl+Shift+S` for agent-readiness breakdown
5. **Preview**: Dry-run execution before commit

### Team Collaboration
- **Consistent Validation**: Same rules across entire team
- **Template Sharing**: Standardized project setups
- **Quality Metrics**: Track agent-readiness over time
