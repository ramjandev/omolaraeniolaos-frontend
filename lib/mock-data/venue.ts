export interface VenueSpace {
  id: string;
  name: string;
  type: string;
  capacity: number;
  spacesCount: number;
  utilization: number;
  status: 'Occupied' | 'Available';
  address: string;
  image: string;
  nextBooking?: {
    event: string;
    date: string;
    time?: string;
    status: 'Confirmed' | 'Tentative' | 'Awaiting';
    organizer?: string;
    guests?: number;
  };
  amenities: string[];
  description?: string;
}

export interface VenueBooking {
  id: string;
  event: string;
  category: 'Gala' | 'Corporate' | 'Wedding' | 'Charity' | 'Private' | 'VIP';
  space: string;
  date: string;
  time: string;
  organizer: string;
  guests: number;
  status: 'Confirmed' | 'Tentative' | 'Awaiting' | 'Cancelled';
}

export interface TableItem {
  id: string;
  tableNumber: string;
  seats: number;
  category: 'VIP' | 'Standard' | 'Accessible';
  status: 'Reserved' | 'Available' | 'Unavailable';
}

export interface TableZone {
  id: string;
  name: string;
  category: 'VIP' | 'Standard' | 'Accessible';
  tableCount: number;
  totalSeats: number;
  availableSeats: number;
  tables: TableItem[];
}

export const MOCK_VENUE_SPACES: VenueSpace[] = [
  {
    id: '1',
    name: 'Grand Ballroom A',
    type: 'Ballroom',
    capacity: 500,
    spacesCount: 3,
    utilization: 82,
    status: 'Occupied',
    address: '1 Eko Hotel Drive, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    description:
      'Our premier ballroom features soaring 7-meter ceilings, crystal chandeliers, state-of-the-art audiovisual systems, and flexible acoustic partition walls. Ideal for grand galas, corporate annual summits, state banquets, and high-profile luxury celebrations.',
    nextBooking: {
      event: 'The Grand Royal Gala & In...',
      date: '24 Oct 2026',
      time: '6:00 PM',
      status: 'Confirmed',
      organizer: 'Chief Babatunde Alabi',
      guests: 350,
    },
    amenities: [
      'Air Conditioning',
      'AV System',
      'Stage',
      'Dance Floor',
      'Bridal Suite',
      'High-Speed Wi-Fi',
      'Valet Parking',
      'Catering Kitchen',
    ],
  },
  {
    id: '2',
    name: 'Conference Hall B',
    type: 'Conference',
    capacity: 200,
    spacesCount: 2,
    utilization: 65,
    status: 'Available',
    address: '1 Eko Hotel Drive, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    description:
      'Engineered for modern executive symposiums, technical seminars, and board assemblies with high-definition laser projectors, surround acoustics, and modular seating arrangements.',
    nextBooking: {
      event: 'Lagos Business Summit 2...',
      date: '28 Oct 2026',
      time: '9:00 AM',
      status: 'Tentative',
      organizer: 'Tunde Fashola Ltd',
      guests: 180,
    },
    amenities: [
      'Air Conditioning',
      'AV System',
      'High-Speed Wi-Fi',
      'Projector Screens',
      'Video Conferencing',
      'Breakout Rooms',
    ],
  },
  {
    id: '3',
    name: 'Garden Terrace',
    type: 'Outdoor',
    capacity: 450,
    spacesCount: 2,
    utilization: 74,
    status: 'Available',
    address: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description:
      'An exquisite open-air garden terrace with scenic waterfront greenery, custom ambient string lighting, cocktail bar kiosks, and flexible marquee installations for unforgettable wedding receptions.',
    nextBooking: {
      event: 'Adeyemi Gold Wedding Re...',
      date: '1 Nov 2026',
      time: '4:00 PM',
      status: 'Confirmed',
      organizer: 'Adeyemi Family',
      guests: 420,
    },
    amenities: [
      'Outdoor Bar',
      'Ambient Lighting',
      'Scenic Garden View',
      'Tent Cover Option',
      'Valet Parking',
      'Private Restrooms',
    ],
  },
  {
    id: '4',
    name: 'Auditorium C',
    type: 'Auditorium',
    capacity: 700,
    spacesCount: 4,
    utilization: 58,
    status: 'Available',
    address: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description:
      'A multi-tier tiered auditorium equipped with professional broadcast cameras, acoustic wall paneling, hydraulic stage lifts, and synchronized translation booths.',
    nextBooking: {
      event: 'Tech Nigeria Conference',
      date: '5 Nov 2026',
      time: '10:00 AM',
      status: 'Confirmed',
      organizer: 'TechNG Events',
      guests: 600,
    },
    amenities: [
      'Acoustic Paneling',
      'Tiered Seating',
      'Stage Lighting',
      'Live Stream Rig',
      'Air Conditioning',
      'Control Booth',
    ],
  },
  {
    id: '5',
    name: 'Executive Lounge',
    type: 'Lounge',
    capacity: 80,
    spacesCount: 1,
    utilization: 91,
    status: 'Occupied',
    address: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    description:
      'An intimate sanctuary crafted for VIP guests, private afterparties, and keynote speaker holding suites, featuring premium leather lounges, private sommelier services, and direct security exits.',
    nextBooking: {
      event: 'VIP Cocktail Reception',
      date: 'Today, 8 PM',
      time: '8:00 PM',
      status: 'Confirmed',
      organizer: 'Lagos Syndicate',
      guests: 65,
    },
    amenities: [
      'Private Bar',
      'Plush Seating',
      'High-Speed Wi-Fi',
      'Dedicated Staff',
      'Private Entrance',
    ],
  },
];

export const MOCK_VENUE_BOOKINGS: VenueBooking[] = [
  {
    id: 'b-1',
    event: 'The Grand Royal Gala & In...',
    category: 'Gala',
    space: 'Grand Ballroom A',
    date: '24 Oct 2026',
    time: '6:00 PM',
    organizer: 'Chief Babatunde Alabi',
    guests: 350,
    status: 'Confirmed',
  },
  {
    id: 'b-2',
    event: 'Lagos Business Summit 2...',
    category: 'Corporate',
    space: 'Conference Hall B',
    date: '28 Oct 2026',
    time: '9:00 AM',
    organizer: 'Tunde Fashola Ltd',
    guests: 180,
    status: 'Tentative',
  },
  {
    id: 'b-3',
    event: 'Adeyemi Gold Wedding Re...',
    category: 'Wedding',
    space: 'Garden Terrace',
    date: '1 Nov 2026',
    time: '4:00 PM',
    organizer: 'Adeyemi Family',
    guests: 420,
    status: 'Confirmed',
  },
  {
    id: 'b-4',
    event: 'Tech Nigeria Conference',
    category: 'Corporate',
    space: 'Auditorium C',
    date: '5 Nov 2026',
    time: '10:00 AM',
    organizer: 'TechNG Events',
    guests: 600,
    status: 'Confirmed',
  },
  {
    id: 'b-5',
    event: 'NGO Annual Charity Dinner',
    category: 'Charity',
    space: 'Grand Ballroom A',
    date: '10 Nov 2026',
    time: '7:00 PM',
    organizer: 'Hope Foundation',
    guests: 200,
    status: 'Awaiting',
  },
  {
    id: 'b-6',
    event: 'Okafor Family Reunion',
    category: 'Private',
    space: 'Garden Terrace',
    date: '15 Nov 2026',
    time: '2:00 PM',
    organizer: 'Okafor Group',
    guests: 120,
    status: 'Confirmed',
  },
];

export const MOCK_SEATING_ZONES: TableZone[] = [
  {
    id: 'z-1',
    name: 'Stage Front',
    category: 'VIP',
    tableCount: 4,
    totalSeats: 40,
    availableSeats: 10,
    tables: [
      { id: 't-1', tableNumber: 'T1', seats: 10, category: 'VIP', status: 'Reserved' },
      { id: 't-2', tableNumber: 'T2', seats: 10, category: 'VIP', status: 'Reserved' },
      { id: 't-3', tableNumber: 'T3', seats: 10, category: 'VIP', status: 'Reserved' },
      { id: 't-4', tableNumber: 'T4', seats: 10, category: 'VIP', status: 'Available' },
    ],
  },
  {
    id: 'z-2',
    name: 'Central Floor',
    category: 'Standard',
    tableCount: 5,
    totalSeats: 50,
    availableSeats: 20,
    tables: [
      { id: 't-5', tableNumber: 'T5', seats: 10, category: 'Standard', status: 'Reserved' },
      { id: 't-6', tableNumber: 'T6', seats: 10, category: 'Standard', status: 'Reserved' },
      { id: 't-7', tableNumber: 'T7', seats: 10, category: 'Standard', status: 'Reserved' },
      { id: 't-8', tableNumber: 'T8', seats: 10, category: 'Standard', status: 'Available' },
      { id: 't-9', tableNumber: 'T9', seats: 10, category: 'Standard', status: 'Available' },
    ],
  },
  {
    id: 'z-3',
    name: 'Rear Section',
    category: 'Accessible',
    tableCount: 2,
    totalSeats: 12,
    availableSeats: 12,
    tables: [
      { id: 't-10', tableNumber: 'T10', seats: 6, category: 'Accessible', status: 'Available' },
      { id: 't-11', tableNumber: 'T11', seats: 6, category: 'Accessible', status: 'Available' },
    ],
  },
];
