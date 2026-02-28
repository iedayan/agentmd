import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  return (
    <div>
      <h1>How AgentMD Works</h1>
      <p className="lead">A plain-language explanation of what AgentMD does and how it works.</p>

      <h2>What AgentMD Does (Simple Version)</h2>
      <p>
        <strong>AGENTS.md</strong> is like a recipe for AI coding tools. It says things like
        &quot;run tests,&quot; &quot;run the build,&quot; &quot;run the linter.&quot; Most teams
        only <em>read</em> it. AgentMD actually <em>runs</em> those steps and checks that they work.
      </p>

      <h2>The Three Main Parts</h2>

      <h3>1. Read &amp; Understand (Parse)</h3>
      <p>
        AgentMD reads your AGENTS.md and figures out: what sections it has (Build, Test, Lint,
        etc.), what commands to run (e.g. <code>pnpm test</code>, <code>pnpm build</code>), and any
        rules or limits you&apos;ve set (e.g. &quot;don&apos;t run dangerous commands&quot;).
      </p>
      <p>Think of it like reading a recipe and listing all the steps before you start cooking.</p>

      <h3>2. Check It&apos;s OK (Validate)</h3>
      <p>
        Before running anything, AgentMD checks: the file isn&apos;t empty, there are no obviously
        dangerous commands (e.g. &quot;delete everything&quot;), and it has the usual sections
        (build, test, etc.).
      </p>
      <p>
        It also gives a <strong>score from 0–100</strong> for how &quot;ready&quot; your AGENTS.md
        is for AI tools.
      </p>

      <h3>3. Actually Run It (Execute)</h3>
      <p>
        AgentMD runs the commands from your AGENTS.md in order: parse the file, decide which
        commands to run, run them in a safe way (with time limits and safety checks), and record
        what happened (passed, failed, how long it took).
      </p>

      <h2>Why It Matters</h2>
      <p>
        Without AgentMD, AI tools might skip steps or do things differently each time. With AgentMD,
        the same steps run every time, in the same order, and you get a clear record of what ran and
        whether it passed.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/docs/beginner">
          <Button size="sm">Beginner Path</Button>
        </Link>
        <Link href="/docs/quickstart">
          <Button variant="outline" size="sm">
            Quickstart
          </Button>
        </Link>
        <Link href="/docs/execution">
          <Button variant="outline" size="sm">
            Execution &amp; Safety
          </Button>
        </Link>
      </div>
    </div>
  );
}
