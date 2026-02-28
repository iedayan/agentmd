import { AuditLogView } from '@/components/enterprise/audit-log-view';

export default function AuditPage() {
  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
            Compliance & Trust
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">
            System Audit Trail
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
            Immutable, cryptographically signed logs of every agent action and administrative
            change. Masked for PII and SOC2 ready.
          </p>
        </div>
      </div>
      <AuditLogView />
    </div>
  );
}
