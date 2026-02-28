# Getting Started with AgentMD

Welcome to AgentMD! This guide will help you get up and running with AI agent configuration for your projects.

## What is AgentMD?

AgentMD is a platform for configuring, managing, and executing AI agents in software development projects. It provides:

- **AGENTS.md Standard** - A markdown-based configuration format for AI agents
- **Validation & Scoring** - Automated checks to ensure agent safety and effectiveness
- **IDE Integrations** - Real-time validation and suggestions in your editor
- **Workflow Automation** - Pre-built workflows for common development tasks
- **Security Guardrails** - Built-in security policies and risk assessment

## Quick Start

### 1. Installation

```bash
# Install the CLI
npm install -g @agentmd-dev/cli

# Or use pnpm
pnpm add -g @agentmd-dev/cli
```

### 2. Initialize Your Project

```bash
# Navigate to your project directory
cd your-project

# Initialize AGENTS.md
agentmd init

# Or create manually
touch AGENTS.md
```

### 3. Basic AGENTS.md Configuration

Create a simple `AGENTS.md` file:

```markdown
# My Project

AI agent configuration for my project.

## Development Setup

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm run dev
```

## Testing

### Run tests
```bash
npm test
```

## Build

### Build for production
```bash
npm run build
```

## Agent Guidelines

### What agents can do:
- ✅ Run tests and analyze results
- ✅ Build and validate the application
- ✅ Review code for best practices
- ✅ Generate documentation

### Security restrictions:
- 🚫 Never access environment variables directly
- 🚫 Never modify production database
- 🚫 Always use dry-run mode for destructive operations
```

### 4. Validate Your Configuration

```bash
# Validate AGENTS.md
agentmd check

# Get detailed feedback
agentmd check --contract

# See your agent-readiness score
agentmd score
```

### 5. IDE Integration

#### VS Code
1. Install the AgentMD extension
2. Open your project
3. See real-time validation and suggestions

#### Cursor
1. Enable AgentMD integration
2. Get AI-powered configuration suggestions
3. Use enhanced autocomplete for AGENTS.md

## Templates

AgentMD provides templates for popular frameworks:

### Next.js Template
```bash
agentmd template nextjs
```

### Python Template
```bash
agentmd template python
```

### Custom Templates
```bash
# List available templates
agentmd template list

# Use a custom template
agentmd template custom-template-name
```

## Workflows

AgentMD includes pre-built workflows for common tasks:

### PR Reviewer
Automated pull request review with AI agents:

```bash
agentmd workflow pr-reviewer --owner your-org --repo your-repo --pr-number 123
```

### Test Triage
Automated test failure analysis:

```bash
agentmd workflow test-triage --owner your-org --repo your-repo --ref main
```

## Configuration Options

### Frontmatter Configuration

Add YAML frontmatter to your AGENTS.md:

```yaml
---
name: "My Project"
version: "1.0.0"
risk_level: "medium"
permissions:
  - read
  - write
output_contract:
  format: "json"
  quality_gates:
    - test_coverage > 80
    - build_success = true
---
```

### Directives

Use AGENTS.md directives for advanced configuration:

```markdown
<!-- @agentmd priority: high -->
<!-- @agentmd requires_approval: true -->
<!-- @agentmd timeout: 300 -->
```

## Security

### Risk Levels

- **Low**: Safe operations (read, validate)
- **Medium**: Moderate risk (build, test)
- **High**: Risky operations (deploy, database)
- **Critical**: Dangerous operations (delete, production changes)

### Guardrails

AgentMD includes built-in security guardrails:

- Path traversal detection
- Obfuscation detection
- Sensitive file access prevention
- Environment variable injection protection
- Destructive intent detection

### Audit Security

```bash
# Run security audit
agentmd security audit

# Check specific file
agentmd security check path/to/file
```

## Best Practices

### 1. Start Simple
Begin with basic commands and gradually add complexity.

### 2. Be Specific
Use clear, specific commands instead of vague instructions.

### 3. Test Commands
Ensure all commands in AGENTS.md actually work.

### 4. Document Everything
Explain why commands are needed and what they do.

### 5. Review Regularly
Keep AGENTS.md updated as your project evolves.

### 6. Use Templates
Leverage existing templates for your framework.

### 7. Monitor Usage
Track how agents interact with your project.

## Troubleshooting

### Common Issues

#### Validation Failures
```bash
# Get detailed error messages
agentmd check --verbose

# Check specific sections
agentmd check --section build
```

#### Permission Errors
```bash
# Check permissions
agentmd permissions list

# Add required permissions
agentmd permissions add deploy
```

#### Security Blocks
```bash
# Check why command was blocked
agentmd security explain "rm -rf /"

# Override with caution
agentmd run --force "dangerous command"
```

### Getting Help

- **Documentation**: [docs.agentmd.io](https://docs.agentmd.io)
- **Community**: [GitHub Discussions](https://github.com/iedayan/agentmd/discussions)
- **Issues**: [GitHub Issues](https://github.com/iedayan/agentmd/issues)
- **Discord**: [AgentMD Discord](https://discord.gg/agentmd)

## Next Steps

1. **Explore Templates**: Try different framework templates
2. **Set Up Workflows**: Configure automated workflows
3. **Integrate with CI/CD**: Add AgentMD to your pipeline
4. **Monitor Usage**: Track agent interactions
5. **Contribute**: Help improve AgentMD

## Advanced Topics

- Custom workflow development
- Integration with external tools
- Enterprise deployment
- Performance optimization
- Security customization

---

Ready to dive deeper? Check out our [Advanced Guide](./ADVANCED.md) or [API Documentation](../api/README.md).
