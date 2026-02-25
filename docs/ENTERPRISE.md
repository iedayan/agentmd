# AgentMD Enterprise

AgentMD Enterprise provides the governance, security, and scale required for production AI agent deployments.

## 1. Feature Status

Which enterprise features are implemented vs. planned. Updated as we ship.

### Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| **Audit logs** | ✅ Implemented | `audit_logs` table; who ran what when. Dashboard at `/dashboard/audit`. |
| **Execution history** | ✅ Implemented | Full history per repo with success/failure, duration, commands run. |
| **Kill switch** | ✅ Implemented | Cancel running execution via `POST /api/executions/[id]/cancel`. |
| **Permission boundaries** | ✅ Implemented | AGENTS.md frontmatter `shell.allow`/`deny`; enforcment in cores. |
| **Policy-as-code** | ✅ Implemented | Enterprise policy config in core; approval requirements per command. |
| **Self-hosted** | ✅ Implemented | Docker Compose, Helm, air-gapped options in `deploy/`. |

### In Progress / Roadmap
- **SSO Enforcement** — Config UI exists; SAML flow integration in progress.
- **RBAC Enforcement** — Role model in place; dashboard UI for assignment live.
- **Slack Approvals** — Approval request flow exists; Slack action handlers in place.
- **SLA & Compliance** — 99.9% target; SOC2 / HIPAA readiness on roadmap.

## 2. Pricing

| | Free | Pro ($40/mo) | Enterprise ($199/mo) |
|---|---|---|---|
| Repositories | 3 | Unlimited | Unlimited |
| Execution min | 100 | 1000 | Unlimited |
| Self-hosted | — | — | ✓ |
| SSO/SAML | — | — | ✓ |
| Audit logs | — | — | ✓ |
| SLA | — | — | 99.9% |

## 3. Deployment & Security

Enterprise self-hosted options include Docker Compose, Kubernetes/Helm, and Air-gapped environments. 

### Security Controls
- **SSO/SAML** — Okta, Azure AD, Google Workspace integration.
- **RBAC** — Admin, Developer, Viewer, Approver + custom roles.
- **Compliance** — Designed for SOC2 and HIPAA compatibility.

### Licensing
Enterprise self-hosted requires `AGENTMD_LICENSE_KEY`. Contact sales@agentmd.io for trials and license keys.
