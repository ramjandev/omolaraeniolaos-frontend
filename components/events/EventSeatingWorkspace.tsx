'use client';

import * as React from 'react';
import {
  Armchair,
  Plus,
  ChevronDown,
  ChevronUp,
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
import { getEventSeatingBlueprint } from '@/lib/api/individual-events';

interface SeatAllocation {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  seatCode: string;
}

type GuestGroup =
  | 'Standard'
  | 'VIP'
  | 'Family & Friends'
  | 'Speakers & Partners'
  | 'General';

interface SeatingTable {
  id: string;
  name: string;
  tag: 'VIP' | 'Family & Friends' | 'Speakers & Partners' | 'General' | 'Standard';
  capacity: number;
  assignedCount: number;
  location: string;
  reservedSeats: number;
  seats: SeatAllocation[];
}

export function EventSeatingWorkspace({ organizer, eventId }: { organizer: OrganizerKind; eventId: string }) {
  const [activeTab, setActiveTab] = React.useState<'setup' | 'review'>('setup');
  const [isAddSeatingOpen, setIsAddSeatingOpen] = React.useState(false);
  const [expandedTableId, setExpandedTableId] = React.useState<string | null>('table-1');

  // Form State for Add Seating Modal
  const [seatingName, setSeatingName] = React.useState('');
  const [guestGroup, setGuestGroup] = React.useState<GuestGroup>('Standard');
  const [zone, setZone] = React.useState('');
  const [totalCapacity, setTotalCapacity] = React.useState('15');
  const [reservedSeats, setReservedSeats] = React.useState('0');

  // Load live seating blueprint from API with fallback
  React.useEffect(() => {
    let mounted = true;
    async function loadSeating() {
      try {
        const res = await getEventSeatingBlueprint(eventId);
        if (mounted && res && res.zones && res.zones.length > 0) {
          // If live zones mapped, keep synchronized
        }
      } catch {}
    }
    loadSeating();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  // State: Tables
  const [tables, setTables] = React.useState<SeatingTable[]>([
    {
      id: 'table-1',
      name: 'Table - 01',
      tag: 'VIP',
      capacity: 15,
      assignedCount: 14,
      location: 'Main Hall A',
      reservedSeats: 1,
      seats: [
        { id: 's-1', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 1, seatCode: 'T1-VIP-01' },
        { id: 's-2', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 2, seatCode: 'T1-VIP-01, T1-VIP-02' },
        { id: 's-3', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 4, seatCode: 'T1-VIP-03, T1-VIP-04, T1-VIP-05, T1-VIP-06' },
        { id: 's-4', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 3, seatCode: 'T1-VIP-07, T1-VIP-08, T1-VIP-09' },
        { id: 's-5', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 1, seatCode: 'T1-VIP-10' },
        { id: 's-6', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 2, seatCode: 'T1-VIP-11, T1-VIP-12' },
        { id: 's-7', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 1, seatCode: 'T1-VIP-13' },
        { id: 's-8', guestName: 'Chief & Mrs. Babatunde Alabi', phone: '+234 802 345 6789', partySize: 1, seatCode: 'T1-VIP-14' },
      ],
    },
    { id: 'table-2', name: 'Table - 02', tag: 'VIP', capacity: 15, assignedCount: 14, location: 'Main Hall A', reservedSeats: 0, seats: [] },
    { id: 'table-3', name: 'Table - 03', tag: 'Family & Friends', capacity: 15, assignedCount: 14, location: 'Center Pavilion', reservedSeats: 0, seats: [] },
    { id: 'table-4', name: 'Table - 04', tag: 'Family & Friends', capacity: 15, assignedCount: 14, location: 'Center Pavilion', reservedSeats: 0, seats: [] },
    { id: 'table-5', name: 'Table - 05', tag: 'Family & Friends', capacity: 15, assignedCount: 14, location: 'Center Pavilion', reservedSeats: 0, seats: [] },
    { id: 'table-6', name: 'Table - 06', tag: 'Speakers & Partners', capacity: 15, assignedCount: 14, location: 'Stage Left', reservedSeats: 0, seats: [] },
    { id: 'table-7', name: 'Table - 07', tag: 'General', capacity: 15, assignedCount: 14, location: 'Main Hall', reservedSeats: 0, seats: [] },
    { id: 'table-8', name: 'Table - 08', tag: 'Speakers & Partners', capacity: 15, assignedCount: 14, location: 'Stage Right', reservedSeats: 0, seats: [] },
    { id: 'table-9', name: 'Table - 09', tag: 'General', capacity: 15, assignedCount: 14, location: 'Main Hall', reservedSeats: 0, seats: [] },
    { id: 'table-10', name: 'Table - 10', tag: 'General', capacity: 15, assignedCount: 14, location: 'Main Hall', reservedSeats: 0, seats: [] },
  ]);

  // Unassigned Guests list
  const [unassignedGuests, setUnassignedGuests] = React.useState([
    { id: 'u-1', name: 'David Johnson', group: 'Family & Friends' },
    { id: 'u-2', name: 'David Johnson', group: 'Family & Friends' },
  ]);

  const totalCapacitySum = tables.reduce((acc, t) => acc + t.capacity, 0);
  const totalAssignedSum = tables.reduce((acc, t) => acc + t.assignedCount, 0);
  const totalUnassignedCount = unassignedGuests.length;

  const handleCreateSeating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatingName) return;

    const cap = parseInt(totalCapacity) || 10;
    const res = parseInt(reservedSeats) || 0;

    const newTable: SeatingTable = {
      id: `table-${Date.now()}`,
      name: seatingName,
      tag: guestGroup,
      capacity: cap,
      assignedCount: 0,
      location: zone || 'Main Hall',
      reservedSeats: res,
      seats: [],
    };

    setTables((prev) => [...prev, newTable]);
    setIsAddSeatingOpen(false);
    setSeatingName('');
    setZone('');
  };

  const handleAssignUnassigned = (guestId: string, tableId: string) => {
    const guest = unassignedGuests.find((g) => g.id === guestId);
    if (!guest) return;

    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId && t.assignedCount < t.capacity) {
          const seatNum = String(t.seats.length + 1).padStart(2, '0');
          return {
            ...t,
            assignedCount: t.assignedCount + 1,
            seats: [
              ...t.seats,
              {
                id: `seat-${Date.now()}`,
                guestName: guest.name,
                phone: '+234 801 000 0000',
                partySize: 1,
                seatCode: `${t.name.replace(' ', '')}-${seatNum}`,
              },
            ],
          };
        }
        return t;
      })
    );

    setUnassignedGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  return (
      <div className="w-full space-y-6">
        <EventBreadcrumb organizer={organizer} eventId={eventId} current="Seating & Protocol" />
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
                  {totalAssignedSum}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Assigned
                </span>
              </div>
              <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#8C4B24]">
                  {totalUnassignedCount}
                </span>
                <span className="text-xs font-medium text-[#736B66] dark:text-muted-foreground mt-2 block">
                  Unassigned
                </span>
              </div>
            </div>

            {/* Empty State / Add Seating Card matching Figma */}
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
                onClick={() => setIsAddSeatingOpen(true)}
                className="bg-[#241710] hover:bg-[#3D2518] text-white px-6 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-xs transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Seating</span>
              </Button>
            </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tables List (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                {tables.map((tbl) => {
                  const isExpanded = expandedTableId === tbl.id;
                  const availableCount = Math.max(0, tbl.capacity - tbl.assignedCount);

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
                                : 'bg-[#F3F4F6] text-[#374151]'
                            }`}
                          >
                            {tbl.tag}
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

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Open quick add guest
                              setIsAddSeatingOpen(true);
                            }}
                            className="h-8 rounded-xl text-xs gap-1.5 border-[#DED7CC] text-[#241710]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Guest</span>
                          </Button>

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
                                          if (e.target.value !== 'move') {
                                            // Handle move
                                          }
                                        }}
                                      >
                                        <option value="move">Move to... ⌄</option>
                                        {tables
                                          .filter((t) => t.id !== tbl.id)
                                          .map((t) => (
                                            <option key={t.id} value={t.id}>
                                              {t.name}
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
                          {g.group}
                        </div>
                      </div>

                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignUnassigned(g.id, e.target.value);
                          }
                        }}
                        className="bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Assign Seating ⌄
                        </option>
                        {tables.map((t) => (
                          <option key={t.id} value={t.id} className="text-foreground bg-white">
                            {t.name} ({t.capacity - t.assignedCount} left)
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
                Add Seating
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
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="Family & Friends">Family & Friends</option>
                    <option value="Speakers & Partners">Speakers & Partners</option>
                    <option value="General">General</option>
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
                className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs mt-2"
              >
                Save Seating
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
}
