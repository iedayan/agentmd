/**
 * CI Export
 * Generate GitHub Actions workflow YAML from AGENTS.md.
 */

import type { ParsedAgentsMd, ExtractedCommand } from './types.js';
import { getSuggestedExecutionOrder } from './commands.js';
import { isCommandSafe } from './executor.js';

export interface ExportOptions {
  /** Workflow name */
  name?: string;
  /** Triggers: push, pull_request, workflow_dispatch */
  on?: string[];
  /** Job name */
  jobName?: string;
  /** Runner (default: ubuntu-latest) */
  runsOn?: string;
  /** Include only safe commands (default: true) */
  safeOnly?: boolean;
}

const DEFAULT_ON = ['push', 'pull_request', 'workflow_dispatch'];
const DEFAULT_JOB = 'agentmd';

/**
 * Generate GitHub Actions workflow YAML from parsed AGENTS.md.
 */
export async function exportToGitHubActions(
  parsed: ParsedAgentsMd,
  options: ExportOptions = {},
): Promise<string> {
  const {
    name = 'AgentMD',
    on = DEFAULT_ON,
    jobName = DEFAULT_JOB,
    runsOn = 'ubuntu-latest',
    safeOnly = true,
  } = options;

  let commands = getSuggestedExecutionOrder(parsed.commands);
  if (safeOnly) {
    const safetyResults = await Promise.all(
      commands.map(async (c) => ({
        cmd: c,
        safe: (await isCommandSafe(c.command)).safe,
      })),
    );
    commands = safetyResults.filter((r) => r.safe).map((r) => r.cmd);
  }

  const steps = commands.map((cmd) => toActionStep(cmd));
  const stepsYaml = steps.map((s) => indent(s, 6)).join('\n');

  return `name: ${name}

on:
${on.map((e) => `  - ${e}`).join('\n')}

jobs:
  ${jobName}:
    runs-on: ${runsOn}
    steps:
${stepsYaml}
`;
}

function toActionStep(cmd: ExtractedCommand): string {
  const lines: string[] = [
    `- name: ${escapeYaml(cmd.section)} (${cmd.type})`,
    `  run: ${escapeYaml(cmd.command)}`,
  ];
  if (cmd.context) {
    lines.push(`  working-directory: ${escapeYaml(cmd.context)}`);
  }
  return lines.join('\n');
}

function escapeYaml(s: string): string {
  if (/[:\n"#'"]/.test(s)) return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return s;
}

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => pad + line)
    .join('\n');
}
