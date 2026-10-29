import { AppShell } from '@/components/shell/AppShell';
import { ClientForm } from '@/components/clients/ClientForm';

export const metadata = {
  title: 'Edit Client | McEniesVite Agency',
};

export default async function EditAgencyClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell currentRole="organizer_agency">
      <ClientForm clientId={id} />
    </AppShell>
  );
}
