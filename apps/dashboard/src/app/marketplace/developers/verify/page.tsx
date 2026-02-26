import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Certified AGENTS.md Compatible
        </h1>
        <p className="text-muted-foreground mt-2">
          Security review, performance benchmarking, trust score
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Verification Process</CardTitle>
            <CardDescription>
              Regular re-verification to maintain badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Security Review</p>
                <p className="text-sm text-muted-foreground">
                  No dangerous commands, permissions declared, no hardcoded secrets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Performance Benchmarking</p>
                <p className="text-sm text-muted-foreground">
                  Execution time thresholds for key commands
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Trust Score</p>
                <p className="text-sm text-muted-foreground">
                  Test coverage, user reviews, security compliance, update frequency
                </p>
              </div>
            </div>
            <Button className="w-full mt-4" asChild>
              <a href="mailto:enterprise@agentmd.dev?subject=AGENTS.md%20Certification%20Application">
                Apply for Certification
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
