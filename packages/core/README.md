# @agentmd-dev/agentmd-core

**State-of-the-art AGENTS.md runtime** — Parse, validate, discover, compose, and execute agent instructions.

Implements the [AGENTS.md standard](https://agents.md) with production-grade safety, policy integration, and best-practice validation.

## Installation

```bash
pnpm add @agentmd-dev/agentmd-core
# or
npm install @agentmd-dev/agentmd-core
```

## Features

- **Parse** — YAML frontmatter, markdown directives, sections, commands
- **Validate** — Schema checks, command safety, permission validation, readiness scoring
- **Discover** — Find AGENTS.md files (monorepo-aware, nearest resolution)
- **Compose** — Build from fragments (`**/agents-md/**/*.md`, `**/*.agents.md`)
- **Execute** — Sandboxed runners with permission boundaries and policy integration
- **Export** — CI/CD (GitHub Actions) generation

## Quick Start

```typescript
import {
  parseAgentsMd,
  validateAgentsMd,
  extractCommands,
  executeCommand,
  computeAgentReadinessScore,
} from "@agentmd-dev/agentmd-core";

const content = `
## Build
\`pnpm run build\`

## Test
\`pnpm test\`
`;

const parsed = parseAgentsMd(content);
const validation = validateAgentsMd(parsed);
const score = computeAgentReadinessScore(parsed);

if (validation.valid) {
  const cmd = parsed.commands[0];
  const result = await executeCommand(cmd, { sandbox: true });
  console.log(result.success ? "OK" : result.stderr);
}
```

## API

### Parsing

- `parseAgentsMd(content, filePath?)` — Parse AGENTS.md into structured sections and commands
- `findSection(parsed, title)` — Find section by title (case-insensitive, partial match)
- `parseFrontmatter(content)` — Extract YAML frontmatter
- `parseDirectives(content)` — Extract `<!-- agents-md: key=value -->` directives

### Commands

- `extractCommands(content, sections)` — Extract executable commands from content
- `getSuggestedExecutionOrder(commands)` — Order by install → build → test → deploy

### Validation

- `validateAgentsMd(parsed)` — Validate against schema and best practices
- `validateAgentsMd(parsed, { requireOutputContract: true })` — Enforce required `output_contract`
- `computeAgentReadinessScore(parsed)` — Score 0–100 for agent readiness
- `validateOutputAgainstContract(parsed, outputContent)` — Validate agent output payload against `output_contract`

### Discovery

- `discoverAgentsMd(rootDir, options?)` — Find all AGENTS.md files
- `findNearestAgentsMd(filePath)` — Resolve nearest AGENTS.md (like .gitignore)

### Composition

- `discoverFragments(rootDir, config)` — Find fragment files
- `composeAgentsMd(rootDir, config)` — Compose AGENTS.md from fragments

### Execution

- `executeCommand(cmd, options)` — Execute a single command
- `executeCommands(commands, options)` — Execute multiple commands sequentially
- `executeCommandsParallel(commands, options)` — Execute independent commands in parallel
- `isCommandSafe(command)` — Check for dangerous patterns
- `isCommandAllowed(command, permissions)` — Check permission boundaries

### CI Export

- `exportToGitHubActions(parsed, options)` — Generate GitHub Actions workflow YAML

## Best Practices (Built-in)

The validator enforces [AGENTS.md best practices](https://agentsmd.io/agents-md-best-practices):

- **Brevity** — Warns when file exceeds 150 lines
- **Structure** — Recommends sections (Testing, Build, PR guidelines)
- **Commands** — Suggests 3–5 executable commands
- **Safety** — Blocks dangerous commands, validates permissions
- **File-scoped** — Suggests single-file validation when appropriate

## Security

- Dangerous patterns blocked (e.g. `rm -rf /`, `curl | sh`)
