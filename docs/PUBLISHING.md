# Publishing AgentMD to npm and VS Code Marketplace

## Prerequisites

- [npm](https://www.npmjs.com/) account
- [VS Code Marketplace](https://marketplace.visualstudio.com/) publisher account
- [Azure DevOps](https://dev.azure.com/) account (for marketplace PAT)

---

## Part 1: Publish @agentmd-dev/agentmd-core to npm

### 1.1 Create npm organization (if needed)

Scoped packages like `@agentmd-dev/agentmd-core` require an npm org:

1. Go to [npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Create org `agentmd-dev` (or use your username if taken)

### 1.2 Log in to npm

```bash
npm login
# Enter username, password, email, OTP if 2FA enabled
```

### 1.3 Update repository URL (optional)

In `packages/core/package.json`, set the `repository.url` to your actual GitHub repo (e.g. `https://github.com/your-org/agentmd.git`).

### 1.4 Build and publish

```bash
cd packages/core
pnpm run build
npm publish --access public
```

The `--access public` flag is required for scoped packages (`@agentmd-dev/...`) to be publicly installable.

### 1.5 Verify

```bash
npm view @agentmd-dev/agentmd-core
```

---

## Part 2: Publish VS Code Extension to Marketplace

### 2.1 Publish @agentmd-dev/agentmd-core first

The extension depends on `@agentmd-dev/agentmd-core`. Publish core to npm **before** packaging the extension. The extension already uses `@agentmd-dev/agentmd-core: ^0.1.0`.

### 2.2 Create a publisher

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Sign in with Microsoft account
3. Click **Create Publisher**
4. Choose a publisher ID (e.g. `agentmd` — must match `package.json`)
5. Fill in display name, description

### 2.3 Create a Personal Access Token (PAT)

1. Go to [dev.azure.com](https://dev.azure.com/) → your profile → Personal Access Tokens
2. New Token: **Marketplace (Publish)** scope
3. Copy the token (you won't see it again)

### 2.4 Install vsce

```bash
npm install -g @vscode/vsce
```

### 2.5 Package the extension

```bash
cd packages/agentmd-vscode
pnpm run build
vsce package
```

This creates `agentmd-0.1.0.vsix`.

### 2.6 Publish

**Option A: Command line**

```bash
vsce publish -p <YOUR_PAT>
```

**Option B: Manual upload**

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Your publisher → New extension → VS Code
3. Upload the `.vsix` file

### 2.7 Verify

Search for "AgentMD" in the [VS Code Marketplace](https://marketplace.visualstudio.com/).

---

## Checklist

- [ ] npm org `agentmd-dev` created (or publisher ID matches)
- [ ] `@agentmd-dev/agentmd-core` published to npm
- [ ] Extension `package.json` uses `@agentmd-dev/agentmd-core: ^0.1.0`
- [ ] Extension builds successfully
- [ ] Publisher created on marketplace
- [ ] PAT created with Marketplace (Publish) scope
- [ ] `vsce package` produces .vsix
- [ ] `vsce publish` or manual upload completes

---

## Updating published packages

**@agentmd-dev/agentmd-core:** Bump `version` in `packages/core/package.json`, then `npm publish`.

**VS Code extension:** Bump `version` in `packages/agentmd-vscode/package.json`, run `vsce package`, then `vsce publish`.
