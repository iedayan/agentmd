import { EnterpriseOverview } from "@/components/dashboard/enterprise-overview";

export default function EnterprisePage() {
  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Security & Compliance</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">Enterprise Governance</h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
            Manage self-hosted deployments, SSO configuration, and advanced policy guardrails for your agentic fleet.
          </p>
        </div>
      </div>
      <EnterpriseOverview />
    </div>
  );
}
