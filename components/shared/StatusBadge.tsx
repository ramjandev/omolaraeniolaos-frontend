import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EventStatus, RSVPStatus } from '@/types/events';

interface StatusBadgeProps {
  status: EventStatus | RSVPStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dotColor?: string }
> = {
  live: {
    label: 'Live Now',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500 animate-pulse',
  },
  published: {
    label: 'Published',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
    dotColor: 'bg-blue-500',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    dotColor: 'bg-zinc-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
  },
  checked_in: {
    label: 'Checked In',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
  },
  attending: {
    label: 'Confirmed RSVP',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
    dotColor: 'bg-blue-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full border shadow-2xs',
        config.className,
        className
      )}
    >
      {config.dotColor && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}
