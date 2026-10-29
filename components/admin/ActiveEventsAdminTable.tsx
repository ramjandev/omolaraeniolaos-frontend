'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { DashboardEvent, DashboardEventsPage } from '@/lib/api/admin-dashboard';

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status: string) {
  const value = status.replaceAll('_', ' ').toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pageNumbers(current: number, total: number) {
  if (total <= 1) return [1];
  const wanted = [1, total, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= total,
  );
  return [...new Set(wanted)].sort((a, b) => a - b);
}

export function ActiveEventsAdminTable({
  page,
  limit,
  events,
  loading,
  onPageChange,
  onLimitChange,
}: {
  page: DashboardEventsPage | null;
  limit: number;
  events: DashboardEvent[];
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const total = page?.meta.total ?? 0;
  const current = page?.meta.page ?? 1;
  const totalPages = Math.max(1, page?.meta.totalPages ?? 1);
  const start = total === 0 ? 0 : (current - 1) * limit + 1;
  const end = Math.min(current * limit, total);

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? events.map((event) => event.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-foreground">Active Events</h3>
          <p className="text-xs text-muted-foreground max-w-xl mt-1 leading-relaxed">
            Live and upcoming event productions monitored platform-wide across verified organizers and venues.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
          <Link href="/admin/events">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
              <tr>
                <th className="py-3 px-3 w-10">
                  <Checkbox
                    checked={events.length > 0 && selectedIds.length === events.length}
                    onCheckedChange={(checked) => handleToggleAll(checked === true)}
                  />
                </th>
                <th className="py-3 px-3">Event Name</th>
                <th className="py-3 px-3">Organizer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Guests</th>
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
                        onCheckedChange={() => handleToggleRow(event.id)}
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {statusLabel(event.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{formatEventDate(event.date)}</td>
                    <td className="py-3 px-3 text-muted-foreground">{event.guestsCount}</td>
                    <td className="py-3 px-3 text-muted-foreground">{event.eventType || 'Event'}</td>
                    <td className="py-3 px-3 text-center">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 px-3 text-center text-muted-foreground">
                    No live or upcoming events yet.
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
              className="bg-background border border-border/80 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              value={String(limit)}
              onChange={(event) => onLimitChange(Number(event.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-muted-foreground ml-2">
              showing {start}–{end} of {total} rows
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={current <= 1}
              onClick={() => onPageChange(current - 1)}
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
                  onClick={() => onPageChange(number)}
                  className={`h-8 w-8 rounded-md text-xs font-semibold flex items-center justify-center ${
                    number === current
                      ? 'bg-[#6D3A1B] text-white shadow-xs'
                      : 'hover:bg-muted text-foreground'
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
              onClick={() => onPageChange(current + 1)}
              className="h-8 px-3 text-xs text-foreground hover:bg-muted"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
