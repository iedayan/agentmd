import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import type { Diagnostic } from 'vscode-languageserver';
import { getDiagnostics, isAgentsMd } from '../src/server/diagnostics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');
const read = (name: string) => readFileSync(join(FIXTURES, name), 'utf8');

// ─── isAgentsMd ───────────────────────────────────────────────────────────────

describe('isAgentsMd', () => {
    it('matches AGENTS.md', () => {
        expect(isAgentsMd('/repo/AGENTS.md')).toBe(true);
    });
    it('matches *.agents.md', () => {
        expect(isAgentsMd('/repo/backend.agents.md')).toBe(true);
    });
    it('does not match regular markdown', () => {
        expect(isAgentsMd('/repo/README.md')).toBe(false);
    });
    it('does not match partial name', () => {
        expect(isAgentsMd('/repo/MYAGENTS.md')).toBe(false);
    });
});

// ─── getDiagnostics – perfect-score.agents.md ─────────────────────────────────

describe('getDiagnostics – perfect-score fixture', () => {
    it('produces no errors for a fully conformant file', async () => {
        const content = read('perfect-score.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        const errors = diagnostics.filter((d: Diagnostic) => d.severity === 1);
        expect(errors).toHaveLength(0);
    });

    it('does not raise AMD001 (Build section present)', async () => {
        const content = read('perfect-score.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD001')).toBeUndefined();
    });

    it('does not raise AMD002 (Test section present)', async () => {
        const content = read('perfect-score.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD002')).toBeUndefined();
    });
});

// ─── getDiagnostics – valid.agents.md ────────────────────────────────────────

describe('getDiagnostics – valid fixture', () => {
    it('produces no errors for a valid file', async () => {
        const content = read('valid.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        const errors = diagnostics.filter((d: Diagnostic) => d.severity === 1);
        expect(errors).toHaveLength(0);
    });

    it('returns a parsed result', async () => {
        const content = read('valid.agents.md');
        const { parsed } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(parsed).toBeDefined();
    });
});

// ─── getDiagnostics – invalid-missing-build ───────────────────────────────────

describe('getDiagnostics – missing-build fixture', () => {
    it('raises AMD001 for missing ## Build', async () => {
        const content = read('invalid-missing-build.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        const amd001 = diagnostics.find((d: Diagnostic) => d.code === 'AMD001');
        expect(amd001).toBeDefined();
        expect(amd001?.severity).toBe(1); // Error
    });

    it('does NOT raise AMD002 (## Test is present)', async () => {
        const content = read('invalid-missing-build.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD002')).toBeUndefined();
    });
});

// ─── getDiagnostics – invalid-empty-block ─────────────────────────────────────

describe('getDiagnostics – empty-block fixture', () => {
    it('raises AMD004 for an empty code block', async () => {
        const content = read('invalid-empty-block.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        const amd004 = diagnostics.find((d: Diagnostic) => d.code === 'AMD004');
        expect(amd004).toBeDefined();
        expect(amd004?.severity).toBe(1); // Error
    });

    it('does NOT raise AMD002 — ## Test section is present', async () => {
        const content = read('invalid-empty-block.agents.md');
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD002')).toBeUndefined();
    });
});

// ─── getDiagnostics – inline inline cases ─────────────────────────────────────

describe('getDiagnostics – inline cases', () => {
    it('raises AMD005 for missing frontmatter', async () => {
        const content = `## Build\n\`\`\`bash\npnpm build\n\`\`\`\n\n## Test\n\`\`\`bash\npnpm test\n\`\`\`\n`;
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD005')).toBeDefined();
    });

    it('raises AMD011 for duplicate sections', async () => {
        const content = `---\nname: test\ndescription: dup\n---\n## Build\nok\n## Build\nok2\n## Test\nok3\n`;
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD011')).toBeDefined();
    });

    it('raises AMD007 for absolute paths in commands', async () => {
        const content = `---\nname: test\ndescription: abs\n---\n## Build\n\`\`\`bash\n/usr/local/bin/build\n\`\`\`\n## Test\n\`\`\`bash\npnpm test\n\`\`\`\n`;
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        expect(diagnostics.find((d: Diagnostic) => d.code === 'AMD007')).toBeDefined();
    });

    it('all diagnostics have an AgentMD source', async () => {
        const content = `## Test\n\`\`\`bash\npnpm test\n\`\`\`\n`;
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        for (const d of diagnostics) {
            expect(d.source).toBe('AgentMD');
        }
    });

    it('all diagnostics have a codeDescription href', async () => {
        const content = `## Test\n\`\`\`bash\npnpm test\n\`\`\`\n`;
        const { diagnostics } = await getDiagnostics(content, 'file:///AGENTS.md');
        for (const d of diagnostics) {
            expect(d.codeDescription?.href).toContain('AMD');
        }
    });
});
