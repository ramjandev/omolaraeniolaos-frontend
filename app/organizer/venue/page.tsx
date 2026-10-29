'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import {
  getVenueDashboard,
  type VenueBookingStatus,
  type VenueDashboard,
  type VenueDashboardBooking,
} from '@/lib/api/venue-dashboard';
import { useAppSelector } from '@/store/store';

type BookingFilter = 'All' | VenueBookingStatus;

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(fullName?: string | null) {
  return fullName?.trim().split(/\s+/)[0] || 'there';
}

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {positive ? '+ ' : ''}{value}%
    </span>
  );
}

function statusClass(status: VenueBookingStatus) {
  if (status === 'Confirmed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Tentative') return 'bg-amber-50 text-amber-700';
  if (status === 'Awaiting') return 'bg-blue-50 text-blue-700';
  return 'bg-zinc-100 text-zinc-600';
}

function statusDot(status: VenueBookingStatus) {
  if (status === 'Confirmed') return 'bg-emerald-500';
  if (status === 'Tentative') return 'bg-amber-500';
  if (status === 'Awaiting') return 'bg-blue-500';
  return 'bg-zinc-400';
}

export default function VenueDashboardPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [dashboard, setDashboard] = React.useState<VenueDashboard | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<BookingFilter>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  React.useEffect(() => {
    let cancelled = false;
    getVenueDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Venue dashboard could not be loaded');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bookings = dashboard?.bookings ?? [];
  const todayLabel = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const name = firstName(dashboard?.organizer.fullName || authUser?.fullName);
  const categories = React.useMemo(
    () => [...new Set(bookings.map((booking) => booking.category).filter(Boolean))],
    [bookings],
  );
  const counts = {
    All: bookings.length,
    Confirmed: bookings.filter((booking) => booking.status === 'Confirmed').length,
    Tentative: bookings.filter((booking) => booking.status === 'Tentative').length,
    Awaiting: bookings.filter((booking) => booking.status === 'Awaiting').length,
    Cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
  };
  const filteredBookings = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesTab = activeTab === 'All' || booking.status === activeTab;
      const matchesCategory = selectedCategory === 'All' || booking.category === selectedCategory;
      const matchesSearch = !query
        || booking.event.toLowerCase().includes(query)
        || booking.space.toLowerCase().includes(query)
        || booking.organizer.toLowerCase().includes(query);
      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [activeTab, bookings, searchQuery, selectedCategory]);

  const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarCells = React.useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells: Array<{ day: number; inMonth: boolean; date: Date }> = [];
    for (let index = first.getDay() - 1; index >= 0; index -= 1) {
      const day = prevDays - index;
      cells.push({ day, inMonth: false, date: new Date(year, month - 1, day) });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, inMonth: true, date: new Date(year, month, day) });
    }
    let next = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: next, inMonth: false, date: new Date(year, month + 1, next) });
      next += 1;
    }
    return cells;
  }, [visibleMonth]);
  const monthBookings = bookings.filter((booking) => {
    const start = new Date(booking.startDate);
    return booking.status !== 'Cancelled'
      && start.getFullYear() === visibleMonth.getFullYear()
      && start.getMonth() === visibleMonth.getMonth();
  });
  const months = dashboard?.performance.months ?? [];
  const maxMonth = Math.max(...months.map((month) => month.count), 1);
  const points = months.map((month, index) => ({
    x: months.length <= 1 ? 200 : (index / (months.length - 1)) * 360 + 20,
    y: 100 - (month.count / maxMonth) * 80,
    count: month.count,
    label: month.label,
  }));
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`
    : '';
  const topSpaces = [...(dashboard?.performance.utilization ?? [])]
    .sort((left, right) => right.percent - left.percent)
    .slice(0, 3);
  const metrics = dashboard?.metrics;

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              {greeting()}, {name}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              {loading
                ? 'Loading your venue…'
                : `${metrics?.totalSpaces ?? 0} venues · ${metrics?.upcoming ?? 0} upcoming bookings · ${metrics?.today ?? 0} ${metrics?.today === 1 ? 'event' : 'events'} today`}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-medium text-[#1F140E] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#6E3B1C]" />
              <span>{todayLabel}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-[#F5D0A9] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Venues" hint="Active spaces" value={metrics?.totalSpaces ?? 0} change={metrics?.spacesChange ?? null} />
          <MetricCard label="Upcoming Events" hint="Next 30 days" value={metrics?.upcoming ?? 0} change={metrics?.upcomingChange ?? null} />
          <MetricCard label="Today's Events" hint="Happening today" value={metrics?.today ?? 0} />
          <MetricCard label="Available Spaces" hint="Open right now" value={metrics?.available ?? 0} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/organizer/venue/spaces" icon={Plus} label="Add Venue / Space" />
          <QuickAction href="/organizer/venue/bookings" icon={Plus} label="Create Booking" />
          <QuickAction href="/organizer/venue/bookings" icon={CalendarDays} label="View Calendar" />
          <QuickAction href="/organizer/venue/availability" icon={SlidersHorizontal} label="Manage Availability" />
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#1F140E]">Upcoming Bookings</h2>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                Manage venue reservations and upcoming events
              </p>
            </div>
            <Link
              href="/organizer/venue/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14] transition-colors self-start md:self-auto"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-[#EFECE6] pb-3">
            {(['All', 'Confirmed', 'Tentative', 'Awaiting', 'Cancelled'] as BookingFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#1F140E] text-white shadow-2xs'
                    : 'text-[#71717A] hover:text-[#1F140E] hover:bg-[#FAF8F5]'
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] text-[#1F140E] placeholder:text-[#8C7A6B] transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white text-[#1F140E] focus:outline-none focus:ring-1 focus:ring-[#6E3B1C]"
            >
              <option value="All">Category: All</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFECE6] text-[#8C7A6B] font-medium">
                  <th className="py-3 px-3 font-medium">Event</th>
                  <th className="py-3 px-3 font-medium">Venue / Space</th>
                  <th className="py-3 px-3 font-medium">Date & Time</th>
                  <th className="py-3 px-3 font-medium">Organizer</th>
                  <th className="py-3 px-3 font-medium text-right">Guests</th>
                  <th className="py-3 px-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EB]">
                {!loading && filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8C7A6B]">
                      No bookings yet.
                    </td>
                  </tr>
                )}
                {filteredBookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F140E]">Venue Availability</h3>
                <p className="text-xs text-[#8C7A6B]">Current occupancy status & upcoming schedules</p>
              </div>
              <Link href="/organizer/venue/spaces" className="text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14]">
                Manage →
              </Link>
            </div>
            <div className="divide-y divide-[#F4F1EB] pt-1">
              {!loading && (dashboard?.spaces.length ?? 0) === 0 && (
                <p className="py-6 text-sm text-[#8C7A6B]">No spaces have been added yet.</p>
              )}
              {(dashboard?.spaces ?? []).map((space) => (
                <div key={space.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1F140E]">{space.name}</span>
                      <span className="text-[11px] text-[#8C7A6B]">· {space.capacity} cap.</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        space.status === 'Occupied'
                          ? 'bg-[#1F140E] text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {space.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
                    <span>
                      {space.nextBooking
                        ? `Next: ${formatDay(space.nextBooking.date)}, ${formatTime(space.nextBooking.time)}`
                        : 'No upcoming bookings'}
                    </span>
                    <span className="font-medium text-[#1F140E]">{space.utilization}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div className="h-full rounded-full bg-[#6E3B1C]" style={{ width: `${space.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F140E]">Booking Calendar</h3>
                <p className="text-xs text-[#8C7A6B]">Events slated across all spaces</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F140E]">
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                  aria-label="Previous Month"
                  onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>{monthLabel}</span>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                  aria-label="Next Month"
                  onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8C7A6B] mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarCells.map((cell) => {
                  const isToday = cell.inMonth && sameDay(cell.date, new Date());
                  const hasBooking = cell.inMonth && monthBookings.some((booking) => sameDay(new Date(booking.startDate), cell.date));
                  return (
                    <div
                      key={cell.date.toISOString()}
                      className={`relative py-2 flex flex-col items-center justify-center rounded-xl text-xs font-medium ${
                        isToday
                          ? 'bg-[#6E3B1C] text-white font-bold shadow-xs'
                          : cell.inMonth
                            ? 'text-[#1F140E]'
                            : 'text-[#D4CFC7]'
                      }`}
                    >
                      <span>{cell.day}</span>
                      {hasBooking && !isToday && (
                        <span className="w-1 h-1 rounded-full bg-[#6E3B1C] mt-0.5 absolute bottom-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFECE6] space-y-2">
              <p className="text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
                Scheduled in {visibleMonth.toLocaleDateString('en-US', { month: 'long' })}
              </p>
              {monthBookings.length === 0 && (
                <p className="text-xs text-[#8C7A6B]">No bookings this month.</p>
              )}
              <div className="space-y-1.5 text-xs">
                {monthBookings.slice(0, 4).map((booking, index) => (
                  <div key={booking.id} className="flex items-center gap-2 text-[#1F140E]">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${index % 2 === 0 ? 'bg-[#6E3B1C]' : 'bg-amber-600'}`} />
                    <span className="font-medium">{booking.event}</span>
                    <span className="text-[#8C7A6B] text-[11px]">({formatDay(booking.startDate)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1F140E]">Venue Performance</h3>
            <p className="text-xs text-[#8C7A6B]">Monthly booking trends & utilization breakdown</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F140E]">Bookings over time</span>
                {dashboard?.performance.growth != null && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    dashboard.performance.growth >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                  }`}
                  >
                    {dashboard.performance.growth >= 0 ? '+' : ''}{dashboard.performance.growth}% growth
                  </span>
                )}
              </div>
              <div className="h-44 w-full flex flex-col justify-end pt-4 pb-2">
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 400 120">
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#F4F1EB" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#F4F1EB" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#F4F1EB" />
                  {area && <path d={area} fill="#6E3B1C" fillOpacity="0.12" />}
                  {line && <path d={line} fill="none" stroke="#6E3B1C" strokeWidth="2.5" strokeLinecap="round" />}
                  {points.map((point) => (
                    <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke="#6E3B1C" strokeWidth="2.5" />
                  ))}
                </svg>
                <div className="flex justify-between text-[11px] font-medium text-[#8C7A6B] pt-2 border-t border-[#EFECE6]">
                  {months.map((month, index) => (
                    <span key={month.label} className={index === months.length - 1 ? 'font-semibold text-[#1F140E]' : undefined}>
                      {month.label} ({month.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F140E]">Venue utilization (%)</span>
                <span className="text-xs text-[#8C7A6B]">Average: {dashboard?.performance.averageUtilization ?? 0}%</span>
              </div>
              {(dashboard?.performance.utilization.length ?? 0) === 0 && (
                <p className="text-xs text-[#8C7A6B] pt-2">Utilization appears after spaces are added.</p>
              )}
              <div className="space-y-2.5 pt-1">
                {(dashboard?.performance.utilization ?? []).map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#1F140E] font-medium">{item.name}</span>
                      <span className="text-[#8C7A6B] font-semibold">{item.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                      <div className="h-full rounded-full bg-[#6E3B1C]" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {topSpaces.length > 0 && (
            <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                Most booked spaces:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {topSpaces.map((space, index) => (
                  <div key={space.name} className="flex items-center gap-1.5 font-medium text-[#1F140E]">
                    <span className="font-bold text-[#6E3B1C]">#{index + 1}</span>
                    <span>{space.name}</span>
                    <span className="text-[11px] text-[#8C7A6B] font-semibold">({space.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  hint,
  value,
  change = null,
}: {
  label: string;
  hint: string;
  value: number;
  change?: number | null;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold font-sans text-[#1F140E]">{value}</span>
        <ChangeBadge value={change} />
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold text-[#1F140E]">{label}</p>
        <p className="text-xs text-[#8C7A6B]">{hint}</p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E4DD] hover:border-[#6E3B1C] hover:bg-[#FAF8F5] transition-all shadow-2xs group"
    >
      <div className="w-8 h-8 rounded-lg bg-[#FAF4EF] text-[#6E3B1C] flex items-center justify-center shrink-0 group-hover:bg-[#6E3B1C] group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-semibold text-[#1F140E]">{label}</span>
    </Link>
  );
}

function BookingRow({ booking }: { booking: VenueDashboardBooking }) {
  return (
    <tr className="hover:bg-[#FAF8F5]/60 transition-colors">
      <td className="py-3.5 px-3">
        <div className="font-semibold text-[#1F140E]">{booking.event}</div>
        <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C]">
          {booking.category}
        </span>
      </td>
      <td className="py-3.5 px-3 font-medium text-[#1F140E]">{booking.space}</td>
      <td className="py-3.5 px-3 text-[#71717A]">
        <div className="text-[#1F140E] font-medium">{formatDay(booking.startDate)}</div>
        <div className="text-[11px] text-[#8C7A6B]">{formatTime(booking.startDate)}</div>
      </td>
      <td className="py-3.5 px-3 text-[#1F140E]">{booking.organizer}</td>
      <td className="py-3.5 px-3 text-right font-medium text-[#1F140E]">{booking.guests}</td>
      <td className="py-3.5 px-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusClass(booking.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(booking.status)}`} />
          {booking.status}
        </span>
      </td>
    </tr>
  );
}
