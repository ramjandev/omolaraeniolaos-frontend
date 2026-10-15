import { AppShell } from '@/components/shell/AppShell';
import { MessageTemplatesWorkspace } from '@/components/communications/MessageTemplatesWorkspace';

export const metadata = {
  title: 'Message Templates | McEniesVite Venue',
};

export default async function VenueEventTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_venue">
      <MessageTemplatesWorkspace organizer="venue" eventId={id} />
    </AppShell>
  );
}
