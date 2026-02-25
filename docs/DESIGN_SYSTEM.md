# AgentMD Design System

This document describes the visual identity and design decisions for the AgentMD frontend.

**Live reference:** When the dashboard is running, open `/design-system` for the integrated design system (site nav + full token and component showcase). The standalone HTML is also at `/design-system.html`.

## Design Philosophy

AgentMD's design should feel **distinctive**—not generic SaaS. It should evoke:

- **Spec execution** — Parse, validate, execute as a clear pipeline
- **Agent health** — Validation, readiness, "green for go"
- **Developer tools** — Terminal, CLI, code-first

## Typography

- **Sans**: [Outfit](https://fonts.google.com/specimen/Outfit) — Geometric, modern, distinctive. Avoids the generic "IBM Plex / Inter" look common in dev tools.
- **Mono**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — Optimized for code, widely recognized by developers.

## Color

- **Primary**: Emerald (`hsl(160 84% 39%)`) — Conveys "agent health," "validation pass," "ready to execute." Distinct from the overused cyan/teal in AI SaaS.
- **Accents**: Use primary for CTAs, status indicators, and success states.

## Visual Motifs

- **Execution grid**: Hero uses a subtle grid (not dots) with primary-tinted lines—evokes "spec as blueprint" or "execution pipeline."
- **Soft orbs**: Reduced intensity; primary-colored glows instead of generic indigo/blue.
- **Terminal aesthetic**: Code blocks, status bars, and prompts use primary for the `$` cursor and status indicators.

## Logo

The logo combines:
- Document mark (AGENTS.md as a file)
- Terminal `>` prompt (execution)
- Emerald gradient (agent health)

## Avoid

- Cyan/teal as primary (overused in AI tools)
- IBM Plex, Inter, Geist for body (too common)
- Generic dot grids with no meaning
- Heavy glassmorphism
