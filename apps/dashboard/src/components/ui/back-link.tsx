"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/core/utils";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Uses router.back() when the user came from another page on this site.
 * Falls back to navigating to href when there's no in-app history.
 */
export function BackLink({ href, children, className }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerOrigin = new URL(document.referrer).origin;
        if (referrerOrigin === window.location.origin) {
          router.back();
          return;
        }
      } catch {
        /* invalid referrer */
      }
    }
    router.push(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
