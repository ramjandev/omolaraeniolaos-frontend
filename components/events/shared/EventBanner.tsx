import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, Info, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Countdown, EventUiStatus } from './event-format';

const STATUS_STYLES: Record<EventUiStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'border-white/60 bg-[#E9E4DF]/90 text-[#2B1D14]',
  },
  active: {
    label: 'Active',
    className: 'border-[#F3D9BC] bg-[#DDA877] text-[#3B2414]',
  },
  live: {
    label: 'Live',
    className: 'border-[#7FB08E] bg-[#2F5D3E] text-white',
  },
  completed: {
    label: 'Completed',
    className: 'border-white/60 bg-[#D9D4CF]/90 text-[#3F342D]',
  },
};

export function EventStatusBadge({ status, className }: { status: EventUiStatus; className?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'rounded-md border px-2 py-1 font-sans text-[11px] font-semibold leading-none shadow-sm',
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

export interface EventMeta {
  date?: string;
  time?: string;
  guests?: number | string;
}

export function EventMetaPill({ date, time, guests }: EventMeta) {
  const items = [
    { icon: CalendarDays, label: date, iconClass: 'text-[#D9473A]' },
    { icon: Clock, label: time, iconClass: 'text-[#C23A7A]' },
    { icon: Users, label: guests === undefined ? undefined : String(guests), iconClass: 'text-[#7A5AA8]' },
  ].filter((item) => item.label);

  if (items.length === 0) return null;

  return (
    <div className="w-fit rounded-xl bg-white/30 p-1 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#2B1D14]">
        {items.map(({ icon: Icon, label, iconClass }) => (
          <span key={`${label}`} className="flex items-center gap-1.5">
            <Icon className={cn('size-3.5', iconClass)} />
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function EventCountdown({ countdown }: { countdown: Countdown }) {
  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hour' },
    { value: countdown.minutes, label: 'Min' },
  ];
  return (
    <div className="flex gap-1 rounded-xl border border-white/15 bg-[#2B211C]/85 p-1.5 shadow-[0_6px_16px_rgba(20,10,5,0.35)]">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex w-11 flex-col items-center rounded-lg border border-white/10 bg-[#3A2E28] py-1"
        >
          <span className="font-serif text-lg leading-tight text-white">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-white/60">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EventBannerProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="w-full min-w-[180px] rounded-lg border border-white/70 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
      <p className="text-[11px] text-[#3F342D]">{label}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#E8E2D9]">
        <div className="h-full rounded-full bg-[#2F5D3E]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function EventBannerNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-[#FFF5EA] px-2.5 py-2 text-[11px] text-[#3F342D] shadow-sm">
      <Info className="size-4 shrink-0 fill-[#D9A877] text-white" />
      {children}
    </div>
  );
}

export interface EventBannerProps {
  title: string;
  category?: string;
  status?: EventUiStatus;
  meta?: EventMeta;
  countdown?: Countdown | null;
  /** Rendered top-right instead of the countdown (e.g. a "View plans" call to action). */
  topRight?: React.ReactNode;
  /** Rendered bottom-right next to the date/time pill. */
  bottomRight?: React.ReactNode;
  href?: string;
  className?: string;
}

export function EventBanner({
  title,
  category,
  status,
  meta,
  countdown,
  topRight,
  bottomRight,
  href,
  className,
}: EventBannerProps) {
  const content = (
    <>
      <Image
        src="/images/banner.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 80vw, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/5" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-white md:text-[26px]">
              {title}
            </h2>
            {status && <EventStatusBadge status={status} />}
          </div>
          {category && <p className="mt-1 font-sans text-sm text-white/80">{category}</p>}
        </div>
        {topRight ?? (countdown ? <EventCountdown countdown={countdown} /> : null)}
      </div>

      <div className="relative z-10 mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {meta ? <EventMetaPill {...meta} /> : <span />}
        {bottomRight}
      </div>
    </>
  );

  const classes = cn(
    'relative flex min-h-[145px] flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-sm md:p-5',
    href && 'transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3416]/50',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
}
