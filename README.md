# AgentMD

[![npm](https://img.shields.io/npm/v/@agentmd-dev/core.svg)](https://www.npmjs.com/package/@agentmd-dev/core) [![npm](https://img.shields.io/npm/dw/@agentmd-dev/core.svg)](https://www.npmjs.com/package/@agentmd-dev/core) [![GitHub stars](https://img.shields.io/github/stars/iedayan/agentmd.svg?style=social&label=Star)](https://github.com/iedayan/agentmd) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**🚀 CI/CD for AI Agents** — Make AGENTS.md files executable in 10 minutes, not just readable.

<!-- TODO: Add demo GIF here -->
<!-- 
![AgentMD Demo](./assets/demo.gif)
*AgentMD in action: Parse, validate, and execute AGENTS.md files in seconds*
-->

[▶️ **Quick Start**](#quick-start) • [📖 **Docs**](https://agentsmd.io) • [💬 **Discussions**](https://github.com/iedayan/agentmd/discussions) • [🎯 **Live Demo**](https://demo.agentmd.io)

```bash
npm install -g @agentmd-dev/cli
agentmd check . --score
```

AgentMD turns static AGENTS.md files into **living, breathing workflows** with governance and safety built-in. While observability tools watch what agents do, AgentMD actually **runs** what they're supposed to do.

## Market Position

|                | Observability (AgentOps, LangFuse, Helicone) | **AgentMD**                                  |
| -------------- | -------------------------------------------- | -------------------------------------------- |
| **Focus**      | Watch what agents do                         | **Execute** what agents should do            |
| **AGENTS.md**  | Read for context                             | Parse, validate, **run** commands            |
| **Governance** | Post-hoc monitoring                          | Guardrails, permissions, policies at runtime |
| **Value**      | Telemetry & debugging                        | Orchestration, CI/CD & governed execution    |

## Strategic Priorities

1. **Distribution**: GitHub App integration, out-of-the-box templates, and quickstart interactive demos.
2. **Time-to-Value**: Guided onboarding enabling the first governed execution in under 10 minutes.
3. **Proof of Value**: Hard outcome metrics and documented case studies demonstrating ROI.
4. **Reliability**: Boringly dependable, deterministic, production-grade agent execution.
5. **Governance**: Guardrails, permission boundaries, and policy enforcement for agentic AI risk management.
6. **Deep Integrations**: Comprehensive, native hooks into Slack, Jira, and GitHub workflows.

## Core Engine: Making AGENTS.md Executable

AgentMD is the runtime environment for agent instructions:

- **Parse** — YAML frontmatter (agent config), markdown directives, sections, commands
- **Compose** — Build AGENTS.md from fragments (`**/agents-md/**/*.md`, `**/*.agents.md`)
- **Validate** — Format checks, command safety, permission validation
- **Execute** — Sandboxed runners with permission boundaries
- **Score** — Agent-readiness score (0-100)

## Quick Start

**🎯 Get running in 60 seconds:**

```bash
# Install the CLI
npm install -g @agentmd-dev/cli

# Check any AGENTS.md file
agentmd check . --score

# Execute safely (dry run)
agentmd run . --dry-run
```

**📦 VS Code Extension:**
```
ext install agentmd.agentmd-vscode
```

## Installation

**From source** (clone and build):

```bash
git clone https://github.com/iedayan/agentmd.git
cd agentmd
pnpm install
pnpm run build:core
pnpm run build:cli
# Or: pnpm run build
```

**Quick try** (no global install):

```bash
pnpm run agentmd -- check . --contract
pnpm run agentmd -- init .
```

**In CI** — Use the [GitHub Action](.github/actions/agentmd/README.md); no manual install.

**Dashboard** — `pnpm run dev:dashboard` (Next.js on port 3001).

**npm** — Core and CLI are published: `pnpm add @agentmd-dev/core`, `npx @agentmd-dev/cli init`. VS Code extension: use from source. See [docs/INSTALL.md](docs/INSTALL.md) for full options.

## Quick Start

```bash
# Validate AGENTS.md + required output contract
pnpm run agentmd -- check . --contract

# Compose from fragments
pnpm run agentmd -- compose .

# Run test commands
pnpm run agentmd -- run . test

# Agent-readiness score
pnpm run agentmd -- score

# Self-improve from validation feedback
pnpm run agentmd -- improve . --apply
```

## Start Here (Beginner)

If you are new to AgentMD, use this path:

1. Create a starter file (auto-detects Node.js, Python, Rust, Go):

```bash
pnpm run agentmd -- init .
```

Or force a template: `pnpm run agentmd -- init . --template python`

2. Diagnose and improve:

```bash
pnpm run agentmd -- doctor .
pnpm run agentmd -- improve . --apply
```

3. Validate and score:

```bash
pnpm run agentmd -- check . --contract
pnpm run agentmd -- score .
```

4. Preview safely, then run tests:

```bash
pnpm run agentmd -- run . --dry-run
pnpm run agentmd -- run . test
```

5. Install local pre-commit hook (runs lint):

```bash
pnpm run hooks:install
```

If a command needs shell operators like `|` or redirects, opt in explicitly:

```bash
pnpm run agentmd -- run . --use-shell
```

## YAML Frontmatter (Schema)

```yaml
---
agent:
  name: pr-labeler
  purpose: 'Apply size labels to PRs'
  model: gpt-4o-mini
  triggers: [pull_request.opened]
  permissions:
    pull_requests: write
    shell:
      allow: ['pnpm test', 'pnpm lint']
      default: deny
  guardrails:
    - 'Never modify code, never merge'
  commands:
    'pnpm run deploy':
      risk_level: dangerous
      preconditions: ['tests pass', 'approval']
      audit_tags: [deploy, production]
  output_contract:
    format: json
    schema:
      summary: string
      files_changed: array
    quality_gates: [tests_pass]
    artifacts: [patches]
    exit_criteria: [ready_for_review]
---
```

**Command schema:** `risk_level` = `safe` | `read-only` | `write` | `dangerous`. Use `preconditions` and `audit_tags` for governance.

## Project Structure

```
agentsmd/
├── packages/
│   ├── core/           # AGENTS.md parser, validator, discovery, execution
│   ├── cli/            # Command-line interface
│   └── sdk/            # Programmatic API for integrations
├── apps/
│   └── dashboard/      # Next.js 14 dashboard (repos, executions, billing)
├── deploy/
│   ├── migrations/     # SQL migrations (run via pnpm run migrate)
│   ├── provision/     # Vercel, Neon, GitHub setup
│   └── worker/        # Background execution worker (Railway, Render)
└── docs/               # Specification extensions
```

## Deployment

- **Dashboard** — Deploy to Vercel; run `pnpm run migrate` for DB migrations. See [deploy/provision/PROVISION.md](deploy/provision/PROVISION.md).
- **Worker** — Run `node deploy/worker/worker.mjs` with `DATABASE_URL`. Set `AGENTMD_REAL_EXECUTION=1` to run real commands from AGENTS.md (clones repo, executes); otherwise uses mock execution. See [deploy/worker/README.md](deploy/worker/README.md).
- **GitHub setup** — Use the setup wizard at `https://your-domain.com/setup/github-app` or run `pnpm run github:config https://your-domain.com` to generate OAuth and GitHub App URLs and env vars.

## Marketplace

Discover, purchase, and execute agents through AGENTS.md:

- **Agent Directory** — Certified agents with search, filters, trust scores
- **Stripe Connect** — 15% platform fee, automated payouts
- **Execution API** — REST API for discovery and execution
- **Verification** — "Certified AGENTS.md Compatible" badge
- **Developer Tools** — Generator, migration, sandbox, SDK

## Pricing

- **Free**: Basic parsing + validation, 3 repos, 100 min/mo
- **Pro ($49/mo)**: Unlimited repos, 1000 min, team features
- **Enterprise ($249/mo)**: Self-hosted, SSO, RBAC, audit logs. See [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) for deployment options.

## 🌟 Community & Support

- **[💬 GitHub Discussions](https://github.com/iedayan/agentmd/discussions)** - Ask questions, share ideas
- **[🐛 Issues](https://github.com/iedayan/agentmd/issues)** - Bug reports and feature requests  
- **[📖 Documentation](https://agentsmd.io)** - Complete guides and API reference
- **[🎯 Live Demo](https://demo.agentmd.io)** - Try AgentMD in your browser

## 🏆 Used By

[![AgentMD Users](https://img.shields.io/badge/Used%20By-Production%20Teams-blue)](https://github.com/iedayan/agentmd)

*AgentMD is trusted by startups and enterprises to orchestrate AI agents in production.*

---

**⭐ Star this repo** if AgentMD helps you build better AI agents!

[🔔 **Watch**](https://github.com/iedayan/agentmd/subscription) for updates • [🍴 **Fork**](https://github.com/iedayan/agentmd/fork) to contribute

## Open Source Readiness

- **Installation & CLI reference**: [docs/INSTALL.md](docs/INSTALL.md)
- **Core API contract**: [docs/CORE_PUBLIC_API.md](docs/CORE_PUBLIC_API.md)
- **Infrastructure & deployment**: [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)
- **Security policy**: [SECURITY.md](SECURITY.md)
- **Contribution guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Release history**: [CHANGELOG.md](CHANGELOG.md)

Notes:

- `@agentmd-dev/core` enterprise and marketplace modules are currently experimental.
- Dashboard demo endpoints (for example under `/api/demo/*`) are for product UX and not treated as stable SDK/API contracts.

## License

MIT — see [LICENSE](LICENSE) for details.
