import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Probot, ProbotOctokit } from 'probot';
import githubApp from './github-app';
import * as core from '@agentmd-dev/core';

vi.mock('@agentmd-dev/core', async () => {
  const actual = await vi.importActual<typeof import('@agentmd-dev/core')>('@agentmd-dev/core');
  return {
    ...actual,
    parseAgentsMd: vi.fn(),
    validateAgentsMd: vi.fn(),
    computeAgentReadinessScore: vi.fn(),
  };
});

describe('GitHub Integration App', () => {
  let mockApp: any;
  let mockContext: any;
  let handlers: Record<string, Function>;

  beforeEach(() => {
    handlers = {};
    mockApp = {
      on: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      log: {
        error: vi.fn(),
        debug: vi.fn(),
      }
    };

    // Initialize the app to register handlers
    githubApp(mockApp);

    mockContext = {
      repo: vi.fn().mockReturnValue({ owner: 'test-owner', repo: 'test-repo' }),
      payload: {
        pull_request: { number: 42, head: { sha: '123456' } },
      },
      octokit: {
        pulls: {
          listFiles: vi.fn(),
        },
        checks: {
          create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
          update: vi.fn(),
        },
        repos: {
          getContent: vi.fn(),
          createOrUpdateFileContents: vi.fn(),
        },
        issues: {
          createComment: vi.fn(),
        },
      },
      log: {
        debug: vi.fn(),
        error: vi.fn(),
      }
    };
  });

  describe('pull_request.opened', () => {
    it('should ignore PRs without AGENTS.md changes', async () => {
      mockContext.octokit.pulls.listFiles.mockResolvedValue({
        data: [{ filename: 'src/index.ts' }],
      });

      await handlers['pull_request.opened'](mockContext);

      expect(mockContext.octokit.checks.create).not.toHaveBeenCalled();
    });

    it('should validate AGENTS.md and create success check run', async () => {
      mockContext.octokit.pulls.listFiles.mockResolvedValue({
        data: [{ filename: 'AGENTS.md' }],
      });
      mockContext.octokit.repos.getContent.mockResolvedValue({
        data: { content: Buffer.from('---').toString('base64'), sha: 'sha' },
      });

      vi.mocked(core.parseAgentsMd).mockReturnValue({} as any);
      vi.mocked(core.validateAgentsMd).mockResolvedValue({ valid: true, errors: [], warnings: [], suggestions: [] });
      vi.mocked(core.computeAgentReadinessScore).mockResolvedValue(100);

      await handlers['pull_request.opened'](mockContext);

      expect(mockContext.octokit.checks.create).toHaveBeenCalled();
      expect(mockContext.octokit.checks.update).toHaveBeenCalledWith(expect.objectContaining({
        conclusion: 'success',
      }));
    });

    it('should report failure if validation errors exist', async () => {
      mockContext.octokit.pulls.listFiles.mockResolvedValue({
        data: [{ filename: 'AGENTS.md' }],
      });
      mockContext.octokit.repos.getContent.mockResolvedValue({
        data: { content: Buffer.from('---').toString('base64'), sha: 'sha' },
      });

      vi.mocked(core.parseAgentsMd).mockReturnValue({} as any);
      vi.mocked(core.validateAgentsMd).mockResolvedValue({
        valid: false,
        errors: [{ message: 'Bad syntax', line: 1 } as any],
        warnings: [],
        suggestions: ['Fix syntax']
      });
      vi.mocked(core.computeAgentReadinessScore).mockResolvedValue(50);

      await handlers['pull_request.opened'](mockContext);

      expect(mockContext.octokit.checks.update).toHaveBeenCalledWith(expect.objectContaining({
        conclusion: 'failure',
      }));
      expect(mockContext.octokit.issues.createComment).toHaveBeenCalled();
    });
  });

  describe('push event', () => {
    it('should generate and commit workflow file if AGENTS.md exists', async () => {
      mockContext.octokit.repos.getContent.mockResolvedValue({
        data: { content: Buffer.from('---').toString('base64'), sha: 'sha' },
      });

      vi.mocked(core.parseAgentsMd).mockReturnValue({ commands: [{ type: 'test' }] } as any);

      await handlers['push'](mockContext);

      expect(mockContext.octokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '.github/workflows/agents-md.yml',
        })
      );
    });

    it('should skip if AGENTS.md does not exist', async () => {
      mockContext.octokit.repos.getContent.mockRejectedValue(new Error('Not found'));

      await handlers['push'](mockContext);

      expect(mockContext.octokit.repos.createOrUpdateFileContents).not.toHaveBeenCalled();
      expect(mockContext.log.debug).toHaveBeenCalledWith('No AGENTS.md found, skipping workflow generation');
    });
  });
});
