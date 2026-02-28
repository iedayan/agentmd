import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { discoverAgentsMd, findNearestAgentsMd } from '../discovery.js';

describe('discoverAgentsMd', () => {
  it('finds AGENTS.md in directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      writeFileSync(join(dir, 'AGENTS.md'), '## Test\nRun `pnpm test`');
      const results = discoverAgentsMd(dir);
      expect(results.length).toBe(1);
      expect(results[0].path).toBe('AGENTS.md');
      expect(results[0].depth).toBe(0);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('finds nested AGENTS.md in subdirectories', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      writeFileSync(join(dir, 'AGENTS.md'), '## Root');
      mkdirSync(join(dir, 'packages'));
      writeFileSync(join(dir, 'packages', 'AGENTS.md'), '## Package');
      const results = discoverAgentsMd(dir);
      expect(results.length).toBe(2);
      const root = results.find((r) => r.depth === 0);
      const nested = results.find((r) => r.path.includes('packages'));
      expect(root).toBeDefined();
      expect(nested).toBeDefined();
      expect(nested?.depth).toBe(1);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('parses when parse option is true', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      writeFileSync(join(dir, 'AGENTS.md'), '## Testing\nRun `pnpm test`');
      const results = discoverAgentsMd(dir, { parse: true });
      expect(results[0].parsed).toBeDefined();
      expect(results[0].parsed?.sections.length).toBeGreaterThanOrEqual(1);
      expect(results[0].parsed?.commands.length).toBeGreaterThanOrEqual(1);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('respects maxDepth option', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      let d = dir;
      for (let i = 0; i < 5; i++) {
        mkdirSync(join(d, 'l' + i), { recursive: true });
        writeFileSync(join(d, 'l' + i, 'AGENTS.md'), `## Level ${i}`);
        d = join(d, 'l' + i);
      }
      const results = discoverAgentsMd(dir, { maxDepth: 2 });
      expect(results.length).toBeLessThanOrEqual(3);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

describe('findNearestAgentsMd', () => {
  it('finds AGENTS.md in same directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      mkdirSync(join(dir, 'packages', 'core'), { recursive: true });
      writeFileSync(join(dir, 'packages', 'core', 'AGENTS.md'), '## Core');
      const found = findNearestAgentsMd(join(dir, 'packages', 'core'));
      expect(found).not.toBeNull();
      expect(found?.path).toContain('packages');
      expect(found?.path).toContain('AGENTS.md');
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('walks up to find AGENTS.md in parent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      mkdirSync(join(dir, 'packages', 'core', 'src'), { recursive: true });
      writeFileSync(join(dir, 'packages', 'core', 'AGENTS.md'), '## Core');
      writeFileSync(join(dir, 'packages', 'core', 'src', 'index.ts'), 'export {}');
      const found = findNearestAgentsMd(join(dir, 'packages', 'core', 'src', 'index.ts'));
      expect(found).not.toBeNull();
      expect(found?.absolutePath).toContain('core');
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('returns null when no AGENTS.md exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentmd-'));
    try {
      mkdirSync(join(dir, 'empty'), { recursive: true });
      const found = findNearestAgentsMd(join(dir, 'empty'));
      expect(found).toBeNull();
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});
