'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit2, Armchair, MapPin, ImagePlus } from 'lucide-react';
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
  createVenueSpace,
  getVenueSpaces,
  updateVenueSpace,
  type VenueSpaceCard,
  type VenueSpaceInput,
  type VenueSpacesResponse,
} from '@/lib/api/venue-spaces';

const SPACE_TYPES = [
  { value: 'BALLROOM', label: 'Ballroom' },
  { value: 'AUDITORIUM', label: 'Auditorium' },
  { value: 'TERRACE', label: 'Terrace' },
  { value: 'BOARDROOM', label: 'Boardroom' },
  { value: 'EXHIBITION_HALL', label: 'Exhibition Hall' },
  { value: 'BANQUET_HALL', label: 'Banquet Hall' },
  { value: 'ROOFTOP', label: 'Rooftop' },
];

const STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'CLOSED', label: 'Closed' },
];

const FALLBACK_IMAGE = '/images/banner.png';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {positive ? '+ ' : ''}{value}%
    </span>
  );
}

export default function VenueSpacesPage() {
  const [data, setData] = React.useState<VenueSpacesResponse | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [editing, setEditing] = React.useState<VenueSpaceCard | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    getVenueSpaces()
      .then((next) => {
        setData(next);
        setError('');
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Venue spaces could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const spaces = data?.spaces ?? [];
  const filtered = spaces.filter((space) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query
      || space.name.toLowerCase().includes(query)
      || space.address.toLowerCase().includes(query)
      || space.type.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || space.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const metrics = data?.metrics;

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venues & Spaces
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Manage your venues, spaces, availability, and seating.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Venue</span>
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-[#F5D0A9] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Total Venues" hint="Active spaces" value={metrics?.totalVenues ?? 0} change={metrics?.venuesChange ?? null} />
          <Metric label="Total Spaces" hint="Configured areas" value={metrics?.totalSpaces ?? 0} />
          <Metric label="Available Now" hint="Open for booking" value={metrics?.available ?? 0} />
          <Metric label="Currently Occupied" hint="In active use" value={metrics?.occupied ?? 0} />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] text-[#1F140E] placeholder:text-[#8C7A6B]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white text-[#1F140E]"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-[#8C7A6B] md:col-span-2">No venues yet. Add the first space to start taking bookings.</p>
          )}
          {filtered.map((space) => (
            <article key={space.id} className="rounded-2xl bg-white border border-[#EFECE6] shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-48 w-full relative overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={space.imageUrl || FALLBACK_IMAGE} alt={space.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full text-white ${space.status === 'Occupied' ? 'bg-[#1F140E]/90' : 'bg-emerald-600/90'}`}>
                      {space.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-[#1F140E]">{space.name}</h3>
                      <p className="text-xs text-[#8C7A6B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{space.address || 'Address not set'}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C] border border-[#F2E5D7]">
                      {space.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8C7A6B]">
                    <span><strong className="text-[#1F140E]">{space.capacity}</strong> cap.</span>
                    <span><strong className="text-[#1F140E]">{space.spacesCount}</strong> spaces</span>
                    <span className="font-medium text-[#1F140E]">{space.utilization}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div className="h-full rounded-full bg-[#6E3B1C]" style={{ width: `${space.utilization}%` }} />
                  </div>
                  {space.nextBooking && (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8C7A6B] font-medium">Next booking:</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {space.nextBooking.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1F140E] truncate">{space.nextBooking.event}</p>
                      <p className="text-[11px] text-[#8C7A6B]">{formatWhen(space.nextBooking.startDate)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 pt-3 grid grid-cols-3 gap-2 border-t border-[#F4F1EB]">
                <Link href={`/organizer/venue/spaces/${space.id}`} className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-[#FAF8F5] text-[#1F140E] text-xs font-semibold border border-[#EFECE6]">
                  <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" /> View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(space);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-[#FAF8F5] text-[#1F140E] text-xs font-semibold border border-[#EFECE6]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8C7A6B]" /> Edit
                </button>
                <Link href="/organizer/venue/tables" className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-[#FAF8F5] text-[#1F140E] text-xs font-semibold border border-[#EFECE6]">
                  <Armchair className="w-3.5 h-3.5 text-[#8C7A6B]" /> Seating
                </Link>
              </div>
            </article>
          ))}
          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-[#D4CFC7] bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] p-8 flex flex-col items-center justify-center text-center min-h-[380px]"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-[#E5E0D8] text-[#6E3B1C] flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#1F140E]">Add New Venue</h4>
            <p className="text-xs text-[#8C7A6B] max-w-[200px] mt-1">Create a new venue profile and configure spaces.</p>
          </button>
        </div>
      </div>

      <SpaceFormDialog
        open={isFormOpen}
        space={editing}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          setIsFormOpen(false);
          load();
        }}
      />
    </AppShell>
  );
}

function Metric({ label, hint, value, change = null }: { label: string; hint: string; value: number; change?: number | null }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-[#1F140E]">{value}</span>
        <ChangeBadge value={change} />
      </div>
      <p className="text-sm font-semibold text-[#1F140E] mt-2">{label}</p>
      <p className="text-xs text-[#8C7A6B]">{hint}</p>
    </div>
  );
}

function SpaceFormDialog({
  open,
  space,
  onClose,
  onSaved,
}: {
  open: boolean;
  space: VenueSpaceCard | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('BALLROOM');
  const [address, setAddress] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [capacity, setCapacity] = React.useState('100');
  const [status, setStatus] = React.useState('AVAILABLE');
  const [imageUrl, setImageUrl] = React.useState('');
  const [amenity, setAmenity] = React.useState('');
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [formError, setFormError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(space?.name ?? '');
    setType(space?.typeValue ?? 'BALLROOM');
    setAddress(space?.address ?? '');
    setDescription(space?.description ?? '');
    setCapacity(String(space?.capacity ?? 100));
    setStatus(space?.statusValue ?? 'AVAILABLE');
    setImageUrl(space?.imageUrl ?? '');
    setAmenities(space?.amenities ?? []);
    setAmenity('');
    setFormError('');
  }, [open, space]);

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 700 * 1024) {
      setFormError('Cover image must be under 700KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormError('');
      setImageUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: VenueSpaceInput = {
      name: name.trim(),
      type,
      capacity: Number(capacity) || 1,
      address: address.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      status,
      amenities,
    };
    setSaving(true);
    setFormError('');
    try {
      if (space) await updateVenueSpace(space.id, payload);
      else await createVenueSpace(payload);
      onSaved();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this venue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{space ? 'Edit Venue' : 'Add Venue'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venue Name *">
              <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Crystal Hall" className="rounded-xl" />
            </Field>
            <Field label="Venue Type *">
              <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {SPACE_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Location / Address *">
            <Input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="e.g. 1 Eko Hotel Drive, Victoria Island, Lagos" className="rounded-xl" />
          </Field>
          <Field label="Description *">
            <textarea
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Brief description of the venue..."
              className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Total Capacity *">
              <Input required type="number" min={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} className="rounded-xl" />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Cover Image (optional)">
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium">
                <ImagePlus className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              <Input value={imageUrl.startsWith('data:') ? 'Image selected' : imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="or paste an image URL" className="rounded-xl" />
            </div>
          </Field>
          <Field label="Amenities">
            <div className="flex gap-2">
              <Input value={amenity} onChange={(event) => setAmenity(event.target.value)} placeholder="e.g. AV System" className="rounded-xl" />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  const next = amenity.trim();
                  if (!next || amenities.includes(next)) return;
                  setAmenities((current) => [...current, next]);
                  setAmenity('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {amenities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAmenities((current) => current.filter((entry) => entry !== item))}
                  className="rounded-full bg-[#FAF4EF] px-3 py-1 text-xs text-[#6E3B1C]"
                >
                  {item} ×
                </button>
              ))}
            </div>
          </Field>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-[#6E3B1C] text-white hover:bg-[#5C3117]">
              {saving ? 'Saving...' : space ? 'Save Changes' : 'Create Venue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
