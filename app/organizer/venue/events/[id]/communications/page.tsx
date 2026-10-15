import { AppShell } from '@/components/shell/AppShell';
import { GuestCommunicationsWorkspace } from '@/components/communications/GuestCommunicationsWorkspace';

export const metadata = {
  title: 'Guest Communications | McEniesVite Venue',
};

export default async function VenueEventCommunicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_venue">
      <GuestCommunicationsWorkspace organizer="venue" eventId={id} />
    </AppShell>
  );
}
