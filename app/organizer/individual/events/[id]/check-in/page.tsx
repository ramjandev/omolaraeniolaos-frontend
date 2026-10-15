'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Plus,
  ArrowRight,
  X,
  ChevronDown,
  RotateCw,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useParams } from 'next/navigation';
import {
  getEventCheckInMonitor,
  resolveCheckInFlag,
  assignAllGateStaff,
} from '@/lib/api/individual-events';

interface CheckInFeedItem {
  id: string;
  name: string;
  time: string;
  gate: string;
  staff: string;
  device: string;
  status: 'Checked in' | 'VIP arrival' | 'Offline-synced';
}

interface FlaggedItem {
  id: string;
  guestName: string;
  reason: string;
  time: string;
  gate: string;
  staff: string;
  recommendation: string;
  status: 'open' | 'resolved';
}

interface GateStaffItem {
  id: string;
  name: string;
  role: string;
  gate: string;
  device: string;
  isOnline: boolean;
  syncStatus: string;
}

const INITIAL_FEED: CheckInFeedItem[] = [
  {
    id: 'f-1',
    name: 'Chief Adebayo Okafor',
    time: 'Today • 19:46:12 WAT',
    gate: 'North Gate',
    staff: 'Amara Eze',
    device: 'iPhone 15',
    status: 'Checked in',
  },
  {
    id: 'f-2',
    name: 'Princess Zainab Bello',
    time: 'Today • 19:44:58 WAT',
    gate: 'VIP Gate',
    staff: 'Tunde Afolayan',
    device: 'iPad Air',
    status: 'VIP arrival',
  },
  {
    id: 'f-3',
    name: 'Dr. Ifeanyi Nwosu',
    time: 'Today • 19:42:31 WAT',
    gate: 'East Gate',
    staff: 'Kemi Adeyemi',
    device: 'Pixel 8',
    status: 'Offline-synced',
  },
  {
    id: 'f-4',
    name: 'Mrs. Funmi Bakare',
    time: 'Today • 19:40:09 WAT',
    gate: 'North Gate',
    staff: 'Amara Eze',
    device: 'iPhone 15',
    status: 'Checked in',
  },
  {
    id: 'f-5',
    name: 'Mr. & Mrs. Chuka Obi',
    time: 'Today • 19:38:44 WAT',
    gate: 'VIP Gate',
    staff: 'Tunde Afolayan',
    device: 'iPad Air',
    status: 'Checked in',
  },
  {
    id: 'f-6',
    name: 'Alhaji Musa Lawal',
    time: 'Today • 19:36:17 WAT',
    gate: 'East Gate',
    staff: 'Kemi Adeyemi',
    device: 'Pixel 8',
    status: 'Offline-synced',
  },
];

const INITIAL_FLAGGED: FlaggedItem[] = [
  {
    id: 'fl-1',
    guestName: 'Lady Ngozi Ekanem',
    reason: 'Invitation name differs from ID',
    time: '19:43',
    gate: 'North Gate',
    staff: 'Amara Eze',
    recommendation: 'Staff recommends entry',
    status: 'open',
  },
  {
    id: 'fl-2',
    guestName: 'Prince Kayode Adisa',
    reason: 'QR code already used at East Gate',
    time: '19:39',
    gate: 'VIP Gate',
    staff: 'Tunde Afolayan',
    recommendation: 'Staff is holding guest',
    status: 'open',
  },
];

const INITIAL_STAFF: GateStaffItem[] = [
  {
    id: 's-1',
    name: 'Amara Eze',
    role: 'Lead',
    gate: 'North Gate',
    device: 'iPhone 15',
    isOnline: true,
    syncStatus: 'Online • synced now',
  },
  {
    id: 's-2',
    name: 'Tunde Afolayan',
    role: 'VIP Host',
    gate: 'VIP Gate',
    device: 'iPad Air',
    isOnline: true,
    syncStatus: 'Online • synced 6s',
  },
  {
    id: 's-3',
    name: 'Kemi Adeyemi',
    role: 'Marshal',
    gate: 'East Gate',
    device: 'Pixel 8',
    isOnline: false,
    syncStatus: 'Offline • 3 pending',
  },
  {
    id: 's-4',
    name: 'Bola Martins',
    role: 'Support',
    gate: 'West Gate',
    device: 'Galaxy S24',
    isOnline: true,
    syncStatus: 'Online • synced 11s',
  },
];

export default function CheckInMonitorPage() {
  const params = useParams();
  const eventId = (params?.id as string) || '1';

  const [feed, setFeed] = React.useState<CheckInFeedItem[]>(INITIAL_FEED);
  const [flagged, setFlagged] = React.useState<FlaggedItem[]>(INITIAL_FLAGGED);
  const [staff, setStaff] = React.useState<GateStaffItem[]>(INITIAL_STAFF);
  const [searchAttendee, setSearchAttendee] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Load live check-in telemetry from API with fallback
  React.useEffect(() => {
    let mounted = true;
    async function loadTelemetry() {
      try {
        const res = await getEventCheckInMonitor(eventId);
        if (mounted && res) {
          if (res.liveActivityStream && res.liveActivityStream.length > 0) {
            setFeed(
              res.liveActivityStream.map((s) => ({
                id: s.id,
                name: s.attendeeName,
                time: new Date(s.scannedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                gate: s.turnstile,
                staff: s.staffName || 'Officer Ibrahim K.',
                device: 'Gate Terminal',
                status: 'Checked in',
              })),
            );
          }
          if (res.flaggedExceptions && res.flaggedExceptions.length > 0) {
            setFlagged(
              res.flaggedExceptions.map((f) => ({
                id: f.flagId,
                guestName: f.attendeeName,
                reason: f.reason,
                time: f.timestamp,
                gate: f.turnstile,
                staff: 'Gate Marshal',
                recommendation: 'Staff override verification',
                status: 'open',
              })),
            );
          }
        }
      } catch {}
    }
    loadTelemetry();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  // Add staff modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = React.useState(false);
  const [newStaffName, setNewStaffName] = React.useState('');
  const [newStaffRole, setNewStaffRole] = React.useState('Marshal');
  const [newStaffGate, setNewStaffGate] = React.useState('North Gate');
  const [newStaffDevice, setNewStaffDevice] = React.useState('iPhone 15');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveFlag = async (id: string, actionType: string) => {
    setFlagged((prev) => prev.filter((item) => item.id !== id));
    showToast(`Flag resolved: ${actionType}`);

    try {
      await resolveCheckInFlag(
        eventId,
        id,
        actionType.toLowerCase().includes('trust') ? 'trust_staff' : 'manual_resolve',
      );
    } catch {}
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const added: GateStaffItem = {
      id: `s-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      gate: newStaffGate,
      device: newStaffDevice,
      isOnline: true,
      syncStatus: 'Online • synced now',
    };
    setStaff([...staff, added]);
    setIsAddStaffOpen(false);
    setNewStaffName('');
    showToast(`Gate staff ${added.name} assigned to ${added.gate}!`);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    showToast(`Removed ${name} from active staff`);
  };

  const handleAssignAllGateStaff = async () => {
    setStaff((prev) =>
      prev.map((s) => ({
        ...s,
        isOnline: true,
        syncStatus: 'Online • synced now',
      }))
    );
    showToast('All gate staff devices assigned and synchronized successfully!');

    try {
      await assignAllGateStaff(eventId);
    } catch {}
  };

  const filteredFeed = feed.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchAttendee.trim()) {
      const q = searchAttendee.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.gate.toLowerCase().includes(q) ||
        item.staff.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell
      currentRole="organizer_individual"
      title="Check-in Monitor"
      subtitle="The Grand Royal Gala & Investiture • Live Gate Turnstile Monitor"
    >
      <div className="w-full space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#261710] text-white shadow-2xl border border-[#D4A373]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-[#D4A373]" />
            <span className="text-xs font-medium">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HERO BANNER matching media_1791786578996_114c7a20.png */}
        <div className="rounded-3xl relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-[#5C2911]/30 bg-gradient-to-r from-[#703816] via-[#8C4B24] to-[#5C2911] text-white min-h-[190px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/30 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                  The Grand Royal Gala &amp; Investiture
                </h1>
                <span className="bg-[#1F4D36]/80 text-[#85E0A3] text-xs px-3 py-1 rounded-full font-semibold border border-[#2D6A4F] shadow-xs backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-white/80 text-sm font-sans font-light">
                Gala
              </p>
            </div>

            {/* Floating White Metadata Pill */}
            <div className="bg-white/95 text-[#261710] px-4 py-2 rounded-2xl flex items-center gap-4 text-xs font-medium shadow-sm backdrop-blur-md w-fit flex-wrap">
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                <span>24 October 2026</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>⏰</span>
                <span>24 October 2026</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>👥</span>
                <span>24 October 2026</span>
              </span>
            </div>
          </div>

          {/* Right Column: Started Box */}
          <div className="relative z-10 self-start md:self-center shrink-0">
            <div className="bg-[#18110D]/90 backdrop-blur-md rounded-2xl border border-white/15 p-4 px-6 shadow-2xl space-y-1 text-left min-w-[210px]">
              <p className="font-serif font-bold text-lg text-white">
                Started 2h 15m ago
              </p>
              <p className="text-xs text-white/70">
                Doors opened at 17:30 WAT
              </p>
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards matching media_1791786578996_114c7a20.png */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-foreground">100</span>
            <p className="text-xs font-bold text-foreground">Total Invitees</p>
            <p className="text-[11px] text-muted-foreground">People invited</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-foreground">67</span>
            <p className="text-xs font-bold text-foreground">Checked in</p>
            <p className="text-[11px] text-muted-foreground">67% arrived</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-foreground">28</span>
            <p className="text-xs font-bold text-foreground">Not arrived</p>
            <p className="text-[11px] text-muted-foreground">Expected tonight</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-foreground">80</span>
            <p className="text-xs font-bold text-foreground">Total Attendance</p>
            <p className="text-[11px] text-muted-foreground">Active crowd</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1 col-span-2 sm:col-span-1">
            <span className="font-serif text-3xl font-bold text-[#C53030]">5</span>
            <p className="text-xs font-bold text-foreground">Flagged</p>
            <p className="text-[11px] text-muted-foreground">Needs attention</p>
          </Card>
        </div>

        {/* 2-Column Split Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 / 12): Real-time check-in feed */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="rounded-3xl border border-[#EBE3D9] bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="font-serif font-bold text-base text-foreground">
                    Real-time check-in feed
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Refreshed live entry stream')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground -mt-2">
                Newest arrivals appear first
              </p>

              {/* Search & Filter row */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative flex-1">
                  <Input
                    value={searchAttendee}
                    onChange={(e) => setSearchAttendee(e.target.value)}
                    placeholder="Search guest or staff..."
                    className="h-10 text-xs rounded-xl bg-card border-[#EBE3D9]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 pr-8 rounded-xl bg-card border border-[#EBE3D9] text-xs text-foreground appearance-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    <option value="Checked in">Checked in</option>
                    <option value="VIP arrival">VIP arrival</option>
                    <option value="Offline-synced">Offline-synced</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Feed Table List matching screenshot */}
              <div className="divide-y divide-[#EBE3D9] pt-2">
                <div className="py-2.5 flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Guest / Time</span>
                  <span>Status</span>
                  <span>Scanned By</span>
                </div>

                {filteredFeed.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.time}</p>
                    </div>

                    <div>
                      {item.status === 'Checked in' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E7F7ED] text-[#1E7E34]">
                          Checked in
                        </span>
                      )}
                      {item.status === 'VIP arrival' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDE8E4] text-[#B8543E]">
                          VIP arrival
                        </span>
                      )}
                      {item.status === 'Offline-synced' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                          Offline-synced
                        </span>
                      )}
                    </div>

                    <div className="text-right space-y-0.5">
                      <p className="font-semibold text-xs text-foreground">{item.staff}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.gate} • {item.device}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EBE3D9] flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing 6 most recent of 67 arrivals</span>
                <button
                  type="button"
                  onClick={() => showToast('Full entry log loaded')}
                  className="font-semibold text-[#6E3B1C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View full activity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column (5 / 12): Flagged Queue & Gate staff */}
          <div className="lg:col-span-5 space-y-6">
            {/* CARD 1: Flagged Queue matching media_1791786578996_114c7a20.png */}
            <Card className="rounded-3xl border border-[#F5D5C6] bg-[#FFFBF9] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">
                    Flagged Queue
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Remote review • every decision is logged
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C53030] text-white">
                  5 open
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {flagged.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-card border border-[#F5D5C6] space-y-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-foreground">{item.guestName}</p>
                      <p className="text-xs font-semibold text-[#C53030]">{item.reason}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.time} • {item.gate} • {item.staff}
                      </p>
                    </div>

                    {/* Recommendation Box matching screenshot */}
                    <div className="p-2.5 rounded-xl bg-[#FEF9E7] border border-[#F9E79F] text-[11px] font-medium text-[#7D6608]">
                      {item.recommendation}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleResolveFlag(item.id, 'Trusted gate staff call')}
                        className="flex-1 h-9 text-xs rounded-xl bg-[#241710] hover:bg-[#38261C] text-white font-medium shadow-xs"
                      >
                        Trust staff call
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolveFlag(item.id, 'Reviewed & resolved exception')}
                        className="flex-1 h-9 text-xs rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-medium shadow-xs"
                      >
                        Review &amp; resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground pt-1">
                Organizer actions capture decision, actor, time and gate context.
              </p>
            </Card>

            {/* CARD 2: Gate staff matching media_1791786578996_114c7a20.png */}
            <Card className="rounded-3xl border border-[#EBE3D9] bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">
                    Gate staff
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    4 assigned • 3 online • 1 offline
                  </p>
                </div>

                {/* Right button group with Assign All Gate Staff and Add staff */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAssignAllGateStaff}
                    className="h-8 text-xs rounded-xl border-[#6E3B1C] text-[#6E3B1C] hover:bg-[#6E3B1C] hover:text-white"
                  >
                    Assign All Gate Staff
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsAddStaffOpen(true)}
                    className="h-8 text-xs rounded-xl bg-[#241710] hover:bg-[#38261C] text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add staff</span>
                  </Button>
                </div>
              </div>

              {/* Staff List */}
              <div className="divide-y divide-[#EBE3D9] pt-1">
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E7F7ED] flex items-center justify-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            s.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-foreground">
                          {s.name} • <span className="font-normal text-muted-foreground">{s.role} • {s.gate} • {s.device}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">{s.syncStatus}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(s.id, s.name)}
                      className="text-xs text-[#C53030] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground pt-1">
                Staff can scan only at their assigned gate.
              </p>
            </Card>
          </div>
        </div>

        {/* MODAL: ADD STAFF */}
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-lg text-foreground">
                Assign Gate Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Authorize a staff member device to scan turnstiles.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddStaff} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Staff Full Name</Label>
                <Input
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Amara Eze"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Role</Label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground"
                  >
                    <option value="Lead">Lead</option>
                    <option value="VIP Host">VIP Host</option>
                    <option value="Marshal">Marshal</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assigned Gate</Label>
                  <select
                    value={newStaffGate}
                    onChange={(e) => setNewStaffGate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground"
                  >
                    <option value="North Gate">North Gate</option>
                    <option value="VIP Gate">VIP Gate</option>
                    <option value="East Gate">East Gate</option>
                    <option value="West Gate">West Gate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Device Type</Label>
                <Input
                  value={newStaffDevice}
                  onChange={(e) => setNewStaffDevice(e.target.value)}
                  placeholder="e.g. iPhone 15"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl"
                >
                  Assign Staff
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
