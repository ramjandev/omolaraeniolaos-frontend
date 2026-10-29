'use client';

import * as React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  archiveAgencyClient,
  getAgencyClients,
  type AgencyClientOption,
} from '@/lib/api/agency-dashboard';

type StatusFilter = 'all' | 'active' | 'archived';
type SortKey = 'newest' | 'oldest' | 'events';

export default function AgencyClientsPage() {
  const [clients, setClients] = React.useState<AgencyClientOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [sort, setSort] = React.useState<SortKey>('newest');
  const [selected, setSelected] = React.useState<string[]>([]);

  const load = React.useCallback(async () => {
    setError('');
    try {
      const rows = await getAgencyClients();
      setClients(Array.isArray(rows) ? rows : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Clients could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = clients.filter((client) => {
      const archived = client.status === 'archived';
      if (status === 'active' && archived) return false;
      if (status === 'archived' && !archived) return false;
      if (!query) return true;
      return [client.name, client.contactPerson, client.contactEmail, client.contactPhone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'events') return (b.totalEvents || 0) - (a.totalEvents || 0);
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [clients, search, sort, status]);

  const metrics = {
    total: clients.length,
    active: clients.filter((client) => client.status !== 'archived').length,
    events: clients.reduce((sum, client) => sum + (client.totalEvents || 0), 0),
  };

  const archive = async (client: AgencyClientOption) => {
    try {
      await archiveAgencyClient(client.id);
      toast.success(`${client.name} archived`);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Client could not be archived');
    }
  };

  const toggleAll = () => {
    setSelected((current) =>
      current.length === visible.length ? [] : visible.map((client) => client.id),
    );
  };

  return (
    <AppShell currentRole="organizer_agency">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium text-[#1F140E]">Clients</h1>
            <p className="mt-1 text-sm text-[#736B66]">
              Manage client relationships and keep every event connected.
            </p>
          </div>
          <Button
            asChild
            className="h-10 rounded-xl bg-[#241710] px-4 text-xs font-semibold text-white hover:bg-[#38261C]"
          >
            <Link href="/organizer/agency/clients/new">
              <Plus className="mr-1.5 size-4" />
              Add Client
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric value={metrics.total} label="Total Clients" />
          <Metric value={metrics.active} label="Active Clients" />
          <Metric value={metrics.events} label="Total Events" />
        </div>

        <div className="rounded-2xl border border-[#EBE3D9] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#EFEAE4] p-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8C7D73]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="h-10 rounded-xl border-[#EBE3D9] pl-9 text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="h-10 rounded-xl border border-[#EBE3D9] bg-white px-3 text-sm text-[#3F342C]"
            >
              <option value="all">Status</option>
              <option value="active">Active</option>
              <option value="archived">Archive</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-10 rounded-xl border border-[#EBE3D9] bg-white px-3 text-sm text-[#3F342C]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="events">Sort: Most events</option>
            </select>
          </div>

          {loading && <p className="p-6 text-sm text-[#736B66]">Loading clients…</p>}
          {error && <p className="p-6 text-sm text-[#B33927]">{error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="p-6 text-sm text-[#736B66]">No clients match this view.</p>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs text-[#8C7D73]">
                  <tr className="border-b border-[#EFEAE4]">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.length > 0 && selected.length === visible.length}
                        onChange={toggleAll}
                        aria-label="Select all clients"
                      />
                    </th>
                    <th className="px-3 py-3 font-medium">Staff Member</th>
                    <th className="px-3 py-3 font-medium">Contact Info</th>
                    <th className="px-3 py-3 font-medium">Total Events</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((client) => {
                    const archived = client.status === 'archived';
                    const label = client.name;
                    return (
                      <tr key={client.id} className="border-b border-[#F4EFEA] last:border-0">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(client.id)}
                            onChange={() =>
                              setSelected((current) =>
                                current.includes(client.id)
                                  ? current.filter((id) => id !== client.id)
                                  : [...current, client.id],
                              )
                            }
                            aria-label={`Select ${label}`}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <Link
                            href={`/organizer/agency/clients/${client.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <span className="grid size-9 place-items-center rounded-full bg-[#F3E6D8] text-xs font-semibold text-[#6E3B1C]">
                              {label.slice(0, 1).toUpperCase()}
                            </span>
                            <span>
                              <span className="block font-medium text-[#1F140E]">{label}</span>
                              <span className="block text-xs text-[#8C7D73]">{client.contactEmail}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-4 text-[#3F342C]">{client.contactEmail}</td>
                        <td className="px-3 py-4 text-[#3F342C]">{client.totalEvents || 0}</td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              archived
                                ? 'bg-[#F4F1EC] text-[#6F6258]'
                                : 'bg-[#E7F6EC] text-[#2F6B4F]'
                            }`}
                          >
                            {archived ? 'Archive' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="rounded-lg p-1.5 text-[#6F6258] hover:bg-[#F7F1EA]"
                                aria-label={`Actions for ${label}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl">
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/agency/clients/${client.id}`}>View Client</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/agency/clients/${client.id}/edit`}>Edit Client</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/agency/events/create?clientId=${client.id}`}>
                                  Create Event
                                </Link>
                              </DropdownMenuItem>
                              {!archived && (
                                <DropdownMenuItem
                                  onClick={() => void archive(client)}
                                  className="text-[#C44536] focus:text-[#C44536]"
                                >
                                  Archive Client
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#EBE3D9] bg-white px-5 py-4">
      <p className="font-serif text-3xl text-[#6E3B1C]">{value}</p>
      <p className="text-sm text-[#736B66]">{label}</p>
    </div>
  );
}
