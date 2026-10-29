'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Plus, Users } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { getVenueSpace, type VenueSpaceDetail } from '@/lib/api/venue-spaces';

type DetailTab = 'Overview' | 'Spaces' | 'Bookings' | 'Availability';
const FALLBACK_IMAGE = '/images/banner.png';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export default function SingleVenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [venue, setVenue] = React.useState<VenueSpaceDetail | null>(null);
  const [error, setError] = React.useState('');
  const [tab, setTab] = React.useState<DetailTab>('Overview');
  const [month, setMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  React.useEffect(() => {
    let cancelled = false;
    getVenueSpace(id)
      .then((data) => {
        if (!cancelled) setVenue(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'This venue could not be loaded');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const bookings = venue?.bookings ?? [];
  const cells = React.useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const first = new Date(year, monthIndex, 1).getDay();
    const days = new Date(year, monthIndex + 1, 0).getDate();
    const previous = new Date(year, monthIndex, 0).getDate();
    const items: Array<{ day: number; inMonth: boolean; date: Date }> = [];
    for (let index = first - 1; index >= 0; index -= 1) {
      const day = previous - index;
      items.push({ day, inMonth: false, date: new Date(year, monthIndex - 1, day) });
    }
    for (let day = 1; day <= days; day += 1) items.push({ day, inMonth: true, date: new Date(year, monthIndex, day) });
    return items;
  }, [month]);

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        <p className="text-xs text-[#8C7A6B]">
          <Link href="/organizer/venue/spaces" className="hover:text-[#1F140E]">Venues & Spaces</Link>
          {venue ? ` / ${venue.name}` : ''}
        </p>
        {error && <p className="rounded-xl border border-[#F5D0A9] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">{error}</p>}
        {venue && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E]">{venue.name}</h1>
                <p className="text-xs sm:text-sm text-[#8C7A6B] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{venue.address || 'Address not set'}</span>
                </p>
              </div>
              <Link href="/organizer/venue/spaces" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" /> Add Venue
              </Link>
            </div>

            <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-[#EFECE6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={venue.imageUrl || FALLBACK_IMAGE} alt={venue.name} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#1F140E]/90 px-3 py-1 text-xs font-semibold text-white">{venue.status}</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1F140E]">{venue.type}</span>
                {venue.active && <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">Active</span>}
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F140E]/85 px-3.5 py-1.5 text-xs font-semibold text-white">
                  <Users className="h-3.5 w-3.5 text-[#D4A373]" /> {venue.capacity} capacity
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat value={venue.capacity} label="Total Capacity" hint="Maximum attendees" />
              <Stat value={venue.spacesCount} label="Spaces / Areas" hint="Sub-divided zones" />
              <Stat value={bookings.length} label="Upcoming Bookings" hint="Scheduled ahead" />
              <Stat value={`${venue.utilization}%`} label="Utilization" hint="This month" />
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#EFECE6] pb-1">
              {([
                ['Overview', 'Overview'],
                ['Spaces', `Spaces (${venue.areas.length || venue.spacesCount})`],
                ['Bookings', `Bookings (${bookings.length})`],
                ['Availability', 'Availability'],
              ] as Array<[DetailTab, string]>).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === key ? 'bg-[#1F140E] text-white' : 'text-[#71717A]'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'Overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Panel title="About this venue">
                    <p className="text-xs leading-relaxed text-[#71717A]">{venue.description || 'No description has been added yet.'}</p>
                  </Panel>
                  <Panel title="Amenities">
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.length === 0 && <p className="text-xs text-[#8C7A6B]">No amenities listed.</p>}
                      {venue.amenities.map((amenity) => (
                        <span key={amenity} className="rounded-xl border border-[#E8E4DD] bg-[#FAF8F5] px-3 py-1.5 text-xs">{amenity}</span>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Seating at a glance">
                    <div className="grid grid-cols-3 gap-3">
                      <SeatStat value={venue.seating.configured} label="Configured seats" />
                      <SeatStat value={venue.seating.available} label="Available seats" tone="green" />
                      <SeatStat value={venue.seating.reserved} label="Reserved seats" tone="amber" />
                    </div>
                  </Panel>
                </div>
                <div className="space-y-6">
                  <Calendar month={month} cells={cells} bookings={bookings} onPrev={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} onNext={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} />
                  <Panel title="Next bookings">
                    {bookings.length === 0 && <p className="text-xs text-[#8C7A6B]">No upcoming bookings.</p>}
                    <div className="divide-y divide-[#F4F1EB]">
                      {bookings.slice(0, 4).map((booking) => (
                        <div key={booking.id} className="py-3 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#1F140E]">{booking.event}</span>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{booking.status}</span>
                          </div>
                          <p className="text-[11px] text-[#8C7A6B]">{formatWhen(booking.startDate)}</p>
                          <p className="text-[11px] text-[#71717A]">{booking.organizer} · {booking.guests} guests</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            )}

            {tab === 'Spaces' && (
              <Panel title="Spaces / areas">
                {venue.areas.length === 0 && <p className="text-xs text-[#8C7A6B]">This hall is the only area. Add seating zones from the tables page.</p>}
                <div className="divide-y divide-[#F4F1EB]">
                  {venue.areas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-[#1F140E]">{area.name}</span>
                      <span className="text-[#8C7A6B]">{area.tables} tables · {area.seats} seats</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === 'Bookings' && (
              <Panel title="Bookings">
                {bookings.length === 0 && <p className="text-xs text-[#8C7A6B]">No bookings for this venue.</p>}
                <div className="divide-y divide-[#F4F1EB]">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div>
                        <p className="font-medium text-[#1F140E]">{booking.event}</p>
                        <p className="text-xs text-[#8C7A6B]">{formatWhen(booking.startDate)} · {booking.organizer}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#6E3B1C]">{booking.status} · {booking.guests} guests</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === 'Availability' && (
              <Calendar month={month} cells={cells} bookings={bookings} onPrev={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} onNext={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ value, label, hint }: { value: number | string; label: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#EFECE6] bg-white p-5">
      <span className="text-3xl font-bold text-[#1F140E]">{value}</span>
      <p className="mt-2 text-sm font-semibold text-[#1F140E]">{label}</p>
      <p className="text-xs text-[#8C7A6B]">{hint}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#EFECE6] bg-white p-6">
      <h3 className="text-base font-bold text-[#1F140E]">{title}</h3>
      {children}
    </div>
  );
}

function SeatStat({ value, label, tone }: { value: number; label: string; tone?: 'green' | 'amber' }) {
  const color = tone === 'green' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-[#1F140E]';
  return (
    <div className="rounded-xl border border-[#EFECE6] bg-[#FAF8F5] p-3.5 text-center">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <p className="mt-0.5 text-[11px] text-[#8C7A6B]">{label}</p>
    </div>
  );
}

function Calendar({
  month,
  cells,
  bookings,
  onPrev,
  onNext,
}: {
  month: Date;
  cells: Array<{ day: number; inMonth: boolean; date: Date }>;
  bookings: Array<{ startDate: string }>;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#EFECE6] bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1F140E]">Booking Calendar</h3>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button type="button" onClick={onPrev} aria-label="Previous month" className="rounded-md p-1 text-[#8C7A6B]"><ChevronLeft className="h-4 w-4" /></button>
          <span>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button type="button" onClick={onNext} aria-label="Next month" className="rounded-md p-1 text-[#8C7A6B]"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#8C7A6B]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((cell) => {
          const booked = cell.inMonth && bookings.some((booking) => sameDay(new Date(booking.startDate), cell.date));
          const today = cell.inMonth && sameDay(cell.date, new Date());
          return (
            <div key={cell.date.toISOString()} className={`rounded-lg py-1.5 ${today || booked ? 'bg-[#6E3B1C] font-bold text-white' : cell.inMonth ? 'text-[#1F140E]' : 'text-[#D4CFC7]'}`}>
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
