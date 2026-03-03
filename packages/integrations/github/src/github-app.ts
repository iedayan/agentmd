/**
 * AgentMD GitHub App Integration
 * Provides PR checks, status checks, and workflow generation for AGENTS.md files
 */

import { Probot } from 'probot';
import { parseAgentsMd, validateAgentsMd, computeAgentReadinessScore } from '@agentmd-dev/core';

export default (app: Probot) => {
  // Handle pull request events
  app.on('pull_request.opened', async (context) => {
    const { owner, repo } = context.repo();
    const pull_number = context.payload.pull_request.number;

    try {
      // Get the PR files
      const files = await context.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number,
      });

      // Look for AGENTS.md changes
      const agentsMdFiles = files.data.filter(file =>
        file.filename === 'AGENTS.md' || file.filename.endsWith('.agents.md')
      );

      if (agentsMdFiles.length === 0) {
        return;
      }

      // Create a check run for validation
      const check = await context.octokit.checks.create({
        owner,
        repo,
        name: 'AgentMD Validation',
        head_sha: context.payload.pull_request.head.sha,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

      try {
        // Get AGENTS.md content
        const content = await context.octokit.repos.getContent({
          owner,
          repo,
          path: agentsMdFiles[0].filename,
          ref: context.payload.pull_request.head.sha,
        });

        const agentsMdContent = Buffer.from((content.data as GitHubContentResponse).content, 'base64').toString('utf-8');
        const parsed = parseAgentsMd(agentsMdContent);
        const validation = await validateAgentsMd(parsed);
        const score = await computeAgentReadinessScore(parsed);

        // Update check run with results
        await context.octokit.checks.update({
          owner,
          repo,
          check_run_id: check.data.id,
          status: 'completed',
          conclusion: validation.errors.length === 0 ? 'success' : 'failure',
          completed_at: new Date().toISOString(),
          output: {
            title: 'AgentMD Validation Results',
            summary: `Agent-readiness score: ${score}/100`,
            text: generateValidationReport(validation, score),
          },
        });

        // Create PR comment with suggestions
        if (validation.suggestions.length > 0) {
          await context.octokit.issues.createComment({
            owner,
            repo,
            issue_number: pull_number,
            body: generatePRComment(validation, score),
          });
        }

      } catch (_error) {
        // Update check run with error
        await context.octokit.checks.update({
          owner,
          repo,
          check_run_id: check.data.id,
          status: 'completed',
          conclusion: 'failure',
          completed_at: new Date().toISOString(),
          output: {
            title: 'AgentMD Validation Error',
            summary: 'Failed to validate AGENTS.md file',
            text: _error instanceof Error ? _error.message : 'Unknown error',
          },
        });
      }
    } catch (_error) {
      context.log.error({ error: _error, message: 'Error processing PR' });
    }
  });

  // Handle push events for workflow generation
  app.on('push', async (context) => {
    const { owner, repo } = context.repo();

    try {
      // Check if AGENTS.md exists
      const { data: file } = await context.octokit.repos.getContent({
        owner,
        repo,
        path: 'AGENTS.md',
      });

      const agentsMdContent = Buffer.from((file as GitHubContentResponse).content, 'base64').toString('utf-8');
      const parsed = parseAgentsMd(agentsMdContent);

      // Generate GitHub Actions workflow
      const workflow = generateGitHubWorkflow(parsed);

      // Create or update workflow file
      const workflowPath = '.github/workflows/agents-md.yml';
      try {
        await context.octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: workflowPath,
          message: 'Update AgentMD workflow',
          content: Buffer.from(workflow).toString('base64'),
          sha: (file as GitHubContentResponse).sha,
        });
      } catch (_error) {
        // File might not exist, try creating it
        await context.octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: workflowPath,
          message: 'Create AgentMD workflow',
          content: Buffer.from(workflow).toString('base64'),
        });
      }

    } catch (_error) {
      // AGENTS.md doesn't exist, skip
      context.log.debug('No AGENTS.md found, skipping workflow generation');
    }
  });
};

interface GitHubContentResponse {
  content: string;
  sha: string;
}

function generateValidationReport(validation: { errors: Array<{ message: string, line?: number }>, warnings: Array<{ message: string, line?: number }>, suggestions: string[] }, score: number): string {
  let report = `## Agent-readiness Score: ${score}/100\n\n`;

  if (validation.errors.length > 0) {
    report += '### ❌ Errors\n\n';
    validation.errors.forEach((error: { message: string, line?: number }) => {
      report += `- ${error.message}${error.line ? ` (line ${error.line})` : ''}\n`;
    });
    report += '\n';
  }

  if (validation.warnings.length > 0) {
    report += '### ⚠️ Warnings\n\n';
    validation.warnings.forEach((warning: { message: string, line?: number }) => {
      report += `- ${warning.message}${warning.line ? ` (line ${warning.line})` : ''}\n`;
    });
    report += '\n';
  }

  if (validation.suggestions.length > 0) {
    report += '### 💡 Suggestions\n\n';
    validation.suggestions.forEach((suggestion: string) => {
      report += `- ${suggestion}\n`;
    });
  }

  return report;
}

function generatePRComment(validation: { suggestions: string[] }, score: number): string {
  let comment = `## 🤖 AgentMD Analysis\n\n`;
  comment += `**Agent-readiness score:** ${score}/100\n\n`;

  if (score >= 80) {
    comment += '🟢 **Great job!** Your AGENTS.md is well-structured.\n\n';
  } else if (score >= 60) {
    comment += '🟡 **Good progress!** Consider the improvements below.\n\n';
  } else {
    comment += '🔴 **Needs improvement.** Review the suggestions below.\n\n';
  }

  if (validation.suggestions.length > 0) {
    comment += '### Recommendations:\n\n';
    validation.suggestions.forEach((suggestion: string) => {
      comment += `- ${suggestion}\n`;
    });
  }

  comment += '\n---\n*Generated by [AgentMD](https://agentmd.online)*';
  return comment;
}

function generateGitHubWorkflow(parsed: { commands?: Array<{ type: string }> }): string {
  const commands = parsed.commands || [];
  const hasTests = commands.some((cmd: { type: string }) => cmd.type === 'test');
  const hasBuild = commands.some((cmd: { type: string }) => cmd.type === 'build');
  const hasLint = commands.some((cmd: { type: string }) => cmd.type === 'lint');

  let workflow = `name: AgentMD Workflow

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
`;

  if (hasLint) {
    workflow += `  lint:
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

`;
  }

  if (hasTests) {
    workflow += `  test:
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

`;
  }

  if (hasBuild) {
    workflow += `  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm ci
    - name: Build project
      run: npm run build

`;
  }

  return workflow;
}
