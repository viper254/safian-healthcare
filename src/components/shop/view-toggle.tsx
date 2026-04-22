"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Product view"
      className="inline-flex rounded-full border bg-background p-1 shadow-sm"
    >
      {(["grid", "list"] as const).map((m) => {
        const Icon = m === "grid" ? LayoutGrid : List;
        const active = value === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${m} view`}
            onClick={() => onChange(m)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition-all text-sm",
              active
                ? "bg-brand-gradient text-white shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
