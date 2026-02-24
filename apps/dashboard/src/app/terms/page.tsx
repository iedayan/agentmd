import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = {
  title: "Terms of Service — AgentMD",
  description: "Terms of Service for AgentMD. By using AgentMD, you agree to these terms.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="lead text-muted-foreground">
        Last updated: February 2025
      </p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of AgentMD
        (&quot;Service&quot;), including our website, API, CLI, and related services operated by
        AgentMD (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service, you agree to
        be bound by these Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Acceptance and Eligibility</h2>
      <p>
        By creating an account or using the Service, you represent that you are at least 18 years
        old and have the authority to bind yourself or your organization to these Terms. If you use
        the Service on behalf of an organization, you represent that you have the authority to bind
        that organization.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        AgentMD provides tools to parse, validate, and execute AGENTS.md files—a specification
        format for AI agent instructions. Our Service includes:
      </p>
      <ul>
        <li>Validation and parsing of AGENTS.md files</li>
        <li>Agent-readiness scoring</li>
        <li>CI/CD integration for automated execution</li>
        <li>Marketplace for verified agent configurations</li>
        <li>Dashboard, API, and CLI access</li>
      </ul>

      <h2>3. Account Registration and Security</h2>
      <p>
        You must provide accurate, current information when registering. You are responsible for
        maintaining the confidentiality of your account credentials and for all activity under your
        account. Notify us immediately of any unauthorized access.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purpose or in violation of applicable laws</li>
        <li>Transmit malware, malicious code, or content that could harm our systems or users</li>
        <li>Attempt to gain unauthorized access to our systems, other accounts, or third-party data</li>
        <li>Use the Service to run commands that violate third-party terms or intellectual property</li>
        <li>Resell, sublicense, or commercially exploit the Service without our written consent</li>
        <li>Interfere with or disrupt the Service or its infrastructure</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        We retain all rights to the Service, including our software, branding, and documentation.
        You retain ownership of your content (e.g., AGENTS.md files, repository data). By using the
        Service, you grant us a limited license to process your content solely to provide the
        Service. Our open-source components are licensed under their respective licenses (e.g., MIT).
      </p>

      <h2>6. Pricing and Payment</h2>
      <p>
        Pricing is displayed on our <Link href="/pricing">pricing page</Link>. Free tiers may have
        usage limits. Paid plans are billed in advance. You may cancel at any time; refunds are
        handled per our refund policy. We may change pricing with 30 days&apos; notice.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
        EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
        OR SECURE. WE ARE NOT RESPONSIBLE FOR COMMANDS EXECUTED VIA YOUR AGENTS.MD FILES OR FOR
        THIRD-PARTY CONTENT IN THE MARKETPLACE.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR GOODWILL. OUR
        TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING
        THE CLAIM, OR $100 IF YOU ARE ON A FREE PLAN.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify and hold us harmless from any claims, damages, or expenses (including
        reasonable attorneys&apos; fees) arising from your use of the Service, your content, or your
        violation of these Terms.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your access at any time for violation of these Terms or for any
        other reason. You may terminate your account at any time. Upon termination, your right to
        use the Service ceases. Provisions that by their nature should survive (e.g., intellectual
        property, disclaimers, limitation of liability) will survive.
      </p>

      <h2>11. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, United States, without regard
        to conflict of law principles. Any disputes shall be resolved in the courts of Delaware. If
        you are in the European Union, you may also have rights under mandatory consumer protection
        laws.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms from time to time. We will notify you of material changes by
        posting the new Terms and updating the &quot;Last updated&quot; date. Continued use after changes
        constitutes acceptance. If you do not agree, you must stop using the Service.
      </p>

      <h2>13. Contact</h2>
      <p>
        For questions about these Terms, contact us at{" "}
        <a href="mailto:legal@agentmd.dev">legal@agentmd.dev</a>.
      </p>

      <p className="text-sm text-muted-foreground mt-12">
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/gdpr" className="underline hover:text-foreground">
          GDPR
        </Link>
        {" · "}
        <Link href="/" className="underline hover:text-foreground">
          Home
        </Link>
      </p>
    </LegalLayout>
  );
}
