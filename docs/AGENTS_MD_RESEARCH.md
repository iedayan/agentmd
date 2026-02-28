# AGENTS.md: Research & Best Practices

**Summary:** AGENTS.md makes a measurable difference when developing with agentic AI—but only when done right. Poor implementation can actively harm performance.

---

## What the Research Shows

| Finding                            | Impact                                   | Source                                                                                     |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| **28.64% faster runtime**          | Median wall-clock execution time reduced | Lulla et al. (ICSE JAWs 2026)                                                              |
| **16.58% lower token consumption** | Output tokens reduced                    | Lulla et al.                                                                               |
| **100% accuracy**                  | For Next.js 16 APIs vs 79% with skills   | [Vercel research](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) |
| **+5.19% accuracy**                | With automated instruction optimization  | Arize AI                                                                                   |
| **-2–3% success rate**             | With auto-generated context files        | ETH Zurich study                                                                           |
| **+20% inference cost**            | With unnecessary context                 | ETH Zurich                                                                                 |

---

## When It Works

**Human-written** AGENTS.md files with **non-discoverable information** deliver real gains:

- **Tooling gotchas**: "Use `uv` instead of pip" — agents used it 1.6× per task when mentioned vs &lt;0.01 when not
- **Framework updates**: Next.js 16 APIs not in training data
- **Project-specific landmines**: "Don't refactor the auth module — it uses custom middleware"
- **Command patterns**: File-scoped commands that save minutes per task

Vercel found that a **compressed 8KB docs index** in AGENTS.md achieved 100% accuracy on Next.js 16 tasks—outperforming their "skills" approach which maxed out at 79%.

---

## When It Fails

**Auto-generated** or **bloated** files actively hurt performance:

1. **Redundant information**: LLM-generated context files reduced success by 2–3% and increased costs 20%+
2. **Cognitive load**: Unnecessary requirements make tasks harder—agents follow instructions but waste reasoning tokens
3. **Anchoring effect**: Mentioning legacy patterns biases agents toward outdated approaches
4. **"Lost in the Middle"**: Long context degrades performance regardless of relevance

The ETH Zurich study found that when they **stripped all documentation** from repos, auto-generated files _suddenly helped_ (+2.7%)—proving the problem is redundancy, not the format itself.

---

## What Belongs in AGENTS.md

**Keep it minimal.** Every line should pass this test: _"Can the agent discover this by reading the code?"_ If yes, delete it.

### ✅ Do Include

- Tooling specifics not inferable from code (`uv`, `pnpm`, custom test runners)
- Version requirements that differ from latest
- "Landmines"—things that look right but break
- File-scoped command patterns
- MCP server configurations
- Permission boundaries

### ❌ Don't Include

- Codebase overviews (agents can list directories)
- Tech stack descriptions (inferable from package files)
- Style guides (unless non-obvious)
- Anything already in README

---

## Emerging Best Practices

1. **Hierarchical files**: Place AGENTS.md at module level, not just root
2. **Compressed indexes**: Use minimal pointers to retrievable docs (Vercel's 8KB approach)
3. **Task-specific loading**: Route agents to focused context based on task type
4. **Automated optimization**: Use meta-prompting to refine instructions (+5.19% accuracy)
5. **Version control**: Treat like code—PRs, reviews, changelogs

---

## The Bottom Line

AGENTS.md is **not magic**, but it's **not useless**. It's a precision tool:

- **With human-written, minimal, non-discoverable info**: Significant gains (28% faster, 16% cheaper, 100% accuracy on specific tasks)
- **With auto-generated or bloated content**: Active harm (worse success rates, 20%+ higher costs)

The file works when it **compensates for knowledge gaps**—things the agent genuinely can't figure out on its own. Everything else is noise that competes with the actual task.

---

## How AgentMD Helps

AgentMD validates that your AGENTS.md is actually useful:

- **Parse & validate** — Catch format errors, missing sections, unsafe commands
- **Score** — Agent-readiness score surfaces quality issues
- **Execute** — Run the spec and verify it works
- **Governance** — Audit trails, approval workflows, permission boundaries

**Quality beats quantity.** Validation prevents degradation.
