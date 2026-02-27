"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/core/utils";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

/** Scrolls to #try-it on homepage, or navigates to /#try-it */
function scrollToTryIt() {
  if (typeof window === "undefined") return;
  const el = document.getElementById("try-it");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md transition-all duration-base",
        scrolled
          ? "border-border/60 shadow-sm shadow-black/5"
          : "border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="sm" />
            <span className="text-base font-bold tracking-tight">AgentMD</span>
          </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-[var(--radius-sm)] transition-colors duration-base",
                  isActive
                    ? "text-primary bg-[hsl(var(--primary-dim))]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="w-px h-4 bg-border/60 mx-2" aria-hidden />
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="font-medium text-sm rounded-[var(--radius-sm)]">
              Dashboard
            </Button>
          </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold text-sm rounded-[var(--radius-sm)] shadow-sm shadow-primary/20 ml-1">
                Get Started
              </Button>
            </Link>
        </nav>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 -m-1 rounded-[var(--radius-sm)] hover:bg-muted transition-colors duration-base"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-y-auto transition-[max-height] duration-300 ease-out border-t border-border/50",
          open ? "max-h-[85vh]" : "max-h-0 overflow-hidden border-transparent"
        )}
      >
        <div className="bg-background px-4 py-4">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                className="block w-full text-left py-2.5 px-3 text-sm font-medium rounded-[var(--radius-sm)] text-primary bg-[hsl(var(--primary-dim))]"
                onClick={() => {
                  setOpen(false);
                  if (pathname === "/") scrollToTryIt();
                  else window.location.href = "/#try-it";
                }}
              >
                Get your score
              </button>
            </li>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block py-2.5 px-3 text-sm font-medium rounded-[var(--radius-sm)] transition-colors duration-base",
                      isActive
                        ? "text-primary bg-[hsl(var(--primary-dim))]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-3 mt-3 border-t border-border/50 flex gap-2">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex-1">
                <Button variant="outline" className="w-full text-sm rounded-[var(--radius-sm)]">Dashboard</Button>
              </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1">
                  <Button className="w-full text-sm rounded-[var(--radius-sm)]">Get Started</Button>
                </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
