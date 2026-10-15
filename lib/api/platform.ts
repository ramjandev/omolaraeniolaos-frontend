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

export async function verifyGatePass(payload: {
  qrCode: string;
  gateTurnstile?: string;
  staffId?: string;
  scannedAt?: string;
  clientScanId?: string;
}) {
  const res = await fetch(`${API_ROOT}/gate/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
