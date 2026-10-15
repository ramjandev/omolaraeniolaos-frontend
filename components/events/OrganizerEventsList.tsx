'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarPlus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { eventsPath, ORGANIZERS, type OrganizerKind } from '@/lib/organizer';
import { useGetEventsQuery } from '@/store/Event/eventAPI';
import type { EventItem } from '@/store/Event/types/eventTypes';
import { FilterPills } from '@/components/shared/FilterPills';
import { SearchField } from '@/components/shared/SearchField';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EventBanner,
  EventBannerNotice,
  EventBannerProgress,
} from './shared/EventBanner';
import { EventGridCard } from './shared/EventGridCard';
import {
  countdownTo,
  formatEventDate,
  formatEventTime,
  percent,
  toUiStatus,
  type EventUiStatus,
} from './shared/event-format';

type StatusFilter = 'all' | 'active' | 'draft' | 'completed';

function matchesFilter(status: EventUiStatus, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'active' || status === 'live';
  return status === filter;
}

function eventTarget(event: EventItem) {
  return event.totalTarget ?? event.capacity ?? 0;
}

export function OrganizerEventsList({ organizer }: { organizer: OrganizerKind }) {
  const layout = ORGANIZERS[organizer].eventsLayout;
  const [filter, setFilter] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const { data, isLoading, isError, refetch } = useGetEventsQuery();

  const events = React.useMemo(() => data?.data?.events ?? [], [data]);
  const counts = data?.data?.counts ?? { all: 0, active: 0, draft: 0, completed: 0 };

  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const status = toUiStatus(event.status, event.rawStatus);
      if (!matchesFilter(status, filter)) return false;
      if (!query) return true;
      return (
        event.title.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.venueName?.toLowerCase().includes(query)
      );
    });
  }, [events, filter, search]);

  const createHref = eventsPath(organizer, 'create');

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-[#1F140E] dark:text-[#FBF8F5]">
            Events
          </h1>
          <p className="text-sm text-[#736B66] dark:text-muted-foreground">
            View and organize your event list and draft templates
          </p>
        </div>
        <Link
          href={createHref}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl px-5 text-sm font-medium text-white shadow-sm transition-colors sm:self-auto',
            layout === 'banner'
              ? 'bg-[#2B1D14] hover:bg-[#3D2A1E]'
              : 'bg-[#6B3416] hover:bg-[#5A2B12]',
          )}
        >
          <Plus className="size-4" />
          Create Event
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          ariaLabel="Filter events by status"
          tone={layout === 'banner' ? 'dark' : 'brown'}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'draft', label: 'Draft', count: counts.draft },
            { value: 'completed', label: 'Completed', count: counts.completed },
          ]}
        />
        <SearchField value={search} onChange={setSearch} />
      </div>

      {isLoading ? (
        <EventsSkeleton layout={layout} />
      ) : isError ? (
        <div className="rounded-2xl border border-[#F1D4CC] bg-[#FDF5F3] p-8 text-center">
          <p className="text-sm text-[#7A2E21]">We couldn&apos;t load your events.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-[#E8C4BA] bg-white px-4 py-1.5 text-xs font-medium text-[#7A2E21] hover:bg-[#FBEDE9]"
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#E8E3DD] bg-white px-6 py-14 text-center dark:border-border dark:bg-card">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#F7EFE6] text-[#7A3B18]">
            <CalendarPlus className="size-5" />
          </span>
          <p className="mt-4 font-serif text-xl text-[#261710] dark:text-foreground">
            {events.length === 0 ? 'No events yet' : 'No events match your filters'}
          </p>
          <p className="mt-1 max-w-sm text-xs text-[#736B66]">
            {events.length === 0
              ? 'Create your first event to start inviting guests and tracking RSVPs.'
              : 'Try a different status or search term.'}
          </p>
          {events.length === 0 && (
            <Link
              href={createHref}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B1D14] px-4 py-2 text-xs font-medium text-white hover:bg-[#3D2A1E]"
            >
              <Plus className="size-3.5" />
              Create Event
            </Link>
          )}
        </div>
      ) : layout === 'banner' ? (
        <div className="space-y-4">
          {visible.map((event) => (
            <EventListBanner key={event.id} event={event} href={eventsPath(organizer, event.id)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((event) => (
            <EventListCard key={event.id} event={event} href={eventsPath(organizer, event.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventListBanner({ event, href }: { event: EventItem; href: string }) {
  const status = toUiStatus(event.status, event.rawStatus);
  const countdown = countdownTo(event.startDate);
  const target = eventTarget(event);
  const confirmed = event.confirmedCount ?? 0;

  let bottomRight: React.ReactNode = null;
  if (status === 'draft') {
    bottomRight = <EventBannerNotice>Complete your event setup</EventBannerNotice>;
  } else if (status === 'completed') {
    bottomRight = (
      <EventBannerProgress
        label={`${event.checkedInCount ?? 0} attended · ${percent(confirmed, event.guestsCount ?? 0)}% RSVP rate`}
        value={percent(event.checkedInCount ?? 0, event.guestsCount ?? 0)}
      />
    );
  } else {
    bottomRight = (
      <EventBannerProgress
        label={`${confirmed}/${target} confirmed${countdown ? ` · ${countdown.days} days left` : ''}`}
        value={percent(confirmed, target)}
      />
    );
  }

  return (
    <EventBanner
      href={href}
      title={event.title}
      category={event.category}
      status={status}
      countdown={countdown}
      meta={{
        date: formatEventDate(event.startDate),
        time: formatEventTime(event.startDate),
        guests: target || undefined,
      }}
      bottomRight={bottomRight}
    />
  );
}

function EventListCard({ event, href }: { event: EventItem; href: string }) {
  const status = toUiStatus(event.status, event.rawStatus);
  const target = eventTarget(event);
  const guests = event.guestsCount ?? 0;
  const confirmed = event.confirmedCount ?? 0;
  const daysLeft = countdownTo(event.startDate)?.days;

  let progressLabel: string;
  let progress: number;
  if (status === 'draft') {
    progressLabel = `${guests}/${target} guests added`;
    progress = percent(guests, target);
  } else if (status === 'completed') {
    progressLabel = `${event.checkedInCount ?? 0} attended · ${percent(confirmed, guests)}% RSVP rate`;
    progress = percent(event.checkedInCount ?? 0, guests);
  } else {
    progressLabel = `${confirmed}/${target} confirmed${daysLeft !== undefined ? ` · ${daysLeft} days left` : ''}`;
    progress = percent(confirmed, target);
  }

  return (
    <EventGridCard
      href={href}
      title={event.title}
      category={event.category}
      date={formatEventDate(event.startDate)}
      status={status}
      progressLabel={progressLabel}
      progress={progress}
    />
  );
}

function EventsSkeleton({ layout }: { layout: 'banner' | 'grid' }) {
  if (layout === 'banner') {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-[145px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
