# GitHub Authentication Verification

Automated tests cover auth configuration and protected-route behavior. The full OAuth flow requires **manual verification** because it involves redirects and GitHub's servers.

## Automated Tests

Run the auth-related tests:

```bash
pnpm --filter @agentmd/dashboard test src/lib/auth src/app/api/repositories
```

These verify:

- GitHub provider is configured
- Custom sign-in page (`/register`)
- JWT session strategy
- Protected API routes return 401 when unauthenticated

## Manual Verification Checklist

### Prerequisites

1. **OAuth App** created at [GitHub OAuth Apps](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. **Callback URL** set to `https://your-domain/api/auth/callback/github` (or `http://localhost:3001/api/auth/callback/github` for local)
3. **Env vars** in `.env.local` or Vercel:
   - `GITHUB_ID` (Client ID)
   - `GITHUB_SECRET` (Client secret)
   - `NEXTAUTH_SECRET` (run `openssl rand -base64 32`)
   - `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL`

### Steps

1. **Start the app**
   ```bash
   pnpm --filter @agentmd/dashboard run dev
   ```

2. **Visit `/dashboard`** (unauthenticated)
   - Should redirect to `/register?callbackUrl=/dashboard`

3. **Click "Continue with GitHub"**
   - Should redirect to GitHub's authorization page
   - Authorize the app

4. **After authorization**
   - Should redirect back to `/dashboard`
   - Dashboard should load (repos, sidebar, etc.)

5. **Sign out** (sidebar → Sign out)
   - Should redirect to `/`
   - Visiting `/dashboard` again should redirect to `/register`

6. **Visit `/login`** (when signed out)
   - Should show sign-in form
   - "Sign in with GitHub" should work the same way

### Common Issues

| Symptom | Cause |
|--------|-------|
| "Configuration" error on sign-in | Missing `GITHUB_ID`, `GITHUB_SECRET`, or `NEXTAUTH_SECRET` |
| Redirect loop | `NEXTAUTH_URL` mismatch (must match app URL exactly) |
| "Callback URL mismatch" from GitHub | OAuth App callback URL doesn't match `{NEXTAUTH_URL}/api/auth/callback/github` |
| 401 on API calls after sign-in | Session cookie not sent (check same-origin, secure flags) |
