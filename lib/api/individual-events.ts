/**
 * Individual Organizer Events API Client
 * Connects frontend UI to NestJS Individual Events API
 */

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');
const API_BASE = `${API_ROOT}/individual`;

export interface IndividualEventSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  format: string;
  status: 'active' | 'draft' | 'completed';
  rawStatus: string;
  date: string;
  time: string;
  startDate: string;
  endDate: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  guestsCount: number;
  confirmedCount: number;
  checkedInCount: number;
  totalTarget: number;
  daysLeft: number;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface IndividualEventWorkspaceData {
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    format: string;
    status: 'active' | 'draft' | 'completed';
    rawStatus: string;
    description: string;
    venueName: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    startDate: string;
    endDate: string;
    dateFormatted: string;
    timeFormatted: string;
  };
  kpis: {
    totalInvited: { current: number; target: number; label: string };
    confirmedRsvp: { current: number; rate: string };
    checkedIn: { current: number; rate: string };
    vipAttendance: { current: number; total: number; rate: string };
  };
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
  checklist: Array<{
    id: number;
    title: string;
    description: string;
    status: 'completed' | 'in_progress' | 'ready' | 'pending';
  }>;
  ticketTiers: any[];
  tableZones: any[];
}

export interface WorkspaceGuestDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  checkInStatus: string;
  rsvpStatus: string;
  inviteThrough: string;
  partySize: number;
  preference: string;
  isFlagged?: boolean;
  qrCode?: string;
  tableSeat?: string;
}

export interface GuestRosterResponse {
  guests: WorkspaceGuestDto[];
  metrics: {
    totalGuests: number;
    confirmedCount: number;
    checkedInCount: number;
    notArrivedCount: number;
    flaggedCount: number;
  };
}

export interface CheckInMonitorResponse {
  liveActivityStream: Array<{
    id: string;
    attendeeName: string;
    scannedAt: string;
    turnstile: string;
    staffName?: string | null;
  }>;
  flaggedExceptions: Array<{
    flagId: string;
    attendeeName: string;
    reason: string;
    timestamp: string;
    turnstile: string;
  }>;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Fetch all events for individual organizer
 */
export async function getIndividualEvents(params?: {
  status?: string;
  search?: string;
  category?: string;
}): Promise<{
  events: IndividualEventSummary[];
  counts: { all: number; active: number; draft: number; completed: number };
}> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);

  const url = `${API_BASE}/events${query.toString() ? `?${query.toString()}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load individual events (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Get single event workspace details (4 KPIs, countdown, checklist)
 */
export async function getIndividualEventById(
  id: string,
): Promise<IndividualEventWorkspaceData> {
  const url = `${API_BASE}/events/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load event workspace (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Create new individual event
 */
export async function createIndividualEvent(data: {
  title: string;
  category: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  venueName?: string;
  address?: string;
  description?: string;
}): Promise<any> {
  const url = `${API_BASE}/events`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create event (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Update event details
 */
export async function updateIndividualEvent(
  id: string,
  data: Partial<IndividualEventSummary>,
): Promise<any> {
  const url = `${API_BASE}/events/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update event (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Update checklist step progress
 */
export async function updateSetupStepProgress(
  id: string,
  stepIndex: number,
  completed: boolean,
): Promise<any> {
  const url = `${API_BASE}/events/${id}/setup-step`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ stepIndex, completed }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update setup step (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Publish / Activate event
 */
export async function publishIndividualEvent(id: string): Promise<any> {
  const url = `${API_BASE}/events/${id}/publish`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to publish event (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Get guest roster
 */
export async function getEventGuests(
  id: string,
  params?: { search?: string; status?: string; type?: string },
): Promise<GuestRosterResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.type) query.append('type', params.type);

  const url = `${API_BASE}/events/${id}/guests${
    query.toString() ? `?${query.toString()}` : ''
  }`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load guest roster (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Add single guest
 */
export async function addEventGuest(
  id: string,
  guest: {
    name: string;
    phone: string;
    email?: string;
    type?: string;
    partySize?: number;
    rsvpStatus?: string;
    checkInStatus?: string;
    inviteThrough?: string;
    preference?: string;
  },
): Promise<WorkspaceGuestDto> {
  const url = `${API_BASE}/events/${id}/guests`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(guest),
  });

  if (!res.ok) {
    throw new Error(`Failed to add guest (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Bulk add guests
 */
export async function bulkAddEventGuests(
  id: string,
  guests: Array<{
    name: string;
    phone: string;
    email?: string;
    type?: string;
    partySize?: number;
    rsvpStatus?: string;
  }>,
): Promise<any> {
  const url = `${API_BASE}/events/${id}/guests/bulk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ guests }),
  });

  if (!res.ok) {
    throw new Error(`Failed to bulk add guests (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Update guest
 */
export async function updateEventGuest(
  eventId: string,
  guestId: string,
  data: Partial<WorkspaceGuestDto>,
): Promise<any> {
  const url = `${API_BASE}/events/${eventId}/guests/${guestId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update guest (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Delete guest
 */
export async function deleteEventGuest(
  eventId: string,
  guestId: string,
): Promise<any> {
  const url = `${API_BASE}/events/${eventId}/guests/${guestId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete guest (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Send / Resend invitation
 */
export async function sendGuestInvitation(
  eventId: string,
  guestId: string,
  channel: string = 'WhatsApp',
): Promise<any> {
  const url = `${API_BASE}/events/${eventId}/guests/${guestId}/invite`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ channel }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send invitation (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Get Seating Blueprint
 */
export async function getEventSeatingBlueprint(id: string): Promise<any> {
  const url = `${API_BASE}/events/${id}/seating`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get seating blueprint (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Assign Guest Seat
 */
export async function assignGuestSeat(
  id: string,
  data: {
    attendeeId: string;
    tableNumber: number;
    seatNumber?: number;
    zoneName?: string;
  },
): Promise<any> {
  const url = `${API_BASE}/events/${id}/seating/assign`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to assign seat (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Get live turnstile check-in telemetry
 */
export async function getEventCheckInMonitor(
  id: string,
): Promise<CheckInMonitorResponse> {
  const url = `${API_BASE}/events/${id}/check-in`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get check-in monitor (${res.status})`);
  }

  const json = (await res.json()) as
    | CheckInMonitorResponse
    | { data: CheckInMonitorResponse };
  return 'data' in json ? json.data : json;
}

/**
 * Resolve check-in exception flag
 */
export async function resolveCheckInFlag(
  id: string,
  flagId: string,
  action: 'trust_staff' | 'manual_resolve',
  notes?: string,
): Promise<any> {
  const url = `${API_BASE}/events/${id}/check-in/resolve-flag`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ flagId, action, notes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to resolve flag (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}

/**
 * Assign all gate staff
 */
export async function assignAllGateStaff(id: string): Promise<any> {
  const url = `${API_BASE}/events/${id}/check-in/assign-all-gates`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to assign all gate staff (${res.status})`);
  }

  const json = await res.json();
  return json.data || json;
}
