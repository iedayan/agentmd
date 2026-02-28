# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1.0 | No        |

## Threat Model

AgentMD is a command orchestration engine that parses and executes commands from `AGENTS.md`.
Primary risks:

- Untrusted command execution (`rm -rf`, `curl | sh`, reverse shell patterns)
- Privilege escalation through shell operators and broad permissions
- Supply-chain risk from untrusted `AGENTS.md` content
- Integration abuse (webhooks, automation endpoints)

Current security controls:

- Dangerous pattern blocking in executor
- Permission-aware allow/deny checks (`permissions.shell`)
- Safe default execution mode (`useShell: false`)
- Preflight planning (`planCommandExecutions`) before run
- Optional sandboxed execution for isolated temp-dir runs
- Request validation + rate limiting on dashboard APIs
- Session-based auth (NextAuth + GitHub OAuth) for dashboard; all user-scoped APIs require authentication
- User-scoped data access; repositories and executions filtered by session user ID

## Reporting a Vulnerability

Do not open public issues for vulnerabilities.

- Contact: `security@agentmd.online`
- Include:
  - Affected version(s)
  - Reproduction steps
  - Impact and exploitability
  - Suggested remediation (optional)

Target response timeline:

- Acknowledgement: within 48 hours
- Initial triage: within 5 business days
- Status updates: at least weekly until resolved

## Disclosure Process

1. Reporter submits private report.
2. Maintainers reproduce and assign severity.
3. Patch is prepared and validated.
4. Coordinated release is published with changelog note.
5. Public disclosure follows fix availability.

## Hardening Guidance for Users

- Treat third-party `AGENTS.md` as untrusted input.
- Use safe mode first: `agentmd run . --dry-run`.
- Only use `--use-shell` for explicitly reviewed commands.
- Restrict permissions in frontmatter (`permissions.shell.allow`).
- Run in CI with isolated workers and least privileges.
