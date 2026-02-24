# AgentMD Air-Gapped Deployment

Deploy AgentMD in environments without internet access.

## Prerequisites

- Docker registry accessible from air-gapped network
- Or: ability to transfer container images via USB/secure transfer

## Steps

### 1. Export Images (from connected machine)

```bash
# Build and save images
docker build -f deploy/Dockerfile.dashboard -t agentmd/dashboard:latest .
docker build -f deploy/Dockerfile.worker -t agentmd/worker:latest .
docker save agentmd/dashboard:latest agentmd/worker:latest postgres:16-alpine redis:7-alpine -o agentmd-images.tar
```

### 2. Transfer to Air-Gapped Environment

```bash
# Copy agentmd-images.tar, deploy/, and helm chart to target
scp agentmd-images.tar user@air-gapped-host:/tmp/
```

### 3. Load and Run (on air-gapped machine)

```bash
docker load -i /tmp/agentmd-images.tar

# Use docker-compose with pre-loaded images
# Ensure no image pull in compose: image: agentmd/dashboard:latest
docker compose -f deploy/docker-compose.yml up -d
```

### 4. License Activation

Enterprise requires a license key. Contact sales@agentmd.io for air-gapped license activation. Options:

- Offline license file (JSON with signature)
- License server on internal network (Enterprise only)

## Database

For BYOD in air-gapped:

- Use existing PostgreSQL instance
- Use existing Redis instance
- Set `DATABASE_URL` and `REDIS_URL` in environment

## SSO/SAML

Configure SAML with metadata XML from your IdP (Okta, Azure AD, Google Workspace). No outbound calls required for auth flow.
