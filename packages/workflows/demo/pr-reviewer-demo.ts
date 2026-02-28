#!/usr/bin/env tsx
/**
 * PR Reviewer Demo
 * Demonstrates the PR Reviewer workflow with sample data
 */

import { PRReviewerWorkflow } from '../pr-reviewer/index.js';
import type { ParsedAgentsMd } from '@agentmd-dev/core';

// Sample AGENTS.md data
const sampleAgentsMd: ParsedAgentsMd = {
  raw: `# Testing

## Build commands
\`\`\`bash
pnpm build
\`\`\`

## Test commands
\`\`\`bash
pnpm test
\`\`\`

## Linting
\`\`\`bash
pnpm lint
\`\`\``,
  sections: [
    {
      level: 1,
      title: 'Testing',
      heading: '# Testing',
      content: '## Build commands\n\n```bash\npnpm build\n```\n\n## Test commands\n\n```bash\npnpm test\n```\n\n## Linting\n\n```bash\npnpm lint\n```',
      children: [],
      lineStart: 1,
      lineEnd: 14
    }
  ],
  commands: [
    {
      command: 'pnpm build',
      section: 'Testing',
      line: 4,
      type: 'build',
      context: undefined
    },
    {
      command: 'pnpm test',
      section: 'Testing',
      line: 8,
      type: 'test',
      context: undefined
    },
    {
      command: 'pnpm lint',
      section: 'Testing',
      line: 12,
      type: 'lint',
      context: undefined
    }
  ],
  lineCount: 14,
  filePath: 'AGENTS.md'
};

// Create a demo workflow with mocked data
async function createDemoWorkflow() {
  const workflow = new PRReviewerWorkflow({
    owner: 'agentmd',
    repo: 'demo-repo',
    prNumber: 42
  });

  // Override the private methods with mocked implementations
  (workflow as any).fetchPRData = async () => {
    return {
      title: 'Add new authentication feature',
      description: 'Implements OAuth2 authentication with JWT tokens',
      author: 'john-doe',
      baseBranch: 'main',
      headBranch: 'feature/auth',
      changedFiles: ['src/auth/oauth.ts', 'src/auth/jwt.ts', 'src/middleware/auth.ts']
    };
  };

  (workflow as any).fetchFileChanges = async () => {
    return [
      {
        path: 'src/auth/oauth.ts',
        type: 'added' as const,
        additions: 150,
        deletions: 0,
        content: 'export class OAuthProvider { ... }'
      },
      {
        path: 'src/auth/jwt.ts',
        type: 'added' as const,
        additions: 80,
        deletions: 0,
        content: 'export class JWTService { ... }'
      },
      {
        path: 'src/middleware/auth.ts',
        type: 'modified' as const,
        additions: 25,
        deletions: 5,
        content: 'export function authMiddleware() { ... }'
      },
      {
        path: 'README.md',
        type: 'modified' as const,
        additions: 15,
        deletions: 0,
        content: '# Authentication docs updated'
      }
    ];
  };

  (workflow as any).loadAgentsMd = async () => {
    return sampleAgentsMd;
  };

  return workflow;
}

async function runDemo() {
  console.log('🚀 PR Reviewer Demo\n');
  
  const workflow = await createDemoWorkflow();

  console.log('📊 Running PR review analysis...\n');
  
  try {
    const result = await workflow.execute();
    
    console.log('📋 Review Results:');
    console.log('==================');
    console.log(`Overall Score: ${result.overallScore}/100`);
    console.log(`Status: ${result.summary}\n`);
    
    console.log('Detailed Results:');
    console.log('-----------------');
    result.results.forEach((review: any, index: number) => {
      console.log(`${index + 1}. Test Coverage`);
      console.log(`   Score: ${review.score}/100`);
      console.log(`   Status: ${review.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Feedback: ${review.feedback}`);
      if (review.suggestions.length > 0) {
        console.log(`   Suggestions:`);
        review.suggestions.forEach((s: string) => console.log(`     - ${s}`));
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

runDemo().catch(console.error);
