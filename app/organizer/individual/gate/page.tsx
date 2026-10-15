'use client';

import * as React from 'react';
import {
  Plus,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import {
  useAssignRosterGateStaffMutation,
  useAssignGateStaffMutation,
  useGetGateOverviewQuery,
  useInviteGateStaffMutation,
  type GateStaffMember,
} from '@/store/Gate/gateApi';

export default function IndividualGateManagementPage() {
  const { data, isLoading, isError } = useGetGateOverviewQuery();
  const [inviteGateStaff] = useInviteGateStaffMutation();
  const [assignGateStaff] = useAssignGateStaffMutation();
  const [assignAllGateStaff] = useAssignRosterGateStaffMutation();

  const overview = data?.data;
  const staffList = overview?.staff ?? [];
  const eventsList = overview?.events ?? [];
  const ownerCount = overview?.metrics.ownerCount ?? 0;
  const gateStaffCount = overview?.metrics.gateStaffCount ?? 0;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEventFilter, setSelectedEventFilter] = React.useState('all');
  const [selectedStaffIds, setSelectedStaffIds] = React.useState<string[]>([]);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [invitePhone, setInvitePhone] = React.useState('');
  const [inviteEvent, setInviteEvent] = React.useState('');
  const [inviteGate, setInviteGate] = React.useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = React.useState(false);

  // Assign Modal State
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [selectedMemberToAssign, setSelectedMemberToAssign] = React.useState<GateStaffMember | null>(null);
  const [assignEventId, setAssignEventId] = React.useState('');
  const [assignGateNumber, setAssignGateNumber] = React.useState('');

  // Assign All Modal State
  const [isAssignAllOpen, setIsAssignAllOpen] = React.useState(false);
  const [assignAllEventId, setAssignAllEventId] = React.useState('');
  const [assignAllGatePrefix, setAssignAllGatePrefix] = React.useState('Gate');
  const [isSubmittingAssignAll, setIsSubmittingAssignAll] = React.useState(false);

  // View Member Modal State
  const [viewMember, setViewMember] = React.useState<GateStaffMember | null>(null);

  const filteredStaff = React.useMemo(() => {
    const rows = staffList.filter((staff) => {
      const haystack = `${staff.fullName} ${staff.email} ${staff.currentAssignment ?? ''}`.toLowerCase();
      const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
      const matchesEvent =
        selectedEventFilter === 'all' || staff.currentEventId === selectedEventFilter;
      return matchesSearch && matchesEvent;
    });
    return [...rows].sort((a, b) =>
      sortDirection === 'asc'
        ? a.assignedEventsCount - b.assignedEventsCount
        : b.assignedEventsCount - a.assignedEventsCount,
    );
  }, [staffList, searchQuery, selectedEventFilter, sortDirection]);

  const assignableSelectedIds = selectedStaffIds.filter((id) => {
    const member = staffList.find((staff) => staff.id === id);
    return member && !member.isOwner;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStaffIds(filteredStaff.map((s) => s.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    setIsSubmittingInvite(true);

    try {
      const result = await inviteGateStaff({
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim() || undefined,
        role: 'Gate Staff',
        eventId: inviteEvent || undefined,
        gateNumber: inviteGate.trim() || undefined,
      }).unwrap();
      const password = result.data?.temporaryPassword;
      if (password) {
        toast.info(`Temporary password for ${inviteEmail.trim()}: ${password}`);
      }
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
      setInviteEvent('');
      setInviteGate('');
    } catch {
      // The API layer already shows the error toast.
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleOpenAssign = (staff: GateStaffMember) => {
    setSelectedMemberToAssign(staff);
    setAssignEventId(staff.currentEventId || eventsList[0]?.id || '');
    setAssignGateNumber(staff.gateNumber || 'Gate 1');
    setIsAssignOpen(true);
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToAssign || !assignEventId) return;

    try {
      await assignGateStaff({
        staffId: selectedMemberToAssign.id,
        eventId: assignEventId,
        gateNumber: assignGateNumber.trim() || undefined,
      }).unwrap();
      setIsAssignOpen(false);
    } catch {
      // The API layer already shows the error toast.
    }
  };

  const handleConfirmAssignAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAllEventId) return;

    setIsSubmittingAssignAll(true);

    try {
      await assignAllGateStaff({
        eventId: assignAllEventId,
        gatePrefix: assignAllGatePrefix.trim() || 'Gate',
        staffIds: assignableSelectedIds.length > 0 ? assignableSelectedIds : undefined,
      }).unwrap();
      setIsAssignAllOpen(false);
      setSelectedStaffIds([]);
    } catch {
      // The API layer already shows the error toast.
    } finally {
      setIsSubmittingAssignAll(false);
    }
  };

  return (
    <AppShell currentRole="organizer_individual">
      <div className="space-y-6 w-full">
        {/* Top Header Row matching Figma: "Gate Management" & "+ Invite Staff" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F140E] dark:text-[#FBF8F5] tracking-tight">
              Gate Management
            </h1>
            <p className="text-sm text-[#736B66] dark:text-muted-foreground mt-1">
              Manage gate staff and assign them to your events.
            </p>
          </div>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#241710] dark:bg-[#3D2518] hover:bg-[#3D2518] dark:hover:bg-[#4E3020] text-white px-5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Staff</span>
          </Button>
        </div>

        {/* Metric Cards Row matching Figma screenshot (1 Agency Owner / 5 Gate Staff) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Agency Owner */}
          <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="font-serif text-4xl md:text-5xl font-normal text-[#8C4B24]">
              {ownerCount}
            </span>
            <span className="text-sm font-medium text-[#736B66] dark:text-muted-foreground mt-3">
              Agency Owner
            </span>
          </div>

          {/* Card 2: Gate Staff */}
          <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="font-serif text-4xl md:text-5xl font-normal text-[#8C4B24]">
              {gateStaffCount}
            </span>
            <span className="text-sm font-medium text-[#736B66] dark:text-muted-foreground mt-3">
              Gate Staff
            </span>
          </div>
        </div>

        {/* Filter Bar Row: Search input & All Events on Left, Assign All Gate Staff Button on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Controls: Search Bar & Events Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {/* Left Search Bar */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3.5 pr-12 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#8C4B24]/40"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                ⌘ k
              </div>
            </div>

            {/* Events Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#8C4B24]/40 cursor-pointer pr-8"
              >
                <option value="all">All Events</option>
                {eventsList.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Action Button: Assign All Gate Staff */}
          <Button
            type="button"
            disabled={eventsList.length === 0 || gateStaffCount === 0}
            onClick={() => {
              setAssignAllEventId(eventsList[0]?.id || '');
              setIsAssignAllOpen(true);
            }}
            className="bg-[#241710] dark:bg-[#3D2518] hover:bg-[#3D2518] dark:hover:bg-[#4E3020] text-white px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Assign All Gate Staff</span>
          </Button>
        </div>

        {/* Gate Staff Table matching Figma Screenshot */}
        <div className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] dark:bg-muted/40 border-b border-[#EBE3D9] dark:border-border/80 text-[#736B66] dark:text-muted-foreground font-medium">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredStaff.length > 0 &&
                        selectedStaffIds.length === filteredStaff.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-[#DED7CC] text-[#8C4B24] focus:ring-[#8C4B24]"
                    />
                  </th>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                      className="flex items-center gap-1 cursor-pointer select-none"
                    >
                      <span>Assigned Events</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Current Assignment</th>
                  <th className="py-3.5 px-4 text-center w-36">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F2ECE4] dark:divide-border/60">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#736B66]">
                      Loading gate staff…
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#736B66]">
                      Gate staff could not be loaded. Sign in and try again.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#736B66]">
                      No gate staff yet. Invite someone to start the roster.
                    </td>
                  </tr>
                )}
                {filteredStaff.map((staff) => {
                  const isChecked = selectedStaffIds.includes(staff.id);
                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-muted/20 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(staff.id)}
                          className="rounded border-[#DED7CC] text-[#8C4B24] focus:ring-[#8C4B24]"
                        />
                      </td>

                      {/* Staff Member Avatar & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-[#EBE3D9]">
                            {staff.avatarUrl ? (
                              <AvatarImage src={staff.avatarUrl} alt={staff.fullName} />
                            ) : null}
                            <AvatarFallback className="bg-[#FAF6F0] text-[#8C4B24] font-medium text-xs">
                              {staff.fullName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-[#261710] dark:text-foreground">
                              {staff.fullName}
                            </div>
                            <div className="text-[11px] text-[#736B66] dark:text-muted-foreground">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-medium bg-[#FAF8F5] dark:bg-muted border border-[#EBE3D9] dark:border-border text-[#736B66] dark:text-muted-foreground">
                          {staff.role}
                        </span>
                      </td>

                      {/* Assigned Events */}
                      <td className="py-3.5 px-4 text-[#261710] dark:text-foreground font-medium">
                        {staff.assignedEventsCount} {staff.assignedEventsCount === 1 ? 'Event' : 'Events'}
                      </td>

                      {/* Current Assignment */}
                      <td className="py-3.5 px-4">
                        <div className="text-[#261710] dark:text-foreground font-medium truncate max-w-xs">
                          {staff.currentAssignment || 'Not assigned'}
                        </div>
                        {staff.gateNumber && (
                          <div className="text-[10px] text-[#8C4B24] font-medium">
                            {staff.gateNumber}
                          </div>
                        )}
                      </td>

                      {/* Actions: View & Assign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewMember(staff)}
                            className="px-3.5 py-1.5 rounded-xl border border-[#DED7CC] dark:border-border text-[#261710] dark:text-foreground hover:bg-[#FAF8F5] dark:hover:bg-muted text-xs font-semibold transition-colors"
                          >
                            View
                          </button>
                          {!staff.isOwner && (
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(staff)}
                              className="px-4 py-1.5 rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Invite Gate Staff (Screenshots 3 & 4) */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="font-serif text-xl font-bold text-[#261710] dark:text-foreground">
                Invite Gate Staff
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-1">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                  Full Name*
                </Label>
                <Input
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Mensah"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/50 dark:bg-muted/30"
                />
              </div>

              {/* Email Address & Phone Number Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Email Address *
                  </Label>
                  <Input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@mceniesvite.com"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/50 dark:bg-muted/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="e.g. +234 801 234 5678"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/50 dark:bg-muted/30"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                  Role
                </Label>
                <Input
                  disabled
                  value="Gate Staff"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5] dark:bg-muted text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>

              {/* Assign to Event & Assign to Gate Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Assign to Event
                  </Label>
                  <select
                    value={inviteEvent}
                    onChange={(e) => setInviteEvent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-[#FAF8F5]/50 dark:bg-muted/30 text-foreground focus:outline-none"
                  >
                    <option value="">Do not assign yet</option>
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Assign to Gate
                  </Label>
                  <Input
                    value={inviteGate}
                    onChange={(e) => setInviteGate(e.target.value)}
                    placeholder="Write gate name"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-[#FAF8F5]/50 dark:bg-muted/30"
                  />
                </div>
              </div>

              {/* Send Invitation Button */}
              <Button
                type="submit"
                disabled={isSubmittingInvite}
                className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs mt-2"
              >
                {isSubmittingInvite ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Assign Staff to Event */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="font-serif text-xl font-bold text-[#261710] dark:text-foreground">
                Assign Gate Staff
              </DialogTitle>
            </DialogHeader>

            {selectedMemberToAssign && (
              <form onSubmit={handleConfirmAssign} className="space-y-4 pt-1">
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-muted/40 border border-[#EBE3D9] dark:border-border flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-[#EBE3D9]">
                    {selectedMemberToAssign.avatarUrl ? (
                      <AvatarImage src={selectedMemberToAssign.avatarUrl} alt={selectedMemberToAssign.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-[#FAF6F0] text-[#8C4B24] font-medium text-xs">
                      {selectedMemberToAssign.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-xs text-[#261710] dark:text-foreground">
                      {selectedMemberToAssign.fullName}
                    </div>
                    <div className="text-[11px] text-[#736B66] dark:text-muted-foreground">
                      {selectedMemberToAssign.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Target Event
                  </Label>
                  <select
                    value={assignEventId}
                    onChange={(e) => setAssignEventId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card text-foreground focus:outline-none"
                  >
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                    Gate Turnstile / Check-in Post
                  </Label>
                  <Input
                    value={assignGateNumber}
                    onChange={(e) => setAssignGateNumber(e.target.value)}
                    placeholder="e.g. Gate 1, VIP Gate A, Pavilion"
                    className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs"
                >
                  Confirm Assignment
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal: Assign All Gate Staff */}
        <Dialog open={isAssignAllOpen} onOpenChange={setIsAssignAllOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="font-serif text-xl font-bold text-[#261710] dark:text-foreground">
                Assign All Gate Staff
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleConfirmAssignAll} className="space-y-4 pt-1">
              <p className="text-xs text-[#736B66] dark:text-muted-foreground leading-relaxed">
                {assignableSelectedIds.length > 0
                  ? `Assign the ${assignableSelectedIds.length} selected staff members to this event and configure turnstile gate posts.`
                  : `Assign all ${gateStaffCount} gate staff members to this event and configure turnstile gate posts.`}
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                  Target Event*
                </Label>
                <select
                  required
                  value={assignAllEventId}
                  onChange={(e) => setAssignAllEventId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#8C4B24]/40 cursor-pointer"
                >
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#261710] dark:text-foreground">
                  Gate Turnstile / Post Name Prefix
                </Label>
                <Input
                  value={assignAllGatePrefix}
                  onChange={(e) => setAssignAllGatePrefix(e.target.value)}
                  placeholder="e.g. Gate (assigned as Gate 1, Gate 2, etc.)"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmittingAssignAll || !assignAllEventId}
                className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs"
              >
                {isSubmittingAssignAll ? 'Assigning All Staff...' : 'Confirm Bulk Assignment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: View Staff Member Details */}
        <Dialog open={Boolean(viewMember)} onOpenChange={(open) => !open && setViewMember(null)}>
          <DialogContent className="sm:max-w-sm p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-[#261710] dark:text-foreground">
                Staff Member Details
              </DialogTitle>
            </DialogHeader>

            {viewMember && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Avatar className="w-12 h-12 border border-[#EBE3D9]">
                    {viewMember.avatarUrl ? (
                      <AvatarImage src={viewMember.avatarUrl} alt={viewMember.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-[#FAF6F0] text-[#8C4B24] font-medium text-sm">
                      {viewMember.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm text-[#261710] dark:text-foreground">
                      {viewMember.fullName}
                    </div>
                    <div className="text-muted-foreground">{viewMember.email}</div>
                    <div className="text-[#8C4B24] font-medium text-[11px] mt-0.5">
                      {viewMember.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">{viewMember.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned Event:</span>
                    <span className="font-medium text-foreground text-right max-w-[200px] truncate">
                      {viewMember.currentAssignment || 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gate Post:</span>
                    <span className="font-medium text-[#8C4B24]">
                      {viewMember.gateNumber || 'Not assigned'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setViewMember(null)}
                  className="w-full mt-4 bg-[#6E3B1C] hover:bg-[#5C3117] text-white text-xs rounded-xl"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
