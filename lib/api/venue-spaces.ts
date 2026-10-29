import { store } from '@/store/store';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export interface VenueSpaceBooking {
  id: string;
  event: string;
  category: string;
  startDate: string;
  endDate: string;
  organizer: string;
  guests: number;
  status: 'Confirmed' | 'Tentative' | 'Awaiting' | 'Cancelled';
}

export interface VenueSpaceCard {
  id: string;
  name: string;
  type: string;
  typeValue: string;
  capacity: number;
  address: string;
  description: string | null;
  imageUrl: string | null;
  amenities: string[];
  status: string;
  statusValue: string;
  active: boolean;
  spacesCount: number;
  utilization: number;
  nextBooking: VenueSpaceBooking | null;
  seating: { configured: number; reserved: number; available: number };
}

export interface VenueSpaceDetail extends VenueSpaceCard {
  areas: Array<{ id: string; name: string; tables: number; seats: number }>;
  bookings: VenueSpaceBooking[];
}

export interface VenueSpacesResponse {
  metrics: {
    totalVenues: number;
    venuesChange: number | null;
    totalSpaces: number;
    available: number;
    occupied: number;
  };
  spaces: VenueSpaceCard[];
}

export interface VenueSpaceInput {
  name: string;
  type: string;
  capacity: number;
  address?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  amenities?: string[];
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
  if (!res.ok) throw new Error(json?.message || 'Venue spaces could not be loaded');
  return (json?.data ?? json) as T;
}

export function getVenueSpaces() {
  return read<VenueSpacesResponse>('/venue/spaces');
}

export function getVenueSpace(id: string) {
  return read<VenueSpaceDetail>(`/venue/spaces/${id}`);
}

export function createVenueSpace(body: VenueSpaceInput) {
  return read<VenueSpaceDetail>('/venue/spaces', { method: 'POST', body: JSON.stringify(body) });
}

export function updateVenueSpace(id: string, body: VenueSpaceInput) {
  return read<VenueSpaceDetail>(`/venue/spaces/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}
