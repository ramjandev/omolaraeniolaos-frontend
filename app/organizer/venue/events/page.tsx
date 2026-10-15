import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventsList } from '@/components/events/OrganizerEventsList';

export const metadata = {
  title: 'Events | McEniesVite Venue',
  description: 'View and organize your event list and draft templates',
};

export default function VenueEventsPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <OrganizerEventsList organizer="venue" />
    </AppShell>
  );
}
