'use client';

import type { PipelineStage } from '@/lib/ops/mock-data';

/* Design system: primary (emerald), destructive, muted, primary */
const STAGE_COLORS = {
  passed: 'hsl(var(--primary))',
  failed: 'hsl(var(--destructive))',
  pending: 'hsl(var(--muted-foreground))',
  running: 'hsl(var(--primary))',
};

export function PipelineDiagram({
  stages,
  onStageClick,
}: {
  stages: PipelineStage[];
  onStageClick?: (id: string) => void;
}) {
  const width = 140;
  const gap = 24;
  const totalWidth = stages.length * width + (stages.length - 1) * gap;

  return (
    <div className="overflow-x-auto py-4">
      <svg width={Math.max(totalWidth, 800)} height={80}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--foreground))" />
          </marker>
        </defs>
        {stages.map((stage, i) => {
          const x = 20 + i * (width + gap);
          const color = STAGE_COLORS[stage.status];
          const isRunning = stage.status === 'running';
          return (
            <g key={stage.id}>
              {i > 0 && (
                <line
                  x1={x - gap}
                  y1={40}
                  x2={x - 12}
                  y2={40}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  strokeDasharray="60"
                  className="ops-connector"
                />
              )}
              <g onClick={() => onStageClick?.(stage.id)} className="cursor-pointer">
                <rect
                  x={x}
                  y={8}
                  width={width}
                  height={64}
                  fill="hsl(var(--card))"
                  stroke={color}
                  strokeWidth={stage.status === 'failed' ? 2 : 1}
                />
                <text
                  x={x + width / 2}
                  y={32}
                  textAnchor="middle"
                  className="font-mono text-xs font-medium"
                  fill="hsl(var(--foreground))"
                >
                  {stage.status === 'passed' && '✓ '}
                  {stage.status === 'failed' && '✕ '}
                  {stage.status === 'running' && (
                    <tspan className={isRunning ? 'ops-pulse-running' : ''}>▶ </tspan>
                  )}
                  {stage.status === 'pending' && '⏳ '}
                  {stage.name}
                </text>
                <text
                  x={x + width / 2}
                  y={52}
                  textAnchor="middle"
                  className="font-mono text-[10px]"
                  fill="hsl(var(--muted-foreground))"
                >
                  {stage.duration ?? '—'}
                </text>
              </g>
              {i < stages.length - 1 && (
                <line
                  x1={x + width + 12}
                  y1={40}
                  x2={x + width + gap - 12}
                  y2={40}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  markerEnd="url(#arrowhead)"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
