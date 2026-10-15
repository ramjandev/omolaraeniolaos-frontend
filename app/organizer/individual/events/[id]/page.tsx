import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventOverview } from '@/components/events/OrganizerEventOverview';

export const metadata = {
  title: 'Event Details | McEniesVite Individual Organizer',
};

export default async function IndividualEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_individual">
      <OrganizerEventOverview organizer="individual" eventId={id} />
    </AppShell>
  );
}
