import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = {
  title: "Privacy Policy — AgentMD",
  description:
    "Privacy Policy for AgentMD. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="lead text-muted-foreground">
        Last updated: February 2025
      </p>

      <p>
        AgentMD (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy
        explains how we collect, use, disclose, and protect your information when you use our
        website, API, CLI, and related services (&quot;Service&quot;).
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> Email address, name, password (hashed), and profile
          information when you register
        </li>
        <li>
          <strong>Repository data:</strong> Repository metadata (names, URLs, structure) when you
          connect GitHub or other version control systems
        </li>
        <li>
          <strong>AGENTS.md content:</strong> Content of AGENTS.md files you validate, parse, or
          execute through our Service
        </li>
        <li>
          <strong>Execution logs:</strong> Command execution results, timestamps, and status (with
          configurable retention)
        </li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Usage data:</strong> Pages visited, features used, API calls, and general usage
          patterns
        </li>
        <li>
          <strong>Device and browser data:</strong> IP address, browser type, operating system, and
          device identifiers
        </li>
        <li>
          <strong>Cookies and similar technologies:</strong> See our{" "}
          <Link href="/cookies">Cookie Policy</Link> for details
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, operate, and improve the Service</li>
        <li>Authenticate you and manage your account</li>
        <li>Process AGENTS.md files and execute commands as requested</li>
        <li>Send service-related communications (e.g., security alerts, product updates)</li>
        <li>Analyze usage to improve our product and user experience</li>
        <li>Comply with legal obligations and enforce our Terms</li>
      </ul>

      <h2>3. Legal Basis for Processing (EU/EEA Users)</h2>
      <p>
        For users in the European Union and European Economic Area, we process your data based on:
      </p>
      <ul>
        <li>
          <strong>Contract:</strong> To perform our agreement with you (e.g., providing the Service)
        </li>
        <li>
          <strong>Legitimate interests:</strong> To improve the Service, prevent fraud, and ensure
          security
        </li>
        <li>
          <strong>Consent:</strong> Where we have obtained your consent (e.g., marketing emails)
        </li>
      </ul>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>We may share your information with:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> Hosting (e.g., Vercel, AWS), analytics, payment
          processors, and email delivery—all under data processing agreements where required
        </li>
        <li>
          <strong>GitHub / OAuth providers:</strong> When you connect repositories, we interact with
          their APIs per their terms and your authorization
        </li>
        <li>
          <strong>Legal authorities:</strong> When required by law, court order, or to protect our
          rights and safety
        </li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active or as needed to provide the
        Service. Execution logs have configurable retention (default 30 days for free plans; longer
        for paid plans). You may request deletion of your data at any time; see Section 7.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We implement industry-standard security measures, including encryption in transit (TLS) and
        at rest, access controls, and regular security assessments. No method of transmission over
        the internet is 100% secure; we cannot guarantee absolute security.
      </p>

      <h2>7. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of your personal data
        </li>
        <li>
          <strong>Rectification:</strong> Correct inaccurate data
        </li>
        <li>
          <strong>Erasure:</strong> Request deletion of your data
        </li>
        <li>
          <strong>Portability:</strong> Receive your data in a structured, machine-readable format
        </li>
        <li>
          <strong>Object or restrict processing:</strong> In certain circumstances
        </li>
        <li>
          <strong>Withdraw consent:</strong> Where processing is based on consent
        </li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href="mailto:privacy@agentmd.dev">privacy@agentmd.dev</a>. EU/EEA users may also lodge a
        complaint with their local data protection authority. See our{" "}
        <Link href="/gdpr">GDPR Statement</Link> for more details.
      </p>

      <h2>8. International Transfers</h2>
      <p>
        Your data may be processed in the United States or other countries where our service
        providers operate. For EU/EEA users, we use appropriate safeguards (e.g., Standard
        Contractual Clauses) where required.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not intended for users under 16. We do not knowingly collect data from
        children. If you believe we have collected such data, please contact us.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes
        by posting the updated policy and updating the &quot;Last updated&quot; date. Continued use
        constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy-related questions or to exercise your rights, contact us at{" "}
        <a href="mailto:privacy@agentmd.dev">privacy@agentmd.dev</a>.
      </p>

      <p className="text-sm text-muted-foreground mt-12">
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/gdpr" className="underline hover:text-foreground">
          GDPR
        </Link>
        {" · "}
        <Link href="/cookies" className="underline hover:text-foreground">
          Cookie Policy
        </Link>
        {" · "}
        <Link href="/" className="underline hover:text-foreground">
          Home
        </Link>
      </p>
    </LegalLayout>
  );
}
