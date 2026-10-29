'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, MapPin, Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  deleteSeatingZone,
  getSeatingLayout,
  saveSeatingTable,
  saveSeatingZone,
  type SeatCategory,
  type SeatStatus,
  type SeatingLayout,
  type SeatingTable,
  type SeatingZone,
} from '@/lib/api/venue-tables';

const CATEGORIES: SeatCategory[] = ['VIP', 'Standard', 'Accessible'];
const STATUSES: SeatStatus[] = ['Reserved', 'Available', 'Unavailable'];

export default function VenueTablesPage() {
  const [layout, setLayout] = React.useState<SeatingLayout | null>(null);
  const [spaceId, setSpaceId] = React.useState('');
  const [error, setError] = React.useState('');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [zoneEditor, setZoneEditor] = React.useState<SeatingZone | null | 'new'>(null);
  const [tableEditor, setTableEditor] = React.useState<{ zone: SeatingZone; table: SeatingTable | null } | null>(null);

  const load = React.useCallback((nextSpaceId?: string) => {
    getSeatingLayout(nextSpaceId)
      .then((data) => {
        setLayout(data);
        setError('');
        if (data.hall && !nextSpaceId) setSpaceId(data.hall.id);
        setExpanded((current) => {
          if (Object.keys(current).length) return current;
          const first = data.zones[0]?.id;
          return first ? { [first]: true } : {};
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Seating layout could not be loaded'));
  }, []);

  React.useEffect(() => {
    load(spaceId || undefined);
  }, [load, spaceId]);

  const zones = layout?.zones ?? [];
  const total = layout?.totalSeats ?? 0;
  const available = layout?.availableSeats ?? 0;
  const reserved = layout?.reservedSeats ?? 0;
  const unavailable = layout?.unavailableSeats ?? 0;
  const pct = (value: number) => (total ? Math.round((value / total) * 100) : 0);

  const exportLayout = () => {
    const rows = [['Zone', 'Category', 'Table', 'Seats', 'Seat type', 'Status']];
    zones.forEach((zone) => {
      zone.tables.forEach((table) => {
        rows.push([zone.name, zone.category, table.tableNumber, String(table.seats), table.category, table.status]);
      });
    });
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layout?.hall?.name || 'seating'}-layout.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              {layout?.hall ? `${layout.hall.name} Seating Layout` : 'Seating Layout'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7A6B] flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{layout?.hall?.address || 'Add a venue before arranging tables'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {(layout?.spaces.length ?? 0) > 1 && (
              <select
                value={spaceId}
                onChange={(event) => setSpaceId(event.target.value)}
                className="h-9 rounded-xl border border-[#E5E0D8] bg-white px-3 text-xs"
              >
                {layout?.spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
              </select>
            )}
            <button type="button" onClick={exportLayout} className="inline-flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#1F140E]">
              <Download className="h-3.5 w-3.5 text-[#6E3B1C]" /> Export Layout
            </button>
            <button
              type="button"
              disabled={!layout?.hall}
              onClick={() => setZoneEditor('new')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F140E] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Zone
            </button>
          </div>
        </div>

        {error && <p className="rounded-xl border border-[#F5D0A9] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat value={total} label="Total Seats" hint="Configured capacity" />
          <Stat value={available} label="Available" hint="Open for reservation" tone="green" />
          <Stat value={reserved} label="Reserved" hint="Confirmed attendee seats" tone="amber" />
          <Stat value={unavailable} label="Unavailable" hint="Out of service" />
        </div>

        <div className="space-y-4 rounded-2xl border border-[#EFECE6] bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1F140E]">Capacity Overview</h3>
            <span className="text-xs font-semibold text-[#1F140E]">{total} total configured seats</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#EFECE6]">
            <div className="h-full bg-emerald-500" style={{ width: `${pct(available)}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${pct(reserved)}%` }} />
            <div className="h-full bg-[#D4CFC7]" style={{ width: `${pct(unavailable)}%` }} />
          </div>
          <div className="flex flex-wrap gap-6 text-xs">
            <Legend color="bg-emerald-500" label="Available" value={available} percent={pct(available)} />
            <Legend color="bg-amber-500" label="Reserved" value={reserved} percent={pct(reserved)} />
            <Legend color="bg-[#D4CFC7]" label="Unavailable" value={unavailable} percent={pct(unavailable)} />
          </div>
        </div>

        {!layout?.hall && !error && <p className="text-sm text-[#8C7A6B]">Create a venue first, then add seating zones here.</p>}
        {layout?.hall && zones.length === 0 && <p className="text-sm text-[#8C7A6B]">No zones yet. Add a zone to start placing tables.</p>}

        <div className="space-y-5">
          {zones.map((zone) => {
            const open = expanded[zone.id] !== false && (expanded[zone.id] || zones[0]?.id === zone.id);
            return (
              <section key={zone.id} className="overflow-hidden rounded-2xl border border-[#EFECE6] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F1EB] bg-[#FAF8F5]/30 p-5">
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [zone.id]: !open }))} className="flex items-center gap-3 text-left">
                    {open ? <ChevronUp className="h-4 w-4 text-[#8C7A6B]" /> : <ChevronDown className="h-4 w-4 text-[#8C7A6B]" />}
                    <span>
                      <span className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-[#1F140E]">Zone: {zone.name}</span>
                        <CategoryBadge category={zone.category} />
                      </span>
                      <span className="mt-0.5 block text-xs text-[#8C7A6B]">{zone.tableCount} tables · {zone.totalSeats} seats · {zone.availableSeats} available</span>
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button type="button" title="Edit Zone" onClick={() => setZoneEditor(zone)} className="rounded-lg p-1.5 text-[#8C7A6B] hover:bg-[#FAF8F5]">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Zone"
                      onClick={() => {
                        if (!window.confirm(`Delete the ${zone.name} zone?`)) return;
                        deleteSeatingZone(zone.id).then(setLayout).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not delete the zone'));
                      }}
                      className="rounded-lg p-1.5 text-[#8C7A6B] hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {zone.tables.map((table) => (
                        <div key={table.id} className="flex flex-col justify-between space-y-3 rounded-xl border border-[#E8E4DD] bg-white p-4">
                          <button type="button" onClick={() => setTableEditor({ zone, table })} className="flex items-center justify-between text-left">
                            <span className="text-base font-bold text-[#1F140E]">{table.tableNumber}</span>
                            <CategoryBadge category={table.category} />
                          </button>
                          <p className="text-xs text-[#8C7A6B]">{table.seats} seats</p>
                          <select
                            value={table.status}
                            onChange={(event) => {
                              const status = event.target.value as SeatStatus;
                              saveSeatingTable(zone.id, {
                                tableId: table.id,
                                name: table.tableNumber,
                                seats: table.seats,
                                seatType: table.category,
                                status,
                              }).then(setLayout).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not update the table'));
                            }}
                            className={`w-full cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                              table.status === 'Reserved' ? 'border-amber-200 bg-amber-50 text-amber-800' : table.status === 'Available' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-zinc-200 bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {STATUSES.map((status) => <option key={status} value={status}>● {status}</option>)}
                          </select>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setTableEditor({ zone, table: null })}
                        className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4CFC7] bg-[#FAF8F5]/40"
                      >
                        <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full border bg-white text-[#6E3B1C]"><Plus className="h-4 w-4" /></span>
                        <span className="text-xs font-semibold text-[#1F140E]">Add Table</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <ZoneDialog
        open={zoneEditor !== null}
        zone={zoneEditor === 'new' ? null : zoneEditor}
        spaceId={layout?.hall?.id || ''}
        onClose={() => setZoneEditor(null)}
        onSaved={(next) => {
          setLayout(next);
          setZoneEditor(null);
        }}
      />
      <TableDialog
        editor={tableEditor}
        onClose={() => setTableEditor(null)}
        onSaved={(next) => {
          setLayout(next);
          setTableEditor(null);
        }}
      />
    </AppShell>
  );
}

function Stat({ value, label, hint, tone }: { value: number; label: string; hint: string; tone?: 'green' | 'amber' }) {
  const color = tone === 'green' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-[#1F140E]';
  return (
    <div className="rounded-2xl border border-[#EFECE6] bg-white p-5">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <p className="mt-2 text-sm font-semibold text-[#1F140E]">{label}</p>
      <p className={`text-xs ${tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-[#8C7A6B]'}`}>{hint}</p>
    </div>
  );
}

function Legend({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-medium text-[#1F140E]">{label}: {value}</span>
      <span className="text-[#8C7A6B]">({percent}%)</span>
    </div>
  );
}

function CategoryBadge({ category }: { category: SeatCategory }) {
  const tone = category === 'VIP' ? 'bg-[#FAF4EF] text-[#6E3B1C]' : category === 'Accessible' ? 'bg-blue-50 text-blue-700' : 'bg-[#F4F4F5] text-[#52525B]';
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{category}</span>;
}

function ZoneDialog({
  open,
  zone,
  spaceId,
  onClose,
  onSaved,
}: {
  open: boolean;
  zone: SeatingZone | null;
  spaceId: string;
  onClose: () => void;
  onSaved: (layout: SeatingLayout) => void;
}) {
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<SeatCategory>('VIP');
  const [formError, setFormError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(zone?.name ?? '');
    setCategory(zone?.category ?? 'VIP');
    setFormError('');
  }, [open, zone]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader><DialogTitle>{zone ? 'Edit Zone' : 'Add Zone'}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            saveSeatingZone({ name: name.trim(), category, spaceId }, zone?.id)
              .then(onSaved)
              .catch((err: unknown) => setFormError(err instanceof Error ? err.message : 'Could not save the zone'))
              .finally(() => setSaving(false));
          }}
        >
          <div className="space-y-1.5">
            <Label>Zone name *</Label>
            <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Stage Front" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <select value={category} onChange={(event) => setCategory(event.target.value as SeatCategory)} className="h-10 w-full rounded-xl border px-3 text-sm">
              {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !spaceId} className="rounded-xl bg-[#6E3B1C] text-white hover:bg-[#5C3117]">{saving ? 'Saving...' : zone ? 'Save Zone' : 'Add Zone'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TableDialog({
  editor,
  onClose,
  onSaved,
}: {
  editor: { zone: SeatingZone; table: SeatingTable | null } | null;
  onClose: () => void;
  onSaved: (layout: SeatingLayout) => void;
}) {
  const [name, setName] = React.useState('');
  const [seats, setSeats] = React.useState('10');
  const [seatType, setSeatType] = React.useState<SeatCategory>('VIP');
  const [status, setStatus] = React.useState<SeatStatus>('Available');
  const [formError, setFormError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;
    setName(editor.table?.tableNumber ?? '');
    setSeats(String(editor.table?.seats ?? 10));
    setSeatType(editor.table?.category ?? editor.zone.category);
    setStatus(editor.table?.status ?? 'Available');
    setFormError('');
  }, [editor]);

  return (
    <Dialog open={Boolean(editor)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader><DialogTitle>{editor?.table ? 'Edit Table' : 'Add Table'}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!editor) return;
            setSaving(true);
            saveSeatingTable(editor.zone.id, {
              tableId: editor.table?.id,
              name: name.trim(),
              seats: Number(seats) || 1,
              seatType,
              status,
            }).then(onSaved)
              .catch((err: unknown) => setFormError(err instanceof Error ? err.message : 'Could not save the table'))
              .finally(() => setSaving(false));
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Table Name / Number</Label>
              <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="T1" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Seats</Label>
              <Input required type="number" min={1} value={seats} onChange={(event) => setSeats(event.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Seat Type</Label>
              <select value={seatType} onChange={(event) => setSeatType(event.target.value as SeatCategory)} className="h-10 w-full rounded-xl border px-3 text-sm">
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={status} onChange={(event) => setStatus(event.target.value as SeatStatus)} className="h-10 w-full rounded-xl border px-3 text-sm">
                {STATUSES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-[#6E3B1C] text-white hover:bg-[#5C3117]">{saving ? 'Saving...' : 'Save Table'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
