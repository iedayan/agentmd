import { NextRequest, NextResponse } from 'next/server';
import { PRReviewerWorkflow } from '@agentmd-dev/workflows';
import type { ParsedAgentsMd } from '@agentmd-dev/core';

// Mock GitHub API data - in production, this would call real GitHub API
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params reserved for real API
async function fetchGitHubPR(_owner: string, _repo: string, _prNumber: number) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    title: 'Add new authentication feature',
    description: 'Implements OAuth2 authentication with JWT tokens for secure user authentication',
    author: 'john-doe',
    baseBranch: 'main',
    headBranch: 'feature/auth',
    changedFiles: [
      {
        path: 'src/auth/oauth.ts',
        type: 'added' as const,
        additions: 150,
        deletions: 0,
        content: 'export class OAuthProvider { /* OAuth implementation */ }',
      },
      {
        path: 'src/auth/jwt.ts',
        type: 'added' as const,
        additions: 80,
        deletions: 0,
        content: 'export class JWTService { /* JWT implementation */ }',
      },
      {
        path: 'src/middleware/auth.ts',
        type: 'modified' as const,
        additions: 25,
        deletions: 5,
        content: 'export function authMiddleware() { /* Auth middleware */ }',
      },
      {
        path: 'README.md',
        type: 'modified' as const,
        additions: 15,
        deletions: 0,
        content: '# Authentication docs updated',
      },
    ],
  };
}

// Mock AGENTS.md content - in production, this would fetch from the repo
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params reserved for real API
async function fetchAgentsMd(_owner: string, _repo: string): Promise<ParsedAgentsMd | undefined> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
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
        content:
          '## Build commands\n\n```bash\npnpm build\n```\n\n## Test commands\n\n```bash\npnpm test\n```\n\n## Linting\n\n```bash\npnpm lint\n```',
        children: [],
        lineStart: 1,
        lineEnd: 14,
      },
    ],
    commands: [
      {
        command: 'pnpm build',
        section: 'Testing',
        line: 4,
        type: 'build',
        context: undefined,
      },
      {
        command: 'pnpm test',
        section: 'Testing',
        line: 8,
        type: 'test',
        context: undefined,
      },
      {
        command: 'pnpm lint',
        section: 'Testing',
        line: 12,
        type: 'lint',
        context: undefined,
      },
    ],
    lineCount: 14,
    filePath: 'AGENTS.md',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, prNumber } = body;

    if (!owner || !repo || !prNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: owner, repo, prNumber' },
        { status: 400 },
      );
    }

    // Fetch PR data and AGENTS.md
    const [prData, agentsMd] = await Promise.all([
      fetchGitHubPR(owner, repo, prNumber),
      fetchAgentsMd(owner, repo),
    ]);

    // Create and run the PR Reviewer workflow
    const workflow = new PRReviewerWorkflow({
      owner,
      repo,
      prNumber,
    });

    // Mock the private methods with real data (cast via unknown to avoid private-member intersection)
    type WorkflowMocks = {
      fetchPRData: () => Promise<typeof prData>;
      fetchFileChanges: () => Promise<typeof prData.changedFiles>;
      loadAgentsMd: () => Promise<typeof agentsMd>;
    };
    const w = workflow as unknown as WorkflowMocks;
    w.fetchPRData = async () => prData;
    w.fetchFileChanges = async () => prData.changedFiles;
    w.loadAgentsMd = async () => agentsMd;

    // Execute the review
    const result = await workflow.execute();

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        prData: {
          title: prData.title,
          author: prData.author,
          description: prData.description,
          changedFilesCount: prData.changedFiles.length,
        },
        reviewedAt: new Date().toISOString(),
        duration: 2.3, // Mock duration
      },
    });
  } catch (error) {
    console.error('PR Reviewer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze PR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Missing required query parameters: owner, repo' },
      { status: 400 },
    );
  }

  try {
    // Mock recent reviews for this repository
    const mockReviews = [
      {
        id: '1',
        prNumber: 42,
        title: 'Add new authentication feature',
        author: 'john-doe',
        overallScore: 88,
        status: 'approved' as const,
        reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: 2.3,
      },
      {
        id: '2',
        prNumber: 41,
        title: 'Fix memory leak in data processor',
        author: 'jane-smith',
        overallScore: 65,
        status: 'needs_attention' as const,
        reviewedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        duration: 1.8,
      },
    ];

    return NextResponse.json({
      success: true,
      reviews: mockReviews,
    });
  } catch (error) {
    console.error('PR Reviewer GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
