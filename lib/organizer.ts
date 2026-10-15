import type { UserRole } from '@/types/roles';

export type OrganizerKind = 'individual' | 'agency' | 'venue';

interface OrganizerConfig {
  role: UserRole;
  basePath: string;
  eventsLayout: 'banner' | 'grid';
}

export const ORGANIZERS: Record<OrganizerKind, OrganizerConfig> = {
  individual: {
    role: 'organizer_individual',
    basePath: '/organizer/individual',
    eventsLayout: 'banner',
  },
  agency: {
    role: 'organizer_agency',
    basePath: '/organizer/agency',
    eventsLayout: 'grid',
  },
  venue: {
    role: 'organizer_venue',
    basePath: '/organizer/venue',
    eventsLayout: 'grid',
  },
};

export function organizerKindFromRole(role: UserRole): OrganizerKind | null {
  if (role === 'organizer_individual') return 'individual';
  if (role === 'organizer_agency') return 'agency';
  if (role === 'organizer_venue') return 'venue';
  return null;
}

export function eventsPath(kind: OrganizerKind, eventId?: string, section?: string) {
  const base = `${ORGANIZERS[kind].basePath}/events`;
  if (!eventId) return base;
  return section ? `${base}/${eventId}/${section}` : `${base}/${eventId}`;
}
