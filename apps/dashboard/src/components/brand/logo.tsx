"use client";

import { useId } from "react";
import { cn } from "@/lib/core/utils";

/**
 * AgentMD Logo — document mark with terminal cursor
 * The mark: a markdown file corner-fold with a ">" prompt,
 * representing a parsed & executed AGENTS.md file.
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const id = useId().replace(/:/g, "");
  const sizes = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", sizes[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`logo-bg-${id}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`logo-accent-${id}`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="9" fill={`url(#logo-bg-${id})`} />

      {/* Document body — left + bottom + top-left corner, with top-right fold */}
      <path
        d="M10 8h14l7 7v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
        fill="white"
        fillOpacity="0.1"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="1.25"
      />
      {/* Corner fold triangle */}
      <path
        d="M24 8l7 7h-5a2 2 0 0 1-2-2V8z"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Terminal ">" prompt — the agent cursor */}
      <path
        d="M13 19l4 3-4 3"
        stroke={`url(#logo-accent-${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Underscore line — the executing command */}
      <line
        x1="19"
        y1="25"
        x2="27"
        y2="25"
        stroke={`url(#logo-accent-${id})`}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
