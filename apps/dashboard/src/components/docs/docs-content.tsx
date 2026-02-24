"use client";

import { DocsBreadcrumbs } from "./docs-breadcrumbs";

export function DocsContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-0">
      <DocsBreadcrumbs />
      <div className="docs-prose">{children}</div>
    </div>
  );
}
