import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventsList } from '@/components/events/OrganizerEventsList';

export const metadata = {
  title: 'Events | McEniesVite Agency',
  description: 'View and organize your event list and draft templates',
};

export default function AgencyEventsPage() {
  return (
    <AppShell currentRole="organizer_agency">
      <OrganizerEventsList organizer="agency" />
    </AppShell>
  );
}
