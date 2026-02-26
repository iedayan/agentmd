import { LegalLayout } from "@/components/legal/legal-layout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last updated: February 24, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using AgentMD, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        AgentMD provides tools for parsing, validating, and executing AGENTS.md files. Our services are provided &quot;as is&quot; and we make no guarantees regarding uptime or reliability for free-tier users.
      </p>

      <h2>3. User Responsibilities</h2>
      <p>
        You are responsible for your use of the services and for any content you provide, including compliance with applicable laws, rules, and regulations.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        In no event shall AgentMD be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues.
      </p>

      <h2>5. Termination</h2>
      <p>
        We may terminate or suspend your access to our services at any time, without prior notice or liability, for any reason whatsoever.
      </p>
    </LegalLayout>
  );
}
