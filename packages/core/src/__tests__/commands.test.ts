import { describe, it, expect } from 'vitest';
import { extractCommands, getSuggestedExecutionOrder } from '../commands.js';
import type { AgentsMdSection, ExtractedCommand } from '../types.js';

const emptySections: AgentsMdSection[] = [];

describe('extractCommands', () => {
  it('extracts backtick commands', () => {
    const content = 'Run `pnpm test` before committing.';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm test');
  });

  it('extracts from code blocks', () => {
    const content = `
## Build
\`\`\`bash
pnpm install
pnpm run build
\`\`\`
`;
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm install');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it('skips comment lines in code blocks', () => {
    const content = `
\`\`\`sh
# install deps
pnpm install
# then build
pnpm run build
\`\`\`
`;
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).not.toContain('# install deps');
    expect(commands.map((c) => c.command)).toContain('pnpm install');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it('deduplicates identical commands', () => {
    const content = 'Run `pnpm test` and also `pnpm test`.';
    const commands = extractCommands(content, emptySections);
    expect(commands.filter((c) => c.command === 'pnpm test')).toHaveLength(1);
  });

  it('rejects non-commands in backticks', () => {
    const content = 'See `packages/core` or `https://example.com`.';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).not.toContain('packages/core');
    expect(commands.map((c) => c.command)).not.toContain('https://example.com');
  });

  it('infers command types', () => {
    const content = '`pnpm test` and `pnpm run build` and `pnpm lint`';
    const commands = extractCommands(content, emptySections);
    expect(commands.find((c) => c.command.includes('test'))?.type).toBe('test');
    expect(commands.find((c) => c.command.includes('build'))?.type).toBe('build');
    expect(commands.find((c) => c.command.includes('lint'))?.type).toBe('lint');
  });

  it('extracts from run/execute patterns with backticks', () => {
    const content = 'Run `pnpm test` and execute `pnpm run build`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm test');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it('extracts from plain code blocks (no lang)', () => {
    const content = `
## Setup
\`\`\`
pnpm install
\`\`\`
`;
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm install');
  });

  it('splits && and ; chains into separate commands', () => {
    const content = '`pnpm install && pnpm run build`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm install');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it("extracts context from 'in packages/core'", () => {
    const content = `## Build
In packages/core directory run \`pnpm run build\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Build',
        heading: '## Build',
        content: 'In packages/core directory run `pnpm run build`',
        children: [],
        lineStart: 2,
        lineEnd: 3,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.context).toBe('packages/core');
  });

  it('extracts from shell prompt convention ($ cmd)', () => {
    const content = `
## Run
$ pnpm test
$ pnpm run build
`;
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm test');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it('assigns section from section map', () => {
    const content = `## Testing
\`pnpm test\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Testing',
        heading: '## Testing',
        content: '`pnpm test`',
        children: [],
        lineStart: 2,
        lineEnd: 3,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.section).toBe('Testing');
  });
});

describe('getSuggestedExecutionOrder', () => {
  it('orders commands: install -> build -> test', () => {
    const commands: ExtractedCommand[] = [
      { command: 'pnpm test', section: 'Test', line: 5, type: 'test' },
      { command: 'pnpm install', section: 'Setup', line: 2, type: 'install' },
      { command: 'pnpm run build', section: 'Build', line: 4, type: 'build' },
    ];
    const ordered = getSuggestedExecutionOrder(commands);
    expect(ordered.map((c) => c.type)).toEqual(['install', 'build', 'test']);
  });

  it('preserves line order within same type', () => {
    const commands: ExtractedCommand[] = [
      { command: 'pnpm test:unit', section: 'Test', line: 10, type: 'test' },
      { command: 'pnpm test:e2e', section: 'Test', line: 5, type: 'test' },
    ];
    const ordered = getSuggestedExecutionOrder(commands);
    expect(ordered[0]?.line).toBe(5);
    expect(ordered[1]?.line).toBe(10);
  });
});

describe('extractCommands edge cases', () => {
  it('rejects JSON-like code blocks', () => {
    const content = `
\`\`\`
{"scripts": {"test": "vitest"}}
\`\`\`
`;
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).not.toContain('{"scripts"');
  });

  it('infers format type', () => {
    const content = '`prettier --write .` and `cargo fmt`';
    const commands = extractCommands(content, emptySections);
    expect(commands.find((c) => c.command.includes('prettier'))?.type).toBe('format');
    expect(commands.find((c) => c.command.includes('fmt'))?.type).toBe('format');
  });

  it('extracts context from cd directive', () => {
    const content = `## Build
cd packages/core
\`pnpm run build\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Build',
        heading: '## Build',
        content: 'cd packages/core\n`pnpm run build`',
        children: [],
        lineStart: 2,
        lineEnd: 4,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.context).toBe('packages/core');
  });

  it('splits on semicolon in code block', () => {
    const content = '`pnpm install; pnpm run build`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm install');
    expect(commands.map((c) => c.command)).toContain('pnpm run build');
  });

  it('extracts from bullet with run prefix', () => {
    const content = '- run `pnpm test`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('pnpm test');
  });

  it('extracts context from run from directive', () => {
    const content = `## Build
Run from packages/core: \`pnpm run build\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Build',
        heading: '## Build',
        content: 'Run from packages/core: `pnpm run build`',
        children: [],
        lineStart: 2,
        lineEnd: 3,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.context).toBe('packages/core');
  });

  it('recognizes npx and bunx as known runners', () => {
    const content = '`npx vitest run` and `bunx playwright test`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('npx vitest run');
    expect(commands.map((c) => c.command)).toContain('bunx playwright test');
  });

  it('extracts docker compose and docker-compose', () => {
    const content = '`docker compose up -d` and `docker-compose build`';
    const commands = extractCommands(content, emptySections);
    expect(commands.map((c) => c.command)).toContain('docker compose up -d');
    expect(commands.map((c) => c.command)).toContain('docker-compose build');
  });

  it('extracts context from working directory and cwd', () => {
    const content = `## Build
Working directory: packages/core
\`pnpm run build\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Build',
        heading: '## Build',
        content: 'Working directory: packages/core\n`pnpm run build`',
        children: [],
        lineStart: 2,
        lineEnd: 4,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.context).toBe('packages/core');
  });

  it('extracts context from cwd: pattern', () => {
    const content = `## Test
cwd: apps/dashboard
\`pnpm test\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Test',
        heading: '## Test',
        content: 'cwd: apps/dashboard\n`pnpm test`',
        children: [],
        lineStart: 2,
        lineEnd: 4,
      },
    ];
    const commands = extractCommands(content, sections);
    expect(commands[0]?.context).toBe('apps/dashboard');
  });

  it('assigns correct line numbers within code blocks', () => {
    const content = `## Setup
\`\`\`bash
# install deps
pnpm install
pnpm run build
\`\`\`
`;
    const sections: AgentsMdSection[] = [
      {
        level: 2,
        title: 'Setup',
        heading: '## Setup',
        content: '```bash\n# install deps\npnpm install\npnpm run build\n```',
        children: [],
        lineStart: 2,
        lineEnd: 7,
      },
    ];
    const commands = extractCommands(content, sections);
    const installCmd = commands.find((c) => c.command === 'pnpm install');
    const buildCmd = commands.find((c) => c.command === 'pnpm run build');
    expect(installCmd?.line).toBe(4);
    expect(buildCmd?.line).toBe(5);
  });

  it('prefers longer keyword match for command type (build:test -> test)', () => {
    const content = '`pnpm run build:test`';
    const commands = extractCommands(content, emptySections);
    expect(commands[0]?.type).toBe('test');
  });
});
