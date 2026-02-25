# GitHub Quick Start (5 Minutes)

Get AgentMD running with your repo in five steps.

**Setup:** Use the [GitHub App Setup Wizard](/setup/github-app) to generate OAuth and GitHub App URLs and env vars.

## 1. Sign in

Go to [agentmd.io](https://agentmd.io) (or your deployment) and click **Sign in with GitHub**. Authorize the OAuth app.

## 2. Connect a repo

- Click **Add repository** or go to Dashboard → Repositories
- If you've installed the [AgentMD GitHub App](https://github.com/apps/agentmd), select from your repos
- Or add manually: owner/repo (e.g. `agentmd/agentmd`)

## 3. Ensure AGENTS.md exists

Your repo needs an AGENTS.md file. Don't have one?

```bash
npx @agentmd/cli init
# Or use the generator: agentmd.io/marketplace/developers/generator
```

Commit and push.

## 4. Run your first execution

- Dashboard → Executions → **Run Manually**
- Or trigger via API: `POST /api/execute` with `agentId` or `agentsMdUrl`

## 5. Add to CI (optional)

Add the GitHub Action to run on every PR:

```yaml
# .github/workflows/agentmd.yml
on: [pull_request]
jobs:
  agentmd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: agentmd/agentmd/.github/actions/agentmd@main
        with:
          command: check
```

For execution in CI, use the dashboard or API to trigger runs on webhook.

---

## Troubleshooting

**"Repository not found"** — Ensure the GitHub App is installed on the org/repo. Go to GitHub → Settings → Applications → AgentMD → Configure.

**"AGENTS.md not found"** — Create one with `npx @agentmd/cli init` or the [generator](https://agentmd.io/marketplace/developers/generator).

**Execution stays pending** — The worker must be running. For cloud deploy, ensure the worker is deployed (Railway, Render). See [PROVISION.md](provision/PROVISION.md).
