# Contributing to AgentMD

Thank you for your interest in contributing! AgentMD is a rapidly growing project that's making AGENTS.md files executable.

## Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/agentmd.git`
3. **Install dependencies**: `pnpm install`
4. **Create a branch**: `git checkout -b feature/amazing-feature`
5. **Make changes** and test: `pnpm run check && pnpm run test`
6. **Commit**: `git commit -m "feat: add amazing feature"`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## Development Workflow

### Setup
```bash
pnpm install
pnpm run build
pnpm run test
```

### Common Commands
- `pnpm run check` - Lint and typecheck all packages
- `pnpm run test` - Run all tests
- `pnpm run build` - Build all packages
- `pnpm run dev:core` - Watch mode for core package
- `pnpm run dev:dashboard` - Start dashboard dev server

### Package Structure
- `packages/core` - Core parsing/validation engine
- `packages/cli` - Command-line interface
- `packages/agentmd-vscode` - VS Code extension
- `apps/dashboard` - Web dashboard
- `deploy/` - Infrastructure and deployment

## Contribution Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code patterns and naming conventions
- Add tests for new functionality
- Update documentation when needed

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring

### Pull Requests
- Keep PRs focused on a single feature/fix
- Add clear description and testing instructions
- Ensure CI passes before merging
- Request review from maintainers

## Areas to Contribute

### High Priority
- **Templates** - Add more AGENTS.md templates for different stacks
- **Integrations** - New IDE plugins (Neovim, JetBrains, etc.)
- **Documentation** - Tutorials, guides, examples
- **Testing** - More test coverage, edge cases

### Medium Priority
- **Performance** - Optimization for large repositories
- **UI/UX** - Dashboard improvements
- **CLI** - Additional commands and features
- **Security** - Enhanced permission validation

### Ideas
- **Marketplace** - Community-contributed workflows
- **Analytics** - Usage metrics and insights
- **Mobile** - Mobile app for monitoring
- **AI** - Smart AGENTS.md generation

## Getting Help

- **Discussions** - Use GitHub Discussions for questions
- **Issues** - Report bugs or request features
- **Discord** - Join our community (link coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
