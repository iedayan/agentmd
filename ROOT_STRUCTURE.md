# AgentMD Root Directory Organization

This document outlines the organized structure of the AgentMD root directory.

## Directory Structure

```
agentmd/
├── 📁 packages/                    # Core packages and integrations
│   ├── 📁 core/                   # Core parsing and validation logic
│   ├── 📁 cli/                    # Command-line interface
│   ├── 📁 sdk/                    # Software development kit
│   ├── 📁 integrations/           # IDE and editor integrations
│   │   ├── 📁 vscode/            # VS Code extension
│   │   └── 📁 cursor/            # Cursor integration
│   ├── 📁 workflows/              # Pre-built agent workflows
│   │   ├── 📁 pr-reviewer/       # PR review automation
│   │   └── 📁 test-triage/        # Test failure analysis
│   └── 📁 templates/              # AGENTS.md templates
│       ├── 📁 nextjs/            # Next.js template
│       └── 📁 python/            # Python template
├── 📁 apps/                       # Applications
│   └── 📁 dashboard/              # Next.js dashboard UI
├── 📁 tools/                      # Development and operations tools
│   ├── 📁 release/               # Release automation
│   │   └── 📄 release.mjs        # Automated release script
│   ├── 📁 perf/                  # Performance testing
│   │   └── 📄 benchmark.mjs      # Performance benchmarking
│   ├── 📁 security/              # Security scanning
│   │   └── 📄 audit.mjs          # Security audit script
│   └── 📁 analytics/             # Usage analytics
│       └── 📄 usage.mjs          # Analytics processing
├── 📁 docs/                       # Documentation
│   ├── 📁 guides/                # User guides
│   │   └── 📄 GETTING_STARTED.md # Getting started guide
│   ├── 📁 api/                   # API documentation
│   │   └── 📄 README.md          # API reference
│   ├── 📄 ROADMAP.md             # Project roadmap
│   ├── 📄 CUSTOMER_STRATEGY.md   # Customer acquisition
│   └── 📄 CODEBASE_ORGANIZATION.md # Architecture guide
├── 📁 deploy/                     # Deployment configuration
├── 📁 .github/                    # GitHub workflows and templates
├── 📁 .vscode/                    # VS Code settings
├── 📄 package.json                # Root package configuration
├── 📄 pnpm-workspace.yaml         # PNPM workspace configuration
├── 📄 tsconfig.base.json          # Base TypeScript configuration
├── 📄 AGENTS.md                   # AgentMD configuration for this repo
├── 📄 README.md                   # Project README
├── 📄 ARCHITECTURE.md             # Architecture overview
├── 📄 LICENSE                     # MIT License
└── 📄 ...                         # Other configuration files
```

## Key Improvements

### 1. **Tools Directory** (`tools/`)
Centralized location for development and operations scripts:

- **Release Automation** (`tools/release/`) - Automated version bumping, changelog generation, and publishing
- **Performance Testing** (`tools/perf/`) - Benchmarking and performance monitoring
- **Security Scanning** (`tools/security/`) - Vulnerability scanning and security audits
- **Usage Analytics** (`tools/analytics/`) - Usage pattern analysis and reporting

### 2. **Enhanced Documentation** (`docs/`)
Better organized documentation structure:

- **User Guides** (`docs/guides/`) - Step-by-step tutorials and getting started guides
- **API Documentation** (`docs/api/`) - Comprehensive API reference and examples
- **Strategic Docs** - Customer strategy, organization guides, and roadmap

### 3. **Package Organization** (`packages/`)
Feature-based package structure for better scalability:

- **Integrations** (`packages/integrations/`) - All IDE and editor integrations
- **Workflows** (`packages/workflows/`) - Pre-built automation workflows
- **Templates** (`packages/templates/`) - AGENTS.md templates for popular frameworks

### 4. **Clean Root Directory**
Removed unnecessary files and organized configuration:

- Removed `debug.log` and `package-lock.json` (use PNPM)
- Kept essential configuration files at root level
- Better separation of concerns

## Usage Examples

### Running Tools

```bash
# Release automation
node tools/release/release.mjs patch --dry-run

# Performance benchmarking
node tools/perf/benchmark.mjs

# Security audit
node tools/security/audit.mjs

# Analytics processing
node tools/analytics/usage.mjs
```

### Development Workflow

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Build all packages
pnpm build

# Run security audit
node tools/security/audit.mjs

# Run performance benchmarks
node tools/perf/benchmark.mjs

# Release new version
node tools/release/release.mjs minor
```

### Documentation Access

```bash
# Getting started guide
cat docs/guides/GETTING_STARTED.md

# API reference
cat docs/api/README.md

# Architecture overview
cat docs/CODEBASE_ORGANIZATION.md
```

## Benefits

### 1. **Improved Maintainability**
- Clear separation of concerns
- Standardized directory structure
- Easy to find and update tools

### 2. **Better Developer Experience**
- Comprehensive documentation
- Automated tooling for common tasks
- Clear contribution guidelines

### 3. **Enhanced Security**
- Automated security scanning
- Centralized security tools
- Regular vulnerability checks

### 4. **Performance Monitoring**
- Built-in benchmarking
- Performance regression detection
- Usage analytics for optimization

### 5. **Scalability**
- Feature-based package organization
- Easy to add new integrations
- Template system for quick onboarding

## Migration Notes

### For Contributors
- Tools are now in `tools/` directory
- Documentation has been reorganized
- Use PNPM instead of npm
- Follow the new package structure

### For Users
- No breaking changes to public APIs
- Enhanced documentation available
- Better templates and workflows
- Improved security and performance

### For Operations
- Automated release process
- Security audit automation
- Performance monitoring tools
- Usage analytics and reporting

## Future Enhancements

### Planned Additions
- **CI/CD Integration** - GitHub Actions for automated testing and deployment
- **Monitoring Dashboard** - Real-time metrics and alerting
- **Template Marketplace** - Community-contributed templates
- **Workflow Builder** - Visual workflow creation tool

### Tool Improvements
- **Enhanced Security** - More comprehensive security scanning
- **Performance Profiling** - Advanced performance analysis
- **Automated Testing** - Enhanced test coverage and automation
- **Documentation Generation** - Auto-generated API docs

This organization provides a solid foundation for scaling AgentMD while maintaining excellent developer experience and operational efficiency.
