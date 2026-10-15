export type UserRole =
  | 'organizer_individual'
  | 'organizer_agency'
  | 'organizer_venue'
  | 'admin'
  | 'gate_staff'
  | 'guest';

export interface RoleConfig {
  id: UserRole;
  title: string;
  badge: string;
  description: string;
  defaultPath: string;
  iconName: string;
}

export const USER_ROLES: Record<UserRole, RoleConfig> = {
  organizer_individual: {
    id: 'organizer_individual',
    title: 'Organizer (Individual)',
    badge: 'Creator',
    description: 'Manage personal events, tickets, and attendees',
    defaultPath: '/organizer/individual',
    iconName: 'User',
  },
  organizer_agency: {
    id: 'organizer_agency',
    title: 'Organizer (Agency)',
    badge: 'Agency Pro',
    description: 'Multi-client event operations & team collaboration',
    defaultPath: '/organizer/agency',
    iconName: 'Building2',
  },
  organizer_venue: {
    id: 'organizer_venue',
    title: 'Organizer (Venue)',
    badge: 'Venue Partner',
    description: 'Space management, table layouts, bookings & availability',
    defaultPath: '/organizer/venue',
    iconName: 'Landmark',
  },
  admin: {
    id: 'admin',
    title: 'Admin',
    badge: 'Admin Panel',
    description: 'Platform governance, global events audit & configuration',
    defaultPath: '/admin',
    iconName: 'ShieldAlert',
  },
  gate_staff: {
    id: 'gate_staff',
    title: 'Gate Staff',
    badge: 'Field Ops',
    description: 'QR scanner, fast check-in & attendee validation',
    defaultPath: '/gate-staff',
    iconName: 'ScanLine',
  },
  guest: {
    id: 'guest',
    title: 'Guest Portal',
    badge: 'Attendee',
    description: 'Tickets, RSVPs, schedule & event experiences',
    defaultPath: '/guest',
    iconName: 'Ticket',
  },
};
