'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchField({ value, onChange, placeholder = 'Search', className }: SearchFieldProps) {
  return (
    <div className={cn('relative w-full sm:w-48', className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded-lg border border-[#E8E3DD] bg-white pl-2.5 pr-11 text-xs text-[#261710] placeholder:text-[#A39A92] focus:border-[#6B3416]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3416]/10 dark:border-border dark:bg-card dark:text-foreground"
      />
      <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 rounded border border-[#E8E3DD] bg-[#F7F4F0] px-1 font-sans text-[10px] text-[#736B66] dark:border-border dark:bg-muted">
        ⌘k
      </kbd>
    </div>
  );
}
