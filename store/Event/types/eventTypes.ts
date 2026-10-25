/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiResponse,
  PaginatedApiResponse,
} from "@/store/Auth/types/authTypes";

export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type EventFormat = "IN_PERSON" | "VIRTUAL" | "HYBRID";

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  soldCount: number;
  currency?: string;
  perks?: string[];
}

export interface TableZone {
  id: string;
  eventId: string;
  zoneName: string;
  tableCount: number;
  seatPerTable: number;
  totalCapacity: number;
}

export interface EventItem {
  id: string;
  organizerId?: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  format: EventFormat;
  status: EventStatus | string;
  rawStatus?: EventStatus | string;
  startDate: string;
  endDate: string;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  totalTarget?: number;
  currency?: string;
  ticketTiers?: TicketTier[];
  tableZones?: TableZone[];
  guestsCount?: number;
  confirmedCount?: number;
  checkedInCount?: number;
  daysLeft?: number;
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EventGuest {
  id: string;
  eventId?: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  checkInStatus: string;
  rsvpStatus: string;
  inviteThrough: string;
  partySize: number;
  preference: string;
  qrCode?: string;
  isFlagged?: boolean;
  tableSeat?: string;
}

export interface CheckInActivityStreamItem {
  id: string;
  attendeeName: string;
  ticketTier: string;
  turnstile: string;
  scannedAt: string;
  status: string;
  staffName?: string;
}

export interface CheckInFlagItem {
  flagId: string;
  attendeeName: string;
  phone: string;
  reason: string;
  turnstile: string;
  timestamp: string;
  severity: string;
  status: string;
}

export interface CheckInTelemetry {
  eventId: string;
  eventTitle: string;
  metrics: {
    totalCheckedIn: number;
    totalExpected: number;
    checkInPercentage: number;
    activeTurnstiles: number;
    throughputPerMinute: number;
    activeGateStaff: number;
  };
  liveActivityStream: CheckInActivityStreamItem[];
  flaggedExceptions: CheckInFlagItem[];
  turnstiles?: Array<{
    name: string;
    status: string;
    scannedToday: number;
    staff: string;
  }>;
}

// ---- Request payloads ----

export interface CreateEventPayload {
  title: string;
  category: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  venueName?: string;
  address?: string;
  description?: string;
  format?: EventFormat;
  city?: string;
  country?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface UpdateSetupStepPayload {
  stepIndex: number;
  completed: boolean;
}

export interface AddGuestPayload {
  name: string;
  phone: string;
  email?: string;
  type?: string;
  partySize?: number;
  rsvpStatus?: string;
  checkInStatus?: string;
  inviteThrough?: string;
  preference?: string;
}

export type UpdateGuestPayload = Partial<AddGuestPayload>;

export interface BulkAddGuestsPayload {
  guests: AddGuestPayload[];
}

export interface AssignSeatingPayload {
  attendeeId: string;
  zoneId?: string;
  tableNumber: number;
  seatNumber?: number;
  zoneName?: string;
}

export interface CreateSeatingPayload {
  name: string;
  guestGroup?: string;
  location?: string;
  capacity: number;
  reservedSeats?: number;
}

export interface ResolveFlagPayload {
  flagId: string;
  action: "trust_staff" | "manual_resolve";
  notes?: string;
}

export interface GetEventsParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}

export interface GetGuestsParams {
  search?: string;
  status?: string;
  type?: string;
}

// ---- Response types ----

export type GetEventsResponse = ApiResponse<{
  events: EventItem[];
  counts: { all: number; active: number; draft: number; completed: number };
}>;

export type GetEventByIdResponse = ApiResponse<{
  event: EventItem;
  kpis: {
    totalInvited: { current: number; target: number; label: string };
    confirmedRsvp: { current: number; rate: string };
    checkedIn: { current: number; rate: string };
    vipAttendance: { current: number; total: number; rate: string };
  };
  countdown: { days: number; hours: number; minutes: number };
  checklist: Array<{
    id: number;
    title: string;
    description: string;
    status: string;
  }>;
  ticketTiers: TicketTier[];
  tableZones: TableZone[];
}>;

export type CreateEventResponse = ApiResponse<EventItem>;
export type UpdateEventResponse = ApiResponse<EventItem>;

export type GetEventGuestsResponse = ApiResponse<{
  guests: EventGuest[];
  metrics: {
    totalGuests: number;
    confirmedCount: number;
    checkedInCount: number;
    notArrivedCount: number;
    flaggedCount: number;
  };
}>;

export type AddGuestResponse = ApiResponse<EventGuest>;
export type BulkAddGuestsResponse = ApiResponse<{
  importedCount: number;
  guests: EventGuest[];
}>;

export type GetEventSeatingResponse = ApiResponse<{
  eventId: string;
  eventTitle: string;
  totalCapacity: number;
  totalAssigned: number;
  zones: any[];
  unassignedGuests: any[];
}>;

export type AssignSeatingResponse = ApiResponse<{
  assignmentId: string;
  guestName: string;
  table: number;
  seat: number;
  zone: string;
}>;

export type GetCheckInMonitorResponse = ApiResponse<CheckInTelemetry>;

export type ResolveFlagResponse = ApiResponse<{
  flagId: string;
  action: string;
  message: string;
}>;
