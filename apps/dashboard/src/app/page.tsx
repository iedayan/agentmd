import { Nav } from '@/components/landing/nav';
import { LandingDemo } from '@/components/landing/demo';
import { Hero } from '@/components/landing/hero';
import { CompatibilityStrip } from '@/components/landing/compatibility-strip';
import { SocialProof } from '@/components/landing/social-proof';
import { TrustBadges } from '@/components/landing/trust-badges';
import { WhyAgentMD } from '@/components/landing/why-agentmd';
import { TheProblem } from '@/components/landing/the-problem';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingFAQ } from '@/components/landing/landing-faq';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/ui/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <CompatibilityStrip />
        <SocialProof />
        <TrustBadges />
        <LandingDemo />
        <WhyAgentMD />
        <TheProblem />
        <Features />
        <HowItWorks />
        <LandingFAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
