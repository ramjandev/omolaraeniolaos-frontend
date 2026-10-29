const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export interface DashboardSummary {
  totalOrganizers: number;
  breakdown: { individual: number; agency: number; venue: number };
  activeEvents: number;
  completedEvents: number;
  totalRevenue: number;
}

export interface OrganizerBreakdown {
  totalOrganizers: number;
  items: Array<{ type: string; count: number; percentage: number }>;
}

export interface RevenueByType {
  totalOrganizers: number;
  totalRevenue: number;
  rows: Array<{
    type: string;
    organizersCount: number;
    revenueAmount: number;
    billingModel: string;
  }>;
}

export interface DashboardEvent {
  id: string;
  name: string;
  organizer: string;
  organizerType: string;
  status: string;
  date: string;
  guestsCount: number;
  eventType: string;
}

export interface DashboardEventsPage {
  data: DashboardEvent[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminEventDetail {
  event: {
    id: string;
    title: string;
    status: string;
    category: string;
    description?: string | null;
    startDate: string;
    endDate?: string;
    timezone?: string | null;
    venueName?: string | null;
    address?: string | null;
    capacity?: number;
    coverImageUrl?: string | null;
    countdown: { days: number; hours: number; minutes: number };
  };
  summary: {
    totalInvitees: { value: number };
    confirmed: { value: number };
    checkedIn: { value: number };
  };
  rsvpStatusBreakdown: Array<{ label: string; count: number; percentage: number }>;
  eventDetails: {
    organizer: string;
    organizerType: string;
    eventDate: string;
    eventType: string;
    location?: string | null;
    billing: string;
  };
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || 'Admin data could not be loaded');
  }
  return (json?.data ?? json) as T;
}

export function getDashboardSummary() {
  return fetch(`${API_ROOT}/admin/dashboard/summary`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<DashboardSummary>(res));
}

export function getOrganizerBreakdown() {
  return fetch(`${API_ROOT}/admin/dashboard/organizer-breakdown`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<OrganizerBreakdown>(res));
}

export function getRevenueByType() {
  return fetch(`${API_ROOT}/admin/dashboard/revenue-by-type`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<RevenueByType>(res));
}

export function getDashboardActiveEvents(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set('search', search.trim());
  return fetch(`${API_ROOT}/admin/dashboard/active-events?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<DashboardEventsPage>(res));
}

export interface AdminEventsPage {
  data: DashboardEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    activeEvents: number;
    eventTypes: string[];
    tabCounts: { all: number; active: number; draft: number; completed: number };
  };
}

export function getAdminEvents(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  organizerType?: string;
  eventType?: string;
  sort?: string;
}) {
  const params = new URLSearchParams({
    page: String(query.page || 1),
    limit: String(query.limit || 10),
    status: query.status || 'All',
    organizerType: query.organizerType || 'All',
    eventType: query.eventType || 'All',
    sort: query.sort || 'date',
  });
  if (query.search?.trim()) params.set('search', query.search.trim());
  return fetch(`${API_ROOT}/admin/dashboard/events?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AdminEventsPage>(res));
}

export function getAdminEventDetail(id: string) {
  return fetch(`${API_ROOT}/admin/dashboard/events/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AdminEventDetail>(res));
}

export interface AdminOrganizerRow {
  id: string;
  name: string;
  contactEmail: string;
  phone?: string | null;
  type: string;
  status: string;
  eventsCount: number;
  plan: string;
  joinedAt: string;
}

export interface AdminOrganizersPage {
  data: AdminOrganizerRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    tabCounts: { all: number; individual: number; agency: number; venue: number };
  };
}

export interface AdminOrganizerDetail extends AdminOrganizerRow {
  events: Array<{
    id: string;
    title: string;
    status: string;
    startDate?: string;
    _count?: { attendees?: number; orders?: number };
  }>;
}

export function getAdminOrganizers(query: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.status) params.set('status', query.status);
  if (query.search?.trim()) params.set('search', query.search.trim());
  params.set('page', String(query.page || 1));
  params.set('limit', String(query.limit || 10));
  return fetch(`${API_ROOT}/admin/organizers?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AdminOrganizersPage>(res));
}

export function getAdminOrganizer(id: string) {
  return fetch(`${API_ROOT}/admin/organizers/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AdminOrganizerDetail>(res));
}

export function formatNaira(amount: number) {
  const value = Number(amount) || 0;
  if (Math.abs(value) >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `₦${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₦${value.toLocaleString('en-NG')}`;
}

export interface RevenueOverview {
  totalRevenue: { amount: number };
  currentMonth?: { amount: number; label: string };
  momGrowth: { percentage: number; comparedWith?: string };
  availablePlans: { count: number };
  activeSubscriptions: { count: number };
}

export interface RevenueBreakdown {
  period: string;
  year: number;
  data: Array<{ month: string; amount: number }>;
}

export interface RevenueTransaction {
  id: string;
  txId: string;
  date: string;
  organizer: string;
  organizerType: string;
  buyerName?: string;
  buyerEmail?: string;
  amount: number;
  currency: string;
  status: string;
  plan: string | null;
  paymentGateway?: string;
  transactionRef?: string | null;
  paidAt?: string | null;
}

export interface RevenueTransactionsPage {
  data: RevenueTransaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function getRevenueOverview() {
  return fetch(`${API_ROOT}/admin/revenue/overview`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<RevenueOverview>(res));
}

export function getRevenueBreakdown(period = 'Yearly') {
  return fetch(`${API_ROOT}/admin/revenue/breakdown?period=${encodeURIComponent(period)}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<RevenueBreakdown>(res));
}

export function getRevenueTransactions(query: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const params = new URLSearchParams({
    status: query.status || 'All',
    page: String(query.page || 1),
    limit: String(query.limit || 10),
    sort: query.sort || 'date',
  });
  if (query.search?.trim()) params.set('search', query.search.trim());
  return fetch(`${API_ROOT}/admin/revenue/transactions?${params.toString()}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<RevenueTransactionsPage>(res));
}

export interface AnalyticsOverview {
  periodLabel?: string;
  newOrganizers: { count: number };
  eventsCreated: { count: number };
  rsvpsProcessed: { count: number };
  whatsappMessagesSent: { count: number };
  voiceRsvpUsage: { percentage: number; count?: number; totalResponses?: number };
  checkInVolume: { count: number };
}

export interface AnalyticsBundle {
  overview: AnalyticsOverview;
  organizerGrowth: { range: string; data: OrganizerGrowthPoint[] };
  eventsCreated: { range: string; data: EventsCreatedPoint[] };
  voiceRsvpAdoption: VoiceRsvpAdoption;
}

export interface OrganizerGrowthPoint {
  month: string;
  individual: number;
  agency: number;
  venue: number;
  total: number;
}

export interface EventsCreatedPoint {
  month: string;
  eventsCount: number;
}

export interface VoiceRsvpAdoption {
  totalResponses: number;
  breakdown: {
    button: { count: number; percentage: number };
    voiceNote: { count: number; percentage: number };
    textReply: { count: number; percentage: number };
  };
}

export function getAnalyticsOverview() {
  return fetch(`${API_ROOT}/admin/analytics/overview`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AnalyticsOverview>(res));
}

export function getAllAnalytics(range: '6_months' | '12_months') {
  return fetch(`${API_ROOT}/admin/analytics/all?range=${range}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<AnalyticsBundle>(res));
}

export function getOrganizerGrowth(range: '6_months' | '12_months') {
  return fetch(`${API_ROOT}/admin/analytics/organizer-growth?range=${range}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<{ range: string; data: OrganizerGrowthPoint[] }>(res));
}

export function getEventsCreatedSeries(range: '6_months' | '12_months') {
  return fetch(`${API_ROOT}/admin/analytics/events-created?range=${range}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<{ range: string; data: EventsCreatedPoint[] }>(res));
}

export interface PlatformUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'Active' | 'Suspended';
}

export interface PlatformUserInviteResult {
  user: PlatformUserRecord;
  temporaryPassword: string;
  emailSent: boolean;
}

export function getPlatformUsers(query: { search?: string; status?: string } = {}) {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.status && query.status !== 'all') params.set('status', query.status);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return fetch(`${API_ROOT}/admin/users${suffix}`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<{ data: PlatformUserRecord[] }>(res));
}

export function invitePlatformUser(body: { fullName: string; email: string; role: string }) {
  return fetch(`${API_ROOT}/admin/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((res) => readJson<PlatformUserInviteResult>(res));
}

export function updatePlatformUser(
  id: string,
  body: { fullName?: string; role?: string; status?: 'Active' | 'Suspended' },
) {
  return fetch(`${API_ROOT}/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((res) => readJson<PlatformUserRecord>(res));
}

export function deletePlatformUser(id: string) {
  return fetch(`${API_ROOT}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((res) => readJson<{ id: string }>(res));
}

export function getVoiceRsvpAdoption() {
  return fetch(`${API_ROOT}/admin/analytics/voice-rsvp-adoption`, {
    headers: authHeaders(),
    cache: 'no-store',
  }).then((res) => readJson<VoiceRsvpAdoption>(res));
}
