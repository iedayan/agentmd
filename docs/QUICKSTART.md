# AgentMD Quick Start Guide

## Get Started in 5 Minutes

AgentMD makes your AGENTS.md files executable, turning documentation into automated workflows. Here's how to get started quickly.

## Prerequisites

- Node.js >= 18
- Git repository with AGENTS.md file
- AgentMD CLI (or use the web dashboard)

## Installation

### Option 1: Global CLI Installation

```bash
npm install -g @agentmd-dev/cli
```

### Option 2: Use Web Dashboard

Visit [https://dashboard.agentmd.com](https://dashboard.agentmd.com) and connect your repository.

## Create Your First AGENTS.md

Create a file named `AGENTS.md` in your repository root:

````markdown
# My Project Agent

## Description

Automated testing and deployment for my web application.

## Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build application
npm run build

# Deploy to staging
npm run deploy:staging
```
````

## Environment Variables

- `NODE_ENV`: Set to production for deployment
- `API_KEY`: Required for external API access

## Dependencies

- Node.js >= 18
- Docker >= 20.10

## Notes

This agent runs on every push to main branch.

````

## Validate Your Configuration

### Using CLI
```bash
# Validate AGENTS.md syntax
agentmd validate AGENTS.md

# Test execution (dry run)
agentmd run --dry-run AGENTS.md
````

### Using Web Dashboard

1. Connect your repository
2. Navigate to the dashboard
3. The system will automatically validate your AGENTS.md

## Run Your First Agent

### Using CLI

```bash
# Execute the agent
agentmd run AGENTS.md

# Check status
agentmd status

# View logs
agentmd logs
```

### Using Web Dashboard

1. Go to the "Executions" tab
2. Click "Run Agent"
3. Monitor execution in real-time

## Monitor Results

### Success Indicators

-  All commands completed successfully
-  Tests passed
-  Build completed
-  Deployment successful

### Common Issues

-  **Command failed**: Check command syntax and dependencies
-  **Timeout**: Increase timeout in frontmatter
-  **Permission denied**: Check user permissions

## Next Steps

### 1. **Add More Commands**

````markdown
## Commands

```bash
npm install
npm test
npm run build
npm run security:scan    # New security scanning
npm run deploy:staging
npm run smoke:test       # New smoke testing
```
````

````

### 2. **Add Configuration**
```yaml
---
target: production
priority: high
timeout: 600
requires_approval: true
---
````

### 3. **Set Up Notifications**

```yaml
---
notify_on_success: true
notify_on_failure: true
notification_channels: ['slack', 'email']
---
```

## Advanced Features

### Parallel Execution

````markdown
## Commands (Parallel)

```bash
npm run lint
npm run type-check
npm run security:scan
```
````

## Commands (Sequential)

```bash
npm run build
npm run test
npm run deploy
```

````

### Environment-Specific Configs
```yaml
# AGENTS.md.staging
---
target: staging
timeout: 300
---

# AGENTS.md.production
---
target: production
timeout: 600
requires_approval: true
---
````

### Conditional Execution

```yaml
---
conditions:
  branch_pattern: 'main|release/*'
  file_patterns: ['src/**', 'tests/**']
---
```

## Integration Examples

### GitHub Actions

```yaml
name: AgentMD Pipeline
on: [push, pull_request]

jobs:
  agentmd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run AgentMD
        run: |
          npm install -g @agentmd-dev/cli
          agentmd run AGENTS.md
```

### GitLab CI

```yaml
stages:
  - test
  - build
  - deploy

agentmd:
  stage: test
  script:
    - npm install -g @agentmd-dev/cli
    - agentmd run AGENTS.md
```

### VS Code Extension

1. Install "AgentMD" extension from VS Code Marketplace
2. Open your AGENTS.md file
3. Get real-time validation and syntax highlighting
4. Use command palette to run agents

## Common Templates

### Web Application

````markdown
# Web App CI/CD

## Commands

```bash
npm install
npm run lint
npm run test
npm run build
npm run deploy:staging
npm run smoke:test
npm run deploy:production
```
````

````

### Python Application
```markdown
# Python App Pipeline

## Commands
```bash
pip install -r requirements.txt
python -m pytest
python setup.py build
python deploy.py --env=staging
````

````

### Infrastructure as Code
```markdown
# Infrastructure Deployment

## Commands
```bash
terraform fmt -check
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
````

````

## Troubleshooting

### Common Issues

#### 1. **Validation Errors**
```bash
Error: Invalid AGENTS.md syntax
````

**Solution**: Run `agentmd validate AGENTS.md` to identify syntax issues.

#### 2. **Command Failures**

```bash
Error: Command 'npm test' failed with exit code 1
```

**Solution**: Check if tests pass locally, verify dependencies.

#### 3. **Timeout Issues**

```bash
Error: Command timed out after 300 seconds
```

**Solution**: Increase timeout in frontmatter or optimize command.

#### 4. **Permission Errors**

```bash
Error: Permission denied: deploy.sh
```

**Solution**: Check file permissions and user access rights.

### Debug Mode

```bash
# Run with debug logging
agentmd run --debug AGENTS.md

# Verbose output
agentmd run --verbose AGENTS.md
```

## Getting Help

### Resources

- **Documentation**: [https://docs.agentmd.com](https://docs.agentmd.com)
- **API Reference**: [https://docs.agentmd.com/api](https://docs.agentmd.com/api)
- **Community**: [https://community.agentmd.com](https://community.agentmd.com)

### Commands

```bash
# Get help
agentmd --help

# Get specific command help
agentmd run --help

# Check version
agentmd --version
```

### Support

- **GitHub Issues**: [https://github.com/agentmd/agentmd/issues](https://github.com/agentmd/agentmd/issues)
- **Discord Community**: [https://discord.gg/agentmd](https://discord.gg/agentmd)
- **Email**: support@agentmd.com

## Success!

You've successfully set up your first AgentMD workflow! Here's what you accomplished:

 Created an AGENTS.md file  
 Validated the configuration  
 Ran your first automated agent  
 Monitored execution results  
 Learned troubleshooting basics

### What's Next?

- Explore advanced features in the [Complete Reference Guide](./AGENTS.md_REFERENCE.md)
- Set up team collaboration and approval workflows
- Integrate with your existing CI/CD pipeline
- Explore the web dashboard for advanced analytics

---

**Happy Automating! **

For more advanced usage and examples, check out our [complete documentation](https://docs.agentmd.com).
