import { store } from '@/store/store';

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export interface AgencyDashboard {
  organizer: { fullName: string; agencyName: string };
  metrics: {
    totalEvents: number;
    eventsThisMonth: number;
    activeClients: number;
    upcomingEvents: number;
    teamMembers: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    kind: 'client' | 'own';
    ownerLabel: string;
    startDate: string;
    summary: string;
  }>;
  activity: Array<{
    id: string;
    title: string;
    occurredAt: string;
  }>;
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

export interface AgencyClientOption {
  id: string;
  name: string;
  contactEmail: string;
  contactPerson?: string;
  contactPhone?: string | null;
  industry?: string;
  notes?: string | null;
  status?: string;
  createdAt?: string;
  totalEvents?: number;
}

export interface AgencyClientEvent {
  id: string;
  title: string;
  startDate: string;
  venueName?: string | null;
  city?: string | null;
  status: string;
  uiStatus: 'Planning' | 'Confirmed' | 'Completed' | 'Archive';
  coverImageUrl?: string | null;
}

export interface AgencyClientDetail extends AgencyClientOption {
  summary: { totalEvents: number; upcoming: number; completed: number };
  events: AgencyClientEvent[];
  activity: Array<{ id: string; title: string; detail: string; occurredAt: string }>;
}

export interface AgencyClientInput {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  industry?: string;
  notes?: string;
}

export async function getAgencyClients() {
  const res = await fetch(`${API_ROOT}/agency/clients`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || 'Clients could not be loaded');
  }
  return (json?.data ?? json) as AgencyClientOption[];
}

export async function getAgencyClient(id: string) {
  const res = await fetch(`${API_ROOT}/agency/clients/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Client could not be loaded');
  return (json?.data ?? json) as AgencyClientDetail;
}

export async function updateAgencyClient(id: string, body: AgencyClientInput) {
  const res = await fetch(`${API_ROOT}/agency/clients/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      name: body.name,
      industry: body.industry || '',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes || '',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Client could not be updated');
  return (json?.data ?? json) as AgencyClientOption;
}

export async function archiveAgencyClient(id: string) {
  const res = await fetch(`${API_ROOT}/agency/clients/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Client could not be archived');
  return (json?.data ?? json) as AgencyClientOption;
}

export async function createAgencyClient(body: AgencyClientInput) {
  const res = await fetch(`${API_ROOT}/agency/clients`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: body.name,
      industry: body.industry || '',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes || '',
      contractTotal: 0,
      currency: 'NGN',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || 'Client could not be created');
  }
  return (json?.data ?? json) as AgencyClientOption;
}

export interface AgencyTeamMemberRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'Agency Owner' | 'Venue Owner' | 'Admin' | 'Gate Staff';
  kind: 'owner' | 'admin' | 'gate';
  joinedAt: string;
  assignment: string | null;
  eventId: string | null;
  isYou: boolean;
}

export interface AgencyTeam {
  metrics: { owners: number; admins: number; gateStaff: number };
  events: Array<{ id: string; title: string }>;
  members: AgencyTeamMemberRow[];
}

export async function getAgencyTeam() {
  const res = await fetch(`${API_ROOT}/agency/team`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Team could not be loaded');
  return (json?.data ?? json) as AgencyTeam;
}

export async function inviteAgencyTeamMember(body: {
  fullName: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Gate Staff';
  eventId?: string;
}) {
  const res = await fetch(`${API_ROOT}/agency/team/invite`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Invitation could not be sent');
  return json?.data ?? json;
}

export async function assignAgencyTeamMember(body: {
  memberId: string;
  kind: 'admin' | 'gate';
  eventId: string;
}) {
  const res = await fetch(`${API_ROOT}/agency/team/assign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Team member could not be assigned');
  return json?.data ?? json;
}

export interface AgencyReport {
  periodLabel: string;
  currency: string;
  filters: {
    events: Array<{ id: string; title: string }>;
    clients: Array<{ id: string; name: string }>;
  };
  metrics: {
    totalEvents: number;
    activeEvents: number;
    totalGuests: number;
    rsvpRate: number;
    confirmedGuests: number;
    eventsCompleted: number;
    totalRevenue: number;
    avgGuests: number;
    avgRevenue: number;
    attendanceRate: number;
  };
  performance: Array<{ month: string; active: number; completed: number; created: number }>;
  rsvp: Array<{ month: string; confirmed: number; declined: number; noResponse: number; pending: number }>;
  attendance: Array<{ month: string; attended: number; confirmed: number; invited: number }>;
  byClient: Array<{ name: string; count: number }>;
  revenue: Array<{ month: string; amount: number }>;
  eventTypes: Array<{ name: string; value: number; percent: number }>;
}

export async function getAgencyReport(params: {
  range: string;
  from?: string;
  to?: string;
  eventId?: string;
  clientId?: string;
}) {
  const search = new URLSearchParams({ range: params.range });
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.eventId) search.set('eventId', params.eventId);
  if (params.clientId) search.set('clientId', params.clientId);
  const res = await fetch(`${API_ROOT}/agency/reports?${search.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Reports could not be loaded');
  return (json?.data ?? json) as AgencyReport;
}

export async function getAgencyDashboard() {
  const res = await fetch(`${API_ROOT}/agency/dashboard`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || 'Agency dashboard could not be loaded');
  }
  return (json?.data ?? json) as AgencyDashboard;
}
