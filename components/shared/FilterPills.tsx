'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

const TONES = {
  dark: {
    active: 'border-[#2B1D14] bg-[#2B1D14] text-white shadow-sm',
    idle: 'border-[#E8E3DD] bg-[#F3F0EC] text-[#736B66] hover:text-[#261710]',
  },
  brown: {
    active: 'border-[#6B3416] bg-[#6B3416] text-white shadow-sm',
    idle: 'border-transparent bg-transparent text-[#3F342D] hover:bg-[#F3F0EC]',
  },
  underline: {
    active: 'border-[#261710] text-[#261710]',
    idle: 'border-transparent text-[#736B66] hover:text-[#261710]',
  },
} as const;

interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: keyof typeof TONES;
  ariaLabel: string;
  className?: string;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  tone = 'dark',
  ariaLabel,
  className,
}: FilterPillsProps<T>) {
  const styles = TONES[tone];
  const underline = tone === 'underline';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap items-center', underline ? 'gap-4' : 'gap-2', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        const label =
          option.count === undefined
            ? option.label
            : `${option.label}${tone === 'dark' ? '' : ' '}(${option.count})`;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'text-xs transition-colors',
              underline
                ? 'border-b-2 pb-1.5'
                : 'rounded-lg border px-2.5 py-1.5',
              active ? styles.active : styles.idle,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
