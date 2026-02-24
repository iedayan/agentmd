/**
 * Agent-readiness score badge (SVG).
 * Usage: /api/badge/score?score=87 or ?repo=owner/repo
 * For repo: fetches AGENTS.md from GitHub raw and computes score.
 */
import { NextRequest } from "next/server";
import {
  parseAgentsMd,
  validateAgentsMd,
  computeAgentReadinessScore,
} from "@agentmd/core";
function scoreToColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function renderBadgeSvg(score: number, label = "AgentMD Score"): string {
  const color = scoreToColor(score);
  const text = `${score}/100`;
  const width = 120;
  const labelWidth = 90;
  const valueWidth = 50;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" viewBox="0 0 ${totalWidth} 20">
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#f5f5f5"/>
    <stop offset="1" stop-color="#e5e5e5"/>
  </linearGradient>
  <rect width="${labelWidth}" height="20" fill="url(#a)"/>
  <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
  <rect width="${totalWidth}" height="20" fill="transparent" stroke="#e5e5e5" stroke-width="1" rx="3"/>
  <text x="${labelWidth / 2}" y="14" fill="#333" font-family="DejaVu Sans,Verdana,sans-serif" font-size="11" text-anchor="middle">${escapeXml(label)}</text>
  <text x="${labelWidth + valueWidth / 2}" y="14" fill="white" font-family="DejaVu Sans,Verdana,sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${escapeXml(text)}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreParam = searchParams.get("score");
  const repo = searchParams.get("repo");

  let score: number;

  if (scoreParam !== null) {
    score = Math.min(100, Math.max(0, parseInt(scoreParam, 10) || 0));
  } else if (repo && /^[\w.-]+\/[\w.-]+$/.test(repo.trim())) {
    try {
      const [owner, name] = repo.trim().split("/");
      const branch = searchParams.get("branch") || "main";
      const url = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/AGENTS.md`;
      const res = await fetch(url, {
        headers: { "User-Agent": "AgentMD-Badge/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        score = 0;
      } else {
        const content = await res.text();
        const parsed = parseAgentsMd(content);
        validateAgentsMd(parsed);
        score = computeAgentReadinessScore(parsed);
      }
    } catch {
      score = 0;
    }
  } else {
    score = 0;
  }

  const svg = renderBadgeSvg(score);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
