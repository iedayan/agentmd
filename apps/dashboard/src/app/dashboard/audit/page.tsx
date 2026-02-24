import { AuditLogView } from "@/components/dashboard/audit-log-view";

export default function AuditPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Who ran what when — SOC2, HIPAA ready. PII masked in outputs.
        </p>
      </div>
      <AuditLogView />
    </div>
  );
}
