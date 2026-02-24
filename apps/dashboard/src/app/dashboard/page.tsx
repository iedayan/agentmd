import { RepositoryDashboard } from "@/components/dashboard/repository-dashboard";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10">
      <OnboardingWizard />
      <div className="mb-8 rounded-xl border border-border/50 glass-card p-6 bg-gradient-to-r from-background/80 via-background/60 to-primary/5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Control Center</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Repository Operations</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Connect repositories, monitor AGENTS.md health, and trigger executions from a single workflow.
        </p>
      </div>
      <RepositoryDashboard />
    </div>
  );
}
