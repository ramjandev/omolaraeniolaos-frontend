import * as React from 'react';
import { cn } from '@/lib/utils';

const VALUE_TONES = {
  brown: 'text-[#7A3B18] dark:text-[#D4A373]',
  green: 'text-[#2F5D3E] dark:text-emerald-400',
  red: 'text-[#B33927]',
  amber: 'text-[#D9A877]',
} as const;

export interface StatCardProps {
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: keyof typeof VALUE_TONES;
  className?: string;
}

export function StatCard({ value, label, hint, tone = 'brown', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E8E3DD] bg-white px-3 py-3.5 shadow-xs dark:border-border dark:bg-card',
        className,
      )}
    >
      <p className={cn('font-serif text-[28px] leading-none', VALUE_TONES[tone])}>{value}</p>
      <p className="mt-3 text-[13px] text-[#261710] dark:text-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[#8C7D73] dark:text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>{children}</div>;
}
