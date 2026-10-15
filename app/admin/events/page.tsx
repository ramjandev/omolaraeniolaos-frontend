'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ChevronDown, ArrowUpDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminEventRecord {
  id: string;
  name: string;
  organizer: string;
  organizerType: 'Agency' | 'Venue' | 'Individual';
  status: 'Active' | 'Completed' | 'Draft';
  date: string;
  guests: number;
  eventType: 'Gala' | 'Wedding' | 'Conference' | 'Social' | 'Exhibition';
}

const MOCK_EVENTS_DATA: AdminEventRecord[] = [
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
    status: 'Completed',
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
    status: 'Draft',
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
  {
    id: '7',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 240,
    eventType: 'Gala',
  },
  {
    id: '8',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Completed',
    date: '15 Jan 2026',
    guests: 50,
    eventType: 'Exhibition',
  },
  {
    id: '9',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Active',
    date: '15 Jan 2026',
    guests: 200,
    eventType: 'Wedding',
  },
  {
    id: '10',
    name: 'The Grand Royal Gala & I...',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    status: 'Draft',
    date: '15 Jan 2026',
    guests: 230,
    eventType: 'Social',
  },
];

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [organizerTypeFilter, setOrganizerTypeFilter] = React.useState('all');
  const [eventTypeFilter, setEventTypeFilter] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const filteredEvents = MOCK_EVENTS_DATA.filter((event) => {
    if (activeTab === 'active' && event.status !== 'Active') return false;
    if (activeTab === 'draft' && event.status !== 'Draft') return false;
    if (activeTab === 'completed' && event.status !== 'Completed') return false;

    if (organizerTypeFilter !== 'all' && event.organizerType.toLowerCase() !== organizerTypeFilter.toLowerCase()) return false;
    if (eventTypeFilter !== 'all' && event.eventType.toLowerCase() !== eventTypeFilter.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return event.name.toLowerCase().includes(q) || event.organizer.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredEvents.map((e) => e.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-2.png */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Events
          </h1>
          <p className="text-xs text-muted-foreground">
            847 active events across all organizers · read-only
          </p>
        </div>

        {/* Main Card Container */}
        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          {/* Top Tabs */}
          <div className="px-6 pt-4 border-b border-border flex items-center gap-8 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'all'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All (100)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'active'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active (60)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'draft'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Draft (12)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'completed'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed (18)
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-12 py-1.5 text-xs rounded-lg border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                ⌘ k
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* All Organizer Types Dropdown */}
              <div className="relative">
                <select
                  aria-label="Filter by Organizer Type"
                  value={organizerTypeFilter}
                  onChange={(e) => setOrganizerTypeFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">All Organizer Types</option>
                  <option value="agency">Agency</option>
                  <option value="venue">Venue</option>
                  <option value="individual">Individual</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* All Type Dropdown */}
              <div className="relative">
                <select
                  aria-label="Filter by Event Type"
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">All Type</option>
                  <option value="gala">Gala</option>
                  <option value="wedding">Wedding</option>
                  <option value="conference">Conference</option>
                  <option value="social">Social</option>
                  <option value="exhibition">Exhibition</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredEvents.length &&
                        filteredEvents.length > 0
                      }
                      onCheckedChange={handleToggleAll}
                    />
                  </th>
                  <th className="py-3 px-3">Event Name</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span>Guests</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEvents.map((event) => {
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
                        {event.status === 'Active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                        {event.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Completed
                          </span>
                        )}
                        {event.status === 'Draft' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Draft
                          </span>
                        )}
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

          {/* Footer Pagination */}
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
    </AppShell>
  );
}
