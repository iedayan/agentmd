/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { PRReviewerWorkflow, type PRContext, type ReviewCriteria } from '../../pr-reviewer';
import type { ParsedAgentsMd } from '@agentmd-dev/core';

describe('PRReviewerWorkflow', () => {
    const mockConfig = {
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 42,
    };

    const mockAgentsMd: ParsedAgentsMd = {
        raw: '',
        commands: [
            { type: 'test', command: 'npm test', section: 'Test', line: 1 },
            { type: 'build', command: 'npm run build', section: 'Build', line: 2 },
            { type: 'lint', command: 'npm run lint', section: 'Lint', line: 3 },
        ],
        sections: [],
        lineCount: 10,
    };

    it('initializes with default criteria', () => {
        const workflow = new PRReviewerWorkflow(mockConfig);
        // @ts-ignore: testing private property
        expect(workflow.defaultCriteria.length).toBeGreaterThan(0);
        // @ts-ignore
        expect(workflow.defaultCriteria.map(c => c.name)).toContain('Test Coverage');
    });

    describe('execute()', () => {
        it('summarizes results from all criteria checks', async () => {
            const customCriteria: ReviewCriteria = {
                name: 'Custom',
                description: 'Custom Check',
                weight: 10,
                check: async () => ({
                    passed: true,
                    score: 100,
                    feedback: 'Custom OK',
                    suggestions: [],
                    blocked: false,
                }),
            };

            const workflow = new PRReviewerWorkflow({ ...mockConfig, criteria: [customCriteria] });

            // Mock context creation
            const mockContext: PRContext = {
                pr: {
                    title: 'Test PR',
                    description: 'Desc',
                    author: 'user',
                    baseBranch: 'main',
                    headBranch: 'feature',
                    changedFiles: [],
                },
                changes: [],
                agentsMd: mockAgentsMd,
            };

            // @ts-ignore: overriding private method for test isolation
            workflow.buildContext = async () => mockContext;

            const summary = await workflow.execute();

            expect(summary.results.length).toBeGreaterThan(1);
            const customResult = summary.results.find((r: any) => r.feedback === 'Custom OK');
            expect(customResult).toBeDefined();
        });
    });

    describe('checkTestCoverage()', () => {
        it('fails if source files are changed but no tests are included', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkTestCoverage({
                changes: [{ path: '/src/app.ts', type: 'modified', additions: 10, deletions: 0 }],
            } as any);

            expect(result.passed).toBe(false);
            expect(result.score).toBe(30);
            expect(result.feedback).toContain('no test files');
        });

        it('passes if tests are included', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkTestCoverage({
                changes: [
                    { path: '/src/app.ts', type: 'modified', additions: 10, deletions: 0 },
                    { path: '/src/app.test.ts', type: 'added', additions: 20, deletions: 0 },
                ],
            } as any);

            expect(result.passed).toBe(true);
            expect(result.score).toBe(90);
        });
    });

    describe('checkBuildSuccess()', () => {
        it('fails if no AGENTS.md build commands', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkBuildSuccess({
                agentsMd: { commands: [{ type: 'test', command: 'npm test', section: 'Test', line: 1 }] },
            } as any);

            expect(result.passed).toBe(false);
            expect(result.feedback).toContain('No build commands');
        });

        it('passes if AGENTS.md has build commands', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkBuildSuccess({
                agentsMd: mockAgentsMd,
            } as any);

            expect(result.passed).toBe(true);
            expect(result.score).toBe(95);
        });
    });

    describe('checkSecurity()', () => {
        it('fails and blocks if sensitive files are modified', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkSecurity({
                changes: [{ path: '.env.local', type: 'added', additions: 1, deletions: 0 }],
            } as any);

            expect(result.passed).toBe(false);
            expect(result.blocked).toBe(true);
            expect(result.score).toBe(20);
        });

        it('passes if no sensitive files modified', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkSecurity({
                changes: [{ path: '/src/app.ts', type: 'modified', additions: 1, deletions: 0 }],
            } as any);

            expect(result.passed).toBe(true);
            expect(result.blocked).toBe(false);
        });
    });

    describe('checkDocumentation()', () => {
        it('fails if new features added without docs', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkDocumentation({
                changes: [{ path: '/src/new-feature.ts', type: 'added', additions: 50, deletions: 0 }],
            } as any);

            expect(result.passed).toBe(false);
            expect(result.score).toBe(60);
        });

        it('passes if features added with docs', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkDocumentation({
                changes: [
                    { path: '/src/new-feature.ts', type: 'added', additions: 50, deletions: 0 },
                    { path: 'docs/new-feature.md', type: 'added', additions: 10, deletions: 0 },
                ],
            } as any);

            expect(result.passed).toBe(true);
        });
    });

    describe('checkCodeStyle()', () => {
        it('passes and suggests linting if no lint command found', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkCodeStyle({
                agentsMd: { commands: [] },
            } as any);

            expect(result.passed).toBe(true);
            expect(result.suggestions).toContain('Add `npm run lint` to AGENTS.md');
        });

        it('passes if lint command found', async () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const result = await workflow.checkCodeStyle({
                agentsMd: mockAgentsMd,
            } as any);

            expect(result.passed).toBe(true);
            expect(result.feedback).toContain('linting command');
        });
    });

    describe('summarizeResults()', () => {
        it('generates blocked status', () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const summary = workflow.summarizeResults([
                { passed: true, score: 100, feedback: '', suggestions: [], blocked: false },
                { passed: false, score: 0, feedback: '', suggestions: [], blocked: true },
            ]);

            expect(summary.passed).toBe(false);
            expect(summary.blocked).toBe(true);
            expect(summary.summary).toContain('BLOCKED');
        });

        it('generates passed status', () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const summary = workflow.summarizeResults([
                { passed: true, score: 100, feedback: '', suggestions: [], blocked: false },
            ]);

            expect(summary.passed).toBe(true);
            expect(summary.blocked).toBe(false);
            expect(summary.summary).toContain('APPROVED');
        });

        it('generates needs attention status', () => {
            const workflow = new PRReviewerWorkflow(mockConfig);
            // @ts-ignore
            const summary = workflow.summarizeResults([
                { passed: false, score: 50, feedback: '', suggestions: [], blocked: false },
            ]);

            expect(summary.passed).toBe(false);
            expect(summary.blocked).toBe(false);
            expect(summary.summary).toContain('NEEDS ATTENTION');
        });
    });
});
