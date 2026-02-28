import Link from 'next/link';

export default function AgenticAiPage() {
  return (
    <div>
      <h1>What is Agentic AI?</h1>
      <p className="lead">
        Agentic AI is software that acts autonomously—chaining tasks, making decisions, and taking
        actions without step-by-step human guidance. Understanding it helps you govern it.
      </p>

      <h2>In Plain Language</h2>
      <p>
        Traditional AI tools respond to prompts: you ask, it answers. <strong>Agentic AI</strong>{' '}
        goes further. It plans, uses tools (APIs, terminals, databases), and executes workflows on
        its own. A coding agent might read your repo, run tests, fix failures, and open a PR—all
        without you clicking through each step.
      </p>
      <p>
        That autonomy is powerful. It&apos;s also what makes governance hard. As IBM puts it:
        &quot;Agentic systems are complex and dynamic, essentially involving software with a mind of
        its own.&quot; Agents can chain tasks, adapt to changing conditions, and behave
        non-deterministically. Without guardrails, you can&apos;t easily predict or audit what
        they&apos;ll do.
      </p>

      <h2>Why Governance Matters</h2>
      <p>
        The same characteristics that make agentic AI powerful—autonomy, adaptability,
        complexity—also create risks. Governance frameworks help ensure agents operate safely,
        ethically, and transparently.
      </p>

      <h3>Autonomy without oversight</h3>
      <p>
        Agents make decisions independently. Unlike rule-based software, they use ML to analyze data
        and determine actions. In high-risk situations (e.g., deploy to production, approve a loan),
        an agent&apos;s decision can have major consequences—yet human oversight isn&apos;t always
        present. Governance balances efficiency with accountability.
      </p>

      <h3>Opacity</h3>
      <p>
        Many agents perform decision-making that isn&apos;t easy for humans to interpret. Unlike
        traceable rule-based logic, ML models infer from patterns in data. That opacity makes it
        hard to audit decisions. Stakeholders need to understand <em>why</em> an agent did
        something—especially when it goes wrong.
      </p>

      <h3>Bias and fairness</h3>
      <p>
        AI systems learn from historical data. If that data contains biases, agents may amplify
        them. Agents might prioritize efficiency over fairness or privacy. Governance includes bias
        detection, fairness metrics, and human review.
      </p>

      <h3>Security</h3>
      <p>
        Agents use APIs, tools, and external data. Poorly governed integrations can expose
        vulnerabilities—adversarial attacks, data leaks, unauthorized access. Access controls,
        authentication, and least-privilege boundaries are essential.
      </p>

      <h2>Where AgentMD Fits</h2>
      <p>
        AgentMD focuses on <strong>execution governance</strong> for agents that run commands
        (build, test, lint, deploy). We turn AGENTS.md—the spec—into deterministic, auditable
        workflows. Commands are explicit, permission boundaries are enforced, and every run is
        logged. That gives you control and traceability without sacrificing automation.
      </p>
      <p>
        For the full picture—observability, feedback loops, and accountability—see{' '}
        <Link href="/docs/best-practices" className="text-primary hover:underline">
          Agentic AI Best Practices
        </Link>
        .
      </p>

      <h2>Further Reading</h2>
      <ul>
        <li>
          <a
            href="https://www.ibm.com/think/topics/agentic-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            IBM: Agentic AI explained
          </a>{' '}
          — Key concepts and use cases
        </li>
        <li>
          <a
            href="https://www.ibm.com/think/topics/agentops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            IBM: What is AgentOps?
          </a>{' '}
          — Lifecycle management for AI agents
        </li>
        <li>
          <a
            href="https://www.ibm.com/think/insights/ai-agent-governance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            IBM: AI agent governance
          </a>{' '}
          — Autonomy, transparency, compliance
        </li>
      </ul>

      <p className="mt-8">
        <Link href="/docs/best-practices" className="text-primary hover:underline">
          → Agentic AI Best Practices
        </Link>
        {' · '}
        <Link href="/docs/why-execute" className="text-primary hover:underline">
          Why Execute AGENTS.md?
        </Link>
      </p>
    </div>
  );
}
