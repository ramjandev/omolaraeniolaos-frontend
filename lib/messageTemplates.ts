import { store } from '@/store/store';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export type TemplateChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export interface MessageTemplate {
  id: string;
  name: string;
  channel: TemplateChannel;
  content: string;
  updatedAt: string;
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window === 'undefined') return headers;
  const token =
    store.getState().auth.accessToken ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof json?.message === 'string' ? json.message : fallback;
    throw new Error(message);
  }
  return (json?.data ?? json) as T;
}

export async function listMessageTemplates(eventId: string) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}/templates`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const rows = await readJson<MessageTemplate[]>(res, 'Templates could not be loaded.');
  return Array.isArray(rows) ? rows : [];
}

export async function createMessageTemplate(
  eventId: string,
  body: { name: string; channel: TemplateChannel; content: string },
) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}/templates`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readJson<MessageTemplate>(res, 'The template could not be created.');
}

export async function updateMessageTemplate(
  eventId: string,
  templateId: string,
  body: { name: string; channel: TemplateChannel; content: string },
) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}/templates/${templateId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readJson<MessageTemplate>(res, 'The template could not be saved.');
}

export async function deleteMessageTemplate(eventId: string, templateId: string) {
  const res = await fetch(`${API_ROOT}/communications/events/${eventId}/templates/${templateId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await readJson(res, 'The template could not be deleted.');
}

export function fillMessageTemplate(content: string, values: Record<string, string>) {
  return content.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key: string) => values[key] ?? '');
}

export function templateChannelLabel(channel: string) {
  if (channel === 'SMS') return 'SMS';
  if (channel === 'EMAIL') return 'Email';
  return 'WhatsApp';
}
