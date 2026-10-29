'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ChevronDown, ArrowUpDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getAdminEvents, type AdminEventsPage, type DashboardEvent } from '@/lib/api/admin-dashboard';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pageNumbers(current: number, total: number) {
  if (total <= 1) return [1];
  const wanted = [1, total, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= total,
  );
  return [...new Set(wanted)].sort((a, b) => a - b);
}

function statusClass(status: string) {
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (status === 'Completed') return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
  if (status === 'Cancelled') return 'bg-rose-50 text-rose-700 border-rose-200/60';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200/60';
}

const TABS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['draft', 'Draft'],
  ['completed', 'Completed'],
] as const;

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number][0]>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [organizerType, setOrganizerType] = React.useState('All');
  const [eventType, setEventType] = React.useState('All');
  const [sort, setSort] = React.useState<'date' | 'guests-desc' | 'guests-asc'>('date');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [result, setResult] = React.useState<AdminEventsPage | null>(null);
  const [error, setError] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const statusQuery = activeTab === 'all'
    ? 'All'
    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  React.useEffect(() => {
    let active = true;
    setError('');
    getAdminEvents({
      status: statusQuery,
      organizerType,
      eventType,
      search: debouncedSearch,
      sort,
      page,
      limit,
    })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setResult(null);
        setError(err instanceof Error ? err.message : 'Events could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [statusQuery, organizerType, eventType, debouncedSearch, sort, page, limit]);

  const events: DashboardEvent[] = result?.data || [];
  const counts = result?.meta.tabCounts || { all: 0, active: 0, draft: 0, completed: 0 };
  const eventTypes = result?.meta.eventTypes || [];
  const total = result?.meta.total ?? 0;
  const current = result?.meta.page ?? page;
  const totalPages = Math.max(1, result?.meta.totalPages ?? 1);
  const start = total === 0 ? 0 : (current - 1) * limit + 1;
  const end = Math.min(current * limit, total);
  const activeEvents = result?.meta.activeEvents ?? counts.active;

  const toggleGuestSort = () => {
    setSort((currentSort) => (
      currentSort === 'date' ? 'guests-desc' : currentSort === 'guests-desc' ? 'guests-asc' : 'date'
    ));
    setPage(1);
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Events
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeEvents} active events across all organizers · read-only
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          <div className="px-6 pt-4 border-b border-border flex items-center gap-8 text-xs font-medium">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  setPage(1);
                  setSelectedIds([]);
                }}
                className={`pb-3 relative transition-colors ${
                  activeTab === id
                    ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label} ({counts[id]})
              </button>
            ))}
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full pl-3.5 pr-12 py-1.5 text-xs rounded-lg border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                ⌘ k
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <select
                  aria-label="Filter by Organizer Type"
                  value={organizerType}
                  onChange={(event) => {
                    setOrganizerType(event.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="All">All Organizer Types</option>
                  <option value="Agency">Agency</option>
                  <option value="Venue">Venue</option>
                  <option value="Individual">Individual</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter by Event Type"
                  value={eventType}
                  onChange={(event) => {
                    setEventType(event.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="All">All Type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={events.length > 0 && selectedIds.length === events.length}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked === true ? events.map((event) => event.id) : []);
                      }}
                    />
                  </th>
                  <th className="py-3 px-3">Event Name</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">
                    <button type="button" onClick={toggleGuestSort} className="flex items-center gap-1">
                      <span>Guests</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {events.map((event) => {
                  const isSelected = selectedIds.includes(event.id);
                  return (
                    <tr
                      key={event.id}
                      className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            setSelectedIds((prev) => (
                              prev.includes(event.id) ? prev.filter((id) => id !== event.id) : [...prev, event.id]
                            ));
                          }}
                        />
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground max-w-[200px] truncate">
                        {event.name}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground leading-tight">{event.organizer}</p>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                          {event.organizerType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusClass(event.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{formatDate(event.date)}</td>
                      <td className="py-3 px-3 text-muted-foreground">{event.guestsCount}</td>
                      <td className="py-3 px-3 text-muted-foreground">{event.eventType}</td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/admin/events/${event.id}`} aria-label={`View ${event.name}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-3 text-center text-muted-foreground">
                      No events match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                aria-label="Rows per page"
                value={String(limit)}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="bg-background border border-border/80 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted-foreground ml-2">showing {start}–{end} of {total} rows</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
                className="h-8 px-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                Previous
              </Button>
              {pageNumbers(current, totalPages).map((number, index, list) => (
                <React.Fragment key={number}>
                  {index > 0 && number - list[index - 1] > 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-8 w-8 rounded-md text-xs font-semibold flex items-center justify-center ${
                      number === current ? 'bg-[#6D3A1B] text-white shadow-xs' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={current >= totalPages}
                onClick={() => setPage(current + 1)}
                className="h-8 px-3 text-xs text-foreground hover:bg-muted"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
