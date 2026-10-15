import { AppShell } from '@/components/shell/AppShell';
import { EventSeatingWorkspace } from '@/components/events/EventSeatingWorkspace';

export const metadata = {
  title: 'Seating & Protocol | McEniesVite Venue',
};

export default async function VenueEventSeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_venue">
      <EventSeatingWorkspace organizer="venue" eventId={id} />
    </AppShell>
  );
}
