import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedTabOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-[#EBE3D9] bg-white p-1 shadow-[0_4px_12px_rgba(60,40,20,0.08)] dark:border-border dark:bg-card",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm transition-colors cursor-pointer",
              selected
                ? "bg-[#DDB892] font-medium text-[#2A1A14] shadow-xs"
                : "text-[#6F6761] hover:text-[#1F140E] dark:text-muted-foreground dark:hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
