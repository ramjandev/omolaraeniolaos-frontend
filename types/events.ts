export type EventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
export type TicketTierType = 'free' | 'early_bird' | 'general' | 'vip' | 'speaker' | 'sponsor';
export type RSVPStatus = 'attending' | 'checked_in' | 'pending' | 'declined';
export type CommunicationChannel = 'email' | 'sms' | 'push' | 'whatsapp';

export interface TicketTier {
  id: string;
  name: string;
  type: TicketTierType;
  price: number;
  currency: string;
  capacity: number;
  soldCount: number;
  availableCount: number;
  description?: string;
  perks?: string[];
  salesStart?: string;
  salesEnd?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  timezone: string;
  isVirtual: boolean;
  location: {
    venueName: string;
    address: string;
    city: string;
    country: string;
    roomOrZone?: string;
    mapsUrl?: string;
  };
  coverImage: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    type: 'individual' | 'agency' | 'venue';
  };
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  revenue: number;
  currency: string;
  ticketTiers: TicketTier[];
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone?: string;
  ticketTierId: string;
  ticketTierName: string;
  qrCode: string;
  status: RSVPStatus;
  checkInTime?: string;
  registeredAt: string;
  avatar?: string;
  notes?: string;
  tableOrSeat?: string;
}

export interface GuestCommunication {
  id: string;
  eventId: string;
  eventTitle: string;
  subject: string;
  preview: string;
  channel: CommunicationChannel;
  sentAt: string;
  recipientsCount: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'scheduled' | 'draft';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
  icon?: string;
}
