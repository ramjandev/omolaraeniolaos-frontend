const API_ROOT =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export async function getCommsHealth() {
  const res = await fetch(`${API_ROOT}/communications/health`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Unable to load channel health');
  return readJson<{
    sandbox: boolean;
    channels: Record<string, string>;
  }>(res);
}

export async function listEventCommunications(eventId: string) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Unable to load communications');
  return readJson<Array<{
    subject?: string;
    deliveries?: Array<{ attendeeId: string; status: string; sentAt?: string | null }>;
  }>>(res);
}

export async function listGuestThread(eventId: string, attendeeId: string) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}/threads/${attendeeId}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Unable to load the conversation');
  return readJson<Array<{
    direction: 'INBOUND' | 'OUTBOUND';
    body: string;
    createdAt: string;
  }>>(res);
}

export async function dispatchCoordinatedMessage(body: {
  eventId: string;
  attendeeIds?: string[];
  channels: Array<'WHATSAPP' | 'SMS' | 'EMAIL'>;
  subject: string;
  content: string;
}) {
  const res = await fetch(`${API_ROOT}/communications/dispatch`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Dispatch failed');
  return readJson(res);
}

export interface GuestPass {
  attendeeId: string;
  eventId: string;
  fullName: string;
  email?: string;
  phone?: string;
  qrCode: string;
  passToken?: string;
  rsvpStatus: string;
  status: string;
  partySize: number;
  dietaryPreference?: string | null;
  language?: string | null;
  guestType?: string | null;
  notes?: string | null;
  tableName?: string;
  seatLabel?: string;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    startDate: string;
    endDate?: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    coverImageUrl?: string | null;
    venueName?: string | null;
  } | null;
}

export async function getGuestPass(query: {
  attendeeId?: string | null;
  eventId?: string | null;
  qrCode?: string | null;
}): Promise<GuestPass> {
  const params = new URLSearchParams();
  if (query.attendeeId) params.set('attendeeId', query.attendeeId);
  if (query.eventId) params.set('eventId', query.eventId);
  if (query.qrCode) params.set('qrCode', query.qrCode);
  const res = await fetch(`${API_ROOT}/guest/pass?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Invitation could not be loaded');
  return readJson<GuestPass>(res);
}

export async function submitGuestRsvp(body: {
  attendeeId?: string | null;
  eventId?: string | null;
  qrCode?: string | null;
  phone?: string | null;
  status: 'accepted' | 'tentative' | 'declined';
  partySize?: number;
  dietary?: string;
  language?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_ROOT}/guest/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('RSVP could not be saved');
  return readJson(res);
}

export interface GateWorkspace {
  staff: {
    id: string;
    profileId: string | null;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  events: Array<{
    id: string;
    title: string;
    startDate: string;
    gate: string;
    organizer: string;
    status: 'Upcoming' | 'Live' | 'Ended' | string;
    expected: number;
    checkedIn: number;
  }>;
  scans: Array<{
    id: string;
    name: string;
    partySize: number;
    eventId: string;
    gate: string;
    scannedAt: string;
    status: string;
  }>;
}

export interface GateGuestResult {
  id: string;
  name: string;
  guestType: string;
  partySize: number;
  rsvpStatus: string;
  checkInStatus: string;
  qrCode: string;
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  const res = await fetch(`${API_ROOT}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const json = await res.json().catch(() => null);
  const data = json?.data ?? json;
  if (!data?.accessToken) return false;
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('accessToken', data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  return true;
}

export async function pingGatePresence() {
  const res = await fetch(`${API_ROOT}/gate/presence`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.ok;
}

export async function getGateWorkspace(): Promise<GateWorkspace> {
  let res = await fetch(`${API_ROOT}/gate/workspace`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (res.status === 401 && (await refreshAccessToken())) {
    res = await fetch(`${API_ROOT}/gate/workspace`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
  }
  if (!res.ok) throw new Error('Sign in as gate staff to see your events');
  return readJson<GateWorkspace>(res);
}

export async function searchGateGuests(eventId: string, query: string): Promise<GateGuestResult[]> {
  const params = new URLSearchParams({ eventId, q: query });
  const res = await fetch(`${API_ROOT}/gate/guests?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Guests could not be loaded');
  return readJson<GateGuestResult[]>(res);
}

export async function verifyGatePass(payload: {
  qrCode: string;
  gateTurnstile?: string;
  staffId?: string;
  scannedAt?: string;
  clientScanId?: string;
}) {
  const res = await fetch(`${API_ROOT}/gate/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: json?.data ?? json };
}

export async function syncOfflineScans(
  scans: Array<{
    qrCode: string;
    scannedAt?: string;
    clientScanId?: string;
    gateTurnstile?: string;
  }>,
) {
  const res = await fetch(`${API_ROOT}/gate/sync`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ scans }),
  });
  if (!res.ok) throw new Error('Offline sync failed');
  return readJson(res);
}

export async function getSampleGatePass() {
  const res = await fetch(`${API_ROOT}/gate/sample-pass`, { cache: 'no-store' });
  if (!res.ok) return { available: false as const };
  return readJson<{
    available: boolean;
    attendee?: { qrCode: string; fullName: string };
  }>(res);
}

export { API_ROOT };
