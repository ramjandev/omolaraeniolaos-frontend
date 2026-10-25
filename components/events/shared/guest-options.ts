export const GUEST_TYPES = ['VIP', 'General', 'Family & Friends', 'Speakers & Partners'] as const;
export type GuestType = (typeof GUEST_TYPES)[number];

/** A Preserved table can seat every guest type. Every other table seats only its own type. */
export const TABLE_TYPES = [...GUEST_TYPES, 'Preserved'] as const;
export type TableType = (typeof TABLE_TYPES)[number];

export function tableAcceptsGuest(tableType: string, guestType: string) {
  const table = tableType === 'Standard' ? 'Preserved' : tableType || 'General';
  if (table === 'Preserved') return true;
  return table === (guestType || 'General');
}

export const RSVP_STATUSES = ['Confirmed', 'Tentative', 'Declined', 'Awaiting Response', 'Not Sent'] as const;
export type RsvpStatusLabel = (typeof RSVP_STATUSES)[number];

export const INVITE_CHANNELS = ['WhatsApp', 'SMS', 'Email'] as const;
export type InviteChannel = (typeof INVITE_CHANNELS)[number];

export const RSVP_BADGE: Record<string, string> = {
  Confirmed: 'bg-[#E3F3EC] text-[#2F8A5F]',
  Tentative: 'bg-[#F7EFE6] text-[#8C5835]',
  Declined: 'bg-[#FBE4E1] text-[#B33927]',
  'Awaiting Response': 'bg-[#F0EDE9] text-[#5E554F]',
  'Not Sent': 'bg-[#F0EDE9] text-[#8C7D73]',
};

export const CHANNEL_SELECT: Record<string, string> = {
  WhatsApp: 'border-[#E3DED8] bg-[#F0EDE9]',
  SMS: 'border-[#F6D6BE] bg-[#FFF3EA]',
  Email: 'border-[#E3DED8] bg-white',
};
