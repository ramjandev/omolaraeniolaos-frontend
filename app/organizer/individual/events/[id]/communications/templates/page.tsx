import { AppShell } from '@/components/shell/AppShell';
import { MessageTemplatesWorkspace } from '@/components/communications/MessageTemplatesWorkspace';

export const metadata = {
  title: 'Message Templates | McEniesVite Individual Organizer',
};

export default async function IndividualEventTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_individual">
      <MessageTemplatesWorkspace organizer="individual" eventId={id} />
    </AppShell>
  );
}
