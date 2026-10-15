'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminEventRow {
  id: string;
  name: string;
  organizer: string;
  organizerType: 'Agency' | 'Venue' | 'Individual';
  status: 'Active';
  date: string;
  guests: number;
  eventType: 'Gala' | 'Wedding' | 'Conference' | 'Social';
}

const MOCK_ACTIVE_EVENTS: AdminEventRow[] = [
  {
    id: '1',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 150,
    eventType: 'Gala',
  },
  {
    id: '2',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Royale Occasions',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 110,
    eventType: 'Wedding',
  },
  {
    id: '3',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Eko Convention Ce...',
    organizerType: 'Venue',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 120,
    eventType: 'Gala',
  },
  {
    id: '4',
    name: 'The Grand Royal Gala & I...',
    organizer: 'James Obi',
    organizerType: 'Individual',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 90,
    eventType: 'Conference',
  },
  {
    id: '5',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 190,
    eventType: 'Social',
  },
  {
    id: '6',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 250,
    eventType: 'Conference',
  },
];

export function ActiveEventsAdminTable() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? MOCK_ACTIVE_EVENTS.map((e) => e.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header section with title and View All */}
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

      {/* Events table */}
      <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
              <tr>
                <th className="py-3 px-3 w-10">
                  <Checkbox
                    checked={
                      selectedIds.length === MOCK_ACTIVE_EVENTS.length &&
                      MOCK_ACTIVE_EVENTS.length > 0
                    }
                    onCheckedChange={handleToggleAll}
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
              {MOCK_ACTIVE_EVENTS.map((event) => {
                const isSelected = selectedIds.includes(event.id);

                return (
                  <tr
                    key={event.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
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
                      <p className="font-semibold text-foreground leading-tight">
                        {event.organizer}
                      </p>
                      <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                        {event.organizerType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{event.date}</td>
                    <td className="py-3 px-3 text-muted-foreground">{event.guests}</td>
                    <td className="py-3 px-3 text-muted-foreground">{event.eventType}</td>
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
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Figma exactly */}
        <div className="px-4 py-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              aria-label="Rows per page"
              className="bg-background border border-border/80 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              defaultValue="10"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-muted-foreground ml-2">showing 1–10 of 150 rows</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 px-3 text-xs text-muted-foreground disabled:opacity-40"
            >
              Previous
            </Button>
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-[#6D3A1B] text-white text-xs font-semibold flex items-center justify-center shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
            >
              3
            </button>
            <span className="px-1 text-muted-foreground">...</span>
            <button
              type="button"
              className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
            >
              15
            </button>
            <Button
              variant="outline"
              size="sm"
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
