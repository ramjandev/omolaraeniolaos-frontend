import { io, Socket } from 'socket.io-client';
import { store } from '@/store/store';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export function apiOrigin() {
  return API_ROOT.replace(/\/api$/, '');
}

export interface LiveMessage {
  id: string;
  eventId: string;
  attendeeId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  mediaUrl?: string | null;
  mediaKind?: string | null;
  fileName?: string | null;
  createdAt: string;
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token =
      store.getState().auth.accessToken ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof json?.message === 'string' ? json.message : 'The message could not be sent';
    throw new Error(message);
  }
  return (json?.data ?? json) as T;
}

export async function listLiveThread(eventId: string, attendeeId: string) {
  const res = await fetch(`${API_ROOT}/chat/threads/${eventId}/${attendeeId}`, { cache: 'no-store' });
  const rows = await readJson<LiveMessage[]>(res);
  return Array.isArray(rows) ? rows : [];
}

export async function postLiveMessage(body: {
  eventId: string;
  attendeeId: string;
  from: 'guest' | 'organizer';
  body?: string;
  mediaUrl?: string;
  mediaKind?: string;
  fileName?: string;
}) {
  const res = await fetch(`${API_ROOT}/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return readJson<LiveMessage>(res);
}

export async function uploadMedia(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_ROOT}/uploads`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return readJson<{ url: string; mediaKind: string; fileName: string }>(res);
}

export function subscribeThread(
  eventId: string,
  attendeeId: string,
  onMessage: (message: LiveMessage) => void,
) {
  const socket: Socket = io(`${apiOrigin()}/chat`, { transports: ['websocket', 'polling'] });
  socket.emit('join', { eventId, attendeeId });
  socket.on('message', onMessage);
  return () => {
    socket.off('message', onMessage);
    socket.disconnect();
  };
}

export function mergeMessage(current: LiveMessage[], incoming: LiveMessage) {
  if (current.some((item) => item.id === incoming.id)) return current;
  return [...current, incoming];
}
