'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, CalendarPlus, UserPlus, Users } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { getAgencyDashboard, type AgencyDashboard as AgencyDashboardData } from '@/lib/api/agency-dashboard';
import { useAppSelector } from '@/store/store';

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(fullName?: string | null) {
  return fullName?.trim().split(/\s+/)[0] || '';
}

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatActivityWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  if (date >= startOfToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (date >= startOfYesterday) return 'Yesterday';
  return formatEventDate(value);
}

function isToday(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

const QUICK_ACTIONS = [
  {
    title: 'Create Event',
    description: 'Launch a new event brief',
    href: '/organizer/agency/events/create',
    icon: CalendarPlus,
  },
  {
    title: 'Add Client',
    description: 'Bring a new client onboard',
    href: '/organizer/agency/clients',
    icon: Users,
  },
  {
    title: 'Invite Team',
    description: 'Add a new team member',
    href: '/organizer/agency/team',
    icon: UserPlus,
  },
];

export function AgencyDashboard() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [dashboard, setDashboard] = React.useState<AgencyDashboardData | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const todayLabel = React.useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    [],
  );

  React.useEffect(() => {
    let active = true;
    getAgencyDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Agency dashboard could not be loaded');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const name = firstName(dashboard?.organizer.fullName || authUser?.fullName);
  const metrics = dashboard?.metrics;
  const monthChange = metrics ? `+${metrics.eventsThisMonth} this month` : 'This month';
  const activityIsToday = dashboard?.activity.some((item) => isToday(item.occurredAt));

  const cards = [
    { label: 'Total Events', value: metrics?.totalEvents, hint: monthChange },
    { label: 'Active Clients', value: metrics?.activeClients, hint: 'Across your agency' },
    { label: 'Upcoming Events', value: metrics?.upcomingEvents, hint: 'Next 30 days' },
    { label: 'Team Members', value: metrics?.teamMembers, hint: 'Active members' },
  ];

  return (
    <AppShell currentRole="organizer_agency">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-serif text-[1.65rem] font-semibold tracking-tight text-foreground">
              {greeting()}{name ? `, ${name}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your agency.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground">
              <Calendar className="size-3.5 text-muted-foreground" />
              {todayLabel}
            </div>
            <Link
              href="/organizer/agency/events/create"
              className="inline-flex h-10 items-center rounded-lg bg-[#2C2416] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#1C1814]"
            >
              Create Event
            </Link>
          </div>
        </div>

        {loading && !dashboard && (
          <p className="text-xs text-muted-foreground">Loading your agency dashboard…</p>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border/80 bg-card px-4 py-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-2 font-serif text-3xl font-semibold leading-none text-foreground">
                {card.value ?? '—'}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
          <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Quick access to upcoming agency and client events
                </p>
              </div>
              <Link
                href="/organizer/agency/events"
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {dashboard && dashboard.upcomingEvents.length === 0 && (
                <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                  No upcoming events yet. Create one to see it here.
                </p>
              )}
              {dashboard?.upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/organizer/agency/events/${event.id}`}
                  className="block rounded-xl border border-border/70 bg-[#FBF8F4] px-4 py-3.5 transition-colors hover:border-primary/30 dark:bg-background"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F3E6D4] text-[#8A5A32]">
                      <Calendar className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {event.kind === 'client' ? 'Client Event' : 'Own Event'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="rounded-full bg-[#F6E7D4] px-2.5 py-1 font-medium text-[#8A5A32]">
                            {event.ownerLabel}
                          </span>
                          <span className="whitespace-nowrap">{formatEventDate(event.startDate)}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{event.summary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Create event, add client, invite team</p>
              <div className="mt-4 space-y-2.5">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-[#FBF8F4] px-3 py-3 transition-colors hover:border-primary/30 dark:bg-background"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F3E6D4] text-[#8A5A32]">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{action.title}</span>
                        <span className="block text-[11px] text-muted-foreground">{action.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    New clients, event updates, team actions
                  </p>
                </div>
                {activityIsToday && (
                  <span className="text-[11px] text-muted-foreground">Today</span>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {dashboard && dashboard.activity.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Client signings, invoices, and team joins will show up here.
                  </p>
                )}
                {dashboard?.activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="mt-0.5 size-8 shrink-0 rounded-md bg-[#F6E7D4]" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatActivityWhen(item.occurredAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
