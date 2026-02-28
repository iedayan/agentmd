/**
 * OpenTelemetry-compatible trace export for AgentMD executions.
 * Produces OTLP JSON or trace spans for integration with Langfuse, Datadog, etc.
 * @see https://opentelemetry.io/docs/specs/otlp/
 */

export interface OtelExecutionSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: 'SPAN_KIND_INTERNAL' | 'SPAN_KIND_SERVER' | 'SPAN_KIND_CLIENT';
  startTimeUnixNano: string;
  endTimeUnixNano?: string;
  attributes?: Record<string, string | number | boolean>;
  status?: { code: number; message?: string };
}

export interface ExecutionTraceContext {
  executionId: string;
  repositoryId: string;
  repositoryName: string;
  trigger: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  commandsRun: number;
  commandsPassed: number;
  commandsFailed: number;
  steps?: Array<{
    id: string;
    command: string;
    type: string;
    status: string;
    durationMs?: number;
  }>;
}

/**
 * Generate an OTLP-compatible trace from an execution.
 * Use with OTEL exporters or forward to Langfuse/Datadog via their ingest APIs.
 */
export function toOtelTrace(ctx: ExecutionTraceContext): OtelExecutionSpan[] {
  const traceId = ctx.executionId.replace(/-/g, '').slice(0, 32).padEnd(32, '0');
  const rootSpanId = traceId.slice(0, 16);
  const startNs = BigInt(new Date(ctx.startedAt).getTime() * 1_000_000);
  const endNs = ctx.completedAt
    ? BigInt(new Date(ctx.completedAt).getTime() * 1_000_000)
    : BigInt(Date.now() * 1_000_000);

  const rootSpan: OtelExecutionSpan = {
    traceId,
    spanId: rootSpanId,
    name: `agentmd.execution`,
    kind: 'SPAN_KIND_INTERNAL',
    startTimeUnixNano: startNs.toString(),
    endTimeUnixNano: endNs.toString(),
    attributes: {
      'agentmd.execution.id': ctx.executionId,
      'agentmd.repository.id': ctx.repositoryId,
      'agentmd.repository.name': ctx.repositoryName,
      'agentmd.trigger': ctx.trigger,
      'agentmd.status': ctx.status,
      'agentmd.commands.run': ctx.commandsRun,
      'agentmd.commands.passed': ctx.commandsPassed,
      'agentmd.commands.failed': ctx.commandsFailed,
    },
    status: ctx.status === 'failed' ? { code: 2, message: 'Execution failed' } : { code: 1 },
  };

  const spans: OtelExecutionSpan[] = [rootSpan];

  if (ctx.steps?.length) {
    let stepStartNs = startNs;
    for (const step of ctx.steps) {
      const stepSpanId = step.id.replace(/-/g, '').slice(0, 16).padEnd(16, '0');
      const stepDurationMs = step.durationMs ?? 0;
      const stepEndNs = stepStartNs + BigInt(stepDurationMs * 1_000_000);

      spans.push({
        traceId,
        spanId: stepSpanId,
        parentSpanId: rootSpanId,
        name: `agentmd.command.${step.type}`,
        kind: 'SPAN_KIND_INTERNAL',
        startTimeUnixNano: stepStartNs.toString(),
        endTimeUnixNano: stepEndNs.toString(),
        attributes: {
          'agentmd.command': step.command,
          'agentmd.command.type': step.type,
          'agentmd.step.status': step.status,
        },
        status: step.status === 'failed' ? { code: 2 } : { code: 1 },
      });

      stepStartNs = stepEndNs;
    }
  }

  return spans;
}

/**
 * Export trace as OTLP JSON for HTTP export.
 * POST to OTEL collector or Langfuse/Datadog ingest endpoint.
 */
export function toOtlpJson(spans: OtelExecutionSpan[]): object {
  return {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'agentmd' } },
            { key: 'agentmd.version', value: { stringValue: '0.1.0' } },
          ],
        },
        scopeSpans: [
          {
            scope: { name: 'agentmd' },
            spans: spans.map((s) => ({
              traceId: s.traceId,
              spanId: s.spanId,
              parentSpanId: s.parentSpanId,
              name: s.name,
              kind: s.kind,
              startTimeUnixNano: s.startTimeUnixNano,
              endTimeUnixNano: s.endTimeUnixNano,
              attributes: Object.entries(s.attributes ?? {}).map(([k, v]) => ({
                key: k,
                value:
                  typeof v === 'number'
                    ? { intValue: v }
                    : typeof v === 'boolean'
                      ? { boolValue: v }
                      : { stringValue: String(v) },
              })),
              status: s.status,
            })),
          },
        ],
      },
    ],
  };
}
