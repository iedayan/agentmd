# AgentMD Helm Chart

Deploy AgentMD to Kubernetes for scaling and high availability.

## Prerequisites

- Kubernetes 1.24+
- Helm 3+
- PostgreSQL (or use bundled)
- Redis (or use bundled)

## Install

```bash
helm repo add agentmd https://charts.agentmd.online
helm install agentmd agentmd/agentmd -f values.yaml
```

## Values (values.yaml)

```yaml
replicaCount: 2

dashboard:
  image:
    repository: agentmd/dashboard
    tag: latest
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "500m"

worker:
  replicaCount: 3
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"

postgresql:
  enabled: true
  auth:
    username: agentmd
    password: changeme
    database: agentmd

redis:
  enabled: true

license:
  key: ""  # AGENTMD_LICENSE_KEY for Enterprise activation
```

## Air-Gapped Install

1. Export images: `helm package` with `--include-dependencies`
2. Load images on target: `docker load < agentmd-images.tar`
3. Install from tarball: `helm install agentmd agentmd-1.0.0.tgz`
