/**
 * AgentMD Language Server
 * Parsing, validation, diagnostics via @agentmd/core.
 */

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItemKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getDiagnostics, isAgentsMd } from './diagnostics.js';
import { computeAgentReadinessScore } from '@agentmd-dev/core';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 300;

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['-', ' '] },
      hoverProvider: true,
    },
  };
});

function scheduleValidation(uri: string, document: TextDocument) {
  const existing = debounceTimers.get(uri);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    debounceTimers.delete(uri);
    if (!isAgentsMd(uri)) return;

    const content = document.getText();
    const { diagnostics } = await getDiagnostics(content, uri);
    connection.sendDiagnostics({ uri, diagnostics });
  }, DEBOUNCE_MS);

  debounceTimers.set(uri, timer);
}

documents.onDidOpen((e) => {
  if (isAgentsMd(e.document.uri)) {
    scheduleValidation(e.document.uri, e.document);
  }
});

documents.onDidChangeContent((e) => {
  if (isAgentsMd(e.document.uri)) {
    scheduleValidation(e.document.uri, e.document);
  }
});

documents.onDidClose((e) => {
  debounceTimers.delete(e.document.uri);
  connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
});

connection.onCompletion(() => {
  return [
    { label: '## Build', kind: CompletionItemKind.Snippet, detail: 'Required section' },
    { label: '## Test', kind: CompletionItemKind.Snippet, detail: 'Required section' },
    { label: '## Lint', kind: CompletionItemKind.Snippet, detail: 'Recommended section' },
  ];
});

connection.onRequest('agentmd/getScore', async (params: { uri: string }) => {
  const doc = documents.get(params.uri);
  if (!doc || !isAgentsMd(params.uri)) return null;
  const { parsed } = await getDiagnostics(doc.getText(), params.uri);
  if (!parsed) return null;
  const score = await computeAgentReadinessScore(parsed);
  return { score };
});

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const line = doc.getText().split('\n')[params.position.line];
  if (line?.includes('## Build')) {
    return {
      contents: {
        kind: 'markdown',
        value: '**Build section** (AMD001)\n\nRequired. Describe how to build the project.',
      },
    };
  }
  if (line?.includes('## Test')) {
    return {
      contents: {
        kind: 'markdown',
        value: '**Test section** (AMD002)\n\nRequired. Describe how to run tests.',
      },
    };
  }
  return null;
});

documents.listen(connection);
connection.listen();
