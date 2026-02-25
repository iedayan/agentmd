"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/core/utils";

export function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className={cn(
        "group rounded-[var(--radius-md)] border border-border bg-card transition-colors",
        "open:border-primary/30 open:bg-primary/[0.02]"
      )}
      open={open}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden"
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </summary>
      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
