# Changelog

All notable changes to AgentMD will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Discussions integration
- Enhanced issue templates
- Security policy documentation
- Contributing guidelines
- Improved README with quick start guide

### Changed
- Enhanced package exports for better module resolution
- Added Node.js >=20 engine requirement
- Improved TypeScript configuration

### Fixed
- VS Code extension rootDir TypeScript configuration error
- Cleaned up unnecessary build artifacts

## [0.1.1] - 2025-02-28

### Added
- Core parsing and validation engine
- CLI tool for AGENTS.md management
- VS Code extension with real-time diagnostics
- Web dashboard for agent orchestration
- GitHub Actions export functionality
- Agent readiness scoring (0-100)
- Sandboxed command execution
- Permission-based access control
- AGENTS.md composition from fragments
- Comprehensive test suite (398 test files)

### Changed
- Initial release of AgentMD platform

## [0.1.0] - 2025-02-21

### Added
- Project initialization
- Monorepo structure with pnpm workspaces
- TypeScript configuration
- Basic AGENTS.md parsing
- Core package structure

---

## How to Update

```bash
# Update CLI
npm update -g @agentmd-dev/cli

# Update core package
npm update @agentmd-dev/core

# Update VS Code extension
# Check for updates in VS Code Extensions panel
```
