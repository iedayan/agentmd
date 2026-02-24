import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = {
  title: "GDPR Compliance — AgentMD",
  description:
    "AgentMD GDPR compliance statement. Your rights and our commitments under the General Data Protection Regulation.",
};

export default function GDPRPage() {
  return (
    <LegalLayout title="GDPR Compliance">
      <p className="lead text-muted-foreground">
        Last updated: February 2025
      </p>

      <p>
        AgentMD is committed to compliance with the General Data Protection Regulation (GDPR) for
        users in the European Union and European Economic Area. This page summarizes our approach
        and your rights.
      </p>

      <h2>1. Our Role</h2>
      <p>
        When you use AgentMD, we act as a <strong>data controller</strong> for the personal data we
        collect to provide the Service (e.g., account data, usage data). When we process data on your
        behalf as part of the Service (e.g., execution logs), we do so under your instructions and
        act as a <strong>data processor</strong> for that processing.
      </p>

      <h2>2. Legal Basis for Processing</h2>
      <p>We process your personal data based on:</p>
      <ul>
        <li>
          <strong>Contract (Art. 6(1)(b) GDPR):</strong> To perform our agreement with you—providing
          the Service, managing your account, and processing your requests
        </li>
        <li>
          <strong>Legitimate interests (Art. 6(1)(f) GDPR):</strong> To improve the Service,
          prevent fraud, ensure security, and communicate important updates
        </li>
        <li>
          <strong>Consent (Art. 6(1)(a) GDPR):</strong> Where we have obtained your explicit consent
          (e.g., marketing communications)
        </li>
        <li>
          <strong>Legal obligation (Art. 6(1)(c) GDPR):</strong> Where we must comply with applicable
          laws
        </li>
      </ul>

      <h2>3. Your Rights Under GDPR</h2>
      <p>You have the following rights:</p>

      <h3>Right of Access (Art. 15)</h3>
      <p>
        You may request a copy of your personal data we hold. We will provide the information in a
        clear, structured format.
      </p>

      <h3>Right to Rectification (Art. 16)</h3>
      <p>
        You may request correction of inaccurate or incomplete personal data. You can update much of
        your account information directly in the dashboard.
      </p>

      <h3>Right to Erasure (Art. 17)</h3>
      <p>
        You may request deletion of your personal data, subject to certain exceptions (e.g., where
        we must retain data for legal obligations).
      </p>

      <h3>Right to Restriction of Processing (Art. 18)</h3>
      <p>
        You may request that we restrict processing of your data in certain circumstances (e.g.,
        while we verify the accuracy of contested data).
      </p>

      <h3>Right to Data Portability (Art. 20)</h3>
      <p>
        You may receive your personal data in a structured, commonly used, machine-readable format
        and have the right to transmit it to another controller.
      </p>

      <h3>Right to Object (Art. 21)</h3>
      <p>
        You may object to processing based on legitimate interests. We will cease processing unless
        we demonstrate compelling legitimate grounds that override your interests.
      </p>

      <h3>Right to Withdraw Consent (Art. 7(3))</h3>
      <p>
        Where processing is based on consent, you may withdraw consent at any time. Withdrawal does
        not affect the lawfulness of processing before withdrawal.
      </p>

      <h3>Right to Lodge a Complaint (Art. 77)</h3>
      <p>
        You have the right to lodge a complaint with a supervisory authority in your country of
        residence or place of work if you believe our processing violates GDPR.
      </p>

      <h2>4. How to Exercise Your Rights</h2>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:privacy@agentmd.dev">privacy@agentmd.dev</a>. We will respond within 30 days.
        We may need to verify your identity before processing your request.
      </p>

      <h2>5. International Transfers</h2>
      <p>
        Your data may be transferred to and processed in countries outside the EU/EEA (e.g., the
        United States). We ensure appropriate safeguards are in place, including:
      </p>
      <ul>
        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        <li>Data processing agreements with subprocessors</li>
      </ul>

      <h2>6. Data Processing Agreements (Enterprise)</h2>
      <p>
        For Enterprise customers, we offer Data Processing Agreements (DPAs) that include Standard
        Contractual Clauses and meet GDPR requirements for processor obligations. Contact{" "}
        <a href="mailto:enterprise@agentmd.dev">enterprise@agentmd.dev</a> for details.
      </p>

      <h2>7. Data Protection Officer</h2>
      <p>
        For GDPR-related inquiries, you may contact our data protection contact at{" "}
        <a href="mailto:dpo@agentmd.dev">dpo@agentmd.dev</a>.
      </p>

      <p className="text-sm text-muted-foreground mt-12">
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
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
