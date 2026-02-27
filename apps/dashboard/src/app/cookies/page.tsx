import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata = {
  title: "Cookie Policy — AgentMD",
  description: "Cookie Policy for AgentMD. How we use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy">
      <p className="lead text-muted-foreground">
        Last updated: February 2025
      </p>

      <p>
        This Cookie Policy explains how AgentMD (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies
        and similar technologies when you use our website and Service.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help
        websites remember your preferences, keep you signed in, and understand how you use the
        site. We also use similar technologies such as local storage and session storage.
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Strictly Necessary</h3>
      <p>
        These cookies are essential for the Service to function. They enable core features such as
        authentication, security, and load balancing. You cannot opt out of these.
      </p>
      <ul>
        <li>
          <strong>Session / auth cookies:</strong> Keep you logged in and secure your session
        </li>
        <li>
          <strong>Security cookies:</strong> Help prevent cross-site request forgery (CSRF) and
          similar attacks
        </li>
      </ul>

      <h3>2.2 Functional</h3>
      <p>
        These cookies remember your preferences and improve your experience.
      </p>
      <ul>
        <li>
          <strong>Theme preference:</strong> Remembers your light/dark mode choice
        </li>
        <li>
          <strong>Onboarding state:</strong> Tracks whether you have completed setup steps (stored
          in local storage)
        </li>
      </ul>

      <h3>2.3 Analytics</h3>
      <p>
        We may use analytics cookies to understand how visitors use our site (e.g., pages visited,
        features used). This helps us improve the product. Analytics may be first-party or provided
        by trusted third parties.
      </p>

      <h2>3. Local Storage and Session Storage</h2>
      <p>
        In addition to cookies, we use browser storage (localStorage and sessionStorage) for:
      </p>
      <ul>
        <li>Storing theme and UI preferences</li>
        <li>Onboarding wizard state (e.g., whether you have completed setup)</li>
        <li>Chunk reload recovery flags to improve reliability</li>
      </ul>
      <p>
        This data stays on your device and is not sent to our servers except as part of normal
        requests (e.g., API calls that include session tokens).
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        Some third-party services we use (e.g., analytics, payment processors) may set their own
        cookies. Their use is governed by their respective privacy policies. We encourage you to
        review those policies.
      </p>

      <h2>5. Your Choices</h2>
      <p>
        You can control cookies through your browser settings. Most browsers allow you to block or
        delete cookies. Note that blocking strictly necessary cookies may prevent the Service from
        functioning correctly. For analytics and optional cookies, we will honor your preferences
        when you use our cookie consent mechanism (where provided).
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy from time to time. We will post the updated policy and
        update the &quot;Last updated&quot; date. Continued use constitutes acceptance.
      </p>

      <h2>7. Contact</h2>
      <p>
        For questions about our use of cookies, contact us at{" "}
        <a href="mailto:privacy@agentmd.online">privacy@agentmd.online</a>.
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
