import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { describe, expect, it } from 'vitest';

// Use absolute path so it works when spawn cwd is tempDir
const cliPath = resolve(process.cwd(), 'dist/cli.js');

function runCli(args: string[], cwd?: string) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
  });
}

describe('agentmd cli', () => {
  it('prints help', () => {
    const result = runCli(['help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage: agentmd <command>');
  });

  it('initializes AGENTS.md in target directory', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      const result = runCli(['init', tempDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Created AGENTS.md');

      const validate = runCli(['validate', tempDir]);
      expect(validate.status).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('uses --template to force a specific template', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      const result = runCli(['init', tempDir, '--template', 'python']);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Using template: python');
      expect(result.stdout).toContain('Created AGENTS.md');

      const content = readFileSync(join(tempDir, 'AGENTS.md'), 'utf-8');
      expect(content).toContain('uv run pytest');
      expect(content).toContain('uv run ruff');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails for unknown run type', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      runCli(['init', tempDir]);
      const result = runCli(['run', tempDir, 'invalid-type-xyz', '--dry-run']);
      expect(result.status).toBe(1);
      // May fail with "Unknown command type" (types validated first) or "AGENTS.md not found" (path parsed as type)
      const output = result.stderr + result.stdout;
      expect(output).toMatch(/Unknown command type|AGENTS.md not found/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('blocks shell operator commands by default', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(join(tempDir, 'AGENTS.md'), '## Test\n`echo hi | cat`\n', 'utf-8');
      const result = runCli(['run', '.'], tempDir);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('Requires shell features');
      expect(result.stdout).toContain('--use-shell');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('allows shell operator commands with --use-shell', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(join(tempDir, 'AGENTS.md'), '## Test\n`echo hi | cat`\n', 'utf-8');
      const result = runCli(['run', '.', '--use-shell'], tempDir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('✓ [other] echo hi | cat');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('prints doctor report', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(
        join(tempDir, 'AGENTS.md'),
        '## Build\n`pnpm run build`\n## Test\n`pnpm test`\n',
        'utf-8',
      );
      const result = runCli(['doctor', tempDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Doctor report');
      expect(result.stdout).toContain('Execution preflight');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('outputs JSON for validate --json', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      runCli(['init', tempDir]);
      const result = runCli(['validate', tempDir, '--json']);
      expect(result.status).toBe(0);
      const out = JSON.parse(result.stdout);
      expect(out).toHaveProperty('ok');
      expect(out).toHaveProperty('valid');
      expect(out).toHaveProperty('errors');
      expect(out).toHaveProperty('warnings');
      expect(out).toHaveProperty('suggestions');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('supports check --contract for required output_contract', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(join(tempDir, 'AGENTS.md'), '## Test\n`pnpm test`\n', 'utf-8');
      const result = runCli(['check', tempDir, '--contract', '--json']);
      expect(result.status).toBe(1);
      const out = JSON.parse(result.stdout);
      expect(out.errors.some((e: { code: string }) => e.code === 'MISSING_OUTPUT_CONTRACT')).toBe(
        true,
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('validates output file against contract with check --output', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(
        join(tempDir, 'AGENTS.md'),
        `---
output_contract:
  format: json
  schema:
    summary: string
  quality_gates:
    - tests_pass
  artifacts:
    - patches
  exit_criteria:
    - complete
---
## Test
\`pnpm test\`
`,
        'utf-8',
      );
      writeFileSync(
        join(tempDir, 'agent-output.json'),
        JSON.stringify({
          summary: 'ok',
          quality_gates: { tests_pass: true },
          artifacts: ['patches'],
          exit_criteria: { complete: true },
        }),
        'utf-8',
      );
      const result = runCli([
        'check',
        tempDir,
        '--contract',
        '--output',
        join(tempDir, 'agent-output.json'),
        '--json',
      ]);
      expect(result.status).toBe(0);
      const out = JSON.parse(result.stdout);
      expect(out.valid).toBe(true);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('outputs JSON for parse --json', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(
        join(tempDir, 'AGENTS.md'),
        '## Build\n`pnpm build`\n## Test\n`pnpm test`\n',
        'utf-8',
      );
      const result = runCli(['parse', tempDir, '--json']);
      expect(result.status).toBe(0);
      const out = JSON.parse(result.stdout);
      expect(out).toHaveProperty('ok', true);
      expect(out).toHaveProperty('lineCount');
      expect(out).toHaveProperty('sections');
      expect(out).toHaveProperty('commands');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('outputs JSON for score --json', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(
        join(tempDir, 'AGENTS.md'),
        '## Build\n`pnpm build`\n## Test\n`pnpm test`\n',
        'utf-8',
      );
      const result = runCli(['score', tempDir, '--json']);
      expect(result.status).toBe(0);
      const out = JSON.parse(result.stdout);
      expect(out).toHaveProperty('ok', true);
      expect(out).toHaveProperty('score');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('outputs JSON for run --json', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(join(tempDir, 'AGENTS.md'), '## Test\n`echo ok`\n', 'utf-8');
      const result = runCli(['run', tempDir, '--dry-run', '--json'], tempDir);
      expect(result.status).toBe(0);
      const out = JSON.parse(result.stdout);
      expect(out).toHaveProperty('ok', true);
      expect(out).toHaveProperty('dryRun', true);
      expect(out).toHaveProperty('results');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails run when some commands are blocked by preflight', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agentmd-cli-test-'));
    try {
      writeFileSync(join(tempDir, 'AGENTS.md'), '## Mixed\n`echo ok`\n`rm -rf /`\n', 'utf-8');
      const result = runCli(['run', '.'], tempDir);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('Preflight:');
      expect(result.stderr).toContain('Execution incomplete');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('login fails gracefully when dashboard is unreachable', () => {
    // Offline test: login should print helpful error, not crash with an unhandled exception.
    const result = spawnSync(
      process.execPath,
      [cliPath, 'login'],
      {
        encoding: 'utf-8',
        env: { ...process.env, AGENTMD_DASHBOARD_URL: 'http://127.0.0.1:1' }, // guaranteed unreachable
        timeout: 15_000,
      },
    );
    // Should exit with code 1 (graceful error), not crash
    expect(result.status).toBe(1);
    const output = result.stderr + result.stdout;
    expect(output).toMatch(/Cannot reach dashboard|Failed to start login/i);
  });

  it('logout prints "Not logged in" when no credentials exist', () => {
    const result = spawnSync(
      process.execPath,
      [cliPath, 'logout'],
      {
        encoding: 'utf-8',
        // Use a temp HOME so we don't touch the real credentials
        env: { ...process.env, HOME: mkdtempSync(join(tmpdir(), 'agentmd-home-')) },
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Not logged in');
  });

  it('whoami exits non-zero when not logged in', () => {
    const result = spawnSync(
      process.execPath,
      [cliPath, 'whoami'],
      {
        encoding: 'utf-8',
        env: { ...process.env, HOME: mkdtempSync(join(tmpdir(), 'agentmd-home-')) },
      },
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Not logged in');
  });

  it('help includes login and logout commands', () => {
    const result = runCli(['help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('login');
    expect(result.stdout).toContain('logout');
    expect(result.stdout).toContain('whoami');
  });
});
