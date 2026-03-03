import * as path from 'path';
import {
  workspace,
  ExtensionContext,
  window,
  commands,
  StatusBarAlignment,
  Position,
  type OutputChannel,
} from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import type { DryRunResult } from './shared/types.js';

let client: LanguageClient | undefined;
let statusBarItem: ReturnType<typeof window.createStatusBarItem> | undefined;
let outputChannel: OutputChannel | undefined;

export function activate(context: ExtensionContext): void {
  const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'index.js'));

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', pattern: '**/AGENTS.md' },
      { scheme: 'file', pattern: '**/*.agents.md' },
    ],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/AGENTS.md'),
    },
  };

  client = new LanguageClient('agentmd', 'AgentMD', serverOptions, clientOptions);

  // Create a dedicated Output Channel for dry-run results
  outputChannel = window.createOutputChannel('AgentMD');
  context.subscriptions.push(outputChannel);

  client.start().then(() => {
    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    statusBarItem.command = 'agentmd.showScore';
    context.subscriptions.push(statusBarItem);

    const updateStatusBar = async () => {
      const doc = window.activeTextEditor?.document;
      const isAgentsMd =
        doc && (doc.uri.path.endsWith('AGENTS.md') || doc.uri.path.endsWith('.agents.md'));
      if (!statusBarItem || !isAgentsMd) {
        statusBarItem?.hide();
        return;
      }

      statusBarItem.show();
      statusBarItem.text = '$(sync~spin) AgentMD';

      try {
        if (client) {
          const score = await client.sendRequest<{ score: number }>('agentmd/getScore', {
            uri: doc.uri.toString(),
          });
          const s = score?.score ?? 0;
          const icon = s >= 80 ? '$(check)' : s >= 50 ? '$(warning)' : '$(error)';
          statusBarItem.text = `${icon} AgentMD ${s}/100`;
          statusBarItem.tooltip = `Agent-readiness: ${s}/100 — click for breakdown`;
        }
      } catch {
        statusBarItem.text = '$(pulse) AgentMD';
        statusBarItem.tooltip = 'Click to analyze AGENTS.md';
      }
    };

    context.subscriptions.push(
      workspace.onDidChangeTextDocument(updateStatusBar),
      window.onDidChangeActiveTextEditor(updateStatusBar),
    );

    // ── agentmd.validate ──────────────────────────────────────────────────────
    context.subscriptions.push(
      commands.registerCommand('agentmd.validate', async () => {
        const editor = window.activeTextEditor;
        if (!editor) return;
        await client?.sendRequest('textDocument/diagnostic', {
          textDocument: { uri: editor.document.uri.toString() },
        });
        window.showInformationMessage(
          'AgentMD: Validation complete — check the Problems panel for details.',
        );
        await updateStatusBar();
      }),
    );

    // ── agentmd.showScore ─────────────────────────────────────────────────────
    context.subscriptions.push(
      commands.registerCommand('agentmd.showScore', async () => {
        const editor = window.activeTextEditor;
        if (!editor) return;

        const result = await client?.sendRequest<{ score: number }>('agentmd/getScore', {
          uri: editor.document.uri.toString(),
        });

        const score = result?.score ?? 0;
        const label =
          score >= 90
            ? 'Excellent'
            : score >= 70
              ? 'Good'
              : score >= 50
                ? 'Fair'
                : 'Needs Work';

        const barWidth = Math.round((score / 100) * 100);
        const barColor =
          score >= 90
            ? '#22c55e'
            : score >= 70
              ? '#3b82f6'
              : score >= 50
                ? '#f59e0b'
                : '#ef4444';
        const filename = editor.document.uri.fsPath.split('/').pop() ?? 'AGENTS.md';

        const panel = window.createWebviewPanel(
          'agentmdScore',
          'AgentMD Score Breakdown',
          { viewColumn: 2 },
          { enableScripts: false },
        );

        panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 2rem;
           background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
    h1 { font-size: 1.4rem; margin: 0 0 0.2rem; }
    .sub { opacity: 0.55; font-size: 0.875rem; margin-bottom: 2rem; }
    .row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .circle { width: 80px; height: 80px; border-radius: 50%;
              border: 3px solid ${barColor}; background: ${barColor}18;
              display: flex; align-items: center; justify-content: center;
              font-size: 1.6rem; font-weight: 700; color: ${barColor}; flex-shrink: 0; }
    .bar-wrap { flex: 1; }
    .bar-label { font-weight: 600; margin-bottom: 0.5rem; }
    .bar-bg { background: var(--vscode-editorWidget-background); border-radius: 999px; height: 10px; overflow: hidden; }
    .bar { height: 100%; border-radius: 999px; background: ${barColor}; width: ${barWidth}%; }
    .bar-sub { font-size: 0.8rem; opacity: 0.5; margin-top: 0.4rem; }
    .tips { background: var(--vscode-editorWidget-background); border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1rem; }
    .tips h2 { font-size: 0.9rem; margin: 0 0 0.5rem; opacity: 0.7; }
    .tips ul { margin: 0; padding-left: 1.25rem; font-size: 0.875rem; opacity: 0.65; }
    .tips li { margin-bottom: 0.3rem; }
  </style>
</head>
<body>
  <h1>Agent-Readiness Score</h1>
  <p class="sub">${filename}</p>
  <div class="row">
    <div class="circle">${score}</div>
    <div class="bar-wrap">
      <div class="bar-label">${label}</div>
      <div class="bar-bg"><div class="bar"></div></div>
      <div class="bar-sub">${score} / 100 points</div>
    </div>
  </div>
  <div class="tips">
    <h2>How to improve your score</h2>
    <ul>
      <li>Ensure ## Build, ## Test, and ## Lint sections are all present</li>
      <li>Every code block should have at least one command inside it</li>
      <li>Add YAML frontmatter with <code>name</code> and <code>description</code></li>
      <li>Use relative commands — avoid absolute paths</li>
      <li>Remove any duplicate section headings</li>
    </ul>
  </div>
</body>
</html>`;
      }),
    );

    // ── agentmd.createTemplate ────────────────────────────────────────────────
    context.subscriptions.push(
      commands.registerCommand('agentmd.createTemplate', async () => {
        const templates = [
          'node', 'python', 'rust', 'go', 'nextjs', 'react', 'vue',
          'svelte', 'astro', 'fastapi', 'express', 'nestjs', 'remix',
          'nuxt', 'django', 'rails', 'monorepo', 'generic',
        ];
        const selected = await window.showQuickPick(templates, {
          placeHolder: 'Select a framework template for your AGENTS.md',
          title: 'AgentMD: Create from Template',
        });

        if (!selected) return;

        const template = await client?.sendRequest<string>('agentmd/getTemplate', {
          template: selected,
        });
        if (template) {
          const editor = window.activeTextEditor;
          if (editor) {
            await editor.edit((eb) => eb.insert(new Position(0, 0), template));
            window.showInformationMessage(`AgentMD: Inserted ${selected} template.`);
          }
        }
      }),
    );

    // ── agentmd.executeDryRun ─────────────────────────────────────────────────
    context.subscriptions.push(
      commands.registerCommand('agentmd.executeDryRun', async () => {
        const editor = window.activeTextEditor;
        if (!editor || !outputChannel) return;

        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine('AgentMD — Dry Run');
        outputChannel.appendLine('═'.repeat(50));
        outputChannel.appendLine(`File : ${editor.document.uri.fsPath}`);
        outputChannel.appendLine(`Time : ${new Date().toLocaleTimeString()}`);
        outputChannel.appendLine('');

        try {
          const result = await client?.sendRequest<DryRunResult>('agentmd/dryRun', {
            uri: editor.document.uri.toString(),
          });

          if (!result?.commands?.length) {
            outputChannel.appendLine('[No executable commands found]');
            outputChannel.appendLine('');
            outputChannel.appendLine(
              'Tip: Add bash code blocks under ## Build, ## Test, or ## Lint to define commands.',
            );
            return;
          }

          outputChannel.appendLine(
            `Found ${result.commands.length} command(s) — previewing only, nothing was executed:\n`,
          );
          for (const cmd of result.commands) {
            outputChannel.appendLine(`  > ${cmd}`);
          }
          outputChannel.appendLine('');
          outputChannel.appendLine('[Dry run complete — no commands were executed]');
        } catch (error) {
          outputChannel.appendLine(`[Error] ${error}`);
          window.showErrorMessage('AgentMD: Dry-run failed. See Output panel for details.');
        }
      }),
    );

    // Initial status bar update
    updateStatusBar();
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
