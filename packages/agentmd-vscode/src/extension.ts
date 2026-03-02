/**
 * AgentMD VS Code Extension
 * ESLint for AGENTS.md - real-time diagnostics, validation, scoring.
 */

import * as path from 'path';
import { workspace, ExtensionContext, window, commands, StatusBarAlignment, Position } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  type Diagnostic,
} from 'vscode-languageclient/node';
import type { DryRunResult } from './shared/types.js';

let client: LanguageClient | undefined;
let statusBarItem: ReturnType<typeof window.createStatusBarItem> | undefined;

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

  client.start().then(() => {
    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
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
      statusBarItem.text = '$(sync~spin) Analyzing...';

      try {
        if (client) {
          const diagnostics = await client.sendRequest<Diagnostic[]>('textDocument/diagnostic', {
            textDocument: { uri: doc.uri.toString() },
          });
          
          const errors = diagnostics.filter((d) => d.severity === 1);
          const warnings = diagnostics.filter((d) => d.severity === 2);
          
          if (errors.length === 0 && warnings.length === 0) {
            statusBarItem.text = '$(check) AgentMD: Valid';
            statusBarItem.tooltip = 'AGENTS.md is valid and ready to execute';
          } else {
            statusBarItem.text = `$(warning) AgentMD: ${errors.length + warnings.length} issues`;
            statusBarItem.tooltip = `${errors.length} errors, ${warnings.length} warnings`;
          }
        }
      } catch (error) {
        statusBarItem.text = '$(error) AgentMD: Error';
        statusBarItem.tooltip = 'Failed to analyze AGENTS.md';
      }
    };

    // Update status bar on document change
    context.subscriptions.push(
      workspace.onDidChangeTextDocument(updateStatusBar),
      window.onDidChangeActiveTextEditor(updateStatusBar)
    );

    // Register commands
    context.subscriptions.push(
      commands.registerCommand('agentmd.validate', async () => {
        const editor = window.activeTextEditor;
        if (!editor) return;

        await client?.sendRequest('textDocument/diagnostic', {
          textDocument: { uri: editor.document.uri.toString() },
        });

        window.showInformationMessage('AGENTS.md validation completed');
      }),

      commands.registerCommand('agentmd.score', async () => {
        const editor = window.activeTextEditor;
        if (!editor) return;

        const score = await client?.sendRequest('agentmd/score', {
          textDocument: { uri: editor.document.uri.toString() },
        });

        window.showInformationMessage(
          `Agent-readiness score: ${score}/100`,
          'View Details'
        ).then(selection => {
          if (selection === 'View Details') {
            commands.executeCommand('agentmd.showDetails');
          }
        });
      }),

      commands.registerCommand('agentmd.showDetails', () => {
        commands.executeCommand('workbench.action.focusSideBar');
      }),

      commands.registerCommand('agentmd.createTemplate', async () => {
        const templates = ['node', 'python', 'rust', 'go', 'nextjs', 'react', 'vue', 'svelte', 'astro', 'fastapi', 'express', 'nestjs', 'remix', 'nuxt', 'django', 'rails', 'monorepo', 'generic'];
        const selected = await window.showQuickPick(templates, {
          placeHolder: 'Select a template for your AGENTS.md',
        });

        if (selected) {
          const template = await client?.sendRequest<string>('agentmd/getTemplate', { template: selected });
          if (template) {
            const editor = window.activeTextEditor;
            if (editor) {
              await editor.edit(editBuilder => {
                editBuilder.insert(new Position(0, 0), template);
              });
              window.showInformationMessage(`Created ${selected} template`);
            }
          }
        }
      }),

      commands.registerCommand('agentmd.executeDryRun', async () => {
        const editor = window.activeTextEditor;
        if (!editor) return;

        window.showInformationMessage('Running dry-run execution...', 'Cancel').then(selection => {
          if (selection === 'Cancel') return;
        });

        try {
          const result = await client?.sendRequest<DryRunResult>('agentmd/dryRun', {
            textDocument: { uri: editor.document.uri.toString() },
          });

          window.showInformationMessage(
            `Dry-run completed: ${result?.commands?.length || 0} commands would be executed`,
            'View Output'
          ).then(selection => {
            if (selection === 'View Output') {
              commands.executeCommand('workbench.action.focusPanel');
            }
          });
        } catch (error) {
          window.showErrorMessage(`Dry-run failed: ${error}`);
        }
      })
    );

    // Initial update
    updateStatusBar();
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
