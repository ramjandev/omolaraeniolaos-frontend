'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getAgencyClient,
  type AgencyClientDetail,
  type AgencyClientEvent,
} from '@/lib/api/agency-dashboard';

type Tab = 'overview' | 'events' | 'activity';

export function ClientDetailsView({ clientId }: { clientId: string }) {
  const [tab, setTab] = React.useState<Tab>('overview');
  const [client, setClient] = React.useState<AgencyClientDetail | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setClient(null);
    setError('');
    getAgencyClient(clientId)
      .then((row) => {
        if (active) setClient(row);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Client could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  if (error) return <p className="text-sm text-[#B33927]">{error}</p>;
  if (!client) return <p className="text-sm text-[#736B66]">Loading client…</p>;

  const archived = client.status === 'archived';
  const person = client.contactPerson || client.name;
  const since = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#8C7D73]">
          <Link href="/organizer/agency/clients" className="hover:underline">
            Clients
          </Link>
          <span className="mx-1.5 text-[#C4A574]">/</span>
          <span className="text-[#C4A574]">Client Details</span>
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium text-[#1F140E]">Client Details</h1>
        <p className="mt-1 text-sm text-[#736B66]">
          A complete view of the relationship and event history.
        </p>
      </div>

      <div className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-[#F3E6D8] text-lg font-semibold text-[#6E3B1C]">
              {person.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-[#1F140E]">{client.name}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    archived ? 'bg-[#F4F1EC] text-[#6F6258]' : 'bg-[#E7F6EC] text-[#2F6B4F]'
                  }`}
                >
                  {archived ? 'Archive' : 'Active'}
                </span>
              </div>
              <p className="text-sm text-[#736B66]">
                Individual client{client.industry ? ` · ${client.industry}` : ''}
              </p>
              <p className="text-sm text-[#3F342C]">
                {client.contactEmail}
                {client.contactPhone ? ` · ${client.contactPhone}` : ''}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="h-10 rounded-xl bg-[#6E3B1C] px-4 text-xs font-semibold text-white hover:bg-[#5C3117]"
          >
            <Link href={`/organizer/agency/events/create?clientId=${client.id}`}>
              <Plus className="mr-1.5 size-4" />
              Create Event
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex gap-6 border-t border-[#F4EFEA] pt-3 text-sm">
          {(['overview', 'events', 'activity'] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`border-b-2 pb-2 capitalize ${
                tab === item
                  ? 'border-[#6E3B1C] font-medium text-[#6E3B1C]'
                  : 'border-transparent text-[#736B66]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#1F140E]">Client summary</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Summary value={client.summary.totalEvents} label="Total events" />
              <Summary value={client.summary.upcoming} label="Upcoming" />
              <Summary value={client.summary.completed} label="Completed" />
            </div>
            <h3 className="mt-6 text-sm font-semibold text-[#1F140E]">Contact information</h3>
            <dl className="mt-3 space-y-1.5 text-sm text-[#3F342C]">
              <div>Email · {client.contactEmail}</div>
              <div>Phone · {client.contactPhone || '—'}</div>
              <div>Organization · {client.industry || '—'}</div>
              <div>Client since · {since}</div>
              {client.notes ? <div>Notes · {client.notes}</div> : null}
            </dl>
          </section>
          <section className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#1F140E]">Recent activity</h3>
            {client.activity.length === 0 ? (
              <p className="mt-4 text-sm text-[#736B66]">No event activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {client.activity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#6F6258]" />
                    <span>
                      <span className="block text-sm font-medium text-[#1F140E]">{item.title}</span>
                      <span className="block text-xs text-[#736B66]">
                        {item.detail} ·{' '}
                        {new Date(item.occurredAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === 'events' && (
        <div>
          <p className="mb-3 text-right text-xs text-[#8C7D73]">{client.events.length} events</p>
          {client.events.length === 0 ? (
            <p className="rounded-2xl border border-[#EBE3D9] bg-white p-6 text-sm text-[#736B66]">
              This client has no events yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {client.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <section className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
          {client.activity.length === 0 ? (
            <p className="text-sm text-[#736B66]">No event activity yet.</p>
          ) : (
            <ul className="space-y-4">
              {client.activity.map((item) => (
                <li key={item.id} className="text-sm text-[#3F342C]">
                  <span className="font-medium text-[#1F140E]">{item.title}</span> · {item.detail} ·{' '}
                  {new Date(item.occurredAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-[#FBF8F4] px-3 py-3">
      <p className="font-serif text-2xl text-[#1F140E]">{value}</p>
      <p className="text-xs text-[#736B66]">{label}</p>
    </div>
  );
}

function EventCard({ event }: { event: AgencyClientEvent }) {
  const venue = [event.venueName, event.city].filter(Boolean).join(', ') || 'Venue to be confirmed';
  const date = new Date(event.startDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const tone =
    event.uiStatus === 'Confirmed'
      ? 'bg-[#E7F6EC] text-[#2F6B4F]'
      : event.uiStatus === 'Completed'
        ? 'bg-[#F4F1EC] text-[#6F6258]'
        : event.uiStatus === 'Archive'
          ? 'bg-[#F4F1EC] text-[#6F6258]'
          : 'bg-[#F8E8D8] text-[#A15C2A]';

  return (
    <Link
      href={`/organizer/agency/events/${event.id}`}
      className="overflow-hidden rounded-2xl border border-[#EBE3D9] bg-white"
    >
      <img
        src={event.coverImageUrl || '/images/banner.png'}
        alt=""
        className="h-36 w-full object-cover"
      />
      <div className="space-y-1 p-4">
        <p className="flex items-center gap-1.5 text-xs text-[#736B66]">
          <Calendar className="size-3.5" />
          {date}
        </p>
        <p className="font-medium text-[#1F140E]">{event.title}</p>
        <p className="text-sm text-[#736B66]">{venue}</p>
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
          {event.uiStatus}
        </span>
      </div>
    </Link>
  );
}
