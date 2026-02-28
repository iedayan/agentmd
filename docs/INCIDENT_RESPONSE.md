# AgentMD Incident Response

Contact and escalation for security incidents and production outages.

## Contact

- **Security issues**: [security@agentmd.online](mailto:security@agentmd.online)
- **Production incidents**: [ops@agentmd.online](mailto:ops@agentmd.online)
- **Responsible disclosure**: See [SECURITY.md](../SECURITY.md)

## Severity Levels

| Level | Description                                                  | Response Target   |
| ----- | ------------------------------------------------------------ | ----------------- |
| P0    | Full outage, data breach, or critical security vulnerability | 15 min            |
| P1    | Major feature broken, significant degradation                | 1 hour            |
| P2    | Minor feature broken, workaround available                   | 4 hours           |
| P3    | Cosmetic or low-impact issue                                 | Next business day |

## Escalation Steps

1. **Detect** — Monitoring, user report, or automated alert
2. **Triage** — Assign severity, notify on-call
3. **Mitigate** — Rollback, feature flag, or hotfix as appropriate
4. **Communicate** — Status page, user notification if needed
5. **Resolve** — Root cause fix, post-mortem
6. **Improve** — Action items to prevent recurrence

## Runbook Quick Links

- **Health check**: `GET /api/health` and `GET /api/health/ready`
- **Rollback**: Vercel dashboard → Deployments → Promote previous
- **Database**: Neon console for connection issues
- **Worker**: Railway/Render dashboard for job processing
- **Secrets**: Rotate in Vercel/env provider if compromised

## Post-Incident

- Document in post-mortem within 48 hours
- Share learnings with team
- Update runbooks and monitoring as needed
