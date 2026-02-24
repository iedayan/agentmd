# AgentMD Integrations

## Slack

Slack is used for human-in-the-loop approvals. When a policy requires approval, AgentMD can send a Slack message with Approve/Reject buttons.

**Setup:**

1. Create a Slack app with incoming webhooks and interactivity.
2. Set `SLACK_SIGNING_SECRET` in your environment.
3. Configure the Interactivity Request URL to `https://your-domain/api/integrations/slack/actions`.

See [Slack API docs](https://api.slack.com/) for app creation.

## Jira

Post execution status to Jira via webhook when runs complete.

**Setup:**

1. In Jira, create an incoming webhook (Automation rule or app like "Webhook").
2. Set `JIRA_WEBHOOK_URL` to the webhook URL.
3. On execution completion (success or failed), AgentMD POSTs a JSON payload:

```json
{
  "executionId": "exec_123",
  "repositoryName": "owner/repo",
  "status": "success",
  "trigger": "manual",
  "durationMs": 4200,
  "commandsRun": 4,
  "commandsPassed": 4,
  "commandsFailed": 0,
  "summary": "AgentMD execution completed: owner/repo"
}
```

Use this to create Jira issues on failure, update dashboards, or trigger automation.

## GitHub

AgentMD integrates with GitHub via the GitHub App for:

- Repository discovery
- PR checks (AGENTS.md validation)
- Webhook-triggered executions

See the [GitHub Action](.github/actions/agentmd/README.md) and installation flow in the dashboard.
