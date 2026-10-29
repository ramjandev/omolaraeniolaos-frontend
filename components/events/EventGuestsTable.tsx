'use client';

import * as React from 'react';
import { ChevronsUpDown, Pencil, Plus, Trash2, Upload, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import {
  useAddGuestMutation,
  useBulkAddGuestsMutation,
  useDeleteGuestMutation,
  useGetEventGuestsQuery,
  useSendAllInvitesMutation,
  useSendGuestInviteMutation,
  useUpdateGuestMutation,
} from '@/store/Event/eventAPI';
import type { AddGuestPayload, EventGuest } from '@/store/Event/types/eventTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterPills } from '@/components/shared/FilterPills';
import { SearchField } from '@/components/shared/SearchField';
import { TablePagination } from '@/components/shared/TablePagination';
import { GuestFormModal } from './GuestFormModal';
import {
  CHANNEL_SELECT,
  GUEST_TYPES,
  INVITE_CHANNELS,
  RSVP_BADGE,
  RSVP_STATUSES,
} from './shared/guest-options';
import { parseGuestCsv } from './shared/guest-csv';

type RsvpTab = 'all' | (typeof RSVP_STATUSES)[number];
type CheckinTab = 'all' | 'Checked-In' | 'Not Arrived' | 'Flagged' | 'Rejected' | 'Tentative';
type GuestTab = RsvpTab | CheckinTab;

const CHECKIN_TABS: { value: CheckinTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Checked-In', label: 'Checked In' },
  { value: 'Not Arrived', label: 'Not Arrived' },
  { value: 'Flagged', label: 'Flagged' },
];

const ARRIVAL_BADGE: Record<string, string> = {
  'Checked-In': 'bg-[#E3F3EC] text-[#2F8A5F]',
  'Not Arrived': 'bg-[#F0EDE9] text-[#5E554F]',
  Rejected: 'bg-[#FBE4E1] text-[#B33927]',
  Tentative: 'bg-[#F7EFE6] text-[#8C5835]',
};

function arrivalStatus(guest: EventGuest) {
  if (guest.checkInStatus === 'Checked-In') return 'Checked-In';
  if (guest.checkInStatus === 'Rejected') return 'Rejected';
  if (guest.rsvpStatus === 'Tentative') return 'Tentative';
  return 'Not Arrived';
}

const TABS: { value: RsvpTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Tentative', label: 'Tentative' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Awaiting Response', label: 'Awaiting Response' },
  { value: 'Not Sent', label: 'Not Sent' },
];

const toolbarSelect =
  'h-8 rounded-lg border border-[#E8E3DD] bg-white px-2 text-xs text-[#3F342D] focus:outline-none focus:ring-2 focus:ring-[#6B3416]/10 dark:border-border dark:bg-card dark:text-foreground';
const cellSelect =
  'h-7 w-[132px] truncate rounded-md border px-2 text-xs text-[#3F342D] focus:outline-none focus:ring-2 focus:ring-[#6B3416]/15 disabled:opacity-60';

interface EventGuestsTableProps {
  eventId: string;
  /** Draft events invite guests. Published events track RSVPs. Live events track check-in. */
  mode: 'invite' | 'rsvp' | 'checkin';
}

export function EventGuestsTable({ eventId, mode }: EventGuestsTableProps) {
  const { data, isLoading, isError, refetch } = useGetEventGuestsQuery({ id: eventId });
  const [addGuest, { isLoading: adding }] = useAddGuestMutation();
  const [bulkAddGuests, { isLoading: importing }] = useBulkAddGuestsMutation();
  const [updateGuest, { isLoading: updating }] = useUpdateGuestMutation();
  const [deleteGuest, { isLoading: deleting }] = useDeleteGuestMutation();
  const [sendInvite] = useSendGuestInviteMutation();
  const [sendAllInvites, { isLoading: sendingAll }] = useSendAllInvitesMutation();

  const [tab, setTab] = React.useState<GuestTab>('all');
  const checkingIn = mode === 'checkin';
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc' | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventGuest | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EventGuest | null>(null);
  const [busyRow, setBusyRow] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const guests = React.useMemo(() => data?.data?.guests ?? [], [data]);
  const unsentCount = React.useMemo(
    () => guests.filter((guest) => guest.rsvpStatus === 'Not Sent').length,
    [guests],
  );
  const selectedCount = selected.size;
  const inviteCount = selectedCount > 0 ? selectedCount : unsentCount;

  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: guests.length };
    if (checkingIn) {
      counts['Checked-In'] = 0;
      counts['Not Arrived'] = 0;
      counts.Flagged = 0;
      for (const guest of guests) {
        const arrival = arrivalStatus(guest);
        if (arrival === 'Checked-In') counts['Checked-In'] += 1;
        if (arrival === 'Not Arrived') counts['Not Arrived'] += 1;
        if (guest.isFlagged) counts.Flagged += 1;
      }
      return counts;
    }
    for (const status of RSVP_STATUSES) counts[status] = 0;
    for (const guest of guests) counts[guest.rsvpStatus] = (counts[guest.rsvpStatus] ?? 0) + 1;
    return counts;
  }, [guests, checkingIn]);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = guests.filter((guest) => {
      if (checkingIn) {
        if (tab === 'Flagged' && !guest.isFlagged) return false;
        if (tab !== 'all' && tab !== 'Flagged' && arrivalStatus(guest) !== tab) return false;
      } else if (tab !== 'all' && guest.rsvpStatus !== tab) {
        return false;
      }
      if (typeFilter !== 'all' && guest.type !== typeFilter) return false;
      if (!query) return true;
      return (
        guest.name.toLowerCase().includes(query) ||
        guest.phone?.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query)
      );
    });
    if (sortDir) {
      rows.sort((a, b) => (sortDir === 'asc' ? a.partySize - b.partySize : b.partySize - a.partySize));
    }
    return rows;
  }, [guests, tab, typeFilter, search, sortDir, checkingIn]);

  React.useEffect(() => {
    setPage(1);
  }, [tab, typeFilter, search, pageSize]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const columnCount = checkingIn ? 7 : 9;
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((g) => selected.has(g.id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((g) => (allOnPageSelected ? next.delete(g.id) : next.add(g.id)));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runRowAction = async (guestId: string, action: () => Promise<unknown>) => {
    setBusyRow(guestId);
    try {
      await action();
    } catch {
      // baseAPI already surfaces the error toast
    } finally {
      setBusyRow(null);
    }
  };

  const handleSubmitGuest = async (payload: AddGuestPayload) => {
    try {
      if (editing) {
        await updateGuest({ eventId, guestId: editing.id, data: payload }).unwrap();
      } else {
        const created = await addGuest({
          eventId,
          data: {
            ...payload,
            rsvpStatus: 'Not Sent',
            sendInvite: checkingIn,
          },
        }).unwrap();
        if (checkingIn && created.data?.invitation?.error) {
          toast.error(created.data.invitation.error);
        } else if (checkingIn && created.data?.invitation && !created.data.invitation.sent) {
          toast.error('The guest was saved, but the invitation could not be sent.');
        }
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      // keep the modal open so the user can fix and retry
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const { guests: parsed, skipped, shortenedPhones } = parseGuestCsv(await file.text());
    if (parsed.length === 0) {
      toast.error(
        shortenedPhones
          ? 'Excel shortened the WhatsApp numbers. Write them as +234 801 234 5678 and upload again.'
          : 'No guests found. The file needs at least "name" and "phone" columns.',
      );
      return;
    }
    try {
      const imported = await bulkAddGuests({
        eventId,
        data: { guests: parsed, sendInvites: checkingIn },
      }).unwrap();
      if (checkingIn && imported.data?.invitations) {
        const { sent, failed } = imported.data.invitations;
        if (imported.data.invitations.emailError) {
          toast.error(imported.data.invitations.emailError);
        } else if (failed > 0) {
          toast.error(`Sent ${sent} invitation${sent === 1 ? '' : 's'}. ${failed} could not be sent.`);
        } else if (sent > 0) {
          toast.success(`Invitation sent to ${sent} guest${sent === 1 ? '' : 's'}.`);
        }
      }
      if (skipped > 0) toast.info(`${skipped} row(s) were skipped because the name or phone was missing.`);
      if (shortenedPhones > 0) {
        toast.info(`${shortenedPhones} number(s) were shortened by Excel. Write them as +234 801 234 5678.`);
      }
    } catch {
      // error toast handled by baseAPI
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGuest({ eventId, guestId: pendingDelete.id }).unwrap();
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(pendingDelete.id);
        return next;
      });
      setPendingDelete(null);
    } catch {
      // error toast handled by baseAPI
    }
  };

  return (
    <section className="rounded-2xl border border-[#E8E3DD] bg-white p-3 shadow-xs md:p-4 dark:border-border dark:bg-card">
      {checkingIn ? (
        <div className="flex flex-col gap-2 border-b border-[#EFEAE4] pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-border">
          <FilterPills
            ariaLabel="Filter guests by check-in status"
            tone="dark"
            value={tab}
            onChange={setTab}
            options={CHECKIN_TABS.map((item) => ({ ...item, count: tabCounts[item.value] ?? 0 }))}
          />
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg border border-[#E3DED8] bg-white px-3 text-xs font-medium text-[#261710] shadow-xs hover:bg-[#F7F4F0] dark:border-border dark:bg-card dark:text-foreground"
          >
            <Plus className="size-3.5" />
            Add Guest
          </button>
        </div>
      ) : (
        <FilterPills
          ariaLabel="Filter guests by RSVP status"
          tone="underline"
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({ ...t, count: tabCounts[t.value] ?? 0 }))}
          className="border-b border-[#EFEAE4] dark:border-border"
        />
      )}

      <div className="flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={checkingIn ? 'Search guest name...' : 'Search'}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={checkingIn ? 'Check-in status' : 'RSVP status'}
            value={tab}
            onChange={(e) => setTab(e.target.value as GuestTab)}
            className={toolbarSelect}
          >
            <option value="all">{checkingIn ? 'Check-in Status' : 'RSVP Status'}</option>
            {(checkingIn ? ['Checked-In', 'Not Arrived', 'Rejected', 'Tentative', 'Flagged'] : RSVP_STATUSES).map((status) => (
              <option key={status} value={status}>
                {status === 'Checked-In' ? 'Checked In' : status}
              </option>
            ))}
          </select>
          <select
            aria-label="Guest type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={toolbarSelect}
          >
            <option value="all">Guest Type</option>
            {GUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {!checkingIn && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E3DED8] bg-white px-3 text-xs font-medium text-[#261710] shadow-xs hover:bg-[#F7F4F0] dark:border-border dark:bg-card dark:text-foreground"
          >
            <Plus className="size-3.5" />
            Add Guest
          </button>
          )}
          {(mode === 'invite' || checkingIn) && (
            <button
              type="button"
              disabled={sendingAll || inviteCount === 0}
              onClick={() => {
                const guestIds = selectedCount > 0 ? [...selected] : undefined;
                void sendAllInvites({ eventId, guestIds })
                  .unwrap()
                  .then(() => setSelected(new Set()))
                  .catch(() => undefined);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#6B3416] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#5A2B12] disabled:opacity-60"
            >
              {sendingAll
                ? 'Sending…'
                : selectedCount > 0
                  ? `Send to selected (${selectedCount})`
                  : `Send Invitations${unsentCount ? ` (${unsentCount})` : ''}`}
            </button>
          )}
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInput.current?.click()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#2B1D14] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#3D2A1E] disabled:opacity-60"
          >
            <Upload className="size-3.5" />
            {importing ? 'Importing…' : checkingIn ? 'Upload & invite' : 'Upload File'}
          </button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#EFEAE4] dark:border-border">
        <table className={cn('w-full text-left text-xs', checkingIn ? 'min-w-[860px]' : 'min-w-[1180px]')}>
          <thead className="bg-[#F3F1EE] text-[#3F342D] dark:bg-muted dark:text-foreground">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all guests on this page"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="size-3.5 accent-[#6B3416]"
                />
              </th>
              <th className="px-3 py-2.5 font-medium">Guest &amp; Contact</th>
              <th className="px-3 py-2.5 text-center font-medium">Guest Type</th>
              {checkingIn ? (
                <th className="px-3 py-2.5 text-center font-medium">Check-In Status</th>
              ) : (
                <>
              <th className="px-3 py-2.5 text-center font-medium">Invite Through</th>
              <th className="px-3 py-2.5 text-center font-medium">Action</th>
              <th className="px-3 py-2.5 text-center font-medium">RSVP Status</th>
                </>
              )}
              <th className="px-3 py-2.5 text-center font-medium">
                <button
                  type="button"
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="inline-flex items-center gap-1"
                >
                  Party Size
                  <ChevronsUpDown className="size-3" />
                </button>
              </th>
              <th className="px-3 py-2.5 font-medium">Preference</th>
              <th className="px-3 py-2.5 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEAE4] dark:divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columnCount} className="px-3 py-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columnCount} className="px-3 py-10 text-center">
                  <p className="text-sm text-[#7A2E21]">We couldn&apos;t load the guest list.</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 rounded-lg border border-[#E8C4BA] px-3 py-1 text-xs text-[#7A2E21] hover:bg-[#FBEDE9]"
                  >
                    Try again
                  </button>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="bg-[#F3F1EE] px-3 py-12 text-center dark:bg-muted/40">
                  <Users className="mx-auto size-8 text-[#B3AAA1]" />
                  <p className="mt-2 text-sm text-[#736B66]">
                    {guests.length === 0
                      ? 'No guest yet. Create your first guest to start tracking RSVP'
                      : 'No guests match your filters.'}
                  </p>
                  {guests.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2B1D14] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3D2A1E]"
                    >
                      <Plus className="size-3.5" />
                      Add Guest
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((guest) => {
                const rowBusy = busyRow === guest.id;
                const hasReply = guest.rsvpStatus === 'Confirmed' || guest.rsvpStatus === 'Tentative' || guest.rsvpStatus === 'Declined';
                const arrival = arrivalStatus(guest);
                const showParty = checkingIn ? arrival !== 'Not Arrived' : hasReply;
                return (
                  <tr key={guest.id} className="bg-white hover:bg-[#FBFAF8] dark:bg-card dark:hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${guest.name}`}
                        checked={selected.has(guest.id)}
                        onChange={() => toggleRow(guest.id)}
                        className="size-3.5 accent-[#6B3416]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[13px] text-[#261710] dark:text-foreground">{guest.name}</p>
                      <p className="text-[10px] text-[#8C7D73]">{guest.phone || guest.email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <select
                        aria-label={`Guest type for ${guest.name}`}
                        value={guest.type}
                        disabled={rowBusy}
                        onChange={(e) =>
                          runRowAction(guest.id, () =>
                            updateGuest({ eventId, guestId: guest.id, data: { type: e.target.value } }).unwrap(),
                          )
                        }
                        className={cn(cellSelect, 'border-[#F1DFCB] bg-[#FFF8F0]')}
                      >
                        {GUEST_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    {checkingIn ? (
                      <td className="px-3 py-2.5 text-center">
                        <span className={cn('inline-block rounded-md px-2 py-1 text-[11px]', ARRIVAL_BADGE[arrival])}>
                          {arrival}
                        </span>
                      </td>
                    ) : (
                      <>
                    <td className="px-3 py-2.5 text-center">
                      <select
                        aria-label={`Invite channel for ${guest.name}`}
                        value={guest.inviteThrough}
                        disabled={rowBusy}
                        onChange={(e) =>
                          runRowAction(guest.id, () =>
                            updateGuest({
                              eventId,
                              guestId: guest.id,
                              data: { inviteThrough: e.target.value },
                            }).unwrap(),
                          )
                        }
                        className={cn(cellSelect, CHANNEL_SELECT[guest.inviteThrough] ?? CHANNEL_SELECT.WhatsApp)}
                      >
                        {INVITE_CHANNELS.map((channel) => (
                          <option key={channel} value={channel}>
                            {channel}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        disabled={rowBusy}
                        onClick={() =>
                          runRowAction(guest.id, () =>
                            sendInvite({ eventId, guestId: guest.id, channel: guest.inviteThrough }).unwrap(),
                          )
                        }
                        className="rounded-md bg-[#6B3416] px-3 py-1.5 text-[11px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#5A2B12] disabled:opacity-60"
                      >
                        {rowBusy ? 'Sending…' : guest.rsvpStatus === 'Not Sent' ? 'Send Invitation' : 'Resend Invitation'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {guest.rsvpStatus === 'Not Sent' ? (
                        <span className="text-[13px] text-[#8C7D73]">--</span>
                      ) : (
                        <span
                          className={cn(
                            'inline-block rounded-md px-2 py-1 text-[11px]',
                            RSVP_BADGE[guest.rsvpStatus] ?? RSVP_BADGE['Awaiting Response'],
                          )}
                        >
                          {guest.rsvpStatus}
                        </span>
                      )}
                    </td>
                      </>
                    )}
                    <td className="px-3 py-2.5 text-center text-[13px] text-[#3F342D] dark:text-foreground">
                      {showParty ? guest.partySize : '--'}
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-2.5 text-[13px] text-[#3F342D] dark:text-foreground">
                      {showParty && guest.preference && guest.preference !== '--' ? guest.preference : '--'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${guest.name}`}
                          onClick={() => {
                            setEditing(guest);
                            setFormOpen(true);
                          }}
                          className="rounded p-1 text-[#7A3B18] hover:bg-[#F7EFE6]"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${guest.name}`}
                          onClick={() => setPendingDelete(guest)}
                          className="rounded p-1 text-[#B33927] hover:bg-[#FBE4E1]"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && filtered.length > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <GuestFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        guest={editing}
        busy={adding || (Boolean(editing) && updating)}
        sendOnAdd={checkingIn && !editing}
        onSubmit={handleSubmitGuest}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this guest?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will be removed from the guest list along with their RSVP and seating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-[#B33927] hover:bg-[#9A2F20]"
            >
              {deleting ? 'Removing…' : 'Remove Guest'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
