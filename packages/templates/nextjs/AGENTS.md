# Next.js Project

AI agent configuration for Next.js applications with modern development practices.

## Overview

This is a Next.js project configured for AI agent assistance. Agents can help with development, testing, deployment, and maintenance tasks while following security best practices.

## Development Setup

### Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Environment setup

```bash
cp .env.example .env.local
# Fill in required environment variables
```

### Start development server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at http://localhost:3000.

## Testing

### Run unit tests

```bash
npm test
# or
pnpm test
```

### Run tests with coverage

```bash
npm run test:coverage
# or
pnpm test:coverage
```

### Run E2E tests

```bash
npm run test:e2e
# or
pnpm test:e2e
```

## Build & Deployment

### Build for production

```bash
npm run build
# or
pnpm build
```

### Start production server

```bash
npm start
# or
pnpm start
```

### Deploy to Vercel (recommended)

```bash
npm run deploy
# or
vercel --prod
```

## Code Quality

### Lint code

```bash
npm run lint
# or
pnpm lint
```

### Format code

```bash
npm run format
# or
pnpm format
```

### Type checking

```bash
npm run type-check
# or
pnpm type-check
```

## Database Operations

### Run database migrations

```bash
npm run db:migrate
# or
pnpm db:migrate
```

### Seed database

```bash
npm run db:seed
# or
pnpm db:seed
```

### Reset database

```bash
npm run db:reset
# or
pnpm db:reset
```

## Security & Compliance

### Security audit

```bash
npm audit
# or
pnpm audit
```

### Check for vulnerabilities

```bash
npm run security:check
# or
pnpm security:check
```

## Performance

### Analyze bundle size

```bash
npm run analyze
# or
pnpm analyze
```

### Run Lighthouse CI

```bash
npm run lighthouse
# or
pnpm lighthouse
```

## Agent Guidelines

### What agents can do:

- ✅ Run tests and analyze results
- ✅ Build and validate the application
- ✅ Review code for best practices
- ✅ Update dependencies (with approval)
- ✅ Generate documentation
- ✅ Create and update components
- ✅ Fix bugs and implement features

### Security restrictions:

- 🚫 Never access environment variables directly
- 🚫 Never modify production database
- 🚫 Never expose sensitive data
- 🚫 Always use dry-run mode for destructive operations
- 🚫 Require approval for dependency updates

### File structure awareness:

- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `public/` - Static assets
- `docs/` - Project documentation

### Common patterns:

- Use TypeScript for all new code
- Follow existing component patterns
- Add tests for new features
- Update documentation for API changes
- Use Tailwind CSS for styling
- Implement proper error handling

## Troubleshooting

### Common issues and solutions:

1. **Build fails** - Check TypeScript errors and missing dependencies
2. **Tests fail** - Verify test environment setup and database connection
3. **Deployment fails** - Check environment variables and build configuration
4. **Performance issues** - Run bundle analysis and optimize imports

### Getting help:

- Check Next.js documentation: https://nextjs.org/docs
- Review error logs in console
- Ask agents to analyze specific error messages
- Check GitHub issues for known problems

## Contributing

When contributing:

1. Create a feature branch
2. Follow existing code patterns
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request for review

Agents can help with all of these steps while maintaining code quality and security standards.
