'use client';

import { useState } from 'react';
import type { PipelineStage } from '@/lib/ops/mock-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const STAGE_COLORS = {
  passed: 'hsl(var(--primary))',
  failed: 'hsl(var(--destructive))',
  pending: 'hsl(var(--muted-foreground))',
  running: 'hsl(var(--primary))',
};

const STAGE_DESCRIPTIONS = {
  passed: 'Stage completed successfully',
  failed: 'Stage failed - check logs for details',
  pending: 'Stage waiting to run',
  running: 'Stage currently executing',
};

interface EnhancedPipelineDiagramProps {
  stages: PipelineStage[];
  onStageClick?: (id: string) => void;
}

export function EnhancedPipelineDiagram({ stages, onStageClick }: EnhancedPipelineDiagramProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const width = 140;
  const gap = 24;
  const totalWidth = stages.length * width + (stages.length - 1) * gap;

  return (
    <TooltipProvider>
      <div className="overflow-x-auto py-4">
        <svg width={Math.max(totalWidth, 800)} height={100}>
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

            {/* Gradient for running stages */}
            <linearGradient id="runningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>

            {/* Glow filter for hovered stages */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {stages.map((stage, i) => {
            const x = 20 + i * (width + gap);
            const color = STAGE_COLORS[stage.status];
            const isRunning = stage.status === 'running';
            const isHovered = hoveredStage === stage.id;

            return (
              <g key={stage.id}>
                {/* Connection lines */}
                {i > 0 && (
                  <line
                    x1={x - gap}
                    y1={50}
                    x2={x - 12}
                    y2={50}
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    strokeDasharray="60"
                    className="ops-connector"
                  />
                )}

                {/* Stage rectangle with enhanced styling */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <g
                      onClick={() => onStageClick?.(stage.id)}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredStage(stage.id)}
                      onMouseLeave={() => setHoveredStage(null)}
                    >
                      {/* Shadow/glow effect */}
                      {isHovered && (
                        <rect
                          x={x - 2}
                          y={6}
                          width={width + 4}
                          height={68}
                          fill={color}
                          fillOpacity="0.2"
                          filter="url(#glow)"
                          rx="8"
                        />
                      )}

                      {/* Main rectangle */}
                      <rect
                        x={x}
                        y={8}
                        width={width}
                        height={64}
                        fill="hsl(var(--card))"
                        stroke={color}
                        strokeWidth={stage.status === 'failed' ? 2 : 1}
                        rx="6"
                        className={`transition-all duration-300 ${
                          isHovered ? 'filter brightness-110' : ''
                        } ${isRunning ? 'animate-pulse' : ''}`}
                      />

                      {/* Running indicator bar */}
                      {isRunning && (
                        <rect
                          x={x}
                          y={8}
                          width={width}
                          height={3}
                          fill="url(#runningGradient)"
                          rx="6"
                        />
                      )}

                      {/* Status icon and name */}
                      <text
                        x={x + width / 2}
                        y={32}
                        textAnchor="middle"
                        className={`font-mono text-xs font-medium transition-all duration-300 ${
                          isHovered ? 'fill-primary' : 'fill-foreground'
                        }`}
                      >
                        {stage.status === 'passed' && '✓ '}
                        {stage.status === 'failed' && '✕ '}
                        {stage.status === 'running' && (
                          <tspan className={isRunning ? 'ops-pulse-running' : ''}>▶ </tspan>
                        )}
                        {stage.status === 'pending' && '⏳ '}
                        {stage.name}
                      </text>

                      {/* Duration */}
                      <text
                        x={x + width / 2}
                        y={52}
                        textAnchor="middle"
                        className="font-mono text-[10px] fill-muted-foreground"
                      >
                        {stage.duration ?? '—'}
                      </text>

                      {/* Additional info for hovered stage */}
                      {isHovered && stage.status === 'failed' && (
                        <text
                          x={x + width / 2}
                          y={65}
                          textAnchor="middle"
                          className="font-mono text-[9px] fill-destructive"
                        >
                          Click to view logs
                        </text>
                      )}
                    </g>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            stage.status === 'passed'
                              ? 'bg-green-500'
                              : stage.status === 'failed'
                                ? 'bg-red-500'
                                : stage.status === 'running'
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-gray-500'
                          }`}
                        />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_DESCRIPTIONS[stage.status]}
                      </p>
                      {stage.duration && (
                        <p className="text-xs text-muted-foreground">Duration: {stage.duration}</p>
                      )}
                      {stage.status === 'failed' && (
                        <p className="text-xs text-destructive">Click to view error details</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Arrow to next stage */}
                {i < stages.length - 1 && (
                  <line
                    x1={x + width + 12}
                    y1={50}
                    x2={x + width + gap - 12}
                    y2={50}
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    markerEnd="url(#arrowhead)"
                    className="transition-all duration-300"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </TooltipProvider>
  );
}
