import { AppShell } from '@/components/shell/AppShell';
import { EventSeatingWorkspace } from '@/components/events/EventSeatingWorkspace';

export const metadata = {
  title: 'Seating & Protocol | McEniesVite Individual Organizer',
};

export default async function IndividualEventSeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_individual">
      <EventSeatingWorkspace organizer="individual" eventId={id} />
    </AppShell>
  );
}
