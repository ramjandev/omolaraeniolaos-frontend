export interface GateEvent {
  id: string;
  title: string;
  date: string;
  gate: string;
  organizer: string;
  status: 'Upcoming' | 'Live' | 'Ended';
  expected: number;
  checkedIn: number;
}

export interface GateGuest {
  id: string;
  name: string;
  guestType: string;
  partySize: number;
  rsvpStatus: 'Confirmed' | 'Pending' | 'Declined';
  invitationStatus: 'Valid' | 'Invalid';
  seating: string;
  seats: string;
  checkInStatus: 'Checked In' | 'Not Checked In';
  checkInTime?: string;
  checkedInBy?: string;
  gateName?: string;
  code: string;
}

export const INITIAL_GATE_EVENTS: GateEvent[] = [
  {
    id: 'evt-1',
    title: 'The Grand Royal Gala & Investiture',
    date: '24 October 2026',
    gate: 'Main Entrance',
    organizer: 'McEniesVite Event Organizer',
    status: 'Upcoming',
    expected: 95,
    checkedIn: 42,
  },
  {
    id: 'evt-2',
    title: 'Adeleke Birthday Celebration',
    date: '12 December 2026',
    gate: 'North Gate',
    organizer: 'McEniesVite Event Organizer',
    status: 'Upcoming',
    expected: 150,
    checkedIn: 0,
  },
];

export const INITIAL_GUESTS: GateGuest[] = [
  {
    id: 'gst-1',
    name: 'Adeleke Adebayo',
    guestType: 'VIP / Special Guests',
    partySize: 2,
    rsvpStatus: 'Confirmed',
    invitationStatus: 'Valid',
    seating: 'VIP Table 01',
    seats: 'VIP-01, VIP-02',
    checkInStatus: 'Checked In',
    checkInTime: '10:35 AM',
    checkedInBy: 'Tomi Adeyemi',
    gateName: 'Main Entrance',
    code: 'MCE-VIP-8821',
  },
  {
    id: 'gst-2',
    name: 'Sarah Johnson',
    guestType: 'General Admission',
    partySize: 1,
    rsvpStatus: 'Confirmed',
    invitationStatus: 'Valid',
    seating: 'Section B, Row 4',
    seats: 'B-14',
    checkInStatus: 'Checked In',
    checkInTime: '10:42 AM',
    checkedInBy: 'Tomi Adeyemi',
    gateName: 'Main Entrance',
    code: 'MCE-GA-1042',
  },
  {
    id: 'gst-3',
    name: 'Chief Olumide Balogun',
    guestType: 'VIP / Special Guests',
    partySize: 3,
    rsvpStatus: 'Confirmed',
    invitationStatus: 'Valid',
    seating: 'VIP Table 03',
    seats: 'VIP-07, VIP-08, VIP-09',
    checkInStatus: 'Not Checked In',
    code: 'MCE-VIP-9942',
  },
  {
    id: 'gst-4',
    name: 'Folashade Adeleke',
    guestType: 'Family / Honored Guests',
    partySize: 2,
    rsvpStatus: 'Pending',
    invitationStatus: 'Valid',
    seating: 'Table 04',
    seats: 'T4-01, T4-02',
    checkInStatus: 'Not Checked In',
    code: 'MCE-FAM-3301',
  },
  {
    id: 'gst-5',
    name: 'David O. Adeleke',
    guestType: 'Standard Pass',
    partySize: 1,
    rsvpStatus: 'Confirmed',
    invitationStatus: 'Invalid',
    seating: 'Section C',
    seats: 'C-05',
    checkInStatus: 'Not Checked In',
    code: 'MCE-EXP-0000',
  },
];
