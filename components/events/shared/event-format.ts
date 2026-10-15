export type EventUiStatus = 'draft' | 'active' | 'live' | 'completed';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
}

export function toUiStatus(status?: string, rawStatus?: string): EventUiStatus {
  const raw = (rawStatus ?? status ?? '').toUpperCase();
  if (raw === 'LIVE') return 'live';
  if (raw === 'COMPLETED' || raw === 'ARCHIVED') return 'completed';
  if (raw === 'PUBLISHED' || raw === 'ACTIVE') return 'active';
  return 'draft';
}

export function formatEventDate(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatEventTime(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase();
}

export function countdownTo(value?: string | Date | null, now = new Date()): Countdown | null {
  if (!value) return null;
  const diff = new Date(value).getTime() - now.getTime();
  if (Number.isNaN(diff) || diff <= 0) return null;
  const minutes = Math.floor(diff / 60_000);
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}
