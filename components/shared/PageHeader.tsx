import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderAction {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: PageHeaderAction;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
  children,
}: PageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <header
      className={cn(
        'mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>

      {(action || children) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
          {action && (
            <Button asChild>
              <Link href={action.href}>
                {ActionIcon && <ActionIcon className="size-4" />}
                {action.label}
              </Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
