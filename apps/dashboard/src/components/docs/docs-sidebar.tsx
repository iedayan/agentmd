"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/core/utils";

const DOC_GROUPS = [
  {
    title: "Getting Started",
    links: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/beginner", label: "Beginner Path" },
      { href: "/docs/quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Core",
    links: [
      { href: "/docs/parse", label: "Parse &amp; Validate" },
      { href: "/docs/cli", label: "CLI Reference" },
      { href: "/docs/frontmatter", label: "YAML Frontmatter" },
      { href: "/docs/compose", label: "Composition" },
      { href: "/docs/execution", label: "Execution &amp; Safety" },
      { href: "/docs/best-practices", label: "Agentic AI Best Practices" },
      { href: "/docs/eu-ai-act", label: "EU AI Act Compliance" },
    ],
  },
  {
    title: "Reference",
    links: [
      { href: "/marketplace/developers/docs", label: "API Reference" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label="Open docs menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "w-64 shrink-0 sticky top-24 self-start",
          "hidden md:block"
        )}
      >
        <nav className="space-y-8">
          {DOC_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/docs" && pathname.startsWith(link.href));
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-4"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open && (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-background p-6 overflow-y-auto md:hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-sm text-muted-foreground">Documentation</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 -m-2 rounded-md hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-8">
            {DOC_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.links.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/docs" && pathname.startsWith(link.href));
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-4"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                          {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      )}
    </>
  );
}
