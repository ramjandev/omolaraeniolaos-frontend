'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
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
  type CheckInMonitorResponse,
} from '@/lib/api/individual-events';
import {
  useAssignGateStaffMutation,
  useGetGateOverviewQuery,
  useInviteGateStaffMutation,
  useUnassignGateStaffMutation,
} from '@/store/Gate/gateApi';

type FeedStatus = 'Checked in' | 'VIP arrival' | 'Offline-synced';

interface CheckInFeedItem {
  id: string;
  name: string;
  scannedAt: string;
  gate: string;
  staff: string;
  device: string;
  status: FeedStatus;
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
  lastScanAt: string | null;
  pendingOffline: number;
}

function zonedDate(value: string, timezone?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const match = (timezone || '').match(/UTC\s*([+-]\d{1,2})(?::(\d{2}))?/i);
  const offsetMinutes = match ? Number(match[1]) * 60 + Number(match[2] || 0) * (Number(match[1]) < 0 ? -1 : 1) : 0;
  return new Date(date.getTime() + offsetMinutes * 60000);
}

function formatLongDate(value?: string, timezone?: string) {
  const shifted = value ? zonedDate(value, timezone) : null;
  if (!shifted) return 'Date not set';
  return shifted.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatClock(value?: string, timezone?: string) {
  const shifted = value ? zonedDate(value, timezone) : null;
  if (!shifted) return '--:--';
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${remain}m`;
}

function arrivalLabel(value: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const day = date.toDateString() === new Date().toDateString()
    ? 'Today'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${day} • ${time}${timezone ? ` ${timezone}` : ''}`;
}

function syncLabel(member: GateStaffItem) {
  if (!member.isOnline && member.pendingOffline > 0) {
    return `Offline • ${member.pendingOffline} pending`;
  }
  if (!member.isOnline) return 'Offline';
  if (!member.lastScanAt) return 'Online';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(member.lastScanAt).getTime()) / 1000));
  if (seconds < 15) return 'Online • synced now';
  if (seconds < 60) return `Online • synced ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 15) return `Online • synced ${minutes}m`;
  return 'Online';
}

function feedStatus(scan: CheckInMonitorResponse['liveActivityStream'][number]): FeedStatus {
  if (scan.offlineSynced) return 'Offline-synced';
  if ((scan.ticketTier || '').toLowerCase().includes('vip')) return 'VIP arrival';
  return 'Checked in';
}

export default function CheckInMonitorPage() {
  const params = useParams();
  const eventId = (params?.id as string) || '1';
  const [assignGateStaff, { isLoading: isAssigning }] = useAssignGateStaffMutation();
  const [inviteGateStaff, { isLoading: isInviting }] = useInviteGateStaffMutation();
  const [unassignGateStaff] = useUnassignGateStaffMutation();

  const [feed, setFeed] = React.useState<CheckInFeedItem[]>([]);
  const [activityTotal, setActivityTotal] = React.useState(0);
  const [showAllActivity, setShowAllActivity] = React.useState(false);
  const [flagged, setFlagged] = React.useState<FlaggedItem[]>([]);
  const [staff, setStaff] = React.useState<GateStaffItem[]>([]);
  const [eventTitle, setEventTitle] = React.useState('Check-in Monitor');
  const [eventMeta, setEventMeta] = React.useState({
    category: '',
    venueName: '',
    startDate: '',
    timezone: '',
    status: '',
    coverImageUrl: '',
  });
  const [metrics, setMetrics] = React.useState({
    invited: 0,
    checkedIn: 0,
    notArrived: 0,
    attendance: 0,
    flagged: 0,
    percent: 0,
  });
  const [searchAttendee, setSearchAttendee] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const loadAttempts = React.useRef(0);

  React.useEffect(() => {
    let mounted = true;
    async function loadTelemetry() {
      try {
        const res = await getEventCheckInMonitor(eventId);
        if (!mounted || !res) return;
        const payload = res;
        setEventTitle(payload.event?.title || payload.eventTitle || 'Check-in Monitor');
        setEventMeta({
          category: payload.event?.category || '',
          venueName: payload.event?.venueName || '',
          startDate: payload.event?.startDate || '',
          timezone: payload.event?.timezone || '',
          status: payload.event?.status || '',
          coverImageUrl: payload.event?.coverImageUrl || '',
        });
        setMetrics({
          invited: payload.metrics?.totalInvitees ?? 0,
          checkedIn: payload.metrics?.totalCheckedIn ?? 0,
          notArrived: payload.metrics?.notArrived ?? 0,
          attendance: payload.metrics?.totalAttendance ?? payload.metrics?.totalCheckedIn ?? 0,
          flagged: payload.metrics?.flaggedCount ?? payload.flaggedExceptions?.length ?? 0,
          percent: payload.metrics?.checkInPercentage ?? 0,
        });
        setActivityTotal(payload.activityTotal ?? payload.liveActivityStream?.length ?? 0);
        setFeed(
          (payload.liveActivityStream || []).map((scan) => ({
            id: scan.id,
            name: scan.attendeeName,
            scannedAt: scan.scannedAt,
            gate: scan.turnstile,
            staff: scan.staffName || 'Gate staff',
            device: 'Gate Terminal',
            status: feedStatus(scan),
          })),
        );
        setFlagged(
          (payload.flaggedExceptions || []).map((flag) => ({
            id: flag.flagId,
            guestName: flag.attendeeName,
            reason: flag.reason,
            time: flag.timestamp,
            gate: flag.turnstile,
            staff: flag.staffName || 'Gate staff',
            recommendation: flag.recommendation || 'Review this arrival before admitting the guest',
            status: 'open' as const,
          })),
        );
        setStaff(
          (payload.gateStaff || []).map((member) => ({
            id: member.id,
            name: member.name,
            role: member.role || 'Gate Staff',
            gate: member.gate,
            device: member.device || 'Gate Terminal',
            isOnline: member.isOnline,
            lastScanAt: member.lastScanAt || null,
            pendingOffline: member.pendingOffline || 0,
          })),
        );
        loadAttempts.current = 0;
      } catch {
        if (mounted && loadAttempts.current < 2) {
          loadAttempts.current += 1;
          window.setTimeout(() => {
            if (mounted) setReloadKey((value) => value + 1);
          }, 800);
        }
      }
    }
    void loadTelemetry();
    return () => {
      mounted = false;
    };
  }, [eventId, reloadKey]);

  React.useEffect(() => {
    const timer = window.setInterval(() => setReloadKey((value) => value + 1), 20000);
    return () => window.clearInterval(timer);
  }, []);

  const [isAddStaffOpen, setIsAddStaffOpen] = React.useState(false);
  const { data: rosterData } = useGetGateOverviewQuery(undefined, { skip: !isAddStaffOpen });
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [newStaffName, setNewStaffName] = React.useState('');
  const [newStaffEmail, setNewStaffEmail] = React.useState('');
  const [newStaffPhone, setNewStaffPhone] = React.useState('');
  const [newStaffGate, setNewStaffGate] = React.useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveFlag = async (id: string, actionType: string) => {
    try {
      await resolveCheckInFlag(
        eventId,
        id,
        actionType.toLowerCase().includes('trust') ? 'trust_staff' : 'manual_resolve',
      );
      setReloadKey((value) => value + 1);
    } catch {
      showToast('This flag could not be resolved.');
    }
  };

  const rosterChoices = (rosterData?.data?.staff ?? []).filter(
    (member) => !member.isOwner && !staff.some((assigned) => assigned.id === member.id),
  );

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const gateNumber = newStaffGate.trim();
    if (!gateNumber) return;
    try {
      if (selectedStaffId) {
        await assignGateStaff({ staffId: selectedStaffId, eventId, gateNumber }).unwrap();
      } else {
        if (!newStaffName.trim() || !newStaffEmail.trim()) return;
        await inviteGateStaff({
          fullName: newStaffName.trim(),
          email: newStaffEmail.trim(),
          phone: newStaffPhone.trim() || undefined,
          eventId,
          gateNumber,
        }).unwrap();
      }
      setIsAddStaffOpen(false);
      setSelectedStaffId('');
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffGate('');
      setReloadKey((value) => value + 1);
    } catch {
      showToast('Gate staff could not be added.');
    }
  };

  const handleRemoveStaff = async (id: string) => {
    try {
      await unassignGateStaff({ staffId: id, eventId }).unwrap();
      setReloadKey((value) => value + 1);
    } catch {
      showToast('This assignment could not be removed.');
    }
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
  const visibleFeed = showAllActivity ? filteredFeed : filteredFeed.slice(0, 6);
  const onlineCount = staff.filter((member) => member.isOnline).length;
  const doorsOpen = Boolean(eventMeta.startDate) && Date.now() >= new Date(eventMeta.startDate).getTime();
  const startedText = eventMeta.startDate
    ? doorsOpen
      ? `Started ${formatDuration(Date.now() - new Date(eventMeta.startDate).getTime())} ago`
      : `Starts in ${formatDuration(new Date(eventMeta.startDate).getTime() - Date.now())}`
    : 'Schedule not set';

  return (
    <AppShell
      currentRole="organizer_individual"
      title="Check-in Monitor"
      subtitle={`${eventTitle} • Live gate check-in`}
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

        <nav className="flex items-center gap-1.5 text-xs text-[#8C4B24]">
          <Link href="/organizer/individual/events" className="hover:underline">Events</Link>
          <span>/</span>
          <Link href={`/organizer/individual/events/${eventId}`} className="max-w-[180px] truncate hover:underline">
            {eventTitle}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#6E3B1C]">Check-in Monitor</span>
        </nav>

        <div
          className="rounded-3xl relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-[#5C2911]/30 text-white min-h-[190px] bg-gradient-to-r from-[#703816] via-[#8C4B24] to-[#5C2911]"
          style={eventMeta.coverImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(62,28,12,0.82), rgba(92,41,17,0.55)), url(${eventMeta.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {eventTitle}
                </h1>
                <span className="bg-[#1F4D36]/80 text-[#85E0A3] text-xs px-3 py-1 rounded-full font-semibold border border-[#2D6A4F] shadow-xs backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {eventMeta.status === 'DRAFT' ? 'Draft' : eventMeta.status === 'COMPLETED' ? 'Ended' : 'Live'}
                </span>
              </div>
              <p className="text-white/80 text-sm font-sans font-light">
                {eventMeta.category || eventMeta.venueName || 'Event'}
              </p>
            </div>

            <div className="bg-white/95 text-[#261710] px-4 py-2 rounded-2xl flex items-center gap-4 text-xs font-medium shadow-sm backdrop-blur-md w-fit flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatLongDate(eventMeta.startDate, eventMeta.timezone)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatClock(eventMeta.startDate, eventMeta.timezone)} {eventMeta.timezone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{eventMeta.venueName || 'Venue not set'}</span>
              </span>
            </div>
          </div>

          <div className="relative z-10 self-start md:self-center shrink-0">
            <div className="bg-[#18110D]/90 backdrop-blur-md rounded-2xl border border-white/15 p-4 px-6 shadow-2xl space-y-1 text-left min-w-[210px]">
              <p className="font-serif font-bold text-lg text-white">
                {startedText}
              </p>
              <p className="text-xs text-white/70">
                {doorsOpen ? 'Doors opened' : 'Doors open'} at {formatClock(eventMeta.startDate, eventMeta.timezone)} {eventMeta.timezone}
              </p>
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards matching media_1791786578996_114c7a20.png */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-[#8C4B24]">{metrics.invited}</span>
            <p className="text-xs font-bold text-foreground">Total Invitees</p>
            <p className="text-[11px] text-muted-foreground">People invited</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-[#8C4B24]">{metrics.checkedIn}</span>
            <p className="text-xs font-bold text-foreground">Checked in</p>
            <p className="text-[11px] text-muted-foreground">{metrics.percent}% arrived</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-[#8C4B24]">{metrics.notArrived}</span>
            <p className="text-xs font-bold text-foreground">Not arrived</p>
            <p className="text-[11px] text-muted-foreground">Expected tonight</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
            <span className="font-serif text-3xl font-bold text-[#8C4B24]">{metrics.attendance}</span>
            <p className="text-xs font-bold text-foreground">Total Attendance</p>
            <p className="text-[11px] text-muted-foreground">Active crowd</p>
          </Card>

          <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1 col-span-2 sm:col-span-1">
            <span className="font-serif text-3xl font-bold text-[#C53030]">{metrics.flagged}</span>
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
                  onClick={() => setReloadKey((value) => value + 1)}
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

                {visibleFeed.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">No arrivals match this view yet.</p>
                )}
                {visibleFeed.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{arrivalLabel(item.scannedAt, eventMeta.timezone)}</p>
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
                <span>
                  Showing {visibleFeed.length} most recent of {activityTotal} arrivals
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllActivity((open) => !open)}
                  className="font-semibold text-[#6E3B1C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAllActivity ? 'Show recent activity' : 'View full activity'}</span>
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
                  {flagged.length} open
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {flagged.length === 0 && (
                  <p className="text-xs text-muted-foreground">No open flags. New exceptions appear here as soon as a gate reports one.</p>
                )}
                {flagged.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-card border border-[#F5D5C6] space-y-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-foreground">{item.guestName}</p>
                      <p className="text-xs font-semibold text-[#C53030]">{item.reason}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatClock(item.time, eventMeta.timezone)} • {item.gate} • {item.staff}
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
                    {staff.length} assigned • {onlineCount} online • {Math.max(0, staff.length - onlineCount)} offline
                  </p>
                </div>

                <div className="flex items-center gap-2">
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
                {staff.length === 0 && (
                  <p className="py-4 text-xs text-muted-foreground">No gate staff are assigned to this event yet.</p>
                )}
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
                        <p className={`text-[11px] ${s.isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>{syncLabel(s)}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(s.id)}
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
          <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 space-y-4 dark:bg-[#1A110B]">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-lg text-foreground">
                Assign Gate Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign someone already on your roster, or invite a new gate staff member to this event.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddStaff} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Existing gate staff</Label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground"
                >
                  <option value="">Invite someone new</option>
                  {rosterChoices.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedStaffId && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Full Name</Label>
                    <Input
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="Full name"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Email</Label>
                      <Input
                        required
                        type="email"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        placeholder="staff@email.com"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Phone</Label>
                      <Input
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Assigned Gate</Label>
                <Input
                  required
                  value={newStaffGate}
                  onChange={(e) => setNewStaffGate(e.target.value)}
                  placeholder="Main Entrance"
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
                  disabled={isAssigning || isInviting}
                  className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl"
                >
                  {isAssigning || isInviting ? 'Saving...' : 'Assign Staff'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
