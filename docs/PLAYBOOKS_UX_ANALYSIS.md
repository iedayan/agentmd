# Playbooks.com UX Analysis — Ideas to Borrow for AgentMD

**Source:** [playbooks.com](https://playbooks.com/) — “Better context for your AI agents” (skills directory, MCP configs).  
**Goal:** Identify features and UI/UX patterns we can reuse on the AgentMD landing and product.

---

## What Playbooks Does Well

| Area | Their approach |
|------|-----------------|
| **Hero** | One clear value line + single CLI CTA (`npx playbooks find skill`) + “Browse skills” / “Browse MCP servers” |
| **Compatibility** | “Works with these agents” — row of logos (Claude Code, Cursor, Cline, Windsurf, Zed, Amp, Codex CLI, etc.) |
| **Content structure** | “What’s in the directory” as **numbered sections** (01, 02, 03) — Agent skills, Skill bundles, MCP servers |
| **FAQ** | “Common questions” block (01–06) with short, scannable Q&A (What’s a skill? What tools? Free? Submit? Where to put files? Bundles?) |
| **Trust / friction** | “No account required” and “Free” called out; creator attribution + “submit your own” for marketplace feel |
| **Footer CTA** | Repeated value + outcome: “Give your agent better context. Get better code - no hallucinations.” + same two CTAs |

---

## Recommendations for AgentMD

### 1. **Hero: One primary CLI CTA**

- **Borrow:** One hero command that does the main action (like `npx playbooks find skill`).
- **For us:** Make the main hero CTA the **copy-paste command** (e.g. `npx @agentmd-dev/cli init` or “Get your score” that scrolls to a single command block). Keep “Get your score” / “Start free” / “See it live” but ensure the **first** action is “run this one command” so intent is obvious.

### 2. **“Works with” / compatibility strip**

- **Borrow:** Logo row showing where AgentMD fits.
- **For us:** Add a strip under the hero or above the fold: “Works with **GitHub Actions**, **Cursor**, **Warp**, **VS Code**, **AGENTS.md**” (or “Runs in CI · Cursor · CLI · Dashboard”). Use small logos or pill badges. Builds trust and clarifies integration points.

### 3. **Numbered “What’s inside” section**

- **Borrow:** Numbered blocks (01, 02, 03) for “What’s in the directory.”
- **For us:** Add a “What you get” or “What’s in the box” section with **01 Parse**, **02 Validate**, **03 Execute** (or **01 Score**, **02 CI**, **03 Ops**) with one line each. Reuse or extend the existing How it works steps with a clear numeric label (01/02/03) for scanability.

### 4. **Landing FAQ block (“Common questions”)**

- **Borrow:** Dedicated “Common questions” section on the homepage with 4–6 short Q&As.
- **For us:** We have `/faq` and pricing FAQ; add a **compact FAQ block on the landing** (e.g. before or after CTA): “What’s AGENTS.md?”, “Is it free?”, “Do I need to install anything?”, “Works with my stack?”. Reuse existing FAQ content; keep answers to 1–2 lines. Helps SEO and reduces bounce.

### 5. **Dual primary CTAs**

- **Borrow:** Two equal-weight actions: “Browse skills” and “Browse MCP servers.”
- **For us:** Mirror with two clear actions, e.g. “Get your score” (try first) and “Start free” (register), and keep them visible in hero + CTA. We already do this; consider adding a third for “See it live” / “View docs” so “try / sign up / explore” are all obvious.

### 6. **Outcome-focused tagline in footer**

- **Borrow:** “Get better code - no hallucinations.”
- **For us:** Add a short outcome line in the final CTA or footer, e.g. “Ship with confidence. No drift, no surprises.” or “One file. Real execution. No guesswork.” to reinforce benefit at the end of the scroll.

### 7. **“No account” / “Free” in hero**

- **Borrow:** Explicit “no account required” and “free” in hero/subhead.
- **For us:** We already have “No install required · Free for 3 repos · No credit card” under QuickInstall; consider moving or repeating one line next to the main CTA (e.g. “Free for 3 repos — no credit card”) so it’s visible without scrolling.

### 8. **Creator / marketplace angle (optional)**

- **Borrow:** “Can I submit my own?” + attribution.
- **For us:** If we lean into marketplace/templates later, add a line like “Submit a template” or “Add your workflow” in nav or footer and a short FAQ: “Can I contribute?” with link to docs or GitHub.

---

## Quick wins (minimal code)

1. **Hero:** Ensure the first CTA is “Get your score” that scrolls to `#try-it` and the first thing in that section is the CLI command.
2. **Compatibility strip:** New small section or row under hero: “Works with GitHub Actions · Cursor · CLI · Dashboard” (text or icons).
3. **How it works:** Add “01”, “02”, “03” labels (we already have 1, 2, 3) and optionally a section title “What you get” or “How it works.”
4. **Landing FAQ:** New component `LandingFAQ` with 4–6 items from `FAQ_ITEMS`, render before `<CTA />` on the homepage.
5. **Footer CTA:** Add one outcome line above the buttons in `<CTA />`, e.g. “Ship with confidence. No drift, no surprises.”

---

## What we already do well (keep)

- Clear value prop: “Your AGENTS.md is the spec. We execute it.”
- Multiple CTAs (score / register / see it live).
- Trust line under install: “No install required · Free for 3 repos · No credit card.”
- How it works with steps and copyable workflow.
- Bento-style features and strong visual hierarchy.

---

*Analysis based on playbooks.com structure and copy (skills directory, MCP, FAQ). For visual design (typography, motion, spacing) review the live site directly.*
