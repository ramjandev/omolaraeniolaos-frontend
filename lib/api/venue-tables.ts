import { store } from '@/store/store';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export type SeatCategory = 'VIP' | 'Standard' | 'Accessible';
export type SeatStatus = 'Reserved' | 'Available' | 'Unavailable';

export interface SeatingTable {
  id: string;
  tableNumber: string;
  seats: number;
  category: SeatCategory;
  status: SeatStatus;
}

export interface SeatingZone {
  id: string;
  spaceId: string | null;
  name: string;
  category: SeatCategory;
  tableCount: number;
  totalSeats: number;
  availableSeats: number;
  tables: SeatingTable[];
}

export interface SeatingLayout {
  hall: { id: string; name: string; address: string } | null;
  spaces: Array<{ id: string; name: string }>;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  unavailableSeats: number;
  zones: SeatingZone[];
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      store.getState().auth.accessToken ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function read<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Seating layout could not be loaded');
  return (json?.data ?? json) as T;
}

export function getSeatingLayout(spaceId?: string) {
  const query = spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : '';
  return read<SeatingLayout>(`/venue/tables${query}`);
}

export function saveSeatingZone(body: { name: string; category: SeatCategory; spaceId: string }, zoneId?: string) {
  return read<SeatingLayout>(zoneId ? `/venue/tables/zones/${zoneId}` : '/venue/tables/zones', {
    method: zoneId ? 'PATCH' : 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteSeatingZone(zoneId: string) {
  return read<SeatingLayout>(`/venue/tables/zones/${zoneId}`, { method: 'DELETE' });
}

export function saveSeatingTable(
  zoneId: string,
  body: { name: string; seats: number; seatType: SeatCategory; status: SeatStatus; tableId?: string },
) {
  return read<SeatingLayout>(`/venue/tables/zones/${zoneId}/tables`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteSeatingTable(zoneId: string, tableId: string) {
  return read<SeatingLayout>(`/venue/tables/zones/${zoneId}/tables/${tableId}`, { method: 'DELETE' });
}
