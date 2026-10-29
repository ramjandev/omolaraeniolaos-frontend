'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ChevronDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getAdminOrganizer,
  getAdminOrganizers,
  type AdminOrganizerDetail,
  type AdminOrganizerRow,
  type AdminOrganizersPage,
} from '@/lib/api/admin-dashboard';

function formatJoined(value: string) {
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

function typeClass(type: string) {
  if (type === 'Agency') return 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
  if (type === 'Venue') return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
  return 'bg-orange-100/60 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300';
}

function statusClass(status: string) {
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (status === 'Suspended' || status === 'Deactivated') return 'bg-rose-50 text-rose-700 border-rose-200/60';
  return 'bg-amber-50 text-amber-800 border-amber-200/60';
}

export default function AdminOrganizersPage() {
  const [activeTab, setActiveTab] = React.useState<'all' | 'individual' | 'agency' | 'venue'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [result, setResult] = React.useState<AdminOrganizersPage | null>(null);
  const [error, setError] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [detail, setDetail] = React.useState<AdminOrganizerDetail | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const typeQuery = activeTab === 'all'
    ? 'All'
    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  React.useEffect(() => {
    let active = true;
    setError('');
    getAdminOrganizers({
      type: typeQuery,
      status: statusFilter,
      search: debouncedSearch,
      page,
      limit,
    })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setResult(null);
        setError(err instanceof Error ? err.message : 'Organizers could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [typeQuery, statusFilter, debouncedSearch, page, limit]);

  const organizers = result?.data || [];
  const counts = result?.meta.tabCounts || { all: 0, individual: 0, agency: 0, venue: 0 };
  const total = result?.meta.total ?? 0;
  const current = result?.meta.page ?? page;
  const totalPages = Math.max(1, result?.meta.totalPages ?? 1);
  const start = total === 0 ? 0 : (current - 1) * limit + 1;
  const end = Math.min(current * limit, total);

  const chooseTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds([]);
  };

  const openOrganizer = async (organizer: AdminOrganizerRow) => {
    setDetailOpen(true);
    setDetail(null);
    try {
      setDetail(await getAdminOrganizer(organizer.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'This organizer could not be opened');
      setDetailOpen(false);
    }
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Organizers
          </h1>
          <p className="text-xs text-muted-foreground">
            {counts.all} organizers across the platform
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          <div className="px-6 pt-4 border-b border-border flex items-center gap-8 text-xs font-medium">
            {([
              ['all', `All (${counts.all})`],
              ['individual', `Individual (${counts.individual})`],
              ['agency', `Agency (${counts.agency})`],
              ['venue', `Venue (${counts.venue})`],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseTab(id)}
                className={`pb-3 relative transition-colors ${
                  activeTab === id
                    ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
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
                  aria-label="Filter by Status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
              <div className="relative">
                <select
                  aria-label="Filter by Type"
                  value={activeTab}
                  onChange={(event) => chooseTab(event.target.value as typeof activeTab)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">All Type</option>
                  <option value="individual">Individual</option>
                  <option value="agency">Agency</option>
                  <option value="venue">Venue</option>
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
                      checked={organizers.length > 0 && selectedIds.length === organizers.length}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked === true ? organizers.map((organizer) => organizer.id) : []);
                      }}
                    />
                  </th>
                  <th className="py-3 px-3">Organizer & Contact</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Events</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {organizers.map((org) => {
                  const isSelected = selectedIds.includes(org.id);
                  return (
                    <tr
                      key={org.id}
                      className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            setSelectedIds((prev) => (
                              prev.includes(org.id) ? prev.filter((id) => id !== org.id) : [...prev, org.id]
                            ));
                          }}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{org.name}</p>
                        <p className="text-[11px] text-muted-foreground">{org.contactEmail}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${typeClass(org.type)}`}>
                          {org.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusClass(org.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{org.eventsCount}</td>
                      <td className="py-3 px-3 text-muted-foreground">{org.plan}</td>
                      <td className="py-3 px-3 text-muted-foreground">{formatJoined(org.joinedAt)}</td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void openOrganizer(org)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label={`View ${org.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {organizers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-3 text-center text-muted-foreground">
                      No organizers match this view.
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {detail?.name || 'Organizer'}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{detail.contactEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">{detail.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{detail.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold text-foreground">{detail.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-semibold text-foreground">{detail.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-semibold text-foreground">{formatJoined(detail.joinedAt)}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Events ({detail.eventsCount})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(detail.events || []).length === 0 && (
                    <p className="text-muted-foreground">No events yet.</p>
                  )}
                  {(detail.events || []).map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 hover:bg-muted/40"
                    >
                      <span className="font-medium text-foreground">{event.title}</span>
                      <span className="text-muted-foreground">{event.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
