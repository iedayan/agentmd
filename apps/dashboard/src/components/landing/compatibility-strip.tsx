/**
 * "Works with" compatibility strip — clarifies where AgentMD fits (Playbooks-inspired).
 */
export function CompatibilityStrip() {
  const items = [
    'GitHub Actions',
    'Cursor',
    'Warp',
    'CLI',
    'Dashboard',
  ];

  return (
    <section className="border-b border-border bg-muted/20 py-6" aria-label="Works with">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Works with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-foreground/90">
          {items.map((label, i) => (
            <span key={label} className="inline-flex items-center gap-4">
              {i > 0 && <span className="text-muted-foreground/50" aria-hidden>·</span>}
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
