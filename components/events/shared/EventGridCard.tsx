import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { EventUiStatus } from './event-format';

const STATUS_CHIP: Record<EventUiStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-[#F0EDE9] text-[#3F342D]' },
  active: { label: 'Active', className: 'bg-[#E8F1EA] text-[#2F5D3E]' },
  live: { label: 'Live', className: 'bg-[#2F5D3E] text-white' },
  completed: { label: 'Completed', className: 'bg-[#ECEEF2] text-[#3F4654]' },
};

const BAR_TONE: Record<EventUiStatus, string> = {
  draft: 'bg-[#7A3B18]',
  active: 'bg-[#2F5D3E]',
  live: 'bg-[#2F5D3E]',
  completed: 'bg-[#B9B3AE]',
};

export interface EventGridCardProps {
  href: string;
  title: string;
  category?: string;
  date?: string;
  status: EventUiStatus;
  progressLabel: string;
  progress: number;
}

export function EventGridCard({
  href,
  title,
  category,
  date,
  status,
  progressLabel,
  progress,
}: EventGridCardProps) {
  const chip = STATUS_CHIP[status];
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-[#E8E3DD] bg-white shadow-xs transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3416]/40 dark:border-border dark:bg-card"
    >
      <div className="relative h-[94px] overflow-hidden">
        <Image
          src="/images/Promo_Card.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <h3 className="absolute inset-x-3 bottom-2.5 line-clamp-2 font-serif text-lg leading-tight text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          {category && <p className="text-[10px] text-[#736B66]">{category}</p>}
          {date && <p className="text-xs font-semibold text-[#261710] dark:text-foreground">{date}</p>}
        </div>
        <span className={cn('inline-block rounded-md px-2 py-0.5 text-[10px] font-medium', chip.className)}>
          {chip.label}
        </span>
        <div className="border-t border-[#EFEAE4] pt-2.5 dark:border-border">
          <p className="text-[11px] text-[#3F342D] dark:text-muted-foreground">{progressLabel}</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#E8E2D9]">
            <div className={cn('h-full rounded-full', BAR_TONE[status])} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
