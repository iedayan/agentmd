import { LegalLayout } from '@/components/legal/legal-layout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Last updated: February 24, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        AgentMD collects information to provide better services to our users. We collect information
        in the following ways:
      </p>
      <ul>
        <li>
          <strong>Information you give us:</strong> For example, when you sign in with GitHub, we
          receive your GitHub username, email address, and profile information.
        </li>
        <li>
          <strong>Information we get from your use of our services:</strong> We collect information
          about the services that you use and how you use them, like when you run an execution or
          view a dashboard.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>
        We use the information we collect from all of our services to provide, maintain, protect and
        improve them, to develop new ones, and to protect AgentMD and our users.
      </p>

      <h2>3. Data Security</h2>
      <p>
        We work hard to protect AgentMD and our users from unauthorized access to or unauthorized
        alteration, disclosure or destruction of information we hold.
      </p>

      <h2>4. Changes</h2>
      <p>
        Our Privacy Policy may change from time to time. We will post any privacy policy changes on
        this page.
      </p>
    </LegalLayout>
  );
}
