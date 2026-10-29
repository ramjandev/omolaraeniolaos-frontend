'use client';

import * as React from 'react';
import { toast } from 'react-toastify';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { InviteUserModal, type PlatformUserFormValues } from '@/components/admin/InviteUserModal';
import {
  deletePlatformUser,
  getPlatformUsers,
  invitePlatformUser,
  updatePlatformUser,
  type PlatformUserRecord,
} from '@/lib/api/admin-dashboard';

function formatLastActive(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return 'Not recorded';
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function AdminPlatformUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [users, setUsers] = React.useState<PlatformUserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PlatformUserRecord | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<PlatformUserRecord | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [issued, setIssued] = React.useState<{
    email: string;
    temporaryPassword: string;
    emailSent: boolean;
  } | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = React.useCallback(() => {
    let active = true;
    setLoading(true);
    getPlatformUsers({ search: debouncedSearch, status: statusFilter })
      .then((result) => {
        if (!active) return;
        setUsers(result.data || []);
        setError('');
        setSelectedIds([]);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Platform users could not be loaded');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedSearch, statusFilter]);

  React.useEffect(() => loadUsers(), [loadUsers]);

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? users.map((user) => user.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleInvite = async (values: PlatformUserFormValues) => {
    setSubmitting(true);
    try {
      const result = await invitePlatformUser({
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });
      setIssued({
        email: result.user.email,
        temporaryPassword: result.temporaryPassword,
        emailSent: result.emailSent,
      });
      toast.success(`${result.user.name} can now sign in`);
      loadUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'The invitation could not be sent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (values: PlatformUserFormValues) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await updatePlatformUser(editing.id, {
        fullName: values.fullName,
        role: values.role,
        status: values.status,
      });
      toast.success('Platform user updated');
      setEditing(null);
      loadUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'The user could not be updated');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setSubmitting(true);
    try {
      await deletePlatformUser(pendingDelete.id);
      toast.success(`${pendingDelete.name} was removed`);
      setPendingDelete(null);
      loadUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'The user could not be removed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Platform Users
          </h1>
          <p className="text-xs text-muted-foreground">
            Super Admin accounts with platform-wide access
          </p>
        </div>

        <InviteUserModal
          open={isInviteOpen}
          onOpenChange={(open) => {
            setIsInviteOpen(open);
            if (!open) setIssued(null);
          }}
          submitting={submitting}
          issued={issued}
          onSubmit={handleInvite}
        />

        <InviteUserModal
          open={Boolean(editing)}
          mode="edit"
          initial={editing ? {
            fullName: editing.name,
            email: editing.email,
            role: editing.role,
            status: editing.status,
          } : null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          submitting={submitting}
          onSubmit={handleEdit}
        />

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-3.5 pr-12 py-1.5 text-xs rounded-lg border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                  ⌘ k
                </div>
              </div>

              <div className="relative">
                <select
                  aria-label="Filter Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setIssued(null);
                setIsInviteOpen(true);
              }}
              className="h-8 px-4 text-xs font-medium bg-[#1F140E] hover:bg-[#322017] text-white gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={selectedIds.length === users.length && users.length > 0}
                      onCheckedChange={(checked) => handleToggleAll(checked === true)}
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
                {users.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3.5 px-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => handleToggleRow(user.id)} />
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">{user.role}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{formatLastActive(user.lastActive)}</td>
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
                            onClick={() => setEditing(user)}
                            className="p-1 rounded text-[#9A5B32] hover:bg-muted/80 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(user)}
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
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                      No platform users match this view.
                    </td>
                  </tr>
                )}
                {loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                      Loading platform users...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Remove platform user</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Remove {pendingDelete?.name}? They will no longer be able to sign in to the admin panel.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={handleDelete}
              className="bg-[#6E3B1C] hover:bg-[#5C3016] text-white"
            >
              {submitting ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
