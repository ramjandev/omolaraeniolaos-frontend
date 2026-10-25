'use client';

import * as React from 'react';
import Link from 'next/link';
import { Armchair, ArrowRight, LayoutGrid, MessageCircle, Phone } from 'lucide-react';
import { eventsPath, type OrganizerKind } from '@/lib/organizer';
import { useGetEventByIdQuery, useGetEventGuestsQuery, usePublishEventMutation } from '@/store/Event/eventAPI';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard, StatCardGrid } from '@/components/shared/StatCard';
import { EventBanner } from './shared/EventBanner';
import { countdownTo, formatEventDate, formatEventTime, toUiStatus } from './shared/event-format';
import { EventGuestsTable } from './EventGuestsTable';

const pad = (value: number) => String(value).padStart(2, '0');

interface OrganizerEventOverviewProps {
  organizer: OrganizerKind;
  eventId: string;
}

export function OrganizerEventOverview({ organizer, eventId }: OrganizerEventOverviewProps) {
  const { data, isLoading, isError, refetch } = useGetEventByIdQuery(eventId);
  const { data: guestsData } = useGetEventGuestsQuery({ id: eventId });
  const [publishEvent, { isLoading: publishing }] = usePublishEventMutation();

  const stats = React.useMemo(() => {
    const guests = guestsData?.data?.guests ?? [];
    const confirmed = guests.filter((g) => g.rsvpStatus === 'Confirmed');
    const expected = confirmed.reduce((sum, g) => sum + Math.max(1, g.partySize), 0);
    const checkedIn = guests.filter((g) => g.checkInStatus === 'Checked-In').length;
    return {
      invited: guests.length,
      expected,
      confirmed: confirmed.length,
      companions: expected - confirmed.length,
      checkedIn,
      pending: guests.filter((g) => g.rsvpStatus === 'Confirmed' && g.checkInStatus !== 'Checked-In').length,
      flagged: guests.filter((g) => g.isFlagged).length,
    };
  }, [guestsData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[145px] w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-2xl" />
      </div>
    );
  }

  const event = data?.data?.event;
  if (isError || !event) {
    return (
      <div className="rounded-2xl border border-[#E8E3DD] bg-white p-10 text-center dark:border-border dark:bg-card">
        <p className="font-serif text-2xl text-[#261710] dark:text-foreground">Event not found</p>
        <p className="mt-1 text-sm text-[#736B66]">It may have been deleted, or you don&apos;t have access to it.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-[#E3DED8] px-4 py-2 text-xs font-medium text-[#261710] hover:bg-[#F7F4F0]"
          >
            Try again
          </button>
          <Link
            href={eventsPath(organizer)}
            className="rounded-lg bg-[#2B1D14] px-4 py-2 text-xs font-medium text-white hover:bg-[#3D2A1E]"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const status = toUiStatus(event.status, event.rawStatus);
  const isLive = status === 'live' || status === 'completed';
  const showLiveCards = status !== 'draft';

  const publish = async () => {
    try {
      await publishEvent(event.id).unwrap();
      toast.success(`${event.title} is live. The three event cards are now on this page.`);
    } catch {
      // The API layer already shows the error.
    }
  };

  return (
    <div className="w-full space-y-4">
      <EventBanner
        title={event.title}
        category={event.category}
        status={status}
        countdown={countdownTo(event.startDate)}
        meta={{
          date: formatEventDate(event.startDate),
          time: formatEventTime(event.startDate),
          guests: event.capacity || undefined,
        }}
      />

      {status === 'draft' && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#E8E3DD] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:bg-card">
          <p className="text-sm text-[#3F342D] dark:text-foreground">
            This event is still a draft. Publish it to show the urgent update, seating, and check-in cards.
          </p>
          <button
            type="button"
            disabled={publishing}
            onClick={() => void publish()}
            className="h-9 shrink-0 rounded-lg bg-[#241710] px-4 text-xs font-medium text-white hover:bg-[#3D2518] disabled:opacity-60"
          >
            {publishing ? 'Publishing…' : 'Publish event'}
          </button>
        </div>
      )}

      <StatCardGrid>
        <StatCard value={pad(stats.invited)} label="Total Invitees" hint="People invited" />
        {isLive ? (
          <>
            <StatCard value={pad(stats.checkedIn)} label="Checked In" hint="Guests physically arrived" />
            <StatCard value={pad(stats.pending)} label="Not Yet Arrived" hint="Confirmed guests pending" />
            <StatCard value={pad(stats.flagged)} label="Flagged" hint="Exceptions requiring attention" />
          </>
        ) : (
          <>
            <StatCard value={pad(stats.expected)} label="Expected Attendance" hint="Confirmed people, incl. companions" />
            <StatCard value={pad(stats.confirmed)} label="Confirmed Invitees" hint="Primary guests attending" />
            <StatCard value={pad(stats.companions)} label="Additional Guests" hint="Confirmed companions" />
          </>
        )}
      </StatCardGrid>

      {showLiveCards ? (
      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href={eventsPath(organizer, event.id, 'communications')}
          className="group flex flex-col rounded-xl border border-[#D5E6D8] bg-[#E7F3EA] p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#3F342D]">
              <MessageCircle className="size-4" />
            </span>
            <p className="text-[15px] font-medium text-[#261710]">Send An Urgent Update</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#5E554F]">
            Broadcast delays, venue changes, or emergency updates to guests
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#3F342D]">
            Send Broadcast
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href={eventsPath(organizer, event.id, 'seating')}
          className="group flex flex-col rounded-xl border border-[#E8E3DD] bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#F1DFCB] bg-[#FFF5EA] text-[#7A3B18]">
              <Armchair className="size-4" />
            </span>
            <p className="text-[15px] font-medium text-[#261710] dark:text-foreground">View Seating Plan</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#736B66]">
            Review guest seating assignments and protocol at any time
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#7A3B18]">
            View Seating
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href={eventsPath(organizer, event.id, 'check-in')}
          className="group flex flex-col rounded-xl border border-[#6B3E28] bg-[#7A4A32] p-4 text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
              <LayoutGrid className="size-4" />
            </span>
            <p className="text-[15px] font-medium">Open Check-In Monitor</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/85">
            Track live check-ins, monitor guest arrival, and respond to exceptions in real-time
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white">
            Open Monitor
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
      ) : (
      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href={eventsPath(organizer, event.id, 'communications')}
          className="group relative overflow-hidden rounded-xl border border-[#1C5A45] bg-[#1F6650] p-3 text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '14px 14px',
            }}
          />
          <p className="relative max-w-[90%] font-serif text-[17px] leading-snug">
            Stay Connected With Your Guests And Follow Up On Pending RSVPs Via WhatsApp.
          </p>
          <span className="relative mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#E8BE86] underline underline-offset-2">
            Guest Communications Workspace
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="absolute bottom-2 right-3 flex size-7 items-center justify-center rounded-full bg-[#2DB55D] shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
            <Phone className="size-3.5 fill-white text-white" />
          </span>
        </Link>

        <Link
          href={eventsPath(organizer, event.id, 'seating')}
          className="group rounded-xl border border-[#E8E3DD] bg-gradient-to-b from-white to-[#F5F3F0] p-3 shadow-[0_4px_12px_rgba(60,40,20,0.08)] transition-shadow hover:shadow-md dark:border-border dark:from-card dark:to-card"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#F1DFCB] bg-[#FFF5EA] text-[#7A3B18]">
              <Armchair className="size-4" />
            </span>
            <div>
              <p className="text-[15px] font-medium text-[#261710] dark:text-foreground">Seating &amp; Protocol</p>
              <p className="text-xs text-[#736B66]">Create and manage guest seating protocol</p>
            </div>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#7A3B18] underline underline-offset-2">
            Open Seating Workspace
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
      )}

      <EventGuestsTable eventId={event.id} mode={isLive ? 'checkin' : status === 'draft' ? 'invite' : 'rsvp'} />
    </div>
  );
}
