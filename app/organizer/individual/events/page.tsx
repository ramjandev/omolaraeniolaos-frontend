import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventsList } from '@/components/events/OrganizerEventsList';

export const metadata = {
  title: 'Events | McEniesVite Individual Organizer',
  description: 'View and organize your event list and draft templates',
};

export default function IndividualEventsPage() {
  return (
    <AppShell currentRole="organizer_individual">
      <OrganizerEventsList organizer="individual" />
    </AppShell>
  );
}
