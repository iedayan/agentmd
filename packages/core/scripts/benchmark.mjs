import { existsSync } from "fs";
import { resolve } from "path";

const distPath = resolve(process.cwd(), "dist/index.js");
if (!existsSync(distPath)) {
  console.error("dist/index.js not found. Run `pnpm --filter @agentmd/core run build` first.");
  process.exit(1);
}

const core = await import(distPath);

const sample = `---
name: benchmark-agent
triggers: [pull_request.opened]
permissions:
  shell:
    allow: ["pnpm test", "pnpm run build"]
    default: deny
guardrails:
  - Never merge
---

## Setup
\`\`\`bash
pnpm install
\`\`\`

## Build
\`\`\`bash
pnpm run build
\`\`\`

## Test
\`\`\`bash
pnpm test
\`\`\`

## Lint
\`\`\`bash
pnpm run lint
\`\`\`
`;

function hrMs(start) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function bench(label, iterations, fn) {
  // warmup
  for (let i = 0; i < 200; i += 1) fn();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i += 1) fn();
  const totalMs = hrMs(start);
  return {
    label,
    iterations,
    totalMs: round(totalMs),
    avgMs: round(totalMs / iterations),
    opsPerSec: round((iterations / totalMs) * 1000),
  };
}

const parsed = core.parseAgentsMd(sample);
const commands = parsed.commands;

const cases = [
  bench("parseAgentsMd", 10000, () => {
    core.parseAgentsMd(sample);
  }),
  bench("validateAgentsMd", 10000, () => {
    core.validateAgentsMd(parsed);
  }),
  bench("planCommandExecutions", 20000, () => {
    core.planCommandExecutions(commands, { useShell: false, permissions: parsed.frontmatter?.permissions });
  }),
  bench("isCommandSafe", 50000, () => {
    core.isCommandSafe("pnpm test");
  }),
];

console.log("AgentMD Core Benchmark");
console.log(`Node: ${process.version}`);
for (const row of cases) {
  console.log(
    `- ${row.label}: avg ${row.avgMs} ms (${row.opsPerSec} ops/s) over ${row.iterations} iterations`
  );
}
