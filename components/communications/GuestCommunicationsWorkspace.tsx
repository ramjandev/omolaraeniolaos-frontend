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
import { dispatchCoordinatedMessage, listEventCommunications, submitGuestRsvp } from '@/lib/api/platform';
import { listLiveThread, postLiveMessage, subscribeThread, uploadMedia, type LiveMessage } from '@/lib/liveChat';
import { fillMessageTemplate, listMessageTemplates, templateChannelLabel, type MessageTemplate } from '@/lib/messageTemplates';
import { ChatMedia, EmojiPicker, useVoiceNote } from '@/components/chat/ChatBits';
import { getEventGuests, getIndividualEventById, updateEventGuest } from '@/lib/api/individual-events';
import { eventsPath, type OrganizerKind } from '@/lib/organizer';
import { EventBreadcrumb } from '@/components/events/shared/EventBreadcrumb';
import { LocaleFrame } from '@/components/i18n/I18nProvider';
import CommonSelect, { type SelectOption } from '@/components/common/CommonSelect';
import { CommonHeader } from '@/components/shared/CommonHeader';
import { TablePagination } from '@/components/shared/TablePagination';
import type { AppLocale } from '@/i18n/locales';
import { useTranslations } from 'next-intl';

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
  qrCode: string;
  tableSeat: string;
  chatHistory: {
    id?: string;
    sender: 'system' | 'guest';
    text: string;
    time: string;
    mediaUrl?: string | null;
    mediaKind?: string | null;
    fileName?: string | null;
  }[];
}

const GUEST_TYPE_OPTIONS: SelectOption<CommGuest['type']>[] = [
  { label: 'VIP', value: 'VIP' },
  { label: 'General', value: 'General' },
  { label: 'Family & Friends', value: 'Family & Friends' },
  { label: 'Speakers & Partners', value: 'Speakers & Partners' },
];

const RSVP_FILTER_OPTIONS: SelectOption<string>[] = [
  { label: 'RSVP Status', value: 'all' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'No Response', value: 'No Response' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Tentative', value: 'Tentative' },
];

const RSVP_STATUS_OPTIONS: SelectOption<CommGuest['rsvpStatus']>[] = [
  { label: 'No Response', value: 'No Response' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Tentative', value: 'Tentative' },
  { label: 'Rejected', value: 'Rejected' },
];

function toHistory(message: LiveMessage): CommGuest['chatHistory'][number] {
  return {
    id: message.id,
    sender: message.direction === 'INBOUND' ? 'guest' : 'system',
    text: message.body,
    time: new Date(message.createdAt).toLocaleString(),
    mediaUrl: message.mediaUrl,
    mediaKind: message.mediaKind,
    fileName: message.fileName,
  };
}

function mapRsvp(status: string): CommGuest['rsvpStatus'] {
  const value = status.toLowerCase();
  if (value.includes('confirm')) return 'Confirmed';
  if (value.includes('tentat')) return 'Tentative';
  if (value.includes('declin') || value.includes('reject')) return 'Rejected';
  return 'No Response';
}

function deliveryNotice(
  deliveries: Array<{ channel: string; status: string; error?: string; deliveredTo?: string; to?: string }> | undefined,
  successText: string,
) {
  const rows = deliveries || [];
  const failed = rows.filter((row) => row.status === 'failed');
  const email = rows.find((row) => row.channel === 'EMAIL' && row.status !== 'failed');
  const inbox = email?.deliveredTo || email?.to;
  const parts = [
    inbox ? `Email delivered to ${inbox}.` : '',
    ...failed.map((row) => `${row.channel} was not delivered${row.error ? `: ${row.error}` : '.'}`),
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : successText;
}

interface GuestCommunicationsWorkspaceProps {
  organizer: OrganizerKind;
  eventId: string;
}

const PREVIEW_LANGUAGES: Array<{ code: AppLocale; label: string }> = [
  { code: 'en', label: '🇳🇬 English' },
  { code: 'yo', label: '🇳🇬 Èdè Yorùbá' },
  { code: 'ha', label: '🇳🇬 Harshen Hausa' },
  { code: 'ig', label: '🇳🇬 Asụsụ Igbo' },
  { code: 'pcm', label: '🇳🇬 Naija Pidgin' },
];

function GuestLanguagePreview({
  locale,
  eventTitle,
  eventWhen,
  eventVenue,
  guestName,
  onLanguage,
  onRsvp,
  onVoice,
}: {
  locale: AppLocale;
  eventTitle: string;
  eventWhen: string;
  eventVenue: string;
  guestName: string;
  onLanguage: (code: AppLocale, label: string) => void;
  onRsvp: (status: CommGuest['rsvpStatus']) => void;
  onVoice: () => void;
}) {
  return (
    <LocaleFrame locale={locale}>
      <GuestLanguagePreviewCopy
        locale={locale}
        eventTitle={eventTitle}
        eventWhen={eventWhen}
        eventVenue={eventVenue}
        guestName={guestName}
        onLanguage={onLanguage}
        onRsvp={onRsvp}
        onVoice={onVoice}
      />
    </LocaleFrame>
  );
}

function GuestLanguagePreviewCopy({
  locale,
  eventTitle,
  eventWhen,
  eventVenue,
  guestName,
  onLanguage,
  onRsvp,
  onVoice,
}: {
  locale: AppLocale;
  eventTitle: string;
  eventWhen: string;
  eventVenue: string;
  guestName: string;
  onLanguage: (code: AppLocale, label: string) => void;
  onRsvp: (status: CommGuest['rsvpStatus']) => void;
  onVoice: () => void;
}) {
  const t = useTranslations('guest');

  return (
    <>
      <div className="w-full bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
        <div className="relative rounded-xl overflow-hidden h-28 bg-gradient-to-r from-[#703816] to-[#5C2911] p-3 flex flex-col justify-end text-white">
          <Maximize2 className="w-4 h-4 text-white/80 absolute top-2.5 right-2.5" />
          <p className="font-serif font-bold text-sm">{eventTitle}</p>
          <p className="text-[10px] text-white/80">{eventVenue || t('venuePending')}</p>
        </div>

        <div className="space-y-1.5 text-xs text-foreground leading-relaxed">
          <p className="font-bold text-[#6E3B1C]">{guestName}</p>
          <p className="text-muted-foreground">{t('invitedLine', { event: eventTitle })}</p>
          <p className="text-muted-foreground">
            <strong>{t('dateTime')}</strong> {eventWhen || t('toBeConfirmed')}
          </p>
          <p className="text-muted-foreground">
            <strong>{t('venueLabel')}</strong> {eventVenue || t('toBeConfirmed')}
          </p>
          <p className="text-muted-foreground pt-1 text-[11px]">{t('kindlyRsvp')}</p>
        </div>

        <div className="text-right text-[10px] text-muted-foreground font-mono">10:00 AM</div>
      </div>

      <div className="w-full bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
        <div className="space-y-1">
          <p className="font-bold text-xs text-foreground">{t('chooseLanguage')}</p>
          <p className="text-[11px] text-muted-foreground">{t('switchAnytime')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {PREVIEW_LANGUAGES.map((lang) => {
            const isChosen = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguage(lang.code, lang.label)}
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

        <div className="text-right text-[10px] text-muted-foreground font-mono">10:00 AM</div>
      </div>

      <div className="w-full bg-white dark:bg-[#1E1610] rounded-2xl p-4 shadow-sm border border-[#E8DACB] space-y-3">
        <p className="font-bold text-xs text-foreground text-center">{t('respondHow')}</p>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onRsvp('Confirmed')}
            className="w-full p-2.5 rounded-xl bg-[#1E7E34] hover:bg-[#17662A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>✓ {t('accept')}</span>
          </button>
          <button
            type="button"
            onClick={() => onRsvp('Tentative')}
            className="w-full p-2.5 rounded-xl bg-[#E8F4F8] hover:bg-[#D5EBF1] text-[#026AA7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#CDE5EE]"
          >
            <span>🍷 {t('tentative')}</span>
          </button>
          <button
            type="button"
            onClick={() => onRsvp('Rejected')}
            className="w-full p-2.5 rounded-xl bg-[#FDE8E8] hover:bg-[#FBD5D5] text-[#9B1C1C] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#F8B4B4]"
          >
            <span>✕ {t('decline')}</span>
          </button>
          <button
            type="button"
            onClick={onVoice}
            className="w-full p-2.5 rounded-xl bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#E9D5FF]"
          >
            <span>🎙️ {t('voiceSpeak')}</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-1">{t('orReply')}</p>
        <div className="text-right text-[10px] text-muted-foreground font-mono">10:00 AM</div>
      </div>
    </>
  );
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
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [chatTemplates, setChatTemplates] = React.useState<MessageTemplate[]>([]);
  const [chatBusy, setChatBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<AppLocale>('en');
  const sendFileRef = React.useRef<(file: File) => Promise<void>>(async () => undefined);
  const voice = useVoiceNote((file) => {
    void sendFileRef.current(file);
  });

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
          qrCode: guest.qrCode || '',
          tableSeat: guest.tableSeat || '',
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

  const pushHistory = React.useCallback((message: LiveMessage) => {
    setGuests((current) => current.map((guest) => {
      if (guest.id !== message.attendeeId) return guest;
      if (guest.chatHistory.some((item) => item.id === message.id)) return guest;
      return {
        ...guest,
        chatHistory: [...guest.chatHistory, toHistory(message)],
        lastActive: new Date(message.createdAt).toLocaleString(),
      };
    }));
  }, []);

  React.useEffect(() => {
    if (viewMode !== 'chat' || !activeGuestId) return;
    let cancelled = false;
    void listLiveThread(eventId, activeGuestId)
      .then((rows) => {
        if (cancelled) return;
        setGuests((current) => current.map((guest) => {
          if (guest.id !== activeGuestId) return guest;
          const latest = rows.at(-1);
          return {
            ...guest,
            chatHistory: rows.map(toHistory),
            lastActive: latest ? new Date(latest.createdAt).toLocaleString() : guest.lastActive,
          };
        }));
      })
      .catch(() => undefined);
    const stop = subscribeThread(eventId, activeGuestId, (message) => {
      if (!cancelled) pushHistory(message);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [activeGuestId, eventId, pushHistory, viewMode]);

  React.useEffect(() => {
    if (viewMode !== 'chat') return;
    void listMessageTemplates(eventId)
      .then(setChatTemplates)
      .catch(() => setChatTemplates([]));
  }, [eventId, viewMode]);

  const applyTemplate = (template: MessageTemplate) => {
    if (!activeGuest) return;
    const link = `${window.location.origin}/guest?attendeeId=${activeGuest.id}&eventId=${eventId}&qr=${encodeURIComponent(activeGuest.qrCode || '')}`;
    setChatInputText(fillMessageTemplate(template.content, {
      guest_name: activeGuest.name,
      event_name: eventTitle,
      event_date: eventWhen || 'the event date',
      venue: eventVenue || 'the venue',
      table_number: activeGuest.tableSeat || 'Not assigned',
      rsvp_link: link,
    }));
    setTemplateOpen(false);
  };

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
      const result = await dispatchCoordinatedMessage({
        eventId,
        attendeeIds: [guest.id],
        channels: ['WHATSAPP', 'EMAIL'],
        subject: 'RSVP reminder',
        content: notice,
      });
      const refreshed = await loadGuests(true);
      const updated = refreshed.find((item) => item.id === guest.id);
      showToast(deliveryNotice(result.deliveries, updated?.reminderStatus === 'Sent'
        ? `Reminder sent to ${guest.name}.`
        : `The reminder for ${guest.name} was not delivered.`));
    } catch {
      showToast(`The reminder for ${guest.name} could not be sent.`);
    }
  };

  const sendLive = async (input: { body?: string; file?: File }) => {
    if (!activeGuest || chatBusy) return;
    setChatBusy(true);
    setEmojiOpen(false);
    try {
      const media = input.file ? await uploadMedia(input.file) : null;
      const saved = await postLiveMessage({
        eventId,
        attendeeId: activeGuest.id,
        from: 'organizer',
        body: input.body,
        mediaUrl: media?.url,
        mediaKind: media?.mediaKind,
        fileName: media?.fileName,
      });
      pushHistory(saved);
      if (input.body) setChatInputText('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'The message could not be sent.');
    } finally {
      setChatBusy(false);
    }
  };
  sendFileRef.current = (file) => sendLive({ file });

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    void sendLive({ body: chatInputText.trim() });
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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#261710] text-white shadow-2xl border border-[#D4A373]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-[#D4A373]" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="space-y-6">
          <EventBreadcrumb organizer={organizer} eventId={eventId} current="Guest Communication" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CommonHeader
              variant="section"
              as="h1"
              title="Guest Communications Workspace"
              subtitle="Stay connected with your guests and follow up on pending RSVPs via WhatsApp."
            />

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

          <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card shadow-2xs overflow-hidden">
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

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FCEDE6] text-[#6E3B1C] text-xs font-semibold border border-[#F5D5C6]">
                  <span className="w-4 h-4 rounded-full bg-[#E07A5F] text-white flex items-center justify-center text-[10px]">
                    {needsReminderCount}
                  </span>
                  <span>Needs to Send Reminder</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CommonSelect
                  value={rsvpFilter}
                  item={RSVP_FILTER_OPTIONS}
                  w={148}
                  onValueChange={setRsvpFilter}
                  className="h-10 rounded-xl border-[#EBE3D9] bg-card text-xs"
                />

                <CommonSelect
                  value={typeFilter}
                  item={[{ label: 'Guest Type', value: 'all' }, ...GUEST_TYPE_OPTIONS]}
                  w={160}
                  onValueChange={setTypeFilter}
                  className="h-10 rounded-xl border-[#EBE3D9] bg-card text-xs"
                />
              </div>
            </div>

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

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{guest.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{guest.phone}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <CommonSelect
                          value={guest.type}
                          item={GUEST_TYPE_OPTIONS}
                          w={150}
                          onValueChange={(newType) => {
                            const previous = guest.type;
                            setGuests((current) => current.map((item) => (item.id === guest.id ? { ...item, type: newType } : item)));
                            void updateEventGuest(eventId, guest.id, { type: newType }).catch(() => {
                              setGuests((current) => current.map((item) => (item.id === guest.id ? { ...item, type: previous } : item)));
                              showToast(`Could not update ${guest.name}.`);
                            });
                          }}
                          className="h-8 rounded-lg border-[#EBE3D9] bg-card text-xs"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        {guest.partySize > 0 ? guest.partySize : '--'}
                      </td>

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
        <div className="flex flex-col gap-3 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0 lg:overflow-hidden">
          <div className="flex shrink-0 items-center justify-between">
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

          <div className="grid min-h-[720px] flex-1 grid-cols-1 overflow-hidden rounded-3xl border border-[#EBE3D9] bg-card shadow-sm lg:min-h-0 lg:grid-cols-12 dark:border-border">
            <div className="flex min-h-0 flex-col overflow-hidden border-r border-[#EBE3D9] bg-[#FAF8F5] lg:col-span-3 dark:border-border dark:bg-card/40">
              <div className="shrink-0 border-b border-[#EBE3D9] p-3">
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

              <div className="min-h-0 flex-1 divide-y divide-[#EBE3D9]/60 overflow-y-auto">
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

            <div className="relative flex min-h-0 flex-col overflow-hidden border-r border-[#EBE3D9] bg-[#F7F4EE] lg:col-span-6">
              <div className="absolute inset-0 bg-[radial-gradient(#d6cdbe_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-70 pointer-events-none" />

              <div className="relative z-10 min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4">
                <GuestLanguagePreview
                  locale={selectedLanguage}
                  eventTitle={eventTitle}
                  eventWhen={eventWhen}
                  eventVenue={eventVenue}
                  guestName={activeGuest.name}
                  onLanguage={(code, label) => {
                    setSelectedLanguage(code);
                    showToast(`Language set to ${label}`);
                  }}
                  onRsvp={handleInteractiveRsvp}
                  onVoice={() => showToast('Voice RSVP recording enabled for guest note!')}
                />

                {activeGuest.chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-full flex flex-col ${
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
                      {item.mediaUrl && (
                        <ChatMedia url={item.mediaUrl} kind={item.mediaKind} name={item.fileName} />
                      )}
                      {item.text && <p>{item.text}</p>}
                      <p className="text-[9px] text-muted-foreground text-right mt-1 font-mono">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 shrink-0 space-y-2 border-t border-[#EBE3D9] bg-white p-3 dark:bg-card">
                <div className="relative flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] rounded-full border-[#EBE3D9] text-[#6E3B1C] hover:bg-[#FAF8F5]"
                    onClick={() => setTemplateOpen((open) => !open)}
                  >
                    Use Template
                  </Button>
                  {templateOpen && (
                    <div className="absolute bottom-9 left-0 z-40 w-72 rounded-2xl border border-[#E8DACB] bg-white p-2 shadow-lg">
                      {chatTemplates.length === 0 ? (
                        <p className="px-2 py-1 text-[11px] text-muted-foreground">No saved templates yet.</p>
                      ) : (
                        chatTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            className="block w-full rounded-xl px-2 py-1.5 text-left hover:bg-[#FAF0E6]"
                            onClick={() => applyTemplate(template)}
                          >
                            <span className="block text-xs font-medium text-[#1F140E]">{template.name}</span>
                            <span className="block text-[10px] text-muted-foreground">{templateChannelLabel(template.channel)}</span>
                          </button>
                        ))
                      )}
                      <Link href={templatesHref} className="mt-1 block px-2 py-1 text-[11px] font-medium text-[#6E3B1C]">
                        Manage templates
                      </Link>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="relative flex items-center gap-2">
                  {emojiOpen && <EmojiPicker onPick={(emoji) => setChatInputText((value) => `${value}${emoji}`)} />}
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    title="Insert emoji"
                    onClick={() => setEmojiOpen((open) => !open)}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    title="Attach file or photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) void sendLive({ file });
                    }}
                  />

                  <Input
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Type reply in English or native lang..."
                    className="h-10 text-xs rounded-full bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9]"
                  />

                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void voice.toggle()}
                    className={`w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer ${voice.recording ? 'bg-red-700' : 'bg-[#1F4D36] hover:bg-[#173D2B]'}`}
                    title={voice.recording ? 'Stop and send voice note' : 'Record a voice note'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </form>
                {(voice.recording || voice.error || chatBusy) && (
                  <p className="text-[11px] text-muted-foreground">
                    {voice.recording ? 'Recording… tap the microphone again to send.' : voice.error || (chatBusy ? 'Sending…' : '')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col space-y-6 overflow-y-auto bg-white p-5 lg:col-span-3 lg:sticky lg:top-0 dark:bg-card">
              <div className="space-y-5">
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

                  <CommonSelect
                    value={manualGroup}
                    item={GUEST_TYPE_OPTIONS}
                    w={160}
                    onValueChange={setManualGroup}
                    className="h-8 rounded-lg border-[#EBE3D9] bg-[#FAF8F5] text-xs font-semibold text-[#6E3B1C]"
                  />
                </div>

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

                <Button
                  onClick={() => handleSendReminder(activeGuest)}
                  className="w-full h-10 text-xs font-bold rounded-xl bg-[#E59838] hover:bg-[#C9822B] text-white shadow-xs"
                >
                  Send Reminder
                </Button>

                <form onSubmit={handleSaveManualChanges} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-muted/30 border border-[#EBE3D9] space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Change RSVP Status Manually *
                    </Label>
                    <CommonSelect
                      value={manualStatus}
                      item={RSVP_STATUS_OPTIONS}
                      w={220}
                      onValueChange={setManualStatus}
                      className="h-9 w-full rounded-xl border-[#EBE3D9] bg-card text-xs"
                    />
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
