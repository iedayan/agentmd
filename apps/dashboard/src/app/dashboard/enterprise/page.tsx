import { EnterpriseOverview } from "@/components/dashboard/enterprise-overview";

export default function EnterprisePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Enterprise</h1>
        <p className="text-muted-foreground">
          Self-hosted, SSO, RBAC, audit logs, and governance
        </p>
      </div>
      <EnterpriseOverview />
    </div>
  );
}
