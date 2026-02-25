import { LegalLayout } from "@/components/legal/legal-layout";

export default function GDPRPage() {
  return (
    <LegalLayout title="GDPR Statement">
      <p>Last updated: February 24, 2026</p>

      <h2>1. Our Commitment</h2>
      <p>
        AgentMD is committed to ensuring the security and protection of the personal information that we process, and to provide a compliant and consistent approach to data protection.
      </p>

      <h2>2. Data Subject Rights</h2>
      <p>
        Under the GDPR, you have the following rights:
      </p>
      <ul>
        <li>The right to be informed</li>
        <li>The right of access</li>
        <li>The right to rectification</li>
        <li>The right to erasure</li>
        <li>The right to restrict processing</li>
        <li>The right to data portability</li>
        <li>The right to object</li>
      </ul>

      <h2>3. Data Processing</h2>
      <p>
        We only process personal data when we have a legal basis to do so. This includes processing data for the performance of a contract, with your consent, or for our legitimate interests.
      </p>

      <h2>4. Data Breaches</h2>
      <p>
        We have established procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
      </p>
    </LegalLayout>
  );
}
