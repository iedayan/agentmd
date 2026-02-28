/**
 * AGENTS.md templates for popular frameworks.
 */

export const FRAMEWORK_TEMPLATES: Record<string, string> = {
  'React + Vite': `---
# Agent instructions for AI coding tools (React + Vite)
---

## Install

\`\`\`bash
pnpm install
\`\`\`

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`,
  'Next.js': `---
# Agent instructions for AI coding tools (Next.js)
---

## Install

\`\`\`bash
pnpm install
\`\`\`

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`,
  'Python / pytest': `---
# Agent instructions for AI coding tools (Python)
---

## Setup

\`\`\`bash
uv sync
\`\`\`

## Test

\`\`\`bash
uv run pytest
\`\`\`

## Lint

\`\`\`bash
uv run ruff check .
\`\`\`

## Format

\`\`\`bash
uv run ruff format .
\`\`\`
`,
  'Rust / Cargo': `---
# Agent instructions for AI coding tools (Rust)
---

## Build

\`\`\`bash
cargo build
\`\`\`

## Test

\`\`\`bash
cargo test
\`\`\`

## Lint

\`\`\`bash
cargo clippy
\`\`\`

## Format

\`\`\`bash
cargo fmt
\`\`\`
`,
  'Node.js / pnpm': `---
# Agent instructions for AI coding tools (Node.js)
---

## Install

\`\`\`bash
pnpm install
\`\`\`

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`,
  Go: `---
# Agent instructions for AI coding tools (Go)
---

## Build

\`\`\`bash
go build ./...
\`\`\`

## Test

\`\`\`bash
go test ./...
\`\`\`

## Lint

\`\`\`bash
go vet ./...
\`\`\`

## Format

\`\`\`bash
go fmt ./...
\`\`\`
`,
  'Java / Maven': `---
# Agent instructions for AI coding tools (Java)
---

## Build

\`\`\`bash
mvn compile
\`\`\`

## Test

\`\`\`bash
mvn test
\`\`\`

## Package

\`\`\`bash
mvn package -DskipTests
\`\`\`

## Lint

\`\`\`bash
mvn validate
\`\`\`
`,
};
