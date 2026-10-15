import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export function StatsMetricCard({
  title,
  value,
  change,
  isPositive = true,
  description,
  icon: Icon,
  badge,
  className,
}: StatsMetricCardProps) {
  return (
    <Card className={cn('overflow-hidden border-border bg-card shadow-none transition-colors hover:border-primary/25', className)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="metric-value">{value}</span>
            {badge && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          {Icon && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{title}</p>

        {(change || description) && (
          <div className="mt-0.5 flex items-center gap-1.5 text-xs">
            {change && (
              <span
                className={cn(
                  'font-medium',
                isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {change}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
