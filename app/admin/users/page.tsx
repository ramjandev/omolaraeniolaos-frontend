'use client';

import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';

interface PlatformUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin';
  lastActive: string;
  status: 'Active' | 'Suspended';
}

const MOCK_PLATFORM_USERS: PlatformUserRecord[] = [
  {
    id: '1',
    name: 'John Mensah',
    email: 'john@email.com',
    role: 'Super Admin',
    lastActive: 'Just now',
    status: 'Active',
  },
  {
    id: '2',
    name: 'John Mensah',
    email: 'john@email.com',
    role: 'Admin',
    lastActive: '2 hrs ago',
    status: 'Active',
  },
  {
    id: '3',
    name: 'John Mensah',
    email: 'john@email.com',
    role: 'Admin',
    lastActive: '7 hrs ago',
    status: 'Suspended',
  },
  {
    id: '4',
    name: 'John Mensah',
    email: 'john@email.com',
    role: 'Admin',
    lastActive: '12 hrs ago',
    status: 'Active',
  },
];

import { InviteUserModal } from '@/components/admin/InviteUserModal';

export default function AdminPlatformUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  const filteredUsers = MOCK_PLATFORM_USERS.filter((user) => {
    if (statusFilter !== 'all' && user.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredUsers.map((u) => u.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-5.png */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Platform Users
          </h1>
          <p className="text-xs text-muted-foreground">
            Super Admin accounts with platform-wide access
          </p>
        </div>

        {/* Invite User Modal Dialog */}
        <InviteUserModal
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
        />

        {/* Card Container */}
        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          {/* Top Filter and Actions Row */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
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

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  aria-label="Filter Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Invite Button */}
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-8 px-4 text-xs font-medium bg-[#1F140E] hover:bg-[#322017] text-white gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onCheckedChange={handleToggleAll}
                    />
                  </th>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(user.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {user.role}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {user.lastActive}
                      </td>
                      <td className="py-3.5 px-4">
                        {user.status === 'Active' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="p-1 rounded text-[#9A5B32] hover:bg-muted/80 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded text-[#9A5B32] hover:bg-muted/80 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
