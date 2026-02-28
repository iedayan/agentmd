import Link from 'next/link';

export default function ResearchBestPracticesPage() {
  return (
    <div>
      <h1>AGENTS.md: Research &amp; Best Practices</h1>
      <p className="lead">
        AGENTS.md makes a measurable difference when developing with agentic AI—but only when done
        right. Poor implementation can actively harm performance.
      </p>

      <h2>What the Research Shows</h2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Finding</th>
            <th className="text-left py-2">Impact</th>
            <th className="text-left py-2">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2">
              <strong>28.64% faster runtime</strong>
            </td>
            <td className="py-2">Median wall-clock execution time reduced</td>
            <td className="py-2">Lulla et al. (ICSE JAWs 2026)</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">
              <strong>16.58% lower token consumption</strong>
            </td>
            <td className="py-2">Output tokens reduced</td>
            <td className="py-2">Lulla et al.</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">
              <strong>100% accuracy</strong>
            </td>
            <td className="py-2">For Next.js 16 APIs vs 79% with skills</td>
            <td className="py-2">
              <a
                href="https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel research
              </a>
            </td>
          </tr>
          <tr className="border-b">
            <td className="py-2">
              <strong>+5.19% accuracy</strong>
            </td>
            <td className="py-2">With automated instruction optimization</td>
            <td className="py-2">Arize AI</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">
              <strong>-2–3% success rate</strong>
            </td>
            <td className="py-2">With auto-generated context files</td>
            <td className="py-2">ETH Zurich study</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">
              <strong>+20% inference cost</strong>
            </td>
            <td className="py-2">With unnecessary context</td>
            <td className="py-2">ETH Zurich</td>
          </tr>
        </tbody>
      </table>

      <h2>When It Works</h2>
      <p>
        <strong>Human-written</strong> AGENTS.md files with{' '}
        <strong>non-discoverable information</strong> deliver real gains:
      </p>
      <ul>
        <li>
          <strong>Tooling gotchas</strong>: &quot;Use <code>uv</code> instead of pip&quot; — agents
          used it 1.6× per task when mentioned vs &lt;0.01 when not
        </li>
        <li>
          <strong>Framework updates</strong>: Next.js 16 APIs not in training data
        </li>
        <li>
          <strong>Project-specific landmines</strong>: &quot;Don&apos;t refactor the auth module —
          it uses custom middleware&quot;
        </li>
        <li>
          <strong>Command patterns</strong>: File-scoped commands that save minutes per task
        </li>
      </ul>
      <p>
        Vercel found that a <strong>compressed 8KB docs index</strong> in AGENTS.md achieved 100%
        accuracy on Next.js 16 tasks—outperforming their &quot;skills&quot; approach which maxed out
        at 79%.
      </p>

      <h2>When It Fails</h2>
      <p>
        <strong>Auto-generated</strong> or <strong>bloated</strong> files actively hurt performance:
      </p>
      <ol>
        <li>
          <strong>Redundant information</strong>: LLM-generated context files reduced success by
          2–3% and increased costs 20%+
        </li>
        <li>
          <strong>Cognitive load</strong>: Unnecessary requirements make tasks harder—agents follow
          instructions but waste reasoning tokens
        </li>
        <li>
          <strong>Anchoring effect</strong>: Mentioning legacy patterns biases agents toward
          outdated approaches
        </li>
        <li>
          <strong>&quot;Lost in the Middle&quot;</strong>: Long context degrades performance
          regardless of relevance
        </li>
      </ol>
      <p>
        The ETH Zurich study found that when they <strong>stripped all documentation</strong> from
        repos, auto-generated files <em>suddenly helped</em> (+2.7%)—proving the problem is
        redundancy, not the format itself.
      </p>

      <h2>What Belongs in AGENTS.md</h2>
      <p>
        <strong>Keep it minimal.</strong> Every line should pass this test:{' '}
        <em>&quot;Can the agent discover this by reading the code?&quot;</em> If yes, delete it.
      </p>

      <h3>Do Include</h3>
      <ul>
        <li>
          Tooling specifics not inferable from code (<code>uv</code>, <code>pnpm</code>, custom test
          runners)
        </li>
        <li>Version requirements that differ from latest</li>
        <li>&quot;Landmines&quot;—things that look right but break</li>
        <li>File-scoped command patterns</li>
        <li>MCP server configurations</li>
        <li>Permission boundaries</li>
      </ul>

      <h3>Don&apos;t Include</h3>
      <ul>
        <li>Codebase overviews (agents can list directories)</li>
        <li>Tech stack descriptions (inferable from package files)</li>
        <li>Style guides (unless non-obvious)</li>
        <li>Anything already in README</li>
      </ul>

      <h2>Emerging Best Practices</h2>
      <ol>
        <li>
          <strong>Hierarchical files</strong>: Place AGENTS.md at module level, not just root
        </li>
        <li>
          <strong>Compressed indexes</strong>: Use minimal pointers to retrievable docs
          (Vercel&apos;s 8KB approach)
        </li>
        <li>
          <strong>Task-specific loading</strong>: Route agents to focused context based on task type
        </li>
        <li>
          <strong>Automated optimization</strong>: Use meta-prompting to refine instructions (+5.19%
          accuracy)
        </li>
        <li>
          <strong>Version control</strong>: Treat like code—PRs, reviews, changelogs
        </li>
      </ol>

      <h2>The Bottom Line</h2>
      <p>
        AGENTS.md is <strong>not magic</strong>, but it&apos;s <strong>not useless</strong>.
        It&apos;s a precision tool:
      </p>
      <ul>
        <li>
          <strong>With human-written, minimal, non-discoverable info</strong>: Significant gains
          (28% faster, 16% cheaper, 100% accuracy on specific tasks)
        </li>
        <li>
          <strong>With auto-generated or bloated content</strong>: Active harm (worse success rates,
          20%+ higher costs)
        </li>
      </ul>
      <p>
        The file works when it <strong>compensates for knowledge gaps</strong>—things the agent
        genuinely can&apos;t figure out on its own. Everything else is noise that competes with the
        actual task.
      </p>

      <h2>How AgentMD Helps</h2>
      <p>AgentMD validates that your AGENTS.md is actually useful:</p>
      <ul>
        <li>
          <strong>Parse &amp; validate</strong> — Catch format errors, missing sections, unsafe
          commands
        </li>
        <li>
          <strong>Score</strong> — Agent-readiness score surfaces quality issues
        </li>
        <li>
          <strong>Execute</strong> — Run the spec and verify it works
        </li>
        <li>
          <strong>Governance</strong> — Audit trails, approval workflows, permission boundaries
        </li>
      </ul>
      <p>
        <strong>Quality beats quantity.</strong> Validation prevents degradation. See{' '}
        <Link href="/docs/best-practices" className="text-primary hover:underline">
          Agentic AI Best Practices
        </Link>{' '}
        and{' '}
        <Link href="/docs/parse" className="text-primary hover:underline">
          Parse &amp; Validate
        </Link>{' '}
        for more.
      </p>
    </div>
  );
}
