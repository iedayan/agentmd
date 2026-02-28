/**
 * AgentMD VS Code Extension
 * ESLint for AGENTS.md - real-time diagnostics, validation, scoring.
 */

import * as path from 'path';
import { workspace, ExtensionContext, window, commands, StatusBarAlignment } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

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
      try {
        const result = await client?.sendRequest<{ score: number } | null>('agentmd/getScore', {
          uri: doc.uri.toString(),
        });
        if (result?.score != null) {
          statusBarItem.text = `AgentMD: ${result.score}/100`;
          statusBarItem.tooltip = 'Agent-readiness score. Click to show details.';
          statusBarItem.command = 'agentmd.showScore';
          statusBarItem.show();
        } else {
          statusBarItem.hide();
        }
      } catch {
        statusBarItem.hide();
      }
    };

    let statusBarDebounce: ReturnType<typeof setTimeout> | undefined;
    const debouncedUpdate = () => {
      if (statusBarDebounce) clearTimeout(statusBarDebounce);
      statusBarDebounce = setTimeout(updateStatusBar, 400);
    };

    context.subscriptions.push(
      window.onDidChangeActiveTextEditor(updateStatusBar),
      workspace.onDidChangeTextDocument((e) => {
        if (e.document === window.activeTextEditor?.document) debouncedUpdate();
      }),
    );
    updateStatusBar();

    context.subscriptions.push(
      commands.registerCommand('agentmd.validate', async () => {
        const doc = window.activeTextEditor?.document;
        if (!doc || (!doc.uri.path.endsWith('AGENTS.md') && !doc.uri.path.endsWith('.agents.md'))) {
          window.showInformationMessage('Open an AGENTS.md file to validate.');
          return;
        }
        window.showInformationMessage(
          'AgentMD diagnostics run in real time. Check the Problems view.',
        );
      }),
      commands.registerCommand('agentmd.showScore', async () => {
        const doc = window.activeTextEditor?.document;
        if (!doc || (!doc.uri.path.endsWith('AGENTS.md') && !doc.uri.path.endsWith('.agents.md'))) {
          window.showInformationMessage('Open an AGENTS.md file to see the score.');
          return;
        }
        try {
          const result = await client?.sendRequest<{ score: number } | null>('agentmd/getScore', {
            uri: doc.uri.toString(),
          });
          if (result?.score != null) {
            window.showInformationMessage(`AgentMD Score: ${result.score}/100`);
          } else {
            window.showWarningMessage('Could not compute score.');
          }
        } catch (e) {
          window.showErrorMessage(
            `AgentMD: ${e instanceof Error ? e.message : 'Failed to get score'}`,
          );
        }
      }),
    );
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
