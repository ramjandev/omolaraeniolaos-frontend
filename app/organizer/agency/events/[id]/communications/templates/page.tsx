import { AppShell } from '@/components/shell/AppShell';
import { MessageTemplatesWorkspace } from '@/components/communications/MessageTemplatesWorkspace';

export const metadata = {
  title: 'Message Templates | McEniesVite Agency',
};

export default async function AgencyEventTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_agency">
      <MessageTemplatesWorkspace organizer="agency" eventId={id} />
    </AppShell>
  );
}
