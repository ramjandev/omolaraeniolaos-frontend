'use client';

import * as React from 'react';
import { Eye, ChevronDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface OrganizerRecord {
  id: string;
  name: string;
  email: string;
  type: 'Agency' | 'Individual' | 'Venue';
  status: 'Active' | 'Suspended';
  eventsCount: number;
  plan: string;
  joined: string;
}

const MOCK_ORGANIZERS_DATA: OrganizerRecord[] = [
  {
    id: '1',
    name: 'Premium Events Ng',
    email: 'premium@events.ng',
    type: 'Agency',
    status: 'Active',
    eventsCount: 15,
    plan: 'Pro Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '2',
    name: 'Royale Occasions',
    email: 'royale@occasions.ng',
    type: 'Agency',
    status: 'Active',
    eventsCount: 3,
    plan: 'Essential Event Pass',
    joined: '15 Jan 2026',
  },
  {
    id: '3',
    name: 'Eko Convention Ce...',
    email: 'contact@ekoconvention.ng',
    type: 'Venue',
    status: 'Active',
    eventsCount: 8,
    plan: 'Venue Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '4',
    name: 'James Obi',
    email: 'james.obi@gmail.com',
    type: 'Individual',
    status: 'Active',
    eventsCount: 1,
    plan: 'Grand Celebration Pass',
    joined: '15 Jan 2026',
  },
  {
    id: '5',
    name: 'Elite Productions',
    email: 'info@eliteproductions.ng',
    type: 'Agency',
    status: 'Suspended',
    eventsCount: 6,
    plan: 'Pro Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '6',
    name: 'Lagos Oriental Hall',
    email: 'events@orientalhotel.com',
    type: 'Venue',
    status: 'Active',
    eventsCount: 12,
    plan: 'Venue Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '7',
    name: 'Amaka Johnson',
    email: 'amaka.j@yahoo.com',
    type: 'Individual',
    status: 'Active',
    eventsCount: 2,
    plan: 'Essential Event Pass',
    joined: '15 Jan 2026',
  },
  {
    id: '8',
    name: 'Signature Occasions',
    email: 'hello@signature.ng',
    type: 'Agency',
    status: 'Active',
    eventsCount: 9,
    plan: 'Pro Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '9',
    name: 'Federal Palace Venue',
    email: 'booking@fedpalace.com',
    type: 'Venue',
    status: 'Active',
    eventsCount: 5,
    plan: 'Venue Subscription',
    joined: '15 Jan 2026',
  },
  {
    id: '10',
    name: 'Tunde Adeleke',
    email: 'tunde.adeleke@gmail.com',
    type: 'Individual',
    status: 'Active',
    eventsCount: 4,
    plan: 'Grand Celebration Pass',
    joined: '15 Jan 2026',
  },
];

export default function AdminOrganizersPage() {
  const [activeTab, setActiveTab] = React.useState<'all' | 'individual' | 'agency' | 'venue'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const filteredOrganizers = MOCK_ORGANIZERS_DATA.filter((org) => {
    if (activeTab === 'individual' && org.type !== 'Individual') return false;
    if (activeTab === 'agency' && org.type !== 'Agency') return false;
    if (activeTab === 'venue' && org.type !== 'Venue') return false;

    if (statusFilter !== 'all' && org.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && org.type.toLowerCase() !== typeFilter.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return org.name.toLowerCase().includes(q) || org.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredOrganizers.map((o) => o.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-1.png */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Organizers
          </h1>
          <p className="text-xs text-muted-foreground">
            142 organizers across the platform
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
              onClick={() => setActiveTab('individual')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'individual'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Individual (60)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agency')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'agency'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Agency (12)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('venue')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'venue'
                  ? 'text-foreground font-semibold border-b-2 border-[#6D3A1B]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Venue (18)
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
              {/* All Status Dropdown */}
              <div className="relative">
                <select
                  aria-label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* All Type Dropdown */}
              <div className="relative">
                <select
                  aria-label="Filter by Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredOrganizers.length &&
                        filteredOrganizers.length > 0
                      }
                      onCheckedChange={handleToggleAll}
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
                {filteredOrganizers.map((org) => {
                  const isSelected = selectedIds.includes(org.id);

                  return (
                    <tr
                      key={org.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(org.id)}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{org.name}</p>
                        <p className="text-[11px] text-muted-foreground">{org.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            org.type === 'Agency'
                              ? 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                              : org.type === 'Venue'
                              ? 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                              : 'bg-orange-100/60 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
                          }`}
                        >
                          {org.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {org.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{org.eventsCount}</td>
                      <td className="py-3 px-3 text-muted-foreground">{org.plan}</td>
                      <td className="py-3 px-3 text-muted-foreground">{org.joined}</td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
