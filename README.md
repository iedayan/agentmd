# AgentMD

**CI/CD for AI Agents** — The platform that makes AGENTS.md files executable, not just readable.

AgentMD deeply integrates with the [AGENTS.md standard](https://agents.md) to orchestrate and execute setup commands, tests, and workflows defined in your repository. While observability tools watch what agents do, AgentMD actually **runs** what they're supposed to do—with **agentic AI governance** and **risk management** built in.

## Market Position

| | Observability (AgentOps, LangFuse, Helicone) | **AgentMD** |
|---|---|---|
| **Focus** | Watch what agents do | **Execute** what agents should do |
| **AGENTS.md** | Read for context | Parse, validate, **run** commands |
| **Governance** | Post-hoc monitoring | Guardrails, permissions, policies at runtime |
| **Value** | Telemetry & debugging | Orchestration, CI/CD & governed execution |

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

## Installation

**From source** (clone and build):

```bash
git clone https://github.com/agentmd/agentmd.git
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

**npm** — `@agentmd/cli` is not yet published. Use from source until first release. See [docs/INSTALL.md](docs/INSTALL.md) for full options.

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

5. Install local pre-commit contract checks:
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
  purpose: "Apply size labels to PRs"
  model: gpt-4o-mini
  triggers: [pull_request.opened]
  permissions:
    pull_requests: write
    shell:
      allow: ["pnpm test", "pnpm lint"]
      default: deny
  guardrails:
    - "Never modify code, never merge"
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
│   └── worker/         # Background execution worker (Railway, Render)
└── docs/               # Specification extensions
```

## Deployment

- **Dashboard** — Deploy to Vercel; see [deploy/provision/PROVISION.md](deploy/provision/PROVISION.md).
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
- **Pro ($40/mo)**: Unlimited repos, 1000 min, team features
- **Enterprise ($199/mo)**: Self-hosted, SSO, RBAC, audit logs. See [docs/ENTERPRISE.md](docs/ENTERPRISE.md)

## Open Source Readiness

- **Philosophy & Strategy**: [docs/STRATEGY.md](docs/STRATEGY.md)
- **How it works** (plain language): [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md)
- **Design system**: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — live reference at `/design-system.html` when dashboard runs
- **Installation & CLI reference**: [docs/INSTALL.md](docs/INSTALL.md)
- Security policy and disclosure: [SECURITY.md](SECURITY.md)
- Contribution guide and required test matrix: [CONTRIBUTING.md](CONTRIBUTING.md)
- Core stable API contract: [docs/CORE_PUBLIC_API.md](docs/CORE_PUBLIC_API.md)
- SemVer policy: [docs/SEMVER_POLICY.md](docs/SEMVER_POLICY.md)
- Performance and benchmark notes: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- Release history: [CHANGELOG.md](CHANGELOG.md)

Notes:

- `@agentmd/core` enterprise and marketplace modules are currently experimental.
- Dashboard demo endpoints (for example under `/api/demo/*`) are for product UX and not treated as stable SDK/API contracts.

## License

MIT — see [LICENSE](LICENSE) for details.
