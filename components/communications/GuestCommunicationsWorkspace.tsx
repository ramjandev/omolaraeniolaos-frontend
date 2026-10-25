'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Settings,
  CheckCircle2,
  Send,
  Check,
  X,
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dispatchCoordinatedMessage, listEventCommunications, listGuestThread, submitGuestRsvp } from '@/lib/api/platform';
import { getEventGuests, getIndividualEventById, updateEventGuest } from '@/lib/api/individual-events';
import { eventsPath, type OrganizerKind } from '@/lib/organizer';
import { EventBreadcrumb } from '@/components/events/shared/EventBreadcrumb';
import { TablePagination } from '@/components/shared/TablePagination';

export interface CommGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'VIP' | 'General' | 'Family & Friends' | 'Speakers & Partners';
  partySize: number;
  rsvpStatus: 'Confirmed' | 'Tentative' | 'Rejected' | 'No Response';
  reminderStatus: 'Not Required' | 'Needs Reminder' | 'Sent';
  lastChannel: 'WhatsApp' | 'Email' | 'SMS';
  lastActive: string;
  inviteSentDate: string;
  dietary: string;
  chatHistory: { sender: 'system' | 'guest'; text: string; time: string }[];
}


function mapRsvp(status: string): CommGuest['rsvpStatus'] {
  const value = status.toLowerCase();
  if (value.includes('confirm')) return 'Confirmed';
  if (value.includes('tentat')) return 'Tentative';
  if (value.includes('declin') || value.includes('reject')) return 'Rejected';
  return 'No Response';
}

interface GuestCommunicationsWorkspaceProps {
  organizer: OrganizerKind;
  eventId: string;
}

export function GuestCommunicationsWorkspace({ organizer, eventId }: GuestCommunicationsWorkspaceProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'chat'>('table');
  const [guests, setGuests] = React.useState<CommGuest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [eventTitle, setEventTitle] = React.useState('your event');
  const [eventWhen, setEventWhen] = React.useState('');
  const [eventVenue, setEventVenue] = React.useState('');
  const [activeGuestId, setActiveGuestId] = React.useState('');
  const templatesHref = eventsPath(organizer, eventId, 'communications/templates');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [rsvpFilter, setRsvpFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [chatInputText, setChatInputText] = React.useState('');
  const [selectedLanguage, setSelectedLanguage] = React.useState('English');

  const activeGuest = guests.find((g) => g.id === activeGuestId);
  const [manualStatus, setManualStatus] = React.useState<CommGuest['rsvpStatus']>('No Response');
  const [manualPartySize, setManualPartySize] = React.useState(1);
  const [manualDietary, setManualDietary] = React.useState('');
  const [manualGroup, setManualGroup] = React.useState<CommGuest['type']>('General');

  React.useEffect(() => {
    if (!activeGuest) return;
    setManualStatus(activeGuest.rsvpStatus);
    setManualPartySize(activeGuest.partySize);
    setManualDietary(activeGuest.dietary || '');
    setManualGroup(activeGuest.type);
  }, [activeGuest]);

  const loadGuests = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setLoadError('');
    }
    try {
      const [roster, event, campaigns] = await Promise.all([
        getEventGuests(eventId),
        getIndividualEventById(eventId).catch(() => null),
        listEventCommunications(eventId).catch(() => []),
      ]);
      const reminded = new Set<string>();
      for (const campaign of campaigns) {
        const isReminder = (campaign.subject || '').toLowerCase().includes('reminder');
        if (!isReminder) continue;
        for (const delivery of campaign.deliveries ?? []) {
          if (delivery.status === 'SENT' || delivery.status === 'SANDBOX_LOGGED') {
            reminded.add(delivery.attendeeId);
          }
        }
      }
      const mapped: CommGuest[] = roster.guests.map((guest) => {
        const rsvpStatus = mapRsvp(guest.rsvpStatus);
        return {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          type: (['VIP', 'General', 'Family & Friends', 'Speakers & Partners'].includes(guest.type)
            ? guest.type
            : 'General') as CommGuest['type'],
          partySize: guest.partySize,
          rsvpStatus,
          reminderStatus: rsvpStatus === 'Confirmed'
            ? 'Not Required'
            : reminded.has(guest.id)
              ? 'Sent'
              : 'Needs Reminder',
          lastChannel: (guest.inviteThrough as CommGuest['lastChannel']) || 'WhatsApp',
          lastActive: '',
          inviteSentDate: '',
          dietary: guest.preference === '--' ? '' : guest.preference,
          chatHistory: [],
        };
      });
      setEventTitle(event?.event?.title || 'your event');
      setEventWhen([event?.event?.dateFormatted, event?.event?.timeFormatted].filter(Boolean).join(' · '));
      setEventVenue([event?.event?.venueName, event?.event?.city].filter(Boolean).join(', '));
      setGuests(mapped);
      setActiveGuestId((current) => (mapped.some((guest) => guest.id === current) ? current : mapped[0]?.id || ''));
      return mapped;
    } catch {
      if (!silent) {
        setGuests([]);
        setLoadError('Guest communications could not be loaded.');
      }
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  React.useEffect(() => {
    if (viewMode !== 'chat' || !activeGuestId) return;
    let cancelled = false;
    void listGuestThread(eventId, activeGuestId)
      .then((messages) => {
        if (cancelled) return;
        setGuests((current) => current.map((guest) => {
          if (guest.id !== activeGuestId) return guest;
          const rows = Array.isArray(messages) ? messages : [];
          const latest = rows.at(-1);
          return {
            ...guest,
            chatHistory: rows.map((message) => ({
              sender: message.direction === 'INBOUND' ? 'guest' as const : 'system' as const,
              text: message.body,
              time: new Date(message.createdAt).toLocaleString(),
            })),
            lastActive: latest ? new Date(latest.createdAt).toLocaleString() : guest.lastActive,
          };
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activeGuestId, eventId, viewMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const needsReminderCount = guests.filter((g) => g.reminderStatus === 'Needs Reminder').length;
  const confirmedCount = guests.filter((g) => g.rsvpStatus === 'Confirmed').length;
  const rejectedCount = guests.filter((g) => g.rsvpStatus === 'Rejected').length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'No Response' || g.rsvpStatus === 'Tentative').length;

  const filteredGuests = guests.filter((g) => {
    if (rsvpFilter !== 'all' && g.rsvpStatus !== rsvpFilter) return false;
    if (typeFilter !== 'all' && g.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q)
      );
    }
    return true;
  });
  const pageRows = filteredGuests.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, rsvpFilter, typeFilter]);

  const handleSendReminder = async (guest: CommGuest) => {
    const notice = `Hello ${guest.name}, please confirm your RSVP for ${eventTitle}.`;
    try {
      await dispatchCoordinatedMessage({
        eventId,
        attendeeIds: [guest.id],
        channels: ['WHATSAPP', 'EMAIL'],
        subject: 'RSVP reminder',
        content: notice,
      });
      const refreshed = await loadGuests(true);
      const updated = refreshed.find((item) => item.id === guest.id);
      showToast(updated?.reminderStatus === 'Sent'
        ? `Reminder sent to ${guest.name}.`
        : `The reminder for ${guest.name} was not delivered.`);
    } catch {
      showToast(`The reminder for ${guest.name} could not be sent.`);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuest || !chatInputText.trim()) return;

    const newMsg = {
      sender: 'system' as const,
      text: chatInputText.trim(),
      time: 'Just now',
    };

    setGuests((current) => current.map((item) => item.id === activeGuest.id
      ? { ...item, chatHistory: [...item.chatHistory, newMsg] }
      : item));
    setChatInputText('');
    void dispatchCoordinatedMessage({
      eventId,
      attendeeIds: [activeGuest.id],
      channels: ['WHATSAPP', 'EMAIL'],
      subject: 'Message from your host',
      content: newMsg.text,
    }).then(() => showToast('Message sent.'))
      .catch(() => showToast('The message could not be sent.'));
  };

  const handleInteractiveRsvp = (status: CommGuest['rsvpStatus']) => {
    if (!activeGuest) return;
    setGuests(
      guests.map((g) =>
        g.id === activeGuest.id
          ? {
              ...g,
              rsvpStatus: status,
              chatHistory: [
                ...g.chatHistory,
                {
                  sender: 'guest',
                  text:
                    status === 'Confirmed'
                      ? 'I am delighted to accept this invitation! See you at the Gala.'
                      : status === 'Tentative'
                      ? 'I may be able to attend, holding this tentative for now.'
                      : 'I regretfully decline the invitation with best wishes.',
                  time: 'Just now',
                },
              ],
            }
          : g
      )
    );
    setManualStatus(status);
    const apiStatus =
      status === 'Confirmed' ? 'accepted' : status === 'Tentative' ? 'tentative' : 'declined';
    void submitGuestRsvp({
      attendeeId: activeGuest.id,
      eventId,
      status: apiStatus,
      partySize: activeGuest.partySize,
      dietary: activeGuest.dietary,
    }).catch(() => undefined);
    showToast(`RSVP status updated to ${status}!`);
  };

  const handleSaveManualChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuest) return;
    setGuests(
      guests.map((g) =>
        g.id === activeGuest.id
          ? {
              ...g,
              rsvpStatus: manualStatus,
              partySize: manualPartySize,
              dietary: manualDietary,
              type: manualGroup,
            }
          : g
      )
    );
    if (eventId) {
      void updateEventGuest(eventId, activeGuest.id, {
        rsvpStatus: manualStatus,
        partySize: manualPartySize,
        preference: manualDietary,
        type: manualGroup,
      }).catch(() => undefined);
      const apiStatus =
        manualStatus === 'Confirmed'
          ? 'accepted'
          : manualStatus === 'Tentative'
            ? 'tentative'
            : 'declined';
      void submitGuestRsvp({
        attendeeId: activeGuest.id,
        eventId,
        status: apiStatus,
        partySize: manualPartySize,
        dietary: manualDietary,
      }).catch(() => undefined);
    }
    showToast(`Saved changes for ${activeGuest.name}!`);
  };

  return (
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

      {/* VIEW MODE 1: ROSTER TABLE VIEW matching media_1791786578893_f48b6764.png */}
      {viewMode === 'table' ? (
        <div className="space-y-6">
          <EventBreadcrumb organizer={organizer} eventId={eventId} current="Guest Communication" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-[#1F140E] dark:text-[#FBF8F5]">
                Guest Communications Workspace
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Stay connected with your guests and follow up on pending RSVPs via WhatsApp.
              </p>
            </div>

            <Button
              asChild
              className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs gap-2 rounded-xl shadow-xs self-start sm:self-auto h-10 px-4"
            >
              <Link href={templatesHref}>
                <Settings className="w-4 h-4" />
                <span>Manage Template</span>
              </Link>
            </Button>
          </div>

          {/* 4 KPI Metric Cards matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
              <span className="font-serif text-3xl font-bold text-foreground">{guests.length}</span>
              <p className="text-xs font-bold text-foreground">Total Invited Guest</p>
            </Card>

            <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
              <span className="font-serif text-3xl font-bold text-[#2D5A46] dark:text-emerald-400">{confirmedCount}</span>
              <p className="text-xs font-bold text-foreground">Confirmed</p>
            </Card>

            <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
              <span className="font-serif text-3xl font-bold text-[#C53030]">{rejectedCount}</span>
              <p className="text-xs font-bold text-foreground">Rejected</p>
            </Card>

            <Card className="border-border/80 shadow-2xs bg-card p-5 space-y-1">
              <span className="font-serif text-3xl font-bold text-[#B45309]">{pendingCount}</span>
              <p className="text-xs font-bold text-foreground">Pending/No Response</p>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card shadow-2xs overflow-hidden">
            {/* Toolbar Row with ⌘ k & Needs Reminder Pill */}
            <div className="p-4 md:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-12 text-xs h-10 rounded-xl bg-card border-[#EBE3D9]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border px-1.5 py-0.5 rounded font-mono">
                    ⌘ k
                  </span>
                </div>

                {/* 2 Needs to Send Reminder pill */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FCEDE6] text-[#6E3B1C] text-xs font-semibold border border-[#F5D5C6]">
                  <span className="w-4 h-4 rounded-full bg-[#E07A5F] text-white flex items-center justify-center text-[10px]">
                    {needsReminderCount}
                  </span>
                  <span>Needs to Send Reminder</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={rsvpFilter}
                  onChange={(e) => setRsvpFilter(e.target.value)}
                  className="text-xs h-10 px-3 rounded-xl border border-[#EBE3D9] bg-card text-foreground cursor-pointer"
                >
                  <option value="all">RSVP Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="No Response">No Response</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Tentative">Tentative</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs h-10 px-3 rounded-xl border border-[#EBE3D9] bg-card text-foreground cursor-pointer"
                >
                  <option value="all">Guest Type</option>
                  <option value="VIP">VIP</option>
                  <option value="General">General</option>
                  <option value="Family & Friends">Family &amp; Friends</option>
                  <option value="Speakers & Partners">Speakers &amp; Partners</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-muted/40 border-y border-[#EBE3D9] text-muted-foreground font-medium">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="py-3 px-4 font-semibold text-foreground">Guest &amp; Contact</th>
                    <th className="py-3 px-4 font-semibold text-foreground">Guest Type</th>
                    <th className="py-3 px-4 font-semibold text-foreground">Party Size ⇅</th>
                    <th className="py-3 px-4 font-semibold text-foreground">RSVP Status</th>
                    <th className="py-3 px-4 font-semibold text-foreground">Reminder Status</th>
                    <th className="py-3 px-4 font-semibold text-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3D9]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        Loading guests…
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        {loadError || 'No guests match this view.'}
                      </td>
                    </tr>
                  ) : pageRows.map((guest) => (
                    <tr key={guest.id} className="hover:bg-[#FAF7F2]/50">
                      <td className="py-3.5 px-4">
                        <input type="checkbox" className="rounded" />
                      </td>

                      {/* Guest & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{guest.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{guest.phone}</p>
                        </div>
                      </td>

                      {/* Guest Type inline select */}
                      <td className="py-3.5 px-4">
                        <select
                          value={guest.type}
                          onChange={(e) => {
                            const newType = e.target.value as CommGuest['type'];
                            const previous = guest.type;
                            setGuests((current) => current.map((item) => (item.id === guest.id ? { ...item, type: newType } : item)));
                            void updateEventGuest(eventId, guest.id, { type: newType }).catch(() => {
                              setGuests((current) => current.map((item) => (item.id === guest.id ? { ...item, type: previous } : item)));
                              showToast(`Could not update ${guest.name}.`);
                            });
                          }}
                          className="h-8 px-2.5 rounded-lg border border-[#EBE3D9] bg-card text-foreground text-xs cursor-pointer"
                        >
                          <option value="VIP">VIP</option>
                          <option value="General">General</option>
                          <option value="Family & Friends">Family &amp; Friends</option>
                          <option value="Speakers & Partners">Speakers &amp; Partners</option>
                        </select>
                      </td>

                      {/* Party Size */}
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        {guest.partySize > 0 ? guest.partySize : '--'}
                      </td>

                      {/* RSVP Status */}
                      <td className="py-3.5 px-4">
                        {guest.rsvpStatus === 'Confirmed' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#E7F7ED] text-[#1E7E34]">
                            Confirmed
                          </span>
                        )}
                        {guest.rsvpStatus === 'No Response' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F3EFEA] text-[#786B62]">
                            No Response
                          </span>
                        )}
                        {guest.rsvpStatus === 'Rejected' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FCE8E6] text-[#C53030]">
                            Rejected
                          </span>
                        )}
                        {guest.rsvpStatus === 'Tentative' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FEF3C7] text-[#B45309]">
                            Tentative
                          </span>
                        )}
                      </td>

                      {/* Reminder Status */}
                      <td className="py-3.5 px-4">
                        {guest.reminderStatus === 'Needs Reminder' ? (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(guest)}
                            className="px-3 py-1 rounded-lg bg-[#FAF0E6] text-[#B87333] border border-[#B87333]/30 text-xs font-semibold hover:bg-[#B87333] hover:text-white transition-colors cursor-pointer"
                          >
                            Send Reminder
                          </button>
                        ) : guest.reminderStatus === 'Sent' ? (
                          <span className="text-xs text-emerald-600 font-medium">Sent</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not Required</span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveGuestId(guest.id);
                              setViewMode('chat');
                            }}
                            className="h-8 text-xs bg-[#E7F7ED] hover:bg-[#D4EEDB] text-[#1E7E34] font-medium rounded-lg px-2.5 shadow-none"
                          >
                            <span>💬 View Chat</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              page={page}
              pageSize={pageSize}
              total={filteredGuests.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </Card>
        </div>
      ) : !activeGuest ? (
        <p className="text-sm text-muted-foreground">Select a guest to open the conversation.</p>
      ) : (
        /* VIEW MODE 2: 3-COLUMN WHATSAPP CHAT CONVERSATION */
        <div className="space-y-4">
          {/* Top navigation row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6E3B1C] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Communications Ledger</span>
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              Individual Guest Conversation • WhatsApp Concierge
            </span>
          </div>

          {/* 3-Column Split Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#EBE3D9] dark:border-border bg-card overflow-hidden shadow-sm min-h-[720px]">
            {/* COLUMN 1 (Width: 3 / 12): Guest Conversations List */}
            <div className="lg:col-span-3 border-r border-[#EBE3D9] dark:border-border flex flex-col bg-[#FAF8F5] dark:bg-card/40">
              {/* Search Box */}
              <div className="p-3 border-b border-[#EBE3D9]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 pr-8 text-xs rounded-xl bg-card border-[#EBE3D9]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    ⌘ k
                  </span>
                </div>
              </div>

              {/* Guest Conversation Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#EBE3D9]/60">
                {filteredGuests.map((g) => {
                  const isActive = g.id === activeGuestId;

                  return (
                    <div
                      key={g.id}
                      onClick={() => setActiveGuestId(g.id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F2ECE4] dark:bg-muted/40 border-l-4 border-[#6E3B1C]'
                          : 'hover:bg-white/60 dark:hover:bg-muted/20'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#3B281E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {g.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-foreground truncate">{g.name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                            {g.lastActive}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground truncate">
                          {g.chatHistory.length > 0
                            ? g.chatHistory[g.chatHistory.length - 1].text
                            : 'No messages yet'}
                        </p>

                        <div className="flex items-center justify-between pt-0.5">
                          {g.rsvpStatus === 'Confirmed' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E7F7ED] text-[#1E7E34]">
                              Confirmed
                            </span>
                          )}
                          {g.rsvpStatus === 'No Response' && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3EFEA] text-[#786B62]">
                              No Response
                            </span>
                          )}
                          {g.rsvpStatus === 'Tentative' && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309]">
                              Tentative
                            </span>
                          )}
                          {g.rsvpStatus === 'Rejected' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FCE8E6] text-[#C53030]">
                              Rejected
                            </span>
                          )}

                          <span className="text-[10px] text-muted-foreground font-mono">
                            {g.partySize} Party
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2 (Width: 6 / 12): WhatsApp Chat Canvas matching media_1791786489953_6d4f34e1.png */}
            <div className="lg:col-span-6 flex flex-col justify-between border-r border-[#EBE3D9] bg-[#F7F4EE] relative">
              {/* Doodle Wallpaper Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#d6cdbe_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-70 pointer-events-none" />

              {/* Chat Messages Feed */}
              <div className="relative z-10 p-5 space-y-4 flex-1 overflow-y-auto">
                {/* Bubble 1: Event Invitation Card */}
                <div className="max-w-md mx-auto bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
                  {/* Event Thumbnail Header */}
                  <div className="relative rounded-xl overflow-hidden h-28 bg-gradient-to-r from-[#703816] to-[#5C2911] p-3 flex flex-col justify-end text-white">
                    <Maximize2 className="w-4 h-4 text-white/80 absolute top-2.5 right-2.5" />
                    <p className="font-serif font-bold text-sm">{eventTitle}</p>
                    <p className="text-[10px] text-white/80">{eventVenue || 'Venue to be confirmed'}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-foreground leading-relaxed">
                    <p className="font-bold text-[#6E3B1C]">
                      {activeGuest.name}
                    </p>
                    <p className="text-muted-foreground">
                      You are invited to {eventTitle}.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Date &amp; Time:</strong> {eventWhen || 'To be confirmed'}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Venue:</strong> {eventVenue || 'To be confirmed'}
                    </p>
                    <p className="text-muted-foreground pt-1 text-[11px]">
                      Kindly RSVP below to help us prepare your reserved seat and bespoke hospitality.
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-muted-foreground font-mono">
                    10:00 AM
                  </div>
                </div>

                {/* Bubble 2: Language Preference Selector Card */}
                <div className="max-w-md mx-auto bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-foreground">
                      Please choose your preferred communication language
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Select your preferred language below, you can switch anytime:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { code: 'English', label: '🇳🇬 English' },
                      { code: 'Yoruba', label: '🇳🇬 Èdè Yorùbá' },
                      { code: 'Hausa', label: '🇳🇬 Harshen Hausa' },
                      { code: 'Igbo', label: '🇳🇬 Asusu Igbo' },
                      { code: 'Pidgin', label: '🇳🇬 Naija Pidgin' },
                    ].map((lang) => {
                      const isChosen = selectedLanguage === lang.code;

                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            showToast(`Language set to ${lang.label}`);
                          }}
                          className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer ${
                            isChosen
                              ? 'bg-[#1E7E34] text-white border-[#1E7E34]'
                              : 'bg-card border-[#EBE3D9] text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {isChosen && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-right text-[10px] text-muted-foreground font-mono">
                    10:00 AM
                  </div>
                </div>

                {/* Bubble 3: RSVP Response Action Buttons Card */}
                <div className="max-w-md mx-auto bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
                  <p className="font-bold text-xs text-foreground text-center">
                    How would you like to respond to this invitation?
                  </p>

                  <div className="space-y-2 pt-1">
                    {/* Button 1: Accept */}
                    <button
                      type="button"
                      onClick={() => handleInteractiveRsvp('Confirmed')}
                      className="w-full p-2.5 rounded-xl bg-[#1E7E34] hover:bg-[#17662A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>✓ Accept Invitation</span>
                    </button>

                    {/* Button 2: Tentative */}
                    <button
                      type="button"
                      onClick={() => handleInteractiveRsvp('Tentative')}
                      className="w-full p-2.5 rounded-xl bg-[#E8F4F8] hover:bg-[#D5EBF1] text-[#026AA7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#CDE5EE]"
                    >
                      <span>🍷 Tentative / Maybe</span>
                    </button>

                    {/* Button 3: Decline */}
                    <button
                      type="button"
                      onClick={() => handleInteractiveRsvp('Rejected')}
                      className="w-full p-2.5 rounded-xl bg-[#FDE8E8] hover:bg-[#FBD5D5] text-[#9B1C1C] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#F8B4B4]"
                    >
                      <span>✕ Regretfully Decline</span>
                    </button>

                    {/* Button 4: Voice RSVP */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Voice RSVP recording enabled for guest note!');
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#E9D5FF]"
                    >
                      <span>🎙️ Voice RSVP (Speak note)</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center pt-1">
                    Or reply via text in English or native language 💬
                  </p>

                  <div className="text-right text-[10px] text-muted-foreground font-mono">
                    10:00 AM
                  </div>
                </div>

                {/* Render any additional sent messages */}
                {activeGuest.chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`max-w-md mx-auto flex flex-col ${
                      item.sender === 'system' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        item.sender === 'system'
                          ? 'bg-[#E7FFDB] dark:bg-[#005C4B] text-foreground rounded-tr-none'
                          : 'bg-white dark:bg-[#1E1610] text-foreground rounded-tl-none border border-[#E8DACB]'
                      }`}
                    >
                      <p>{item.text}</p>
                      <p className="text-[9px] text-muted-foreground text-right mt-1 font-mono">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Composer Bottom Bar */}
              <div className="relative z-10 p-3 bg-white dark:bg-card border-t border-[#EBE3D9] space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] rounded-full border-[#EBE3D9] text-[#6E3B1C] hover:bg-[#FAF8F5]"
                  >
                    <Link href={templatesHref}>
                      Use Template
                    </Link>
                  </Button>
                </div>

                <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    title="Insert emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    title="Attach file or photo"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <Input
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Type reply in English or native lang..."
                    className="h-10 text-xs rounded-full bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9]"
                  />

                  {/* Send Plane Button */}
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>

                  {/* Mic Voice Button */}
                  <button
                    type="button"
                    onClick={() => showToast('Voice note recorded and queued for guest!')}
                    className="w-10 h-10 rounded-full bg-[#1F4D36] hover:bg-[#173D2B] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* COLUMN 3 (Width: 3 / 12): Guest Meta Data & Manual RSVP Editor */}
            <div className="lg:col-span-3 p-5 flex flex-col justify-between space-y-6 bg-white dark:bg-card">
              <div className="space-y-5">
                {/* Avatar & Guest Details */}
                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                  <div className="w-20 h-20 rounded-full bg-[#3B281E] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#D4A373]">
                    {activeGuest.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">
                      {activeGuest.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {activeGuest.phone}
                    </p>
                  </div>

                  <select
                    value={manualGroup}
                    onChange={(e) => setManualGroup(e.target.value as CommGuest['type'])}
                    className="h-8 px-3 rounded-lg border border-[#EBE3D9] text-xs font-semibold bg-[#FAF8F5] text-[#6E3B1C] cursor-pointer"
                  >
                    <option value="VIP">VIP</option>
                    <option value="General">General</option>
                    <option value="Family & Friends">Family &amp; Friends</option>
                    <option value="Speakers & Partners">Speakers &amp; Partners</option>
                  </select>
                </div>

                {/* Guest Meta Data Box */}
                <div className="space-y-2.5 pt-3 border-t border-[#EBE3D9] text-xs">
                  <p className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Guest Meta Data
                  </p>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Party Size</span>
                    <span className="font-semibold text-foreground">{activeGuest.partySize} person</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>RSVP Status</span>
                    <span
                      className={`font-semibold ${
                        activeGuest.rsvpStatus === 'Confirmed'
                          ? 'text-emerald-600'
                          : activeGuest.rsvpStatus === 'Rejected'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {activeGuest.rsvpStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Invitation Sent</span>
                    <span className="font-semibold text-foreground">{activeGuest.inviteSentDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Last Active</span>
                    <span className="font-semibold text-foreground">{activeGuest.lastActive}</span>
                  </div>
                </div>

                {/* Send Reminder Button */}
                <Button
                  onClick={() => handleSendReminder(activeGuest)}
                  className="w-full h-10 text-xs font-bold rounded-xl bg-[#E59838] hover:bg-[#C9822B] text-white shadow-xs"
                >
                  Send Reminder
                </Button>

                {/* Change RSVP Status Manually Form */}
                <form onSubmit={handleSaveManualChanges} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-muted/30 border border-[#EBE3D9] space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Change RSVP Status Manually *
                    </Label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value as CommGuest['rsvpStatus'])}
                      className="w-full h-9 px-3 rounded-xl border border-[#EBE3D9] bg-card text-xs text-foreground cursor-pointer"
                    >
                      <option value="No Response">No Response</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Tentative">Tentative</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Party Size *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={manualPartySize}
                      onChange={(e) => setManualPartySize(Number(e.target.value))}
                      className="h-9 text-xs rounded-xl bg-card border-[#EBE3D9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Dietary Requirement
                    </Label>
                    <Input
                      value={manualDietary}
                      onChange={(e) => setManualDietary(e.target.value)}
                      placeholder="e.g vegetarian"
                      className="h-9 text-xs rounded-xl bg-card border-[#EBE3D9]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
