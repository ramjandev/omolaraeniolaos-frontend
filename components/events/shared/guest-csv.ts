import {
  isExcelShortNumber,
  isWhatsAppPhone,
  normalizeWhatsAppPhone,
  tidyText,
} from '@/lib/phone';
import type { AddGuestPayload } from '@/store/Event/types/eventTypes';
import { GUEST_TYPES, INVITE_CHANNELS } from './guest-options';

const HEADER_ALIASES: Record<string, keyof AddGuestPayload> = {
  name: 'name',
  'full name': 'name',
  'guest name': 'name',
  phone: 'phone',
  'phone number': 'phone',
  'whatsapp phone number': 'phone',
  'whatsapp phone': 'phone',
  'whatsapp number': 'phone',
  whatsapp: 'phone',
  mobile: 'phone',
  email: 'email',
  'email address': 'email',
  type: 'type',
  'guest type': 'type',
  'guest group': 'type',
  group: 'type',
  'party size': 'partySize',
  partysize: 'partySize',
  'how many coming': 'partySize',
  guests: 'partySize',
  preference: 'preference',
  'rsvp status': 'rsvpStatus',
  rsvp: 'rsvpStatus',
  'invite through': 'inviteThrough',
  channel: 'inviteThrough',
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function matchOption<T extends string>(options: readonly T[], value: string): T | undefined {
  const needle = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === needle);
}

/** Maps spreadsheet group labels onto the groups used by the guest form. */
export function normalizeGuestGroup(value?: string): string {
  const label = (value ?? '').trim().toLowerCase();
  if (!label) return 'General';
  if (label.includes('vip')) return 'VIP';
  if (label.includes('speaker') || label.includes('partner')) return 'Speakers & Partners';
  if (label.includes('family')) return 'Family & Friend';
  if (label.includes('general')) return 'General';
  return value?.trim() || 'General';
}

export function normalizeRsvpLabel(value?: string): 'Accepted' | 'Declined' | 'Pending' | 'Not Sent' {
  const label = (value ?? '').trim().toLowerCase();
  if (label.includes('accept') || label.includes('confirm')) return 'Accepted';
  if (label.includes('declin') || label.includes('regret')) return 'Declined';
  if (label.includes('pend') || label.includes('await') || label.includes('tentat')) return 'Pending';
  return 'Not Sent';
}

/** Parses a guest list CSV. The first row must be a header with at least name and phone columns. */
export function parseGuestCsv(text: string): {
  guests: AddGuestPayload[];
  skipped: number;
  shortenedPhones: number;
} {
  const empty = { guests: [], skipped: 0, shortenedPhones: 0 };
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return empty;

  const columns = splitCsvLine(lines[0]).map((header) => HEADER_ALIASES[header.toLowerCase()]);
  if (!columns.includes('name') || !columns.includes('phone')) return empty;

  const guests: AddGuestPayload[] = [];
  let skipped = 0;
  let shortenedPhones = 0;

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const row: Partial<Record<keyof AddGuestPayload, string>> = {};
    columns.forEach((column, index) => {
      if (column && cells[index]) row[column] = cells[index];
    });

    const name = tidyText(row.name ?? '');
    const phone = normalizeWhatsAppPhone(row.phone ?? '');
    if (!name || !phone || !isWhatsAppPhone(phone)) {
      if (isExcelShortNumber(row.phone ?? '') || isExcelShortNumber(phone)) shortenedPhones += 1;
      else skipped += 1;
      continue;
    }

    const email = tidyText(row.email ?? '');
    guests.push({
      name,
      phone,
      email: email || undefined,
      type: matchOption(GUEST_TYPES, row.type ?? '') ?? normalizeGuestGroup(row.type),
      inviteThrough: matchOption(INVITE_CHANNELS, row.inviteThrough ?? '') ?? 'WhatsApp',
      rsvpStatus: row.rsvpStatus ? normalizeRsvpLabel(row.rsvpStatus) : 'Not Sent',
    });
  }

  return { guests, skipped, shortenedPhones };
}
