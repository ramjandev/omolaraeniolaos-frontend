import { AppShell } from '@/components/shell/AppShell';
import { EventSeatingWorkspace } from '@/components/events/EventSeatingWorkspace';

export const metadata = {
  title: 'Seating & Protocol | McEniesVite Agency',
};

export default async function AgencyEventSeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_agency">
      <EventSeatingWorkspace organizer="agency" eventId={id} />
    </AppShell>
  );
}
