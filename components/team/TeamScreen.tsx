'use client';

import * as React from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  assignAgencyTeamMember,
  getAgencyTeam,
  inviteAgencyTeamMember,
  type AgencyTeamMemberRow,
} from '@/lib/api/agency-dashboard';

const fieldClass =
  'h-11 w-full rounded-lg border-[#E7E1DA] bg-[#FBF8F5] px-3 text-sm text-[#1F140E] outline-none placeholder:text-[#B3A79C]';

const emptyInvite = {
  fullName: '',
  role: '',
  email: '',
  phone: '',
  eventId: '',
};

export function TeamScreen({
  role,
  ownerLabel,
  adminLabel,
}: {
  role: 'organizer_agency' | 'organizer_venue';
  ownerLabel: string;
  adminLabel: string;
}) {
  const [members, setMembers] = React.useState<AgencyTeamMemberRow[]>([]);
  const [events, setEvents] = React.useState<Array<{ id: string; title: string }>>([]);
  const [metrics, setMetrics] = React.useState({ owners: 0, admins: 0, gateStaff: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [eventFilter, setEventFilter] = React.useState('all');
  const [sort, setSort] = React.useState<'newest' | 'oldest'>('newest');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [invite, setInvite] = React.useState(emptyInvite);
  const [saving, setSaving] = React.useState(false);
  const [viewing, setViewing] = React.useState<AgencyTeamMemberRow | null>(null);
  const [assigning, setAssigning] = React.useState<AgencyTeamMemberRow | null>(null);
  const [assignEventId, setAssignEventId] = React.useState('');

  const load = React.useCallback(async () => {
    setError('');
    try {
      const team = await getAgencyTeam();
      setMembers(team.members || []);
      setEvents(team.events || []);
      setMetrics(team.metrics || { owners: 0, admins: 0, gateStaff: 0 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Team could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = members.filter((member) => {
      if (eventFilter !== 'all' && member.eventId !== eventFilter) return false;
      if (!query) return true;
      return [member.name, member.email, member.role]
        .some((value) => value.toLowerCase().includes(query));
    });
    return [...filtered].sort((a, b) => {
      if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
      const diff = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      return sort === 'oldest' ? diff : -diff;
    });
  }, [eventFilter, members, search, sort]);

  const sendInvite = async () => {
    if (invite.fullName.trim().length < 2) {
      toast.error('Enter the full name');
      return;
    }
    if (!invite.role) {
      toast.error('Select a role');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    setSaving(true);
    try {
      await inviteAgencyTeamMember({
        fullName: invite.fullName.trim(),
        email: invite.email.trim(),
        phone: invite.phone.trim() || undefined,
        role: invite.role as 'Admin' | 'Gate Staff',
        eventId: invite.eventId || undefined,
      });
      toast.success('Invitation sent');
      setInviteOpen(false);
      setInvite(emptyInvite);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invitation could not be sent');
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async () => {
    if (!assigning || assigning.kind === 'owner') return;
    if (!assignEventId) {
      toast.error('Select an event');
      return;
    }
    setSaving(true);
    try {
      await assignAgencyTeamMember({
        memberId: assigning.id,
        kind: assigning.kind,
        eventId: assignEventId,
      });
      toast.success(`${assigning.name} assigned`);
      setAssigning(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Team member could not be assigned');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell currentRole={role}>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium text-[#1F140E]">Team</h1>
            <p className="mt-1 text-sm text-[#736B66]">Manage team and assign them to your events.</p>
          </div>
          <Button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="h-10 rounded-xl bg-[#241710] px-4 text-xs font-semibold text-white hover:bg-[#38261C]"
          >
            <Plus className="mr-1.5 size-4" />
            Invite Member
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric value={metrics.owners} label={ownerLabel} />
          <Metric value={metrics.admins} label={adminLabel} />
          <Metric value={metrics.gateStaff} label="Gate Staff" />
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
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#EBE3D9] bg-white px-3 text-sm text-[#3F342C]"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="p-6 text-sm text-[#736B66]">Loading team…</p>}
          {error && <p className="p-6 text-sm text-[#B33927]">{error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="p-6 text-sm text-[#736B66]">No team members match this view.</p>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs text-[#8C7D73]">
                  <tr className="border-b border-[#EFEAE4]">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.length > 0 && selected.length === visible.length}
                        onChange={() =>
                          setSelected((current) =>
                            current.length === visible.length ? [] : visible.map((member) => member.id),
                          )
                        }
                        aria-label="Select all team members"
                      />
                    </th>
                    <th className="px-3 py-3 font-medium">Staff Member</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() => setSort((current) => (current === 'newest' ? 'oldest' : 'newest'))}
                      >
                        Join Date
                        <ChevronDown className="size-3.5" />
                      </button>
                    </th>
                    <th className="px-3 py-3 font-medium">Current Assignment</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((member) => (
                    <tr key={`${member.kind}-${member.id}`} className="border-b border-[#F4EFEA] last:border-0">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(member.id)}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(member.id)
                                ? current.filter((id) => id !== member.id)
                                : [...current, member.id],
                            )
                          }
                          aria-label={`Select ${member.name}`}
                        />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-full bg-[#F3E6D8] text-xs font-semibold text-[#6E3B1C]">
                            {member.name.slice(0, 1).toUpperCase()}
                          </span>
                          <span>
                            <span className="block font-medium text-[#1F140E]">
                              {member.name}
                              {member.isYou ? <span className="font-normal text-[#8C7D73]"> (You)</span> : null}
                            </span>
                            <span className="block text-xs text-[#8C7D73]">{member.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-[#F4F1EC] px-2.5 py-1 text-xs font-medium text-[#5C5148]">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-[#3F342C]">
                        {new Date(member.joinedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-4 text-[#3F342C]">
                        {member.assignment || '—'}
                      </td>
                      <td className="px-4 py-4">
                        {member.isYou ? null : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setViewing(member)}
                              className="h-8 rounded-lg border border-[#E4DDD6] bg-white px-3 text-xs font-medium text-[#3F342C] hover:bg-[#FBF8F5]"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssigning(member);
                                setAssignEventId(member.eventId || '');
                              }}
                              className="h-8 rounded-lg bg-[#6E3B1C] px-3 text-xs font-medium text-white hover:bg-[#5C3117]"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1F140E]">Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Full Name*">
              <input
                value={invite.fullName}
                onChange={(event) => setInvite((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Enter full name"
                className={fieldClass}
              />
            </Field>
            <Field label="Role">
              <select
                value={invite.role}
                onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}
                className={fieldClass}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Gate Staff">Gate Staff</option>
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email Address *">
                <input
                  type="email"
                  value={invite.email}
                  onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Enter your email address"
                  className={fieldClass}
                />
              </Field>
              <Field label="Phone Number">
                <input
                  value={invite.phone}
                  onChange={(event) => setInvite((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+234"
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Assign to Event (optional)">
              <select
                value={invite.eventId}
                onChange={(event) => setInvite((current) => ({ ...current, eventId: event.target.value }))}
                className={fieldClass}
              >
                <option value="">Do not assign yet</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              disabled={saving}
              onClick={() => void sendInvite()}
              className="h-11 w-full rounded-lg bg-[#6E3B1C] text-sm font-medium text-white hover:bg-[#5C3117] disabled:opacity-60"
            >
              {saving ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1F140E]">
              {viewing?.name}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <dl className="space-y-2 text-sm text-[#3F342C]">
              <div>Role · {viewing.role}</div>
              <div>Email · {viewing.email}</div>
              <div>Phone · {viewing.phone || '—'}</div>
              <div>
                Joined ·{' '}
                {new Date(viewing.joinedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div>Assignment · {viewing.assignment || 'Not assigned yet'}</div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assigning)} onOpenChange={(open) => !open && setAssigning(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1F140E]">
              Assign {assigning?.name}
            </DialogTitle>
          </DialogHeader>
          <Field label="Event">
            <select
              value={assignEventId}
              onChange={(event) => setAssignEventId(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveAssignment()}
            className="h-11 w-full rounded-lg bg-[#6E3B1C] text-sm font-medium text-white hover:bg-[#5C3117] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </DialogContent>
      </Dialog>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#1F140E]">{label}</Label>
      {children}
    </div>
  );
}
