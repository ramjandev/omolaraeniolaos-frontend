'use client';

import * as React from 'react';
import {
  Armchair,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { OrganizerKind } from '@/lib/organizer';
import { Button } from '@/components/ui/button';
import { EventBreadcrumb } from './shared/EventBreadcrumb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { SearchField } from '@/components/shared/SearchField';
import { TablePagination } from '@/components/shared/TablePagination';
import { TABLE_TYPES, tableAcceptsGuest, type TableType } from './shared/guest-options';
import {
  useAssignGuestSeatingMutation,
  useCreateEventSeatingMutation,
  useDeleteEventSeatingMutation,
  useGetEventSeatingQuery,
  useUpdateEventSeatingMutation,
} from '@/store/Event/eventAPI';

interface SeatAllocation {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  guestType: string;
  seatCode: string;
}

type GuestGroup = TableType;

function displayTableType(tag: string): GuestGroup {
  if (tag === 'Standard' || tag === 'Preserved') return 'Preserved';
  return (TABLE_TYPES as readonly string[]).includes(tag) ? (tag as GuestGroup) : 'General';
}

interface SeatingTable {
  id: string;
  zoneId: string;
  tableNumber: number;
  name: string;
  tag: string;
  capacity: number;
  assignedCount: number;
  location: string;
  reservedSeats: number;
  seats: SeatAllocation[];
}

function mapTables(zones: Array<Record<string, any>>): SeatingTable[] {
  const tables: SeatingTable[] = [];
  for (const zone of zones) {
    const zoneTables = Array.isArray(zone.tables) && zone.tables.length
      ? zone.tables
      : [{ tableNumber: 1, seats: [], capacity: zone.seatPerTable, occupied: 0 }];
    for (const table of zoneTables) {
      tables.push({
        id: zone.tableCount > 1 ? `${zone.id}:${table.tableNumber}` : zone.id,
        zoneId: zone.id,
        tableNumber: table.tableNumber || 1,
        name: zone.tableCount > 1 ? `${zone.name} ${table.tableNumber}` : zone.name,
        tag: zone.guestGroup || 'General',
        capacity: table.capacity || zone.seatPerTable || zone.totalCapacity || 0,
        assignedCount: table.occupied || 0,
        location: zone.location || '',
        reservedSeats: zone.reservedSeats || 0,
        seats: (table.seats || []).map((seat: Record<string, any>) => ({
          id: seat.attendeeId,
          guestName: seat.guestName,
          phone: seat.phone || '',
          partySize: seat.partySize || 1,
          guestType: seat.tier || 'General',
          seatCode: seat.seatCode || `T${table.tableNumber}-${String(seat.seatNumber || 1).padStart(2, '0')}`,
        })),
      });
    }
  }
  return tables;
}

export function EventSeatingWorkspace({ organizer, eventId }: { organizer: OrganizerKind; eventId: string }) {
  const { data, isLoading, isError, refetch } = useGetEventSeatingQuery(eventId);
  const [createSeating, { isLoading: creating }] = useCreateEventSeatingMutation();
  const [updateSeating, { isLoading: updating }] = useUpdateEventSeatingMutation();
  const [deleteSeating] = useDeleteEventSeatingMutation();
  const [assignSeating] = useAssignGuestSeatingMutation();
  const seating = data?.data?.zones ? data.data : (data as { zones?: unknown[] } | undefined);
  const tables = React.useMemo(() => mapTables((seating?.zones ?? []) as Array<Record<string, any>>), [seating]);
  const unassignedGuests = (seating as { unassignedGuests?: Array<Record<string, any>> } | undefined)?.unassignedGuests ?? [];

  const [activeTab, setActiveTab] = React.useState<'setup' | 'review'>('setup');
  const [isAddSeatingOpen, setIsAddSeatingOpen] = React.useState(false);
  const [expandedTableId, setExpandedTableId] = React.useState<string | null>(null);

  // Form State for Add Seating Modal
  const [seatingName, setSeatingName] = React.useState('');
  const [guestGroup, setGuestGroup] = React.useState<GuestGroup>('General');
  const [zone, setZone] = React.useState('');
  const [totalCapacity, setTotalCapacity] = React.useState('15');
  const [reservedSeats, setReservedSeats] = React.useState('0');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<'capacity' | 'reserved' | 'available' | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const saving = creating || updating;

  React.useEffect(() => {
    if (!expandedTableId && tables[0]) setExpandedTableId(tables[0].id);
  }, [expandedTableId, tables]);

  const totalCapacitySum = tables.reduce((acc, t) => acc + t.capacity, 0);
  const totalAssignedGuests = tables.reduce((acc, t) => acc + t.seats.length, 0);
  const totalReservedSeats = tables.reduce((acc, t) => acc + t.reservedSeats, 0);
  const filteredTables = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = tables.filter((table) => {
      if (typeFilter !== 'all' && displayTableType(table.tag) !== typeFilter) return false;
      if (!query) return true;
      return table.name.toLowerCase().includes(query) || table.location.toLowerCase().includes(query);
    });
    if (sortKey) {
      rows.sort((a, b) => {
        const left = sortKey === 'capacity' ? a.capacity : sortKey === 'reserved' ? a.reservedSeats : Math.max(0, a.capacity - a.reservedSeats - a.assignedCount);
        const right = sortKey === 'capacity' ? b.capacity : sortKey === 'reserved' ? b.reservedSeats : Math.max(0, b.capacity - b.reservedSeats - b.assignedCount);
        return sortDir === 'asc' ? left - right : right - left;
      });
    }
    return rows;
  }, [tables, search, typeFilter, sortKey, sortDir]);
  const pageRows = filteredTables.slice((page - 1) * pageSize, page * pageSize);

  const placeGuest = async (guestId: string, tableId: string) => {
    const table = tables.find((item) => item.id === tableId);
    if (!table) return;
    try {
      await assignSeating({
        eventId,
        data: { attendeeId: guestId, zoneId: table.zoneId, tableNumber: table.tableNumber },
      }).unwrap();
      toast.success(`Seated at ${table.name}.`);
    } catch (error) {
      const message = error && typeof error === 'object' && 'data' in error
        ? String((error as { data?: { message?: string } }).data?.message || '')
        : '';
      toast.error(message || 'That table does not have enough open seats.');
    }
  };

  const handleCreateSeating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatingName.trim()) return;
    try {
      const payload = {
        name: seatingName.trim(),
        guestGroup,
        location: zone,
        capacity: parseInt(totalCapacity, 10) || 10,
        reservedSeats: parseInt(reservedSeats, 10) || 0,
      };
      if (editingId) {
        await updateSeating({ eventId, zoneId: editingId, data: payload }).unwrap();
      } else {
        await createSeating({ eventId, data: payload }).unwrap();
      }
      setIsAddSeatingOpen(false);
      setEditingId(null);
      setSeatingName('');
      setZone('');
      setActiveTab('setup');
      toast.success(editingId ? `${payload.name} updated.` : `${payload.name} added.`);
    } catch {
      toast.error('The table could not be saved.');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setSeatingName('');
    setGuestGroup('General');
    setZone('');
    setTotalCapacity('15');
    setReservedSeats('0');
    setIsAddSeatingOpen(true);
  };

  const openEdit = (table: SeatingTable) => {
    setEditingId(table.zoneId);
    setSeatingName(table.name);
    setGuestGroup(displayTableType(table.tag));
    setZone(table.location);
    setTotalCapacity(String(table.capacity));
    setReservedSeats(String(table.reservedSeats));
    setIsAddSeatingOpen(true);
  };

  const removeTable = async (table: SeatingTable) => {
    if (!window.confirm(`Remove ${table.name}? Guests at this table go back to unassigned.`)) return;
    try {
      await deleteSeating({ eventId, zoneId: table.zoneId }).unwrap();
    } catch {
      toast.error('The table could not be removed.');
    }
  };

  const changeGroup = async (table: SeatingTable, nextGroup: string) => {
    try {
      const result = await updateSeating({
        eventId,
        zoneId: table.zoneId,
        data: {
          name: table.name,
          guestGroup: nextGroup,
          location: table.location,
          capacity: table.capacity,
          reservedSeats: table.reservedSeats,
        },
      }).unwrap() as { data?: { releasedGuests?: number } };
      const released = result?.data?.releasedGuests ?? 0;
      if (released > 0) {
        const rule = nextGroup === 'Preserved' ? 'any guest' : `${nextGroup} guests only`;
        toast.info(
          `${released} guest${released === 1 ? '' : 's'} moved back to unassigned. This table now seats ${rule}.`,
        );
      }
    } catch {
      toast.error('The guest group could not be updated.');
    }
  };

  const toggleSort = (key: 'capacity' | 'reserved' | 'available') => {
    setSortDir((current) => (sortKey === key && current === 'asc' ? 'desc' : 'asc'));
    setSortKey(key);
  };

  return (
      <div className="w-full space-y-6">
        <EventBreadcrumb organizer={organizer} eventId={eventId} current="Seating & Protocol" />
        {isLoading && <p className="text-sm text-[#736B66]">Loading seating…</p>}
        {isError && (
          <div className="rounded-2xl border border-[#E8C4BA] bg-[#FBEDE9] p-4 text-sm text-[#7A2E21]">
            Seating could not be loaded.
            <button type="button" onClick={() => refetch()} className="ml-2 underline">
              Try again
            </button>
          </div>
        )}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F140E] dark:text-[#FBF8F5] tracking-tight">
            Seating & Protocol
          </h1>
          <p className="text-sm text-[#736B66] dark:text-muted-foreground mt-1">
            Set up your event seating, define guest seating rules, and finalize assignments seamlessly.
          </p>
        </div>

        {/* Tab Pill Switcher matching Figma */}
        <div className="inline-flex p-1 bg-[#FAF8F5] dark:bg-muted/40 rounded-2xl border border-[#EBE3D9] dark:border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'setup'
                ? 'bg-[#241710] text-white shadow-xs'
                : 'text-[#736B66] dark:text-muted-foreground hover:text-foreground'
            }`}
          >
            Seating Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-[#241710] text-white shadow-xs'
                : 'text-[#736B66] dark:text-muted-foreground hover:text-foreground'
            }`}
          >
            Review Assignments
          </button>
        </div>

        {/* Tab 1: Seating Setup matching media_1791786489840_0d57195a.png */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#1F140E] dark:text-foreground">
                Seating Setup
              </h2>
              <p className="text-xs text-[#736B66] dark:text-muted-foreground mt-0.5">
                Define the seating available at your event (tables, VIP areas, or standing zones).
              </p>
            </div>

            {/* 4 Metric Cards matching Figma */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#8C4B24]">
                  {totalCapacitySum}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Total Capacity
                </span>
              </div>
              <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#8C4B24]">
                  {tables.length}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Total Table
                </span>
              </div>
              <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#8C4B24]">
                  {totalAssignedGuests}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Assigned Guests
                </span>
              </div>
              <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#8C4B24]">
                  {totalReservedSeats}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Reserved Seats
                </span>
              </div>
            </div>

            {!isLoading && tables.length === 0 ? (
            <div className="rounded-3xl border border-[#EBE3D9] dark:border-border/80 bg-white/70 dark:bg-card/50 p-10 md:p-14 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF2EC] text-[#8C4B24] flex items-center justify-center shadow-xs">
                <Armchair className="w-6 h-6 text-[#8C4B24]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F140E] dark:text-foreground">
                  Set Up Your Event Seating
                </h3>
                <p className="text-xs text-[#736B66] dark:text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
                  Start by telling us what seating is available at your event. You can add tables, zones, standing areas, and custom seating types.
                </p>
              </div>

                <Button
                disabled={saving}
                onClick={openAdd}
                className="bg-[#241710] hover:bg-[#3D2518] text-white px-6 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-xs transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Seating</span>
              </Button>
            </div>
            ) : (
              <div className="rounded-2xl border border-[#EBE3D9] bg-white p-3 shadow-xs dark:border-border dark:bg-card">
                <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <SearchField value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search" />
                    <select
                      aria-label="Guest type"
                      value={typeFilter}
                      onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}
                      className="h-8 rounded-lg border border-[#E8E3DD] bg-white px-2 text-xs text-[#3F342D]"
                    >
                      <option value="all">Guest Type</option>
                      {TABLE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={openAdd} className="h-8 rounded-lg bg-[#241710] px-3 text-xs text-white hover:bg-[#3D2518]">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Seating
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="bg-[#F3F1EE] text-[#3F342D]">
                      <tr>
                        <th className="px-3 py-2.5 font-medium">Guest</th>
                        <th className="px-3 py-2.5 font-medium">Assigned Guest Type</th>
                        {([
                          ['capacity', 'Number of Seat'],
                          ['reserved', 'Reserved'],
                          ['available', 'Available'],
                        ] as const).map(([key, label]) => (
                          <th key={key} className="px-3 py-2.5 font-medium">
                            <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1">
                              {label}
                              <ChevronsUpDown className="size-3" />
                            </button>
                          </th>
                        ))}
                        <th className="px-3 py-2.5 font-medium">Location/Zone</th>
                        <th className="px-3 py-2.5 text-center font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEAE4]">
                      {pageRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-[#736B66]">No tables match this search.</td>
                        </tr>
                      ) : pageRows.map((table) => {
                        const available = Math.max(0, table.capacity - table.reservedSeats - table.assignedCount);
                        return (
                          <tr key={table.id}>
                            <td className="px-3 py-2.5 text-[13px] text-[#261710]">{table.name}</td>
                            <td className="px-3 py-2.5">
                              <select
                                aria-label={`Guest type for ${table.name}`}
                                value={displayTableType(table.tag)}
                                onChange={(event) => void changeGroup(table, event.target.value)}
                                className="h-7 rounded-md border border-[#F1DFCB] bg-[#FFF8F0] px-2 text-xs"
                              >
                                {TABLE_TYPES.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5">{String(table.capacity).padStart(2, '0')}</td>
                            <td className="px-3 py-2.5">{String(table.reservedSeats).padStart(2, '0')}</td>
                            <td className="px-3 py-2.5">{String(available).padStart(2, '0')}</td>
                            <td className="px-3 py-2.5">{table.location || '—'}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <button type="button" aria-label={`Edit ${table.name}`} onClick={() => openEdit(table)} className="rounded p-1 text-[#7A3B18] hover:bg-[#F7EFE6]">
                                  <Pencil className="size-3.5" />
                                </button>
                                <button type="button" aria-label={`Delete ${table.name}`} onClick={() => void removeTable(table)} className="rounded p-1 text-[#B33927] hover:bg-[#FBE4E1]">
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={filteredTables.length}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Review Assignments matching media_1791786529001_73dcec5e.png */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#1F140E] dark:text-foreground">
                Review Assignments
              </h2>
              <p className="text-xs text-[#736B66] dark:text-muted-foreground mt-0.5">
                Review automatically suggested seating and make manual changes or resolve conflicts before finalizing.
              </p>
            </div>

            {tables.length === 0 ? (
              <p className="rounded-2xl border border-[#EBE3D9] bg-white p-8 text-center text-sm text-[#736B66]">
                No tables yet. Add seating first, then assign guests here.
              </p>
            ) : null}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tables List (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                {tables.map((tbl) => {
                  const isExpanded = expandedTableId === tbl.id;
                  const availableCount = Math.max(0, tbl.capacity - tbl.reservedSeats - tbl.assignedCount);
                  const waitingGuests = unassignedGuests.filter((guest) =>
                    tableAcceptsGuest(tbl.tag, String(guest.type || 'General')),
                  );

                  return (
                    <div
                      key={tbl.id}
                      className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden transition-all"
                    >
                      {/* Table Header Bar matching Figma */}
                      <div className="p-4 px-5 flex flex-wrap items-center justify-between gap-3 bg-[#FCFAF7] dark:bg-muted/30 border-b border-[#EBE3D9]/60">
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-lg font-bold text-[#8C4B24]">
                            {tbl.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              tbl.tag === 'VIP'
                                ? 'bg-[#FBE8F0] text-[#9D174D]'
                                : tbl.tag === 'Family & Friends'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : tbl.tag === 'Speakers & Partners'
                                ? 'bg-[#E0F2FE] text-[#0369A1]'
                                : displayTableType(tbl.tag) === 'Preserved'
                                ? 'bg-[#EDE9FE] text-[#5B21B6]'
                                : 'bg-[#F3F4F6] text-[#374151]'
                            }`}
                          >
                            {displayTableType(tbl.tag)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <div className="text-right">
                            <span className="text-xs font-semibold text-[#16A34A] block">
                              {availableCount} available
                            </span>
                            <span className="text-[10px] text-[#736B66]">
                              {tbl.assignedCount}/{tbl.capacity} Seats
                            </span>
                          </div>

                          <select
                            aria-label={`Add a guest to ${tbl.name}`}
                            value=""
                            onChange={(e) => {
                              const guestId = e.target.value;
                              e.target.value = '';
                              if (!guestId) return;
                              setExpandedTableId(tbl.id);
                              void placeGuest(guestId, tbl.id);
                            }}
                            className="h-8 rounded-xl border border-[#DED7CC] bg-white px-2.5 text-xs text-[#241710] dark:bg-card"
                          >
                            <option value="">+ Add Guest</option>
                            {waitingGuests.length === 0 ? (
                              <option value="" disabled>
                                {unassignedGuests.length === 0
                                  ? 'No unassigned guests'
                                  : `No ${displayTableType(tbl.tag)} guests waiting`}
                              </option>
                            ) : (
                              waitingGuests.map((guest) => (
                                <option key={guest.id} value={guest.id}>
                                  {guest.name} · {guest.partySize || 1} {Number(guest.partySize) === 1 ? 'seat' : 'seats'}
                                </option>
                              ))
                            )}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTableId(isExpanded ? null : tbl.id)
                            }
                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Table Seats Roster */}
                      {isExpanded && (
                        <div className="p-0 overflow-x-auto">
                          {tbl.seats.length > 0 ? (
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAF8F5] dark:bg-muted/40 border-b border-[#EBE3D9] text-[#736B66] font-medium">
                                <tr>
                                  <th className="py-2.5 px-4 w-10">
                                    <input type="checkbox" className="rounded" />
                                  </th>
                                  <th className="py-2.5 px-4">Guest & Contact</th>
                                  <th className="py-2.5 px-4">Party Size</th>
                                  <th className="py-2.5 px-4">Seat</th>
                                  <th className="py-2.5 px-4 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EBE3D9]/60">
                                {tbl.seats.map((seat) => (
                                  <tr key={seat.id} className="hover:bg-muted/20">
                                    <td className="py-3 px-4">
                                      <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="font-semibold text-[#1F140E] dark:text-foreground">
                                        {seat.guestName}
                                      </div>
                                      <div className="text-[11px] text-[#736B66]">
                                        {seat.phone}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">
                                      {seat.partySize}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[11px] text-[#8C4B24]">
                                      {seat.seatCode}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <select
                                        className="text-[11px] border rounded-lg px-2 py-1 bg-white dark:bg-card text-foreground"
                                        defaultValue="move"
                                        onChange={(e) => {
                                          if (e.target.value && e.target.value !== 'move') {
                                            void placeGuest(seat.id, e.target.value);
                                            e.target.value = 'move';
                                          }
                                        }}
                                      >
                                        <option value="move">Move to... ⌄</option>
                                        {tables
                                          .filter((t) => t.id !== tbl.id && tableAcceptsGuest(t.tag, seat.guestType))
                                          .map((t) => (
                                            <option key={t.id} value={t.id}>
                                              {t.name} · {displayTableType(t.tag)}
                                            </option>
                                          ))}
                                      </select>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-6 text-center text-xs text-[#736B66]">
                              No guests seated at this table yet. Select an unassigned guest to allocate seats.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Unassigned Guests (4 cols) matching Figma */}
              <div className="lg:col-span-4 rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#1F140E] dark:text-foreground">
                  Unassigned Guests ({unassignedGuests.length})
                </h3>

                <div className="space-y-3">
                  {unassignedGuests.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl border border-[#EBE3D9] bg-[#FAF8F5] dark:bg-muted/30 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-xs text-[#1F140E] dark:text-foreground">
                          {g.name}
                        </div>
                        <div className="text-[11px] text-[#736B66]">
                          {g.type || 'General'} · {g.partySize || 1} {g.partySize === 1 ? 'seat' : 'seats'}
                        </div>
                      </div>

                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            void placeGuest(g.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Assign Seating ⌄
                        </option>
                        {tables.filter((t) => tableAcceptsGuest(t.tag, g.type || 'General')).length === 0 ? (
                          <option value="" disabled className="text-foreground bg-white">
                            No {g.type || 'General'} table
                          </option>
                        ) : null}
                        {tables
                          .filter((t) => tableAcceptsGuest(t.tag, g.type || 'General'))
                          .map((t) => (
                          <option key={t.id} value={t.id} className="text-foreground bg-white">
                            {t.name} · {displayTableType(t.tag)} ({Math.max(0, t.capacity - t.reservedSeats - t.assignedCount)} left)
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {unassignedGuests.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      All guests have been allocated seating!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Seating matching uploaded_media_3_1791786558314.png */}
        <Dialog open={isAddSeatingOpen} onOpenChange={setIsAddSeatingOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="font-serif text-xl font-bold text-[#261710] dark:text-foreground">
                {editingId ? 'Edit Seating' : 'Add Seating'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateSeating} className="space-y-4 pt-1 text-xs">
              {/* Seating Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                  Seating Name
                </Label>
                <Input
                  required
                  value={seatingName}
                  onChange={(e) => setSeatingName(e.target.value)}
                  placeholder="e.g. Table 01 or VIP Section A"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/60"
                />
              </div>

              {/* Assigned Guest Group & Location/Zone Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Assigned Guest Group
                  </Label>
                  <select
                    value={guestGroup}
                    onChange={(e) => setGuestGroup(e.target.value as GuestGroup)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-[#FAF8F5]/60 text-foreground focus:outline-none"
                  >
                    {TABLE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Location / Zone
                  </Label>
                  <Input
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. Main Hall"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/60"
                  />
                </div>
              </div>

              {/* Total Capacity & Reserved Seats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Total Capacity
                  </Label>
                  <Input
                    type="number"
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(e.target.value)}
                    placeholder="15"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Reserved Seats
                  </Label>
                  <Input
                    type="number"
                    value={reservedSeats}
                    onChange={(e) => setReservedSeats(e.target.value)}
                    placeholder="00"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/60"
                  />
                </div>
              </div>

              {/* Submit Button matching Figma */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs mt-2"
              >
                {saving ? 'Saving…' : 'Save Seating'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
}
