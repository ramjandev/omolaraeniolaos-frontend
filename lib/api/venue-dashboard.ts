import { store } from '@/store/store';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export type VenueBookingStatus = 'Confirmed' | 'Tentative' | 'Awaiting' | 'Cancelled';

export interface VenueDashboardBooking {
  id: string;
  event: string;
  category: string;
  spaceId: string | null;
  space: string;
  startDate: string;
  endDate: string;
  organizer: string;
  guests: number;
  status: VenueBookingStatus;
}

export interface VenueDashboardSpace {
  id: string;
  name: string;
  capacity: number;
  status: 'Occupied' | 'Available' | 'Unavailable';
  utilization: number;
  nextBooking: { date: string; time: string } | null;
}

export interface VenueDashboard {
  organizer: { fullName: string; propertyName: string | null };
  metrics: {
    totalSpaces: number;
    spacesChange: number | null;
    upcoming: number;
    upcomingChange: number | null;
    today: number;
    available: number;
  };
  bookings: VenueDashboardBooking[];
  spaces: VenueDashboardSpace[];
  performance: {
    months: Array<{ label: string; count: number }>;
    growth: number | null;
    utilization: Array<{ name: string; percent: number }>;
    averageUtilization: number;
  };
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

export async function getVenueDashboard() {
  const res = await fetch(`${API_ROOT}/venue/dashboard`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || 'Venue dashboard could not be loaded');
  }
  return (json?.data ?? json) as VenueDashboard;
}
