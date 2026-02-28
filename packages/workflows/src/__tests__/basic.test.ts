import { describe, it, expect } from 'vitest';

describe('Workflows Package', () => {
  it('should have basic test structure', () => {
    expect(true).toBe(true);
  });

  it('should import PRReviewerWorkflow', async () => {
    const { PRReviewerWorkflow } = await import('../../pr-reviewer/index');
    expect(PRReviewerWorkflow).toBeDefined();
  });
});
