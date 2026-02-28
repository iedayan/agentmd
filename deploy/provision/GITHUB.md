# GitHub OAuth & GitHub App Setup

**Quick setup:** Use the GitHub App Setup Wizard at `https://your-domain.com/setup/github-app` (or run `node deploy/scripts/github-config.mjs https://your-domain.com`) to generate all URLs and env vars. Paste values directly into GitHub.

---

## 1. GitHub OAuth App (Required for login)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps**.
2. **New OAuth App**.
3. Fill in:
   - **Application name**: `AgentMD` (or your app name)
   - **Homepage URL**: `https://your-domain.com` (e.g. `https://agentmd.online`)
   - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`
4. **Register application**.
5. Copy **Client ID** → set as `GITHUB_ID`.
6. **Generate a new client secret** → set as `GITHUB_SECRET`.

For local dev, create a second OAuth App with:

- Homepage: `http://localhost:3001`
- Callback: `http://localhost:3001/api/auth/callback/github`

---

## 2. GitHub App (Optional — for repo connection & webhooks)

1. Go to [GitHub Developer Settings](https://github.com/settings/apps) → **GitHub Apps**.
2. **New GitHub App**.
3. Fill in:
   - **GitHub App name**: `AgentMD`
   - **Homepage URL**: `https://your-domain.com`
   - **Webhook URL**: `https://your-domain.com/api/github/webhooks`
   - **Webhook secret**: Generate a random string (e.g. `openssl rand -hex 32`) → set as `GITHUB_WEBHOOK_SECRET`
   - **Callback URL**: `https://your-domain.com/api/github/callback`
   - **Setup URL**: `https://your-domain.com/dashboard` (or install flow)
4. **Permissions**:
   - **Repository permissions**:
     - Contents: Read
     - Metadata: Read
     - Pull requests: Read & write
     - Checks: Read & write
   - **Subscribe to events**:
     - `check_run`
     - `check_suite`
     - `pull_request`
5. **Where can this GitHub App be installed?**: Any account.
6. **Create GitHub App**.
7. **Generate a private key** (Settings → Private keys) → download PEM. Set as `GITHUB_APP_PRIVATE_KEY` (escape newlines as `\n` or use multiline in Vercel).
8. Note **App ID** → set as `GITHUB_APP_ID`.
9. **App slug** (from URL `github.com/apps/your-slug`) → set as `GITHUB_APP_SLUG`.

---

## 3. Verify Setup

1. Set `GITHUB_ID` and `GITHUB_SECRET` in your environment.
2. Visit `https://your-domain.com/login` and click **Sign in with GitHub**.
3. You should be redirected to GitHub and back to the dashboard.

For GitHub App:

1. Set `GITHUB_APP_SLUG` to your app slug.
2. Visit `https://your-domain.com/api/github/install` (requires auth).
3. You should be redirected to install the app on your repos.
