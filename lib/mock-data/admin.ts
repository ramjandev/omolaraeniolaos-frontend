export interface PlatformAuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'flagged' | 'blocked';
}

export interface PlatformUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'verified';
  eventsCount: number;
  grossRevenue: number;
  joinedDate: string;
}

export const MOCK_ADMIN_LOGS: PlatformAuditLog[] = [
  {
    id: 'log-1',
    action: 'Event Published to Public Directory',
    user: 'Omolara Eniola',
    role: 'Organizer (Individual)',
    target: 'Future Tech Summit 2026',
    ip: '102.89.44.12',
    timestamp: '2026-10-07 08:34:12',
    status: 'success',
  },
  {
    id: 'log-2',
    action: 'Payout Disbursement Initiated ($47,400)',
    user: 'Omolara Eniola',
    role: 'Organizer (Individual)',
    target: 'Access Bank Account',
    ip: '102.89.44.12',
    timestamp: '2026-10-07 07:12:00',
    status: 'success',
  },
  {
    id: 'log-3',
    action: 'Suspicious Rapid Registration Spike Detected',
    user: 'System Sentinel',
    role: 'Security Engine',
    target: 'Gate Scan Turnstile 4',
    ip: '197.210.65.19',
    timestamp: '2026-10-06 23:45:00',
    status: 'flagged',
  },
  {
    id: 'log-4',
    action: 'Agency Account Approved (Paystack HQ)',
    user: 'Super Admin',
    role: 'Administrator',
    target: 'Paystack HQ',
    ip: '105.112.98.2',
    timestamp: '2026-10-05 14:10:00',
    status: 'success',
  },
];

export const MOCK_ADMIN_USERS: PlatformUserItem[] = [
  {
    id: 'usr-1',
    name: 'Omolara Eniola',
    email: 'omolara.eniola@mceniesvite.live',
    role: 'Organizer (Individual)',
    status: 'verified',
    eventsCount: 4,
    grossRevenue: 70800,
    joinedDate: '2026-01-10',
  },
  {
    id: 'usr-2',
    name: 'Gbenga Agboola (Flutterwave)',
    email: 'gbenga@flutterwavego.com',
    role: 'Organizer (Agency)',
    status: 'verified',
    eventsCount: 3,
    grossRevenue: 145000,
    joinedDate: '2026-02-14',
  },
  {
    id: 'usr-3',
    name: 'Eko Grand Convention Admin',
    email: 'admin@ekogrand.com',
    role: 'Organizer (Venue)',
    status: 'verified',
    eventsCount: 12,
    grossRevenue: 84400,
    joinedDate: '2025-11-20',
  },
  {
    id: 'usr-4',
    name: 'Tunde Gate Controller',
    email: 'tunde.gate@ops.io',
    role: 'Gate Staff',
    status: 'active',
    eventsCount: 0,
    grossRevenue: 0,
    joinedDate: '2026-08-01',
  },
];

export const MOCK_ADMIN_METRICS = {
  platformGMV: '$1,480,200',
  platformFeeRevenue: '$74,010 (5% take rate)',
  totalEventsPublished: '142 Events',
  totalRegisteredAttendees: '48,900 Users',
  uptime: '99.99% Operational',
};
