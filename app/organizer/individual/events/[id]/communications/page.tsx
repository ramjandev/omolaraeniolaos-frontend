import { AppShell } from '@/components/shell/AppShell';
import { GuestCommunicationsWorkspace } from '@/components/communications/GuestCommunicationsWorkspace';

export const metadata = {
  title: 'Guest Communications | McEniesVite Individual Organizer',
};

export default async function IndividualEventCommunicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_individual">
      <GuestCommunicationsWorkspace organizer="individual" eventId={id} />
    </AppShell>
  );
}
