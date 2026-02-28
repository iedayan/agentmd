# AGENTS.md Complete Reference Guide

## 📖 Overview

AGENTS.md is a markdown-based configuration file that defines AI agent workflows, commands, and execution policies. Think of it as "CI/CD for AI Agents" - making your agent operations executable, versionable, and observable.

## 🏗️ File Structure

### Basic Format

````markdown
# Agent Configuration

## Description

A brief description of what this agent does and its purpose.

## Commands

```bash
# Build commands
npm run build

# Test commands
npm test

# Linting
npm run lint
```
````

## Environment Variables

- `API_KEY`: Required for external API access
- `LOG_LEVEL`: Set to debug, info, warn, or error

## Dependencies

- Node.js >= 18
- Docker >= 20.10
- Redis >= 6.0

## Notes

Additional context and setup instructions.

````

### Advanced Format with Frontmatter
```yaml
---
target: production
priority: high
timeout: 300
retry_policy: exponential_backoff
---

# Production Agent Configuration

## Commands
```bash
npm run build:production
npm run test:coverage
npm run security:scan
````

````

## 🎯 Core Concepts

### 1. **Commands**
Commands are executable instructions that the agent will run. They can be shell commands, scripts, or any executable process.

**Syntax:**
```markdown
## Commands
```bash
# Single command
npm run build

# Multiple commands
npm run build
npm run test
npm run deploy

# Commands with comments
npm run build          # Build the application
npm run test           # Run test suite
npm run deploy         # Deploy to production
````

````

**Command Types:**
- **Build**: Compilation and packaging commands
- **Test**: Testing and validation commands
- **Deploy**: Deployment and release commands
- **Lint**: Code quality and style checks
- **Security**: Security scanning and vulnerability checks

### 2. **Frontmatter Configuration**
YAML frontmatter provides metadata and execution policies.

**Available Fields:**
```yaml
# Execution Target
target: production | staging | development

# Priority Level
priority: critical | high | medium | low

# Execution Timeout (seconds)
timeout: 300

# Retry Policy
retry_policy: none | linear | exponential_backoff
retry_count: 3

# Resource Requirements
memory: "512Mi"
cpu: "500m"

# Execution Environment
environment: nodejs18 | python39 | java11

# Approval Requirements
requires_approval: true
approvers: ["@team-lead", "@security-team"]

# Notification Settings
notify_on_success: true
notify_on_failure: true
notification_channels: ["slack", "email"]
````

### 3. **Sections**

Organize your AGENTS.md with clear sections for better readability and maintenance.

**Standard Sections:**

```markdown
# Agent Name

## Description

What this agent does and its purpose.

## Commands

Executable commands.

## Environment Variables

Required and optional environment variables.

## Dependencies

System dependencies and prerequisites.

## Setup

Initial setup instructions.

## Usage

How to use this agent.

## Troubleshooting

Common issues and solutions.

## Notes

Additional context and information.
```

## 🔧 Advanced Features

### 1. **Conditional Execution**

Use frontmatter to control when commands should run:

```yaml
---
conditions:
  branch_pattern: 'main|release/*'
  file_patterns: ['src/**', 'tests/**']
  time_window: '09:00-17:00'
---
```

### 2. **Parallel Execution**

Group commands that can run in parallel:

````markdown
## Commands (Parallel)

```bash
npm run lint
npm run type-check
npm run security-scan
```
````

## Commands (Sequential)

```bash
npm run build
npm run test
npm run deploy
```

````

### 3. **Environment-Specific Configurations**
Create different configurations for different environments:

```yaml
# AGENTS.md.staging
---
target: staging
timeout: 600
---

# AGENTS.md.production
---
target: production
timeout: 1200
requires_approval: true
---
````

### 4. **Template Variables**

Use variables for dynamic configuration:

````markdown
## Commands

```bash
npm run build -- --env=${ENVIRONMENT}
npm run deploy -- --region=${AWS_REGION}
npm run test -- --coverage=${COVERAGE_THRESHOLD}
```
````

## Environment Variables

- `ENVIRONMENT`: ${ENVIRONMENT}
- `AWS_REGION`: ${AWS_REGION}
- `COVERAGE_THRESHOLD`: ${COVERAGE_THRESHOLD}

````

## 📋 Best Practices

### 1. **Organization**
- Use clear, descriptive section headers
- Group related commands together
- Add comments for complex commands
- Keep commands focused and atomic

### 2. **Security**
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Implement proper access controls
- Regular security scans

### 3. **Performance**
- Optimize command execution order
- Use parallel execution where possible
- Set appropriate timeouts
- Monitor resource usage

### 4. **Maintainability**
- Keep AGENTS.md files under version control
- Document complex workflows
- Use consistent formatting
- Regular updates and reviews

## 🚀 Examples

### 1. **Web Application CI/CD**
```yaml
---
target: production
priority: high
timeout: 600
retry_policy: exponential_backoff
retry_count: 2
requires_approval: true
approvers: ["@devops-team"]
---

# Web Application Pipeline

## Description
Complete CI/CD pipeline for web application including build, test, security scan, and deployment.

## Commands (Parallel)
```bash
# Code Quality
npm run lint
npm run type-check
npm run audit

# Testing
npm run test:unit
npm run test:integration
npm run test:e2e
````

## Commands (Sequential)

```bash
# Build
npm run build:production

# Security
npm run security:scan
npm run dependency:check

# Deploy
npm run deploy:staging
npm run smoke:test
npm run deploy:production
```

## Environment Variables

- `NODE_ENV`: production
- `AWS_REGION`: us-west-2
- `DOCKER_REGISTRY`: ${DOCKER_REGISTRY}
- `KUBE_NAMESPACE`: ${KUBE_NAMESPACE}

## Dependencies

- Node.js >= 18
- Docker >= 20.10
- Kubernetes >= 1.24
- AWS CLI >= 2.0

## Setup

1. Configure AWS credentials
2. Set up Docker registry access
3. Configure Kubernetes cluster
4. Install required npm packages

## Troubleshooting

- **Build failures**: Check Node.js version and npm cache
- **Test failures**: Verify test database is running
- **Deploy failures**: Check Kubernetes cluster status

````

### 2. **Machine Learning Pipeline**
```yaml
---
target: production
priority: critical
timeout: 1800
retry_policy: exponential_backoff
retry_count: 3
memory: "2Gi"
cpu: "1000m"
environment: python39
---

# ML Model Training Pipeline

## Description
Automated machine learning pipeline including data preprocessing, model training, evaluation, and deployment.

## Commands (Sequential)
```bash
# Data Preparation
python scripts/data_preprocessing.py
python scripts/feature_engineering.py

# Model Training
python scripts/train_model.py --config=configs/production.yaml
python scripts/hyperparameter_tuning.py

# Evaluation
python scripts/evaluate_model.py --threshold=0.85
python scripts/model_validation.py

# Deployment
python scripts/export_model.py
python scripts/deploy_model.py --environment=production
````

## Commands (Parallel)

```bash
# Quality Checks
python scripts/data_quality_check.py
python scripts/model_bias_check.py
python scripts.performance_benchmark.py
```

## Environment Variables

- `MLFLOW_TRACKING_URI`: ${MLFLOW_TRACKING_URI}
- `AWS_S3_BUCKET`: ${AWS_S3_BUCKET}
- `MODEL_REGISTRY`: ${MODEL_REGISTRY}
- `DATA_VERSION`: ${DATA_VERSION}

## Dependencies

- Python >= 3.9
- CUDA >= 11.8
- MLflow >= 2.0
- TensorFlow >= 2.10

## Setup

1. Configure MLflow tracking server
2. Set up AWS S3 bucket for data storage
3. Install GPU drivers and CUDA
4. Configure model registry

## Notes

- Model training requires GPU resources
- Data preprocessing can take 30-60 minutes
- Model evaluation uses cross-validation

````

### 3. **Infrastructure as Code**
```yaml
---
target: production
priority: critical
timeout: 900
retry_policy: linear
retry_count: 1
requires_approval: true
approvers: ["@infrastructure-team"]
---

# Infrastructure Deployment

## Description
Infrastructure as code deployment using Terraform with security scanning and compliance checks.

## Commands (Sequential)
```bash
# Validation
terraform fmt -check
terraform validate
terraform plan -out=tfplan

# Security Scan
tfsec .
checkov --directory .

# Deployment
terraform apply tfplan
````

## Commands (Parallel)

```bash
# Compliance Checks
opa eval -d policy/ -i tfplan.json "data.terraform.policy.violation"

# Cost Analysis
infracost breakdown --path tfplan
```

## Environment Variables

- `AWS_DEFAULT_REGION`: us-west-2
- `TF_VAR_environment`: production
- `TF_VAR_project`: ${PROJECT_NAME}
- `INFRACOST_API_KEY`: ${INFRACOST_API_KEY}

## Dependencies

- Terraform >= 1.5
- tfsec >= 1.0
- checkov >= 2.0
- OPA >= 0.44

## Setup

1. Configure AWS provider
2. Set up Terraform backend
3. Install security scanning tools
4. Configure policy engine

## Troubleshooting

- **Validation failures**: Check Terraform syntax and provider versions
- **Security issues**: Review tfsec and checkov reports
- **Apply failures**: Verify AWS credentials and permissions

````

## 🔍 Validation and Testing

### 1. **Local Validation**
```bash
# Validate AGENTS.md syntax
agentmd validate AGENTS.md

# Check for common issues
agentmd lint AGENTS.md

# Test execution (dry run)
agentmd run --dry-run AGENTS.md
````

### 2. **Integration Testing**

```bash
# Test with mock data
agentmd test --mock-data AGENTS.md

# Test specific sections
agentmd test --section commands AGENTS.md

# Test with environment variables
agentmd test --env-file .env.test AGENTS.md
```

### 3. **Production Validation**

```bash
# Validate against production environment
agentmd validate --environment=production AGENTS.md

# Check resource requirements
agentmd check --resources AGENTS.md

# Verify security policies
agentmd audit --security AGENTS.md
```

## 📊 Monitoring and Observability

### 1. **Execution Metrics**

- Command execution time
- Resource usage (CPU, memory)
- Success/failure rates
- Error patterns

### 2. **Logging**

- Structured logging with JSON format
- Log levels: debug, info, warn, error
- Log aggregation and search
- Alert integration

### 3. **Tracing**

- Distributed tracing across commands
- Performance bottlenecks
- Dependency mapping
- Root cause analysis

## 🔧 Tools and Integration

### 1. **CLI Tools**

```bash
# AgentMD CLI
agentmd validate AGENTS.md
agentmd run AGENTS.md
agentmd status
agentmd logs

# VS Code Extension
# Real-time validation and syntax highlighting
# Command completion and snippets
# Error detection and suggestions
```

### 2. **CI/CD Integration**

```yaml
# GitHub Actions
- name: Validate AGENTS.md
  uses: agentmd/validate-action@v1
  with:
    file: AGENTS.md

# GitLab CI
validate_agents:
  script:
    - agentmd validate AGENTS.md
```

### 3. **Dashboard Integration**

- Real-time execution status
- Performance metrics and analytics
- Historical execution data
- Alert management

## 🚨 Common Issues and Solutions

### 1. **Syntax Errors**

**Issue**: Invalid markdown or YAML syntax
**Solution**: Use `agentmd validate` to check syntax

### 2. **Command Failures**

**Issue**: Commands failing during execution
**Solution**: Check logs, verify dependencies, test locally

### 3. **Timeout Issues**

**Issue**: Commands taking too long to execute
**Solution**: Increase timeout, optimize commands, check resources

### 4. **Permission Errors**

**Issue**: Insufficient permissions for execution
**Solution**: Check user permissions, configure access controls

### 5. **Environment Issues**

**Issue**: Missing environment variables or dependencies
**Solution**: Verify environment setup, check dependency versions

## 📚 Additional Resources

- [AgentMD Documentation](https://docs.agentmd.com)
- [CLI Reference](https://docs.agentmd.com/cli)
- [API Reference](https://docs.agentmd.com/api)
- [Community Forum](https://community.agentmd.com)
- [GitHub Repository](https://github.com/agentmd/agentmd)

## 🤝 Contributing

Contributions to AGENTS.md and AgentMD are welcome! Please see our [Contributing Guide](https://github.com/agentmd/agentmd/blob/main/CONTRIBUTING.md) for details.

---

_This reference guide covers all aspects of AGENTS.md configuration and usage. For specific questions or issues, please refer to the documentation or community forums._
