import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";

export default function RoiMethodologyPage() {
  return (
    <div>
      <h1>ROI Calculator Methodology</h1>
      <p className="lead">
        How we derive value from automation and failure prevention. Use this to interpret and customize the analytics dashboard.
      </p>

      <h2>Inputs (Configurable)</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Parameter</th>
            <th className="text-left py-2">Default</th>
            <th className="text-left py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2"><code>days</code></td>
            <td className="py-2">30</td>
            <td className="py-2">Analysis window (7–365)</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><code>hourlyRateUsd</code></td>
            <td className="py-2">120</td>
            <td className="py-2">Engineering labor cost per hour</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><code>incidentCostUsd</code></td>
            <td className="py-2">1500</td>
            <td className="py-2">Cost per prevented failure (production incident, rollback)</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><code>baselineFailureRate</code></td>
            <td className="py-2">0.20</td>
            <td className="py-2">Expected failure rate without AgentMD (e.g., 20%)</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><code>platformCostMonthlyUsd</code></td>
            <td className="py-2">40</td>
            <td className="py-2">Your AgentMD subscription cost per month</td>
          </tr>
        </tbody>
      </table>

      <h2>Formulas</h2>

      <h3>Labor value (automation)</h3>
      <p>Each execution saves ~8 minutes of manual run/triage time. Gross labor value = hours saved × hourly rate.</p>

      <h3>Failure prevention value</h3>
      <p>If your observed failure rate is lower than the baseline, the difference represents failures prevented by AgentMD. Value = prevented failures × incident cost.</p>

      <h3>Gross and net value</h3>
      <p>Gross value = labor value + failure value. Net value = gross value − platform cost. ROI multiple = gross / platform cost.</p>

      <h2>Confidence</h2>
      <ul>
        <li><strong>Low</strong> — &lt; 80 executions in window</li>
        <li><strong>Medium</strong> — 80–299 executions</li>
        <li><strong>High</strong> — ≥ 300 executions</li>
      </ul>

      <h2>Caveats</h2>
      <ul>
        <li>Labor value assumes 8 min/execution; adjust for your workflow.</li>
        <li>Failure prevention depends on a realistic baseline. Use 15–25% if you don&apos;t have historical data.</li>
        <li>Incident cost varies widely ($200–$10k+). Use your own post-mortem data when possible.</li>
        <li>Qualitative benefits (context-switching, onboarding, compliance) are not included.</li>
      </ul>

      <h2>API</h2>
      <CodeBlock>{`GET /api/analytics/roi-report?days=30&hourlyRateUsd=150&incidentCostUsd=2000&baselineFailureRate=0.2&platformCostMonthlyUsd=40`}</CodeBlock>
      <p>Response includes <code>assumptions</code>, <code>metrics</code>, <code>value</code>, and <code>confidence</code>.</p>

      <p className="mt-8">
        <Link href="/dashboard/analytics" className="text-primary hover:underline">
          → Analytics Dashboard
        </Link>
        {" · "}
        <Link href="/case-studies" className="text-primary hover:underline">
          Case Studies
        </Link>
      </p>
    </div>
  );
}
