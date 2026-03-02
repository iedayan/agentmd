# AgentMD GitHub Integration

## Overview

The AgentMD GitHub App provides seamless integration between AGENTS.md files and GitHub workflows, enabling automatic validation, PR checks, and workflow generation.

## Features

### 🔍 Pull Request Validation
- **Automatic Checks**: Validates AGENTS.md files on every PR
- **Status Checks**: Shows validation results directly in GitHub UI
- **Smart Comments**: Actionable suggestions for improvement
- **Agent-readiness Scoring**: 0-100 score with detailed breakdown

### 🚀 Workflow Generation
- **Auto-generation**: Creates GitHub Actions from AGENTS.md commands
- **Smart Detection**: Identifies test, build, and lint commands
- **Custom Workflows**: Generates appropriate workflows based on project type

### 📊 Real-time Feedback
- **PR Comments**: Detailed analysis with emoji indicators
- **Quick Fixes**: Suggests specific improvements
- **Score Tracking**: Monitor agent-readiness over time

## Installation

### Option 1: GitHub Marketplace (Recommended)
1. Visit [AgentMD GitHub App](https://github.com/apps/agentmd)
2. Click "Install" and select repositories
3. Configure optional settings (API key, webhook secret)

### Option 2: Self-hosted
```bash
# Clone the integration
git clone https://github.com/iedayan/agentmd.git
cd agentmd/packages/integrations/github

# Install dependencies
npm install

# Configure environment
export GITHUB_APP_ID="your-app-id"
export GITHUB_PRIVATE_KEY="your-private-key"
export WEBHOOK_SECRET="your-webhook-secret"
export AGENTMD_API_KEY="your-api-key"

# Run the app
npm start
```

## Configuration

### Environment Variables
- `GITHUB_APP_ID`: GitHub App ID
- `GITHUB_PRIVATE_KEY`: Private key for GitHub App authentication
- `WEBHOOK_SECRET`: Secret for webhook validation
- `AGENTMD_API_KEY`: AgentMD API key for enhanced validation

### GitHub App Permissions
- **Contents**: Read (for AGENTS.md files)
- **Pull Requests**: Write (for status checks and comments)
- **Checks**: Write (for check runs)
- **Workflows**: Write (for workflow generation)

## Usage

### Automatic PR Validation
1. Create or modify AGENTS.md in a pull request
2. AgentMD automatically validates the file
3. Check results in PR status checks
4. Review suggestions in PR comments

### Workflow Generation
1. Push AGENTS.md to main branch
2. AgentMD automatically generates `.github/workflows/agents-md.yml`
3. Workflow includes detected commands (test, build, lint)
4. Customize as needed

### Example Generated Workflow
```yaml
name: AgentMD Workflow

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm ci
    - name: Run linting
      run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
```

## Troubleshooting

### Common Issues
1. **App Not Triggering**: Check webhook configuration
2. **Permission Errors**: Verify App permissions
3. **Validation Failures**: Check AGENTS.md syntax

### Debug Mode
Enable debug logging:
```bash
export DEBUG=agentmd:*
npm start
```

## Support

- **Documentation**: [AgentMD Docs](https://agentmd.online)
- **Issues**: [GitHub Issues](https://github.com/iedayan/agentmd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iedayan/agentmd/discussions)
