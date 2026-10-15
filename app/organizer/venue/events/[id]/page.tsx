import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventOverview } from '@/components/events/OrganizerEventOverview';

export const metadata = {
  title: 'Event Details | McEniesVite Venue',
};

export default async function VenueEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_venue">
      <OrganizerEventOverview organizer="venue" eventId={id} />
    </AppShell>
  );
}
