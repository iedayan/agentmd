import { Nav } from "@/components/landing/nav";
import { LandingDemo } from "@/components/landing/demo";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { TrustBadges } from "@/components/landing/trust-badges";
import { WhyAgentMD } from "@/components/landing/why-agentmd";
import { TheProblem } from "@/components/landing/the-problem";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/ui/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <TrustBadges />
        <LandingDemo />
        <WhyAgentMD />
        <TheProblem />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
