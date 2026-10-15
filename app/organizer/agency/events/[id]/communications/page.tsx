import { AppShell } from '@/components/shell/AppShell';
import { GuestCommunicationsWorkspace } from '@/components/communications/GuestCommunicationsWorkspace';

export const metadata = {
  title: 'Guest Communications | McEniesVite Agency',
};

export default async function AgencyEventCommunicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_agency">
      <GuestCommunicationsWorkspace organizer="agency" eventId={id} />
    </AppShell>
  );
}
