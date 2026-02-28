# AgentMD API Documentation

This section contains comprehensive API documentation for AgentMD packages and integrations.

## Core APIs

### @agentmd/core

The core package provides the main functionality for parsing, validating, and executing AGENTS.md files.

#### Main Functions

##### `parseAgentsMd(content: string, filePath?: string): ParsedAgentsMd`

Parse AGENTS.md content into structured data.

```typescript
import { parseAgentsMd } from '@agentmd-dev/core';

const content = `
# My Project
## Build
\`\`\`bash
npm run build
\`\`\`
`;

const parsed = parseAgentsMd(content, './AGENTS.md');
console.log(parsed.sections); // [{ level: 1, title: 'My Project', ... }]
console.log(parsed.commands); // [{ command: 'npm run build', type: 'build', ... }]
```

##### `validateAgentsMd(parsed: ParsedAgentsMd, options?: ValidationOptions): ValidationResult`

Validate AGENTS.md content and get feedback.

```typescript
import { validateAgentsMd } from '@agentmd-dev/core';

const result = await validateAgentsMd(parsed);
console.log(result.errors); // Validation errors
console.log(result.warnings); // Validation warnings
console.log(result.score); // Agent-readiness score (0-100)
```

##### `computeAgentReadinessScore(parsed: ParsedAgentsMd): Promise<number>`

Calculate agent-readiness score.

```typescript
import { computeAgentReadinessScore } from '@agentmd-dev/core';

const score = await computeAgentReadinessScore(parsed);
console.log(`Score: ${score}/100`); // Score: 85/100
```

##### `isCommandSafe(command: string): Promise<GuardrailCheckResult>`

Check if a command is safe to execute.

```typescript
import { isCommandSafe } from '@agentmd-dev/core';

const safety = await isCommandSafe('rm -rf /');
console.log(safety.safe); // false
console.log(safety.reason); // "Potentially destructive command detected"
```

#### Types

##### `ParsedAgentsMd`

```typescript
interface ParsedAgentsMd {
  raw: string;
  sections: AgentsMdSection[];
  commands: ExtractedCommand[];
  directives: AgentsMdDirective[];
  frontmatter?: Record<string, unknown>;
  lineCount: number;
  filePath?: string;
}
```

##### `AgentsMdSection`

```typescript
interface AgentsMdSection {
  level: number;
  title: string;
  heading: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  subsections: AgentsMdSection[];
}
```

##### `ExtractedCommand`

```typescript
interface ExtractedCommand {
  command: string;
  type: CommandType;
  section: string;
  line: number;
  context?: string;
  requiresShell?: boolean;
  requiresApproval?: boolean;
}
```

##### `ValidationResult`

```typescript
interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  suggestions: string[];
}
```

### @agentmd/cli

Command-line interface for AgentMD.

#### Commands

##### `agentmd init [options]`

Initialize AGENTS.md in current directory.

```bash
agentmd init
agentmd init --template nextjs
agentmd init --force
```

##### `agentmd check [options] [path]`

Validate AGENTS.md files.

```bash
agentmd check
agentmd check --contract
agentmd check --verbose
agentmd check ./path/to/AGENTS.md
```

##### `agentmd score [path]`

Calculate agent-readiness score.

```bash
agentmd score
agentmd score --json
```

##### `agentmd run [options] <command>`

Execute commands with safety checks.

```bash
agentmd run "npm test"
agentmd run --dry-run "npm run build"
agentmd run --force "dangerous command"
```

##### `agentmd discover [options] [path]`

Find AGENTS.md files in directory tree.

```bash
agentmd discover
agentmd discover --parse
agentmd discover --max-depth 5
```

### @agentmd/sdk

Software Development Kit for building AgentMD integrations.

#### Main Classes

##### `AgentMDClient`

```typescript
import { AgentMDClient } from '@agentmd/sdk';

const client = new AgentMDClient({
  apiKey: 'your-api-key',
  endpoint: 'https://api.agentmd.io'
});

// Parse AGENTS.md
const parsed = await client.parse(content);

// Validate configuration
const result = await client.validate(parsed);

// Execute workflow
const workflowResult = await client.executeWorkflow('pr-reviewer', {
  owner: 'my-org',
  repo: 'my-repo',
  prNumber: 123
});
```

#### Utilities

##### `createTemplate(name: string, content: string): Template`

Create a reusable template.

```typescript
import { createTemplate } from '@agentmd/sdk';

const template = createTemplate('nextjs', `
# Next.js Project
## Development
### Install dependencies
\`\`\`bash
npm install
\`\`\`
`);
```

##### `registerWorkflow(name: string, executor: WorkflowExecutor): void`

Register a custom workflow.

```typescript
import { registerWorkflow } from '@agentmd/sdk';

registerWorkflow('custom-review', async (config) => {
  // Custom review logic
  return { passed: true, feedback: 'Review completed' };
});
```

## Integration APIs

### VSCode Extension

#### Commands

- `agentmd.validate` - Validate current AGENTS.md file
- `agentmd.showScore` - Show agent-readiness score breakdown

#### Configuration

```json
{
  "agentmd.diagnostics.enabled": true,
  "agentmd.diagnostics.debounceMs": 300,
  "agentmd.score.showInStatusBar": true
}
```

#### Language Features

- Syntax highlighting for AGENTS.md
- Real-time validation diagnostics
- Hover information for commands
- Auto-completion for directives

### Cursor Integration

#### Events

```typescript
import { CursorIntegration } from '@agentmd/integrations-cursor';

const cursor = new CursorIntegration();
await cursor.initialize();

// Track usage
await cursor.trackCursorEvent('completion_used', {
  language: 'typescript',
  context: 'function_definition'
});
```

## Workflow APIs

### PR Reviewer Workflow

```typescript
import { PRReviewerWorkflow } from '@agentmd/workflows';

const reviewer = new PRReviewerWorkflow({
  owner: 'my-org',
  repo: 'my-repo',
  prNumber: 123,
  criteria: [
    {
      name: 'Custom Check',
      description: 'Custom validation logic',
      weight: 8,
      check: async (context) => ({ passed: true, score: 90, feedback: 'Good' })
    }
  ]
});

const result = await reviewer.execute();
console.log(result.overallScore); // 85
console.log(result.passed); // true
```

### Test Triage Workflow

```typescript
import { TestTriageWorkflow } from '@agentmd/workflows';

const triage = new TestTriageWorkflow({
  owner: 'my-org',
  repo: 'my-repo',
  ref: 'main',
  framework: 'jest'
});

const result = await triage.execute();
console.log(result.totalFailures); // 5
console.log(result.categories); // { flaky: 2, code: 3 }
```

## Analytics API

### Event Tracking

```typescript
import { getAnalytics, initializeAnalytics } from '@agentmd/core';

// Initialize analytics
initializeAnalytics('your-api-key');

// Track events
const analytics = getAnalytics();
await analytics.track('agents_md_validated', {
  score_range: 'good',
  error_count: 0
});

// Track CLI usage
await analytics.trackCliCommand('check', ['--verbose']);

// Track editor usage
await analytics.trackEditorUsage('vscode', 'validation');
```

### Privacy & Security

All analytics data is anonymized and sanitized:

- No PII (personally identifiable information)
- File paths are sanitized
- Commands are never logged in full
- Environment variables are never captured

## Error Handling

### Common Errors

##### `ParseError`

```typescript
try {
  const parsed = parseAgentsMd(invalidContent);
} catch (error) {
  if (error instanceof ParseError) {
    console.error(`Parse error at line ${error.line}: ${error.message}`);
  }
}
```

##### `ValidationError`

```typescript
const result = await validateAgentsMd(parsed);
if (result.errors.length > 0) {
  result.errors.forEach(error => {
    console.error(`${error.code}: ${error.message} at line ${error.line}`);
  });
}
```

##### `SecurityError`

```typescript
try {
  await isCommandSafe(dangerousCommand);
} catch (error) {
  if (error instanceof SecurityError) {
    console.error(`Security violation: ${error.reason}`);
  }
}
```

## Configuration

### Environment Variables

```bash
AGENTMD_API_KEY=your-api-key
AGENTMD_ENDPOINT=https://api.agentmd.io
AGENTMD_ANALYTICS_ENABLED=true
AGENTMD_LOG_LEVEL=info
```

### Configuration Files

```json
// agentmd.config.json
{
  "defaultTemplate": "nextjs",
  "security": {
    "riskLevel": "medium",
    "requireApproval": true
  },
  "analytics": {
    "enabled": true,
    "sampleRate": 0.1
  }
}
```

## Examples

### Basic Usage

```typescript
import { parseAgentsMd, validateAgentsMd, computeAgentReadinessScore } from '@agentmd/core';

async function analyzeProject(content: string) {
  // Parse AGENTS.md
  const parsed = parseAgentsMd(content);
  
  // Validate configuration
  const validation = await validateAgentsMd(parsed);
  console.log(`Validation: ${validation.errors.length} errors, ${validation.warnings.length} warnings`);
  
  // Calculate score
  const score = await computeAgentReadinessScore(parsed);
  console.log(`Agent-readiness score: ${score}/100`);
  
  return { parsed, validation, score };
}
```

### Custom Integration

```typescript
import { AgentMDClient } from '@agentmd/sdk';

class MyEditorIntegration {
  private client: AgentMDClient;
  
  constructor() {
    this.client = new AgentMDClient({
      apiKey: process.env.AGENTMD_API_KEY
    });
  }
  
  async validateFile(content: string) {
    const parsed = await this.client.parse(content);
    const result = await this.client.validate(parsed);
    
    return {
      diagnostics: result.errors.map(error => ({
        line: error.line,
        message: error.message,
        severity: 'error'
      })),
      score: result.score
    };
  }
}
```

### Custom Workflow

```typescript
import { registerWorkflow } from '@agentmd/sdk';

interface DeployConfig {
  environment: 'staging' | 'production';
  service: string;
}

registerWorkflow('deploy-service', async (config: DeployConfig) => {
  // Validate deployment configuration
  if (!config.service) {
    throw new Error('Service name is required');
  }
  
  // Check if deployment is safe
  if (config.environment === 'production') {
    // Add additional checks for production
    const safetyCheck = await runProductionSafetyChecks(config.service);
    if (!safetyCheck.passed) {
      return { passed: false, reason: safetyCheck.reason };
    }
  }
  
  // Execute deployment
  const result = await executeDeployment(config);
  
  return {
    passed: result.success,
    feedback: result.success 
      ? `Deployed ${config.service} to ${config.environment}`
      : `Deployment failed: ${result.error}`
  };
});
```

## Support

- **Documentation**: [docs.agentmd.io](https://docs.agentmd.io)
- **API Reference**: [api.agentmd.io](https://api.agentmd.io)
- **Examples**: [github.com/iedayan/agentmd/examples](https://github.com/iedayan/agentmd/examples)
- **Issues**: [github.com/iedayan/agentmd/issues](https://github.com/iedayan/agentmd/issues)

---

For more detailed information, see the specific package documentation or explore the examples repository.
