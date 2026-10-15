export interface AgencyClient {
  id: string;
  name: string;
  type: string;
  organization: string;
  industry: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  clientSince: string;
  activeEventsCount: number;
  upcomingEventsCount: number;
  completedEventsCount: number;
  totalSpend: number;
  currency: string;
  status: 'active' | 'pending' | 'on_hold';
  logo: string;
  events: AgencyClientEvent[];
  activities: AgencyActivityItem[];
}

export interface AgencyClientEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  status: 'Planning' | 'Confirmed' | 'Completed' | 'Draft' | 'Active';
  guestsCount: number;
  confirmedCount?: number;
  image?: string;
  daysLeft?: number;
}

export interface AgencyActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  iconType: 'calendar' | 'user' | 'check' | 'file';
}

export interface AgencyTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Agency Director' | 'Senior Event Producer' | 'Stage Manager' | 'Operations Lead' | 'Event Planner' | 'Coordinator';
  assignedClients: string[];
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface AgencyInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  eventTitle: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface AgencyGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  invitationStatus: 'Sent' | 'Delivered' | 'Opened' | 'Not Sent';
  rsvpStatus: 'Accepted' | 'Declined' | 'Pending' | 'Not Sent';
  numberOfGuests: number;
  preference: string;
  table?: string;
  avatar?: string;
}

export const MOCK_AGENCY_CLIENTS: AgencyClient[] = [
  {
    id: 'amara-okafor',
    name: 'Amara Okafor',
    type: 'Individual client · Oak & Ivory',
    organization: 'Oak & Ivory',
    industry: 'Luxury Lifestyle & Events',
    contactPerson: 'Amara Okafor',
    contactEmail: 'amara@oakandivory.com',
    contactPhone: '+234 803 445 0198',
    clientSince: '18 February 2025',
    activeEventsCount: 2,
    upcomingEventsCount: 2,
    completedEventsCount: 3,
    totalSpend: 185000,
    currency: '₦',
    status: 'active',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    events: [
      {
        id: 'adebayo-wedding',
        title: 'The Adebayo Wedding',
        type: 'Wedding',
        date: '14 Sep 2026',
        location: 'Eko Hotel & Suites, Victoria Island, Lagos',
        status: 'Planning',
        guestsCount: 250,
        confirmedCount: 180,
        daysLeft: 42,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'oak-ivory-dinner',
        title: 'Oak & Ivory Brand Dinner',
        type: 'Private Dinner',
        date: '28 Oct 2026',
        location: 'The Art Hotel, Victoria Island, Lagos',
        status: 'Confirmed',
        guestsCount: 80,
        confirmedCount: 65,
        daysLeft: 86,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'design-week-dinner',
        title: 'Lagos Design Week Dinner',
        type: 'Gala & Exhibition',
        date: '21 Aug 2026',
        location: 'Federal Palace Hotel, Lagos',
        status: 'Completed',
        guestsCount: 120,
        confirmedCount: 120,
        image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'amina-soiree',
        title: "Amina's 40th Soirée",
        type: 'Birthday Celebration',
        date: '12 Jul 2026',
        location: 'Civic Centre, Victoria Island, Lagos',
        status: 'Completed',
        guestsCount: 100,
        confirmedCount: 98,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'summer-soiree',
        title: 'Summer Garden Soirée',
        type: 'Social Gathering',
        date: '15 May 2026',
        location: 'Private Waterfront Residence, Ikoyi',
        status: 'Completed',
        guestsCount: 90,
        confirmedCount: 88,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
      },
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Event created',
        description: "The Adebayo Wedding was added to Amara's portfolio",
        timestamp: '2 days ago',
        iconType: 'calendar',
      },
      {
        id: 'act-2',
        title: 'Contact updated',
        description: 'Phone number verified (+234 803 445 0198)',
        timestamp: '1 week ago',
        iconType: 'user',
      },
      {
        id: 'act-3',
        title: 'Event completed',
        description: 'Lagos Design Week Dinner finalized with 120 guests',
        timestamp: '3 weeks ago',
        iconType: 'check',
      },
      {
        id: 'act-4',
        title: 'Client onboarded',
        description: 'Contract signed for 2025/2026 event management',
        timestamp: '18 Feb 2025',
        iconType: 'file',
      },
    ],
  },
  {
    id: 'cli-flutterwave',
    name: 'Flutterwave Global',
    type: 'Enterprise Client · Fintech',
    organization: 'Flutterwave Ltd.',
    industry: 'Fintech & Enterprise',
    contactPerson: 'Gbenga Agboola',
    contactEmail: 'events@flutterwavego.com',
    contactPhone: '+234 802 334 1100',
    clientSince: '10 Jan 2025',
    activeEventsCount: 3,
    upcomingEventsCount: 2,
    completedEventsCount: 4,
    totalSpend: 145000,
    currency: '$',
    status: 'active',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    events: [],
    activities: [],
  },
  {
    id: 'cli-paystack',
    name: 'Paystack HQ',
    type: 'Enterprise Client · Payments',
    organization: 'Paystack Payments Ltd.',
    industry: 'Payments & Tech',
    contactPerson: 'Shola Akinlade',
    contactEmail: 'culture@paystack.com',
    contactPhone: '+234 809 112 3344',
    clientSince: '05 Mar 2025',
    activeEventsCount: 2,
    upcomingEventsCount: 1,
    completedEventsCount: 3,
    totalSpend: 98500,
    currency: '$',
    status: 'active',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80',
    events: [],
    activities: [],
  },
  {
    id: 'cli-andela',
    name: 'Andela Talent',
    type: 'Enterprise Client · Tech',
    organization: 'Andela Inc.',
    industry: 'Engineering & HR',
    contactPerson: 'Jeremy Johnson',
    contactEmail: 'brand@andela.com',
    contactPhone: '+234 803 998 7766',
    clientSince: '14 Apr 2025',
    activeEventsCount: 1,
    upcomingEventsCount: 1,
    completedEventsCount: 2,
    totalSpend: 62000,
    currency: '$',
    status: 'active',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=120&q=80',
    events: [],
    activities: [],
  },
];

export const MOCK_AGENCY_EVENTS = [
  {
    id: '1',
    title: 'The Grand Royal Gala & Investiture',
    type: 'Gala',
    date: '24 Oct 2026',
    status: 'Active' as const,
    confirmedRatio: '60/100 confirmed',
    confirmedCount: 60,
    totalCount: 100,
    daysLeftText: '38 days left',
    progressPercent: 60,
    location: 'Eko Convention Centre, Lagos',
    client: 'Amara Okafor · Oak & Ivory',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Adeyemi Family Reunion',
    type: 'Family Event',
    date: '15 Nov 2026',
    status: 'Active' as const,
    confirmedRatio: '45/80 confirmed',
    confirmedCount: 45,
    totalCount: 80,
    daysLeftText: '57 days left',
    progressPercent: 56,
    location: 'Ikeja Golf Club, Lagos',
    client: 'Adeyemi Estate',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'McEnies Annual Conference 2026',
    type: 'Conference',
    date: '5 Dec 2026',
    status: 'Active' as const,
    confirmedRatio: '178/250 confirmed',
    confirmedCount: 178,
    totalCount: 250,
    daysLeftText: '77 days left',
    progressPercent: 71,
    location: 'Landmark Event Centre, Victoria Island',
    client: 'McEnies Global Ltd.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Lagos Tech Mixer',
    type: 'Networking',
    date: '12 Jan 2027',
    status: 'Draft' as const,
    confirmedRatio: 'Setup 65% complete',
    confirmedCount: 0,
    totalCount: 150,
    daysLeftText: 'Setup in progress',
    progressPercent: 65,
    location: 'The Art Hotel, Victoria Island',
    client: 'TechCircle Africa',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    title: 'Charity Gala Night',
    type: 'Gala',
    date: '20 Sep 2026',
    status: 'Completed' as const,
    confirmedRatio: '142 attended · 94% RSVP rate',
    confirmedCount: 142,
    totalCount: 150,
    daysLeftText: 'Ended',
    progressPercent: 100,
    location: 'Civic Centre, Victoria Island, Lagos',
    client: 'Hope & Heritage Foundation',
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '6',
    title: 'Summer Garden Party',
    type: 'Social',
    date: '15 Aug 2026',
    status: 'Completed' as const,
    confirmedRatio: '85 attended · 91% RSVP rate',
    confirmedCount: 85,
    totalCount: 95,
    daysLeftText: 'Ended',
    progressPercent: 100,
    location: 'The Lekki Coliseum, Lagos',
    client: 'Lumina Collective',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
  },
];

export const MOCK_AGENCY_TEAM: AgencyTeamMember[] = [
  {
    id: 'team-1',
    name: 'Folashade Adeyemi',
    email: 'folashade@mcenies.com',
    role: 'Agency Director',
    assignedClients: ['Oak & Ivory', 'Flutterwave Global', 'Paystack HQ'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    status: 'online',
  },
  {
    id: 'team-2',
    name: 'Alex Rivera',
    email: 'alex@luminaevents.co',
    role: 'Event Planner',
    assignedClients: ['Oak & Ivory', 'Adeyemi Estate'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'online',
  },
  {
    id: 'team-3',
    name: 'Marcus Chen',
    email: 'marcus@luminaevents.co',
    role: 'Coordinator',
    assignedClients: ['McEnies Global Ltd.'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'busy',
  },
  {
    id: 'team-4',
    name: 'Zainab Mohammed',
    email: 'zainab.m@mceniesviteagency.com',
    role: 'Stage Manager',
    assignedClients: ['TechCircle Africa', 'Hope & Heritage'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'online',
  },
];

export const MOCK_AGENCY_INVOICES: AgencyInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-089',
    clientName: 'Amara Okafor (Oak & Ivory)',
    eventTitle: 'The Adebayo Wedding Production Retainer',
    amount: 3500000,
    currency: '₦',
    issueDate: '2026-10-01',
    dueDate: '2026-10-20',
    status: 'paid',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-090',
    clientName: 'McEnies Global Ltd.',
    eventTitle: 'Annual Conference Production Milestone 1',
    amount: 5200000,
    currency: '₦',
    issueDate: '2026-10-03',
    dueDate: '2026-10-25',
    status: 'pending',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-091',
    clientName: 'Adeyemi Estate',
    eventTitle: 'Family Reunion Venue & Hospitality Package',
    amount: 1800000,
    currency: '₦',
    issueDate: '2026-09-15',
    dueDate: '2026-10-05',
    status: 'overdue',
  },
];

export const MOCK_AGENCY_GUESTS: AgencyGuest[] = [
  {
    id: 'g-1',
    name: 'Dr. Tunde Fashola',
    email: 'tunde.fashola@lagosgov.ng',
    phone: '+234 803 200 4511',
    invitationStatus: 'Delivered',
    rsvpStatus: 'Accepted',
    numberOfGuests: 2,
    preference: 'VIP Table 1 · Halal / Gluten-Free',
    table: 'VIP Table 1',
  },
  {
    id: 'g-2',
    name: 'Lady Folasade Coker',
    email: 'folasade@cokerglobal.com',
    phone: '+234 802 114 9876',
    invitationStatus: 'Opened',
    rsvpStatus: 'Accepted',
    numberOfGuests: 1,
    preference: 'VIP Table 2 · Regular',
    table: 'VIP Table 2',
  },
  {
    id: 'g-3',
    name: 'Chief Emeka Okonkwo',
    email: 'emeka@e-moneygroup.com',
    phone: '+234 809 332 5544',
    invitationStatus: 'Sent',
    rsvpStatus: 'Accepted',
    numberOfGuests: 4,
    preference: 'VIP Table 1 · Premium Wine',
    table: 'VIP Table 1',
  },
  {
    id: 'g-4',
    name: 'Amina Bello-Osagie',
    email: 'amina@bellosagie.com',
    phone: '+234 805 441 2233',
    invitationStatus: 'Opened',
    rsvpStatus: 'Pending',
    numberOfGuests: 1,
    preference: 'Table 5 · Vegetarian',
    table: 'Table 5',
  },
  {
    id: 'g-5',
    name: 'Adeyemi Alakija',
    email: 'adeyemi@alakijafamily.org',
    phone: '+234 803 776 5432',
    invitationStatus: 'Sent',
    rsvpStatus: 'Declined',
    numberOfGuests: 0,
    preference: 'Regrets sent · Overseas travel',
  },
  {
    id: 'g-6',
    name: 'Sen. Oluremi Tinubu Rep.',
    email: 'protocol@firstlady.gov.ng',
    phone: '+234 802 998 7711',
    invitationStatus: 'Delivered',
    rsvpStatus: 'Accepted',
    numberOfGuests: 3,
    preference: 'VVIP State Table · Protocol Escort',
    table: 'VVIP State Table',
  },
  {
    id: 'g-7',
    name: 'Kofo Martins-Kuye',
    email: 'kofo@martinskuye.co.uk',
    phone: '+234 807 223 8899',
    invitationStatus: 'Delivered',
    rsvpStatus: 'Accepted',
    numberOfGuests: 2,
    preference: 'Table 3 · Regular',
    table: 'Table 3',
  },
  {
    id: 'g-8',
    name: 'Babatunde Adebayo',
    email: 'babatunde@adebayogroup.ng',
    phone: '+234 803 111 6543',
    invitationStatus: 'Opened',
    rsvpStatus: 'Pending',
    numberOfGuests: 2,
    preference: 'Table 4 · Regular',
    table: 'Table 4',
  },
  {
    id: 'g-9',
    name: 'Ngozi Okonjo Delegate',
    email: 'delegate@wto-liaison.org',
    phone: '+234 805 667 8900',
    invitationStatus: 'Sent',
    rsvpStatus: 'Accepted',
    numberOfGuests: 1,
    preference: 'VIP Table 2 · Regular',
    table: 'VIP Table 2',
  },
  {
    id: 'g-10',
    name: 'Deji Adeleke Jr.',
    email: 'deji@pacific-energy.ng',
    phone: '+234 809 887 6541',
    invitationStatus: 'Not Sent',
    rsvpStatus: 'Not Sent',
    numberOfGuests: 2,
    preference: 'Pending Protocol Verification',
  },
];

export const MOCK_AGENCY_METRICS = {
  totalRetainerRevenue: '₦42,500,000',
  revenueChange: '+38.4% vs last quarter',
  activeClients: '4 Active Clients',
  activeEventsTotal: '3 Active Productions',
  teamSize: '4 Producers & Crew',
  commissionRate: '15% Agency Margin',
};
