import { AppShell } from '@/components/shell/AppShell';
import { OrganizerEventOverview } from '@/components/events/OrganizerEventOverview';

export const metadata = {
  title: 'Event Details | McEniesVite Agency',
};

export default async function AgencyEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_agency">
      <OrganizerEventOverview organizer="agency" eventId={id} />
    </AppShell>
  );
}
