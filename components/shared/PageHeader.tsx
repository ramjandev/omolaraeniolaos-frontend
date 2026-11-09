import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { CommonHeader } from '@/components/shared/CommonHeader';
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
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <CommonHeader
          variant="section"
          as="h1"
          title={title}
          subtitle={description}
        />
      </div>

      {action || children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
          {children}
          {action ? (
            <Button asChild>
              <Link href={action.href}>
                {ActionIcon ? <ActionIcon className="size-4" /> : null}
                {action.label}
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
