import { AgentSetupWizard } from '@/components/dashboard/agent-setup-wizard';
import { BackLink } from '@/components/ui/back-link';

export default function AgentSetupPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <BackLink href="/dashboard">Back to Dashboard</BackLink>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Agent Onboarding</h1>
        <p className="mt-2 text-muted-foreground">
          Configure your repository with human-readable instructions and governed permissions.
        </p>
      </div>

      <AgentSetupWizard />
    </div>
  );
}
