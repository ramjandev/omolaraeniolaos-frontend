'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGuestPass, submitGuestRsvp, submitVoiceRsvp, type GuestPass } from '@/lib/api/platform';
import { listLiveThread, postLiveMessage, subscribeThread, uploadMedia, type LiveMessage } from '@/lib/liveChat';
import { ChatMedia, EmojiPicker, useVoiceNote } from '@/components/chat/ChatBits';
import {
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  MapPin,
  Mic,
  Send,
  Sparkles,
  Lock,
  ChevronRight,
  ShieldCheck,
  Utensils,
  Award,
  Compass,
  Square,
  Play,
  RotateCcw,
  Smile,
  Paperclip,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

type LanguageCode = 'en' | 'yo' | 'ha' | 'ig' | 'pcm';

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Èdè Yorùbá' },
  { code: 'ha', label: 'Harshen Hausa' },
  { code: 'ig', label: 'Asụsụ Igbo' },
  { code: 'pcm', label: 'Naija Pidgin' },
];

function firstName(name: string) {
  const parts = name.trim().split(/\s+/).filter((part) => !/^(md|mr|mrs|ms|dr)\.?$/i.test(part));
  return parts[0] || name || 'Guest';
}

function formatEventWhen(value?: string) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function withCurrent(options: string[], current: string) {
  return options.includes(current) ? options : [current, ...options];
}

export default function GuestConversationalRsvpPage() {
  const router = useRouter();
  // State management for conversation flow
  const [selectedLang, setSelectedLang] = React.useState<LanguageCode>('en');
  const [rsvpStatus, setRsvpStatus] = React.useState<'pending' | 'accepted' | 'tentative' | 'declined'>('pending');
  const [guestCount, setGuestCount] = React.useState<number>(2); // 1 = Solo, 2 = +1, etc.
  const [guestCountSubmitted, setGuestCountSubmitted] = React.useState<boolean>(false);
  
  // Guest Profile Preferences
  const [invite, setInvite] = React.useState<GuestPass | null>(null);
  const [role, setRole] = React.useState<string>('General');
  const [diet, setDiet] = React.useState<string>('Standard Banquet');
  const [protocol, setProtocol] = React.useState<string>('Standard Gate');
  const [profileSubmitted, setProfileSubmitted] = React.useState<boolean>(false);

  // Voice Note Modal state
  const [showVoiceModal, setShowVoiceModal] = React.useState<boolean>(false);
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState<number>(0);
  const [recordedAudioReady, setRecordedAudioReady] = React.useState<boolean>(false);
  const [hasVoiceResponse, setHasVoiceResponse] = React.useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  const [voiceError, setVoiceError] = React.useState('');
  const [voiceSending, setVoiceSending] = React.useState(false);
  const [voiceTranscript, setVoiceTranscript] = React.useState('');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioBlobRef = React.useRef<Blob | null>(null);
  const audioUrlRef = React.useRef<string>('');
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Chat message input state
  const [inputMessage, setInputMessage] = React.useState<string>('');
  const [customMessages, setCustomMessages] = React.useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([]);
  const [liveMessages, setLiveMessages] = React.useState<LiveMessage[]>([]);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [chatBusy, setChatBusy] = React.useState(false);
  const [chatError, setChatError] = React.useState('');
  const chatFileRef = React.useRef<HTMLInputElement>(null);
  const sendFileRef = React.useRef<(file: File) => Promise<void>>(async () => undefined);
  const voiceNote = useVoiceNote((file) => {
    void sendFileRef.current(file);
  });

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages appear
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rsvpStatus, guestCountSubmitted, profileSubmitted, customMessages, liveMessages, hasVoiceResponse]);

  // Timer for recording simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const speechLanguage = (code: LanguageCode) => {
    if (code === 'yo') return 'yo-NG';
    if (code === 'ha') return 'ha-NG';
    if (code === 'ig') return 'ig-NG';
    if (code === 'pcm') return 'pcm';
    return 'en-US';
  };

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || '');
        resolve(value.includes(',') ? value.split(',')[1] : value);
      };
      reader.onerror = () => reject(new Error('The recording could not be read'));
      reader.readAsDataURL(blob);
    });

  const handleStartRecording = async () => {
    setVoiceError('');
    setRecordedAudioReady(false);
    audioBlobRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        audioBlobRef.current = blob;
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordedAudioReady(blob.size > 0);
        if (!blob.size) setVoiceError('The recording was empty. Try again.');
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch {
      setIsRecording(false);
      setVoiceError('Allow microphone access in the browser, then start the recording again.');
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    setIsRecording(false);
  };

  const handleSendVoiceNote = async () => {
    const blob = audioBlobRef.current;
    if (!blob || voiceSending) return;
    setVoiceSending(true);
    setVoiceError('');
    try {
      const params = new URLSearchParams(window.location.search);
      const result = await submitVoiceRsvp({
        audioBase64: await blobToBase64(blob),
        mimeType: blob.type || 'audio/webm',
        languageCode: speechLanguage(selectedLang),
        attendeeId: params.get('attendeeId'),
        eventId: params.get('eventId'),
      });
      const status =
        result.rsvpStatus === 'DECLINED'
          ? 'declined'
          : result.rsvpStatus === 'TENTATIVE'
            ? 'tentative'
            : 'accepted';
      setVoiceTranscript(result.transcribedText);
      setGuestCount(Math.max(1, result.guestCount || 1));
      setHasVoiceResponse(true);
      setRsvpStatus(status);
      setRecordedAudioReady(false);
      try {
        await submitGuestRsvp({
          attendeeId: params.get('attendeeId'),
          eventId: params.get('eventId'),
          qrCode: params.get('qr'),
          status,
          partySize: result.guestCount,
          dietary: result.dietaryOrNotes || diet,
          language: selectedLang,
          notes: `Voice RSVP: ${result.transcribedText}`,
        });
      } catch {
        // The voice endpoint already stored the transcript and RSVP.
      }
      setShowVoiceModal(false);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Voice RSVP could not be sent');
    } finally {
      setVoiceSending(false);
    }
  };

  const toggleVoicePlayback = () => {
    const url = audioUrlRef.current;
    if (!url) return;
    if (!audioPlayerRef.current) audioPlayerRef.current = new Audio();
    const player = audioPlayerRef.current;
    if (isPlayingAudio) {
      player.pause();
      setIsPlayingAudio(false);
      return;
    }
    player.src = url;
    player.onended = () => setIsPlayingAudio(false);
    void player.play();
    setIsPlayingAudio(true);
  };

  const persistRsvp = React.useCallback(
    async (status: 'accepted' | 'tentative' | 'declined', extras?: { partySize?: number; dietary?: string; notes?: string }) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      try {
        await submitGuestRsvp({
          attendeeId: params.get('attendeeId'),
          eventId: params.get('eventId'),
          qrCode: params.get('qr'),
          status,
          partySize: extras?.partySize ?? guestCount,
          dietary: extras?.dietary ?? diet,
          language: selectedLang,
          notes: extras?.notes || `Protocol: ${protocol}`,
        });
      } catch {
        // Keep the local conversation even if the backend is unreachable.
      }
    },
    [diet, guestCount, protocol, selectedLang],
  );

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let active = true;
    const load = (initial: boolean) => {
      getGuestPass({
        attendeeId: params.get('attendeeId'),
        eventId: params.get('eventId'),
        qrCode: params.get('qr'),
      })
        .then((pass) => {
          if (!active) return;
          setInvite(pass);
          if (!initial) return;
          setGuestCount(Math.max(1, pass.partySize || 1));
          if (pass.guestType) setRole(pass.guestType);
          if (pass.dietaryPreference) setDiet(pass.dietaryPreference);
          if (pass.rsvpStatus === 'CONFIRMED') {
            setRsvpStatus('accepted');
            setGuestCountSubmitted(true);
            if (pass.dietaryPreference) setProfileSubmitted(true);
          } else if (pass.rsvpStatus === 'TENTATIVE') {
            setRsvpStatus('tentative');
          } else if (pass.rsvpStatus === 'DECLINED') {
            setRsvpStatus('declined');
          }
        })
        .catch(() => {
          if (active && initial) setInvite(null);
        });
    };
    load(true);
    const refresh = () => {
      if (document.visibilityState === 'visible') load(false);
    };
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, []);

  const handleAcceptRsvp = () => {
    setRsvpStatus('accepted');
    void persistRsvp('accepted');
  };

  const handleTentativeRsvp = () => {
    setRsvpStatus('tentative');
    void persistRsvp('tentative');
  };

  const handleDeclineRsvp = () => {
    setRsvpStatus('declined');
    void persistRsvp('declined');
  };

  const handleConfirmGuestCount = (count: number) => {
    setGuestCount(count);
    setGuestCountSubmitted(true);
  };

  const handleConfirmProfile = () => {
    setProfileSubmitted(true);
    void persistRsvp(rsvpStatus === 'pending' ? 'accepted' : rsvpStatus, {
      partySize: guestCount,
      dietary: diet,
    });
  };

  const rememberLive = React.useCallback((message: LiveMessage) => {
    setLiveMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
  }, []);

  React.useEffect(() => {
    if (!invite?.attendeeId || !invite.eventId) return;
    let cancelled = false;
    void listLiveThread(invite.eventId, invite.attendeeId)
      .then((rows) => {
        if (!cancelled) setLiveMessages(rows);
      })
      .catch(() => undefined);
    const stop = subscribeThread(invite.eventId, invite.attendeeId, (message) => {
      if (!cancelled) rememberLive(message);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [invite?.attendeeId, invite?.eventId, rememberLive]);

  const sendGuestChat = async (input: { body?: string; file?: File }) => {
    if (!invite?.attendeeId || !invite.eventId) {
      setChatError('Open your invitation link to chat with the host.');
      return;
    }
    if (chatBusy) return;
    setChatBusy(true);
    setChatError('');
    setEmojiOpen(false);
    try {
      const media = input.file ? await uploadMedia(input.file) : null;
      const saved = await postLiveMessage({
        eventId: invite.eventId,
        attendeeId: invite.attendeeId,
        from: 'guest',
        body: input.body,
        mediaUrl: media?.url,
        mediaKind: media?.mediaKind,
        fileName: media?.fileName,
      });
      rememberLive(saved);
      if (input.body) setInputMessage('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'The message could not be sent.');
    } finally {
      setChatBusy(false);
    }
  };
  sendFileRef.current = (file) => sendGuestChat({ file });

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    void sendGuestChat({ body: inputMessage.trim() });
  };

  return (
    <div className="min-h-screen bg-[#D1D7DB] flex justify-center items-start sm:py-6">
      {/* Mobile-Only Frame container strictly 430px */}
      <div className="w-full max-w-[430px] h-screen sm:h-[890px] sm:max-h-[920px] bg-[#EFEAE2] flex flex-col relative overflow-hidden sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-[#CBD5E1]">
        
        {/* WhatsApp-Style Header */}
        <header className="bg-[#075E54] text-white px-3 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Avatar & Title */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7A3B18] to-[#C99C6A] p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-[#1F1916] flex items-center justify-center font-serif font-bold text-white text-base">
                    M
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] border-2 border-[#075E54] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-semibold text-[15px] leading-tight tracking-tight text-white">
                    McEniesVite Concierge
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40">
                    VIP Verified
                  </span>
                </div>
                <p className="text-[11px] text-[#A2D2C2] leading-none mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>{invite?.event?.title || 'Your invitation'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={invite ? `/guest/pass?attendeeId=${invite.attendeeId}&eventId=${invite.eventId}&qr=${encodeURIComponent(invite.qrCode)}` : '/guest/pass'}
              className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FDE68A]" />
              <span>Pass</span>
            </Link>
            <button
              aria-label="Menu"
              className="p-1.5 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Area with WhatsApp Wallpaper Pattern Background */}
        <div 
          className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 relative scrollbar-none"
          style={{
            backgroundImage: `radial-gradient(#075e5410 1px, transparent 1px), radial-gradient(#075e5408 1px, #efeae2 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        >
          
          {/* Security Banner: End-to-end Encrypted */}
          <div className="flex justify-center">
            <div className="bg-[#FFEECD] text-[#54656F] text-[11px] px-3.5 py-1.5 rounded-lg shadow-xs max-w-[90%] text-center border border-[#FFE2A4] flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#B0762E] shrink-0" />
              <span>Messages & VIP Credentials are end-to-end encrypted. No one outside can read or intercept them.</span>
            </div>
          </div>

          {/* Today Date Pill */}
          <div className="flex justify-center">
            <span className="bg-white/80 backdrop-blur-xs text-[#54656F] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
              Today
            </span>
          </div>

          {/* INVITATION CARD MESSAGE BUBBLE */}
          <div className="flex flex-col items-start max-w-[94%]">
            <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-[#E1DDD5] space-y-3 w-full">
              
              {/* Event Cover Photo */}
              <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-inner bg-gradient-to-tr from-[#7A3B18] via-[#8F4721] to-[#D4A373]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={invite?.event?.coverImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'}
                  alt={invite?.event?.title || 'Event invitation'}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback visually elegant backdrop
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDE68A]">
                    Official Invitation
                  </span>
                  <h2 className="font-serif text-lg font-bold leading-tight drop-shadow-sm text-[#FFF8ED]">
                    {invite?.event?.title || 'Your event'}
                  </h2>
                </div>
              </div>

              {/* Greeting */}
              <div className="space-y-1">
                <p className="font-serif text-sm font-semibold text-[#1F1916]">
                  Hello {invite?.fullName || 'Guest'},
                </p>
                <p className="text-xs text-[#4A403A] leading-relaxed">
                  You are invited to <span className="font-medium text-[#7A3B18]">{invite?.event?.venueName || invite?.event?.city || 'the venue'}</span>.
                </p>
              </div>

              {/* Event Metadata Card */}
              <div className="bg-[#FAF8F5] rounded-xl p-2.5 space-y-1.5 border border-[#ECE7DF] text-xs">
                <div className="flex items-center gap-2 text-[#3D352F]">
                  <Calendar className="w-3.5 h-3.5 text-[#7A3B18] shrink-0" />
                  <span className="font-medium">{formatEventWhen(invite?.event?.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-[#3D352F]">
                  <MapPin className="w-3.5 h-3.5 text-[#7A3B18] shrink-0" />
                  <span>{[invite?.event?.venueName, invite?.event?.address, invite?.event?.city].filter(Boolean).join(', ') || 'Venue to be confirmed'}</span>
                </div>
              </div>

              {/* Language Selection Header */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#7A3B18]" />
                  <span className="text-xs font-semibold text-[#1F1916]">
                    Select Your Preferred Language:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLang(lang.code)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#075E54] text-white border-[#075E54] font-medium shadow-xs'
                            : 'bg-[#F2EEE9] text-[#4A403A] border-[#DCD5CB] hover:bg-[#EAE4DC]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RSVP Action Buttons */}
              <div className="pt-2 border-t border-[#ECE7DF] space-y-2">
                <p className="text-xs font-semibold text-[#1F1916]">
                  Kindly indicate your attendance:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={handleAcceptRsvp}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      rsvpStatus === 'accepted'
                        ? 'bg-[#075E54] text-white shadow-sm'
                        : 'bg-[#075E54]/10 text-[#075E54] hover:bg-[#075E54]/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Joyfully Accept Invitation</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleTentativeRsvp}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        rsvpStatus === 'tentative'
                          ? 'bg-[#B0762E] text-white'
                          : 'bg-[#FAF8F5] text-[#70665F] border border-[#E1DDD5] hover:bg-[#F2EEE9]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Tentative / Maybe</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeclineRsvp}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        rsvpStatus === 'declined'
                          ? 'bg-rose-700 text-white'
                          : 'bg-[#FAF8F5] text-[#70665F] border border-[#E1DDD5] hover:bg-[#F2EEE9]'
                      }`}
                    >
                      <span>Regretfully Decline</span>
                    </button>
                  </div>

                  {/* Voice RSVP Button */}
                  <button
                    type="button"
                    onClick={() => setShowVoiceModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#7A3B18] to-[#99451C] text-white text-xs font-medium flex items-center justify-center gap-2 hover:opacity-95 shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    <span>Voice RSVP (Record Voice Note)</span>
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F] pt-1">
                <span>10:14 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
              </div>
            </div>
          </div>

          {/* VOICE NOTE RESPONSE BUBBLE (if user recorded voice note) */}
          {hasVoiceResponse && (
            <div className="flex flex-col items-end w-full">
              <div className="bg-[#D9FDD3] rounded-2xl rounded-tr-xs p-3 shadow-xs border border-[#C2EDB9] max-w-[88%] space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoicePlayback}
                    className="w-10 h-10 rounded-full bg-[#075E54] text-white flex items-center justify-center shrink-0 hover:bg-[#064e46] transition-all shadow-xs"
                    aria-label="Play audio note"
                  >
                    {isPlayingAudio ? (
                      <Square className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    {/* Simulated Waveform */}
                    <div className="flex items-center gap-0.5 h-5">
                      {[12, 18, 8, 22, 14, 28, 19, 10, 24, 16, 20, 11, 26, 15, 9, 21].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-full ${
                            isPlayingAudio ? 'bg-[#075E54] animate-pulse' : 'bg-[#7A8B7A]'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-[#54656F]">
                      <span>0:14</span>
                      <span className="font-semibold text-[#075E54]">Voice RSVP</span>
                    </div>
                  </div>
                </div>

                {/* AI Transcription preview card matching Frame images */}
                <div className="bg-white/80 rounded-xl p-2 text-[11px] text-[#2C2420] border border-black/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#7A3B18]">
                    <span>AI Transcription</span>
                    <span className="text-emerald-700 font-mono">Transcribed</span>
                  </div>
                  <p className="italic text-[#4A403A]">
                    &quot;{voiceTranscript || 'Voice note received.'}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F]">
                  <span>10:15 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                </div>
              </div>
            </div>
          )}

          {/* USER ACCEPTANCE PILL (if clicked accept button) */}
          {!hasVoiceResponse && rsvpStatus === 'accepted' && (
            <div className="flex flex-col items-end w-full">
              <div className="bg-[#D9FDD3] rounded-2xl rounded-tr-xs px-3.5 py-2 shadow-xs border border-[#C2EDB9] max-w-[85%]">
                <p className="text-xs text-[#1F1916] font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#075E54] stroke-[3]" />
                  <span>I joyfully accept the invitation.</span>
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F] mt-1">
                  <span>10:15 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                </div>
              </div>
            </div>
          )}

          {/* ASSISTANT CONFIRMATION & GUEST COUNT SELECTOR */}
          {(rsvpStatus === 'accepted' || hasVoiceResponse) && (
            <div className="flex flex-col items-start max-w-[94%]">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-[#E1DDD5] space-y-3 w-full">
                <p className="text-xs text-[#1F1916] leading-relaxed">
                  Delighted to have you, {firstName(invite?.fullName || 'Guest')}. How many people are in your party?
                </p>

                {/* Party Size Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { count: 1, label: 'Solo (1)' },
                    { count: 2, label: '+1 (2)' },
                    { count: 3, label: '+2 (3)' },
                    { count: 4, label: '+3 (4)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => handleConfirmGuestCount(item.count)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all text-center border ${
                        guestCount === item.count
                          ? 'bg-[#7A3B18] text-white border-[#7A3B18] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#4A403A] border-[#E1DDD5] hover:bg-[#F2EEE9]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {guestCountSubmitted && (
                  <div className="flex items-center gap-1.5 text-xs text-[#075E54] font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Party size confirmed: {guestCount} Attendee{guestCount > 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F]">
                  <span>10:16 AM</span>
                </div>
              </div>
            </div>
          )}

          {/* GUEST PREFERENCES SELECTION CARD */}
          {(guestCountSubmitted || hasVoiceResponse) && (
            <div className="flex flex-col items-start max-w-[94%]">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-[#E1DDD5] space-y-3 w-full">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1916]">
                  <Utensils className="w-4 h-4 text-[#7A3B18]" />
                  <span>VIP Hospitality & Dining Preferences</span>
                </div>
                <p className="text-[11px] text-[#70665F] leading-tight">
                  Please confirm your preferences so our protocol team can personalize your table service:
                </p>

                {/* Preference 1: Role / Relationship */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A403A] block">
                    Relationship / Role:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {withCurrent(['General', 'VIP', 'Family', 'Friend'], role).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          role === r
                            ? 'bg-[#7A3B18] text-white border-[#7A3B18]'
                            : 'bg-[#FAF8F5] text-[#4A403A] border-[#E1DDD5]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preference 2: Dietary Requirements */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A403A] block">
                    Dietary Requirements:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {withCurrent(['Standard Banquet', 'Halal', 'Vegetarian', 'Pescatarian'], diet).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiet(d)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          diet === d
                            ? 'bg-[#7A3B18] text-white border-[#7A3B18]'
                            : 'bg-[#FAF8F5] text-[#4A403A] border-[#E1DDD5]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preference 3: Protocol Escort */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A403A] block">
                    Protocol & Accessibility:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['VIP Protocol Escort', 'Wheelchair / Mobility', 'Standard Gate'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProtocol(p)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          protocol === p
                            ? 'bg-[#7A3B18] text-white border-[#7A3B18]'
                            : 'bg-[#FAF8F5] text-[#4A403A] border-[#E1DDD5]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {!profileSubmitted ? (
                  <button
                    type="button"
                    onClick={handleConfirmProfile}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#075E54] hover:bg-[#064e46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Guest Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#075E54] font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Profile Saved: {role} · {diet}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F]">
                  <span>10:17 AM</span>
                </div>
              </div>
            </div>
          )}

          {/* DIGITAL ACCESS CREDENTIAL ISSUANCE CARD */}
          {profileSubmitted && (
            <div className="flex flex-col items-start max-w-[94%]">
              <div className="bg-[#1C1714] text-white rounded-2xl rounded-tl-xs p-4 shadow-lg border border-[#3E322A] space-y-3.5 w-full">
                
                <div className="flex items-center justify-between border-b border-[#3A2F28] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#7A3B18] flex items-center justify-center font-serif font-bold text-xs text-[#FDE68A]">
                      M
                    </div>
                    <span className="font-serif text-sm font-semibold text-[#FFF8ED]">
                      Verified Digital Credential
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E5A84D] bg-[#2A221C] px-2 py-0.5 rounded-md border border-[#48392F]">
                    {invite?.tableName || 'Not assigned'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* QR Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invite ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(invite.qrCode)}` : '/images/guest/Frame 68.png'}
                      alt={`${invite?.fullName || 'Guest'} QR code`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-serif font-bold text-sm text-[#FDF9F3]">
                      {invite?.fullName || 'Guest'}
                    </p>
                    <p className="text-[11px] text-[#C5B8AC]">
                      Token: <span className="font-mono text-[#E5A84D]">{invite?.qrCode || 'Pending'}</span>
                    </p>
                    {invite?.seatLabel && (
                      <p className="text-[11px] text-[#E5A84D]">
                        Seats: {invite.seatLabel}
                      </p>
                    )}
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Security Validation Active</span>
                    </p>
                  </div>
                </div>

                <Link
                  href={invite ? `/guest/pass?attendeeId=${invite.attendeeId}&eventId=${invite.eventId}&qr=${encodeURIComponent(invite.qrCode)}` : '/guest/pass'}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7A3B18] to-[#99451C] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm border border-[#B25424]"
                >
                  <Award className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>View Full Credential & Save Pass</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center justify-end text-[10px] text-white/50">
                  <span>10:18 AM</span>
                </div>
              </div>
            </div>
          )}

          {/* EVENT LOGISTICS & GUEST BRIEFING CARD */}
          {profileSubmitted && (
            <div className="flex flex-col items-start max-w-[94%]">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-[#E1DDD5] space-y-2.5 w-full">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1916]">
                  <Compass className="w-4 h-4 text-[#7A3B18]" />
                  <span>Event Briefing & Valet Parking</span>
                </div>

                <div className="text-xs text-[#4A403A] space-y-1.5 leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-[#ECE7DF]">
                  <p>
                    <strong className="text-[#1F1916]">Guest group:</strong> {role}.
                  </p>
                  <p>
                    <strong className="text-[#1F1916]">Arrival:</strong> Show this digital pass at the gate.
                  </p>
                  <p>
                    <strong className="text-[#1F1916]">Access:</strong> {protocol}.
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([invite?.event?.venueName, invite?.event?.address, invite?.event?.city].filter(Boolean).join(', ') || invite?.event?.title || 'Event venue')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-[#F0EDE6] hover:bg-[#E8E2D8] text-xs font-medium text-[#7A3B18] flex items-center justify-center gap-1.5 border border-[#D5CFC7] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open {invite?.event?.venueName || 'the venue'} in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#A8988B]" />
                </a>

                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F]">
                  <span>10:19 AM</span>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC USER MESSAGES */}
          {customMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col w-full ${
                msg.sender === 'user' ? 'items-end' : 'items-start max-w-[94%]'
              }`}
            >
              <div
                className={`rounded-2xl p-3 shadow-xs text-xs max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-[#D9FDD3] rounded-tr-xs border border-[#C2EDB9] text-[#1F1916]'
                    : 'bg-white rounded-tl-xs border border-[#E1DDD5] text-[#1F1916]'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#70665F] mt-1">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                </div>
              </div>
            </div>
          ))}

          {liveMessages.map((message) => {
            const mine = message.direction === 'INBOUND';
            return (
              <div key={message.id} className={`flex flex-col w-full ${mine ? 'items-end' : 'items-start max-w-[94%]'}`}>
                <div className={`rounded-2xl p-3 shadow-xs text-xs max-w-[85%] ${mine ? 'bg-[#D9FDD3] rounded-tr-xs border border-[#C2EDB9]' : 'bg-white rounded-tl-xs border border-[#E1DDD5]'}`}>
                  {message.mediaUrl && <ChatMedia url={message.mediaUrl} kind={message.mediaKind} name={message.fileName} />}
                  {message.body && <p className="leading-relaxed">{message.body}</p>}
                  <div className="mt-1 text-right text-[10px] text-[#70665F]">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Footer Input Bar */}
        <form
          onSubmit={handleSendTextMessage}
          className="relative bg-[#F0F2F5] px-2.5 py-2 flex items-center gap-1.5 border-t border-[#E1DDD5] z-30 shrink-0"
        >
          {emojiOpen && <EmojiPicker onPick={(emoji) => setInputMessage((value) => `${value}${emoji}`)} />}
          <button
            type="button"
            className="p-1.5 text-[#54656F] hover:bg-black/5 rounded-full transition-colors"
            aria-label="Emoji"
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-1.5 text-[#54656F] hover:bg-black/5 rounded-full transition-colors"
            aria-label="Attachment"
            onClick={() => chatFileRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>
          <input
            ref={chatFileRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void sendGuestChat({ file });
            }}
          />

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type reply in English or native lang..."
            className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-[#1F1916] placeholder:text-[#8696A0] border border-[#E1DDD5] focus:outline-hidden focus:ring-1 focus:ring-[#075E54]"
          />

          {inputMessage.trim() ? (
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void voiceNote.toggle()}
              className={`w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 ${voiceNote.recording ? 'bg-red-700' : 'bg-[#075E54] hover:bg-[#064e46]'}`}
              aria-label="Voice note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
        {(chatError || voiceNote.error || voiceNote.recording || chatBusy) && (
          <p className="bg-[#F0F2F5] px-3 pb-2 text-[11px] text-[#70665F]">
            {voiceNote.recording ? 'Recording… tap the microphone again to send.' : chatError || voiceNote.error || (chatBusy ? 'Sending…' : '')}
          </p>
        )}

        {/* VOICE RSVP MODAL (Replicating Guest Conversation Screen-4.png / Screen-6.png) */}
        {showVoiceModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-[#E1DDD5]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#7A3B18]/10 flex items-center justify-center text-[#7A3B18]">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1F1916]">
                      WhatsApp Voice Note RSVP
                    </h3>
                    <p className="text-[11px] text-[#70665F]">
                      Speech-to-Text Multi-Language Support
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="w-7 h-7 rounded-full bg-[#F0EDE6] hover:bg-[#E5DFD5] text-[#4A403A] flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Central Voice Recording Animation Area */}
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  {isRecording && (
                    <>
                      <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                      <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-pulse pointer-events-none" />
                    </>
                  )}
                  
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                      isRecording
                        ? 'bg-rose-600 text-white'
                        : recordedAudioReady
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#075E54] text-white'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-[#1F1916]">
                    {isRecording
                      ? 'Listening to your RSVP...'
                      : recordedAudioReady
                      ? 'Voice response recorded!'
                      : 'Speak your response naturally in your preferred language'}
                  </p>
                  <p className="font-mono text-sm text-[#70665F]">
                    {isRecording || recordedAudioReady
                      ? `00:${String(recordingSeconds).padStart(2, '0')}`
                      : 'Ready'}
                  </p>
                </div>
              </div>

              {voiceError && (
                <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {voiceError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {!isRecording && !recordedAudioReady && (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-full py-3 rounded-2xl bg-[#075E54] hover:bg-[#064e46] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                )}

                {isRecording && (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Recording</span>
                  </button>
                )}

                {recordedAudioReady && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={voiceSending}
                      onClick={() => void handleSendVoiceNote()}
                      className="w-full py-3 rounded-2xl bg-[#075E54] hover:bg-[#064e46] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      <span>{voiceSending ? 'Transcribing…' : 'Send Voice RSVP Note'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="w-full py-2 rounded-xl bg-[#F0EDE6] text-[#70665F] hover:bg-[#E5DFD5] text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-record Note</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
