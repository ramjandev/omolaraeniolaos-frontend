"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileSpreadsheet, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guestEntrySchema, type GuestEntryValues } from "@/lib/validations/eventWizardSchemas";
import {
  GUEST_GROUPS,
  type WizardGuest,
} from "@/store/eventSlice/eventSlice";
import { parseGuestCsv } from "./shared/guest-csv";

export const SAMPLE_GUEST_CSV = "/samples/guest-list-sample.csv";

const fieldClass =
  "h-11 text-xs rounded-xl bg-card border-[#EBE3D9] dark:border-border";

function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function toGuest(values: GuestEntryValues, index = 0): WizardGuest {
  return {
    id: `guest-${Date.now()}-${index}`,
    name: values.name,
    email: "",
    phone: values.phone,
    group: values.group,
    rsvpStatus: "Not Sent",
    invitationStatus: "Not Sent",
    partySize: 1,
    preference: "--",
  };
}

interface GuestListManagerProps {
  guests: WizardGuest[];
  capacity: number;
  eventName: string;
  onChange: (guests: WizardGuest[]) => void;
}

export function GuestListManager({
  guests,
  capacity,
  eventName,
  onChange,
}: GuestListManagerProps) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<
    "All" | "Accepted" | "Declined" | "Pending" | "Not Sent"
  >("All");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [csvError, setCsvError] = React.useState("");
  const [csvFileName, setCsvFileName] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<GuestEntryValues>({
    resolver: zodResolver(guestEntrySchema),
    defaultValues: { name: "", group: "Family & Friend", phone: "" },
  });

  const filtered = guests.filter((guest) => {
    const matchesFilter = filter === "All" || guest.rsvpStatus === filter;
    const query = search.trim().toLowerCase();
    if (!query) return matchesFilter;
    return (
      matchesFilter &&
      (guest.name.toLowerCase().includes(query) ||
        guest.phone.includes(query) ||
        guest.group.toLowerCase().includes(query))
    );
  });

  const appendGuests = (incoming: WizardGuest[]) => {
    const room = capacity - guests.length;
    if (room <= 0) {
      toast.error(`This event already has ${capacity} guests.`);
      return { added: 0, duplicates: 0, overflow: incoming.length };
    }
    const existing = new Set(guests.map((guest) => phoneDigits(guest.phone)));
    const accepted: WizardGuest[] = [];
    let duplicates = 0;
    for (const guest of incoming) {
      if (accepted.length >= room) break;
      const digits = phoneDigits(guest.phone);
      if (!digits || existing.has(digits)) {
        duplicates += 1;
        continue;
      }
      existing.add(digits);
      accepted.push(guest);
    }
    if (accepted.length > 0) onChange([...guests, ...accepted]);
    return {
      added: accepted.length,
      duplicates,
      overflow: Math.max(0, incoming.length - duplicates - accepted.length),
    };
  };

  const visibleIds = filtered.map((guest) => guest.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [selectedVisibleCount, allVisibleSelected]);

  React.useEffect(() => {
    const liveIds = new Set(guests.map((guest) => guest.id));
    setSelectedIds((current) => {
      const next = current.filter((id) => liveIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [guests]);

  const openAdd = () => {
    setEditingId(null);
    form.reset({ name: "", group: "Family & Friend", phone: "" });
    setAddOpen(true);
  };

  const openEdit = (guest: WizardGuest) => {
    const group = (GUEST_GROUPS as readonly string[]).includes(guest.group)
      ? (guest.group as GuestEntryValues["group"])
      : "General";
    setEditingId(guest.id);
    form.reset({ name: guest.name, group, phone: guest.phone });
    setAddOpen(true);
  };

  const toggleGuest = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return [...new Set([...current, ...visibleIds])];
    });
  };

  const removeGuests = (ids: string[]) => {
    if (ids.length === 0) return;
    const removed = guests.filter((guest) => ids.includes(guest.id));
    onChange(guests.filter((guest) => !ids.includes(guest.id)));
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    toast.success(
      removed.length === 1
        ? `${removed[0]?.name ?? "Guest"} removed.`
        : `${removed.length} guests removed.`,
    );
  };

  const submitManual = form.handleSubmit((values) => {
    const duplicate = guests.some(
      (guest) => guest.id !== editingId && phoneDigits(guest.phone) === phoneDigits(values.phone),
    );
    if (duplicate) {
      form.setError("phone", { message: "A guest with this phone number is already on the list." });
      return;
    }
    if (editingId) {
      onChange(
        guests.map((guest) =>
          guest.id === editingId
            ? { ...guest, name: values.name, phone: values.phone, group: values.group }
            : guest,
        ),
      );
      toast.success(`${values.name} updated.`);
    } else {
      const result = appendGuests([toGuest(values)]);
      if (result.added === 0) return;
      toast.success(`${values.name} added to the guest list.`);
    }
    form.reset({ name: "", group: "Family & Friend", phone: "" });
    window.setTimeout(() => {
      setEditingId(null);
      setAddOpen(false);
    }, 0);
  });

  const importCsvText = (text: string, fileName: string) => {
    const { guests: parsed, skipped, shortenedPhones } = parseGuestCsv(text);
    if (parsed.length === 0) {
      setCsvError(
        shortenedPhones
          ? "Excel turned the WhatsApp numbers into scientific notation (2.35E+12). Put spaces in the number, for example +234 801 234 5678, then upload again."
          : 'No guests found. Use columns "Guest Name" and "WhatsApp Phone Number", or download the sample file.',
      );
      return;
    }
    const result = appendGuests(
      parsed.map((guest, index) => ({
        id: `csv-${Date.now()}-${index}`,
        name: guest.name,
        email: guest.email ?? "",
        phone: guest.phone,
        group: guest.type || "General",
        rsvpStatus: (guest.rsvpStatus as WizardGuest["rsvpStatus"]) || "Not Sent",
        invitationStatus: "Not Sent" as const,
        partySize: 1,
        preference: "--",
      })),
    );
    const notes = [
      result.added > 0 ? `${result.added} guest${result.added === 1 ? "" : "s"} imported from ${fileName}.` : "",
      skipped ? `${skipped} row(s) skipped because the name or phone was missing.` : "",
      shortenedPhones
        ? `${shortenedPhones} number(s) were shortened by Excel (2.35E+12). Write them as +234 801 234 5678.`
        : "",
      result.duplicates ? `${result.duplicates} duplicate phone number(s) skipped.` : "",
      result.overflow ? `${result.overflow} guest(s) left out because the list is full (${capacity}).` : "",
    ].filter(Boolean);
    if (result.added === 0) {
      setCsvError(notes.join(" ") || "None of those rows could be added.");
      return;
    }
    setCsvError("");
    setCsvFileName("");
    setUploadOpen(false);
    toast.success(notes[0]);
    if (notes.length > 1) toast.info(notes.slice(1).join(" "));
  };

  const readCsvFile = async (file: File) => {
    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";
    if (!isCsv) {
      setCsvError("Upload a .csv file. Download the sample if you need the column layout.");
      return;
    }
    if (file.size > 2_000_000) {
      setCsvError("That file is too large. Keep the guest list under 2 MB.");
      return;
    }
    setCsvFileName(file.name);
    setCsvError("");
    importCsvText(await file.text(), file.name);
  };

  const errorText = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-[#B33927]">{message}</p> : null;

  return (
    <>
      <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card p-6 md:p-8 shadow-2xs space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1F140E] dark:text-foreground">
            Add Your Guests
          </h2>
          <p className="text-xs text-[#736B66] dark:text-muted-foreground">
            How would you like to build your guest list?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border border-[#EBE3D9] bg-[#FAF8F5] dark:bg-card/60 flex flex-col items-center justify-between text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FCEDE6] text-[#6E3B1C] flex items-center justify-center text-2xl">
              👥
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-foreground">Add Manually</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Perfect for small events or adding a few VIPs one by one.
              </p>
            </div>
            <Button
              type="button"
              onClick={openAdd}
              variant="outline"
              className="w-full max-w-xs h-11 text-xs rounded-xl border-[#EBE3D9] hover:bg-card text-foreground font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Guest
            </Button>
          </div>

          <div className="p-8 rounded-3xl border border-[#EBE3D9] bg-[#FAF8F5] dark:bg-card/60 flex flex-col items-center justify-between text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-2xl font-bold">
              📊
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-foreground">Import from Spreadsheet</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload a CSV file to add multiple guests instantly.
              </p>
              <a
                href={SAMPLE_GUEST_CSV}
                download="guest-list-sample.csv"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E3B1C] hover:underline"
              >
                <Download className="w-3 h-3" />
                Download sample CSV
              </a>
            </div>
            <Button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="w-full max-w-xs h-11 text-xs rounded-xl bg-[#241710] hover:bg-[#38261C] text-white font-semibold"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload File
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card shadow-2xs overflow-hidden">
        <div className="p-4 md:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="h-10 pl-9 pr-12 text-xs rounded-xl bg-card border-[#EBE3D9]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border px-1.5 py-0.5 rounded-md font-mono">
              ⌘ k
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeGuests(selectedIds)}
                className="h-8 px-3 text-xs rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete {selectedIds.length}
              </Button>
            )}
            {(["All", "Accepted", "Declined", "Pending", "Not Sent"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === status
                    ? "bg-[#241710] text-white"
                    : "bg-card border border-[#EBE3D9] text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-muted/40 border-y border-[#EBE3D9] dark:border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="rounded"
                    checked={allVisibleSelected}
                    onChange={toggleVisible}
                    aria-label="Select all guests"
                    disabled={visibleIds.length === 0}
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-foreground">Guest &amp; Contact</th>
                <th className="py-3 px-4 font-semibold text-foreground">Invitation Status</th>
                <th className="py-3 px-4 font-semibold text-foreground">RSVP Status</th>
                <th className="py-3 px-4 text-right font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground space-y-3">
                    <div className="text-3xl">👥</div>
                    <p className="text-xs">
                      {guests.length === 0
                        ? "No guest yet. Create your first guest to start tracking RSVP"
                        : "No guests match this search or filter."}
                    </p>
                    {guests.length === 0 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={openAdd}
                        className="bg-[#241710] text-white rounded-xl text-xs"
                      >
                        + Add Guest
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr key={guest.id} className="hover:bg-[#FAF7F2]/50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedIds.includes(guest.id)}
                        onChange={() => toggleGuest(guest.id)}
                        aria-label={`Select ${guest.name}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{guest.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{guest.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-muted-foreground">{guest.invitationStatus}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-medium rounded-md px-2.5 py-0.5 ${
                          guest.rsvpStatus === "Accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : guest.rsvpStatus === "Declined"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {guest.rsvpStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(guest)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                          aria-label={`Edit ${guest.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGuests([guest.id])}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg"
                          aria-label={`Remove ${guest.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif font-bold text-lg text-foreground">
                {editingId ? "Edit Guest" : "Add Event Guests"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                McEniesVite • {eventName || "Untitled Event"}
              </DialogDescription>
            </div>
            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#FAF0E6] text-[#B87333] border border-[#B87333]/20">
              {guests.length} of {capacity} added
            </span>
          </div>

          <form onSubmit={submitManual} className="space-y-4 pt-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="guest-name" className="text-xs font-semibold">
                Guest Name
              </Label>
              <Input id="guest-name" placeholder="guest name" className={fieldClass} {...form.register("name")} />
              {errorText(form.formState.errors.name?.message)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="guest-group" className="text-xs font-semibold">
                  Guest Group
                </Label>
                <select
                  id="guest-group"
                  className="w-full h-11 px-3 rounded-xl bg-card border border-[#EBE3D9] text-xs text-foreground"
                  {...form.register("group")}
                >
                  {GUEST_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {errorText(form.formState.errors.group?.message)}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guest-phone" className="text-xs font-semibold">
                  WhatsApp Phone Number
                </Label>
                <Input
                  id="guest-phone"
                  placeholder="+234 801 234 5678"
                  className={fieldClass}
                  {...form.register("phone")}
                />
                {errorText(form.formState.errors.phone?.message)}
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-xs font-semibold bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl shadow-xs">
              {editingId ? "Save Changes" : "Add Guest"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) {
            setCsvError("");
            setCsvFileName("");
            setDragOver(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6E3B1C]/10 text-[#6E3B1C] mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-foreground">Import from Spreadsheet</DialogTitle>
            <DialogDescription className="text-left text-xs leading-relaxed text-muted-foreground space-y-1.5">
              <span className="block">
                <span className="font-semibold text-foreground">Required. </span>
                Guest Name, Guest Group, and WhatsApp Phone Number.
              </span>
              <span className="block">
                <span className="font-semibold text-foreground">Optional. </span>
                Email. Leave it blank when you do not have one. Party size and preference are chosen by the guest.
              </span>
              <span className="block">
                <span className="font-semibold text-foreground">Phone. </span>
                Country code, then the number, for example +234 801 234 5678. +234 is Nigeria, not the only code. Do not add quotation marks. Extra spaces are removed.
              </span>
              <span className="block pt-1">
                {guests.length} of {capacity} guests added.
              </span>
            </DialogDescription>
          </DialogHeader>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void readCsvFile(file);
            }}
          />
          <div
            onClick={() => csvInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void readCsvFile(file);
            }}
            className={`p-8 border-2 border-dashed rounded-2xl bg-muted/20 space-y-2 cursor-pointer transition-colors ${
              dragOver ? "border-[#6E3B1C] bg-[#6E3B1C]/5" : "border-[#EBE3D9] hover:border-[#6E3B1C]"
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs font-semibold text-foreground">{csvFileName || "Click to upload or drag & drop"}</p>
            <p className="text-[11px] text-muted-foreground">CSV file, up to 5,000 rows</p>
          </div>
          {csvError && <p className="text-xs text-[#B33927]">{csvError}</p>}
          <a
            href={SAMPLE_GUEST_CSV}
            download="guest-list-sample.csv"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#6E3B1C] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            Download sample CSV
          </a>
          <DialogFooter className="flex justify-between sm:justify-between pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setUploadOpen(false)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => csvInputRef.current?.click()}
              className="text-xs rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
