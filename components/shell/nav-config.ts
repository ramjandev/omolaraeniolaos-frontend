import { UserRole } from '@/types/roles';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  exact?: boolean;
  section?: string;
  children?: { title: string; href: string }[];
  /** Children are filled with the organizer's own events at runtime. */
  eventChildren?: boolean;
}

export const ROLE_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  organizer_individual: [
    { title: 'Dashboard', href: '/organizer/individual', iconName: 'LayoutDashboard', exact: true, section: 'Main Menu' },
    { title: 'Events', href: '/organizer/individual/events', iconName: 'CalendarDays', section: 'Main Menu', eventChildren: true },
    { title: 'Gate Management', href: '/organizer/individual/gate', iconName: 'Scan', section: 'Main Menu' },
    { title: 'Billing', href: '/organizer/individual/billing', iconName: 'CreditCard', section: 'General' },
    { title: 'Settings', href: '/organizer/individual/settings', iconName: 'Settings', section: 'General' },
  ],
  organizer_agency: [
    { title: 'Dashboard', href: '/organizer/agency', iconName: 'LayoutDashboard', exact: true, section: 'Main Menu' },
    { title: 'Events', href: '/organizer/agency/events', iconName: 'CalendarDays', section: 'Main Menu', eventChildren: true },
    { title: 'Clients', href: '/organizer/agency/clients', iconName: 'Users', section: 'Main Menu' },
    { title: 'Team', href: '/organizer/agency/team', iconName: 'Users2', section: 'Main Menu' },
    { title: 'Reports', href: '/organizer/agency/reports', iconName: 'BarChart3', section: 'Main Menu' },
    { title: 'Gate Management', href: '/organizer/agency/gate', iconName: 'Scan', section: 'Main Menu' },
    { title: 'Billing', href: '/organizer/agency/pricing', iconName: 'CreditCard', section: 'General' },
    { title: 'Settings', href: '/organizer/agency/settings', iconName: 'Settings', section: 'General' },
  ],
  organizer_venue: [
    { title: 'Dashboard', href: '/organizer/venue', iconName: 'LayoutDashboard', exact: true, section: 'Main Menu' },
    { title: 'Venue/Spaces', href: '/organizer/venue/spaces', iconName: 'Building', section: 'Main Menu' },
    { title: 'Events', href: '/organizer/venue/events', iconName: 'CalendarDays', section: 'Main Menu', eventChildren: true },
    { title: 'Team', href: '/organizer/venue/team', iconName: 'Users2', section: 'Main Menu' },
    { title: 'Reports', href: '/organizer/venue/reports', iconName: 'BarChart3', section: 'Main Menu' },
    { title: 'Gate Management', href: '/organizer/venue/gate', iconName: 'Scan', section: 'Main Menu' },
    { title: 'Billing', href: '/organizer/venue/billing', iconName: 'CreditCard', section: 'General' },
    { title: 'Settings', href: '/organizer/venue/settings', iconName: 'Settings', section: 'General' },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin', iconName: 'LayoutDashboard', exact: true, section: 'Main Menu' },
    { title: 'Organizers', href: '/admin/organizers', iconName: 'Users', section: 'Main Menu' },
    { title: 'Events', href: '/admin/events', iconName: 'CalendarDays', section: 'Main Menu' },
    { title: 'Revenue & Plans', href: '/admin/revenue', iconName: 'CreditCard', section: 'Main Menu' },
    { title: 'Analytics', href: '/admin/analytics', iconName: 'BarChart3', section: 'Main Menu' },
    { title: 'Platform Settings', href: '/admin/settings', iconName: 'Settings', section: 'General' },
    { title: 'Platform Users', href: '/admin/users', iconName: 'Users2', section: 'General' },
  ],
  gate_staff: [
    { title: 'My Events', href: '/gate-staff', iconName: 'CalendarCheck', exact: true },
    { title: 'Check-In', href: '/gate-staff/checkin', iconName: 'Scan' },
    { title: 'Check-in History', href: '/gate-staff/history', iconName: 'Calendar' },
    { title: 'My Profile', href: '/gate-staff/profile', iconName: 'UserCircle' },
  ],
  guest: [
    { title: 'RSVP', href: '/guest', iconName: 'Ticket', exact: true },
    { title: 'Event Pass', href: '/guest/pass', iconName: 'ShieldCheck' },
  ],
};
