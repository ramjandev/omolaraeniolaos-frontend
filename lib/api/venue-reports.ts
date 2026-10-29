import { store } from '@/store/store';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export interface VenueReport {
  periodLabel: string;
  spaces: Array<{ id: string; name: string }>;
  metrics: {
    totalBookings: number;
    bookingsChange: number | null;
    upcoming: number;
    upcomingChange: number | null;
    utilization: number;
    utilizationChange: number | null;
    guests: number;
    guestsChange: number | null;
  };
  bookingsOverTime: Array<{ month: string; count: number }>;
  guestSeries: string[];
  guestVolume: Array<Record<string, string | number>>;
  utilization: Array<{
    id: string;
    name: string;
    bookings: number;
    guests: number;
    utilization: number;
    upcoming: number;
  }>;
  breakdown: Array<{ name: string; bookings: number; guests: number; share: number }>;
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

export async function getVenueReport(range: string, spaceId?: string) {
  const params = new URLSearchParams({ range });
  if (spaceId) params.set('spaceId', spaceId);
  const res = await fetch(`${API_ROOT}/venue/reports?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Venue reports could not be loaded');
  return (json?.data ?? json) as VenueReport;
}
